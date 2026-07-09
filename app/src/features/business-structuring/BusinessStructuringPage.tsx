import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  ChoiceList,
  LoadingIndicator,
  PageHeader,
  ProgressIndicator,
  Stack,
  SuggestionCard,
  TextArea,
  TransitionWrapper,
} from "../../design-system";
import { advanceAfterCanvasEdit } from "../../domain/lifecycle";
import { useLocalization } from "../../localization";
import { useCanvasAssistant } from "../../ai/useCanvasAssistant";
import { useProjectContext } from "../useProject";
import { QUESTIONS, resumeQuestionIndex, v1StaticPresetProvider } from "./questionModel";
import { buildWorkspaceSnapshot } from "./workspaceSnapshot";

export function BusinessStructuringPage() {
  const { project, update, saveError } = useProjectContext();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLocalization();

  // Resume position derived from Canvas completeness, computed once on mount — never persisted
  // separately (per sdd/workspace/02_data_and_state.md). Backward/forward movement afterward is
  // purely local view state.
  const [currentIndex, setCurrentIndex] = useState(() => resumeQuestionIndex(project.canvas));
  const advanceTimeout = useRef<number | null>(null);
  const assistant = useCanvasAssistant();

  // Always-current snapshot of `project`, read by the stale-response guard below.
  // A plain closure over `project` would freeze at invocation time — by the time an
  // in-flight response arrives, that closure is stale even though React has since
  // re-rendered with the user's edits. This ref is what lets the guard see the
  // truly live field value (Manual-first, sdd/ai/04_ai_interaction.md#manual-first-behavior-and-field-editability).
  const projectRef = useRef(project);
  projectRef.current = project;

  const total = QUESTIONS.length;
  const onReview = currentIndex >= total;

  // Switching questions targets a different field — the previous field's AI state
  // (per sdd/ai/04_ai_interaction.md, this lifecycle governs one invocation for one
  // target) does not carry over; any in-flight request for the old field is aborted.
  const resetAssistant = assistant.reset;
  useEffect(() => {
    resetAssistant();
  }, [currentIndex, resetAssistant]);

  function saveAnswer(value: string) {
    const canvas = { ...project.canvas, [QUESTIONS[currentIndex].relatedCanvasField]: value };
    const next = { ...project, canvas };
    next.stage = advanceAfterCanvasEdit(next);
    update(next);
  }

  function handleSelectPreset(value: string) {
    saveAnswer(value);
    // Brief delay so the Transition Wrapper's enter animation is visible before advancing.
    if (advanceTimeout.current) window.clearTimeout(advanceTimeout.current);
    advanceTimeout.current = window.setTimeout(() => goNext(), 350);
  }

  // AI invocation entry point: an explicit user action only (Governing Rule 1,
  // sdd/ai/04_ai_interaction.md) — nothing here fires on mount, focus, typing, or
  // scroll. Canvas context is built from whatever Canvas fields are already
  // answered, mirroring Canvas Assistant's Request Contract.
  function handleAskAi() {
    const question = QUESTIONS[currentIndex];

    // A builder, not a pre-computed object: called fresh both now and again on
    // every later Regenerate/Retry, so each of those — each its own "new,
    // independent invocation" per 04_ai_interaction.md's Suggestion Lifecycle —
    // reads projectRef.current, never a snapshot frozen at this first click
    // (Progressive Context Accumulation, sdd/ai/04_ai_interaction.md#conversation-policy).
    const buildInput = () => {
      // Single source of truth for current confirmed Canvas state — no separate,
      // duplicate construction of "prior answers" alongside it. The Capability
      // reuses this same data for its "prior answers" template variable when the
      // Feature doesn't have a genuinely different set to supply (see
      // CanvasAssistantCapability.invoke()'s fallback).
      const canvasContext = buildWorkspaceSnapshot(projectRef.current);

      return {
        operation: "suggestion" as const,
        canvasContext,
        currentField: question.relatedCanvasField,
        language,
        // AI-first Draft Generation: seed context is sent only when the Canvas is
        // entirely empty — per sdd/ai/capabilities/01_canvas_assistant.md, this is
        // context selection (a Feature-owned decision), not something the
        // Capability decides on its own.
        projectName: canvasContext.length === 0 ? projectRef.current.name : undefined,
        fieldValueAtInvocation: projectRef.current.canvas[question.relatedCanvasField],
      };
    };

    assistant.invoke(buildInput, () => projectRef.current.canvas[question.relatedCanvasField]);
  }

  // Accept: the same saveAnswer() path a preset or manually typed answer already
  // uses — from this point the accepted text is ordinary user-authored content,
  // per ADR-0009, indistinguishable from a preset-derived answer.
  function handleAcceptSuggestion() {
    if (assistant.suggestionText) saveAnswer(assistant.suggestionText);
    assistant.reset();
  }

  const failureMessage = assistant.failureKind
    ? {
        timeout: t.aiAssistant.failureTimeout,
        rate_limited: t.aiAssistant.failureRateLimited,
        unavailable: t.aiAssistant.failureUnavailable,
        safety_refusal: t.aiAssistant.failureSafetyRefusal,
        generic: t.aiAssistant.failureGeneric,
      }[assistant.failureKind]
    : undefined;

  function goNext() {
    setCurrentIndex((i) => Math.min(i + 1, total));
  }

  function goBack() {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }

  if (onReview) {
    return (
      <ReviewStep
        onEditQuestion={(i) => setCurrentIndex(i)}
        onConfirm={() => navigate(`/app/projects/${projectId}/scope`)}
      />
    );
  }

  const question = QUESTIONS[currentIndex];
  const value = project.canvas[question.relatedCanvasField];
  const presets = v1StaticPresetProvider(question.questionId, { project, language });
  const questionText = t.question[question.localizationKey].title;

  return (
    <div>
      <PageHeader title={t.businessStructuring.title} subtitle={t.businessStructuring.subtitle} />
      {saveError && <Alert>{saveError}</Alert>}

      <ProgressIndicator
        current={currentIndex}
        total={total}
        label={t.businessStructuring.progressLabel(Math.min(currentIndex + 1, total), total)}
      />

      <TransitionWrapper stepKey={question.questionId}>
        <Card>
          <h2 style={{ margin: "0 0 var(--space-4)" }}>{questionText}</h2>

          <ChoiceList
            presets={presets}
            value={value}
            writeMyOwnLabel={t.common.writeMyOwn}
            answerLabel={t.common.yourAnswer}
            answerPlaceholder={t.common.yourAnswerPlaceholder}
            onSelectPreset={handleSelectPreset}
            onCustomChange={saveAnswer}
          />

          {/* AI area: the field above remains editable in every state below —
              Manual-first (sdd/ai/04_ai_interaction.md#manual-first-behavior-and-field-editability).
              aria-live announces loading/ready/failed transitions to assistive
              technology without stealing focus (sdd/ai/04#accessibility-ai-interaction-specific-only). */}
          <div aria-live="polite" aria-atomic="true" style={{ marginTop: "var(--space-3)" }}>
            {assistant.status === "idle" && (
              <Button variant="secondary" onClick={handleAskAi}>
                {t.aiAssistant.askAiLabel}
              </Button>
            )}

            {assistant.status === "loading" && <LoadingIndicator label={t.aiAssistant.loadingLabel} />}

            {assistant.status === "ready" && assistant.suggestionText && (
              <SuggestionCard
                aiTag={t.aiAssistant.aiTag}
                suggestionText={assistant.suggestionText}
                rationale={assistant.rationale}
                acceptLabel={t.aiAssistant.acceptLabel}
                rejectLabel={t.aiAssistant.rejectLabel}
                regenerateLabel={t.aiAssistant.regenerateLabel}
                onAccept={handleAcceptSuggestion}
                onReject={assistant.reject}
                onRegenerate={assistant.regenerate}
              />
            )}

            {assistant.status === "failed" && failureMessage && (
              <Stack gap="var(--space-2)">
                <Alert tone="warning">{failureMessage}</Alert>
                <Button variant="secondary" onClick={assistant.retry}>
                  {t.aiAssistant.retryLabel}
                </Button>
              </Stack>
            )}
          </div>
        </Card>
      </TransitionWrapper>

      <Stack direction="row" style={{ marginTop: "var(--space-5)", justifyContent: "space-between" }}>
        <Button variant="secondary" onClick={goBack} disabled={currentIndex === 0}>
          {t.common.back}
        </Button>
        <Button onClick={goNext} disabled={!value.trim()}>
          {currentIndex === total - 1 ? t.businessStructuring.continueToReview : t.common.continue}
        </Button>
      </Stack>
    </div>
  );
}

function ReviewStep({
  onEditQuestion,
  onConfirm,
}: {
  onEditQuestion: (index: number) => void;
  onConfirm: () => void;
}) {
  const { project, update } = useProjectContext();
  const { t } = useLocalization();

  return (
    <div>
      <PageHeader title={t.businessStructuring.reviewTitle} subtitle={t.businessStructuring.reviewSubtitle} />

      <Stack gap="var(--space-3)">
        {QUESTIONS.map((q, i) => (
          <Card key={q.questionId}>
            <Stack direction="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{t.question[q.localizationKey].title}</p>
                <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-neutral-text-muted)" }}>
                  {project.canvas[q.relatedCanvasField]}
                </p>
              </div>
              <Button variant="secondary" onClick={() => onEditQuestion(i)}>
                {t.common.edit}
              </Button>
            </Stack>
          </Card>
        ))}

        <Card>
          <TextArea
            label={t.businessStructuring.riskNotesLabel}
            hint={t.businessStructuring.riskNotesHint}
            value={project.riskNotes}
            onChange={(e) => update({ ...project, riskNotes: e.target.value })}
          />
        </Card>
      </Stack>

      <Button onClick={onConfirm} style={{ marginTop: "var(--space-5)" }}>
        {t.businessStructuring.confirmAndContinue}
      </Button>
    </div>
  );
}
