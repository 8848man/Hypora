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
  Skeleton,
  Stack,
  SuggestionCard,
  TextArea,
  TransitionWrapper,
} from "../../design-system";
import { advanceAfterCanvasEdit } from "../../domain/lifecycle";
import { useLocalization } from "../../localization";
import { useCanvasAssistant } from "../../ai/useCanvasAssistant";
import { useProjectContext } from "../useProject";
import { QUESTIONS, resumeQuestionIndex, resolvePresets, onboardingStatus } from "./questionModel";
import { buildWorkspaceSnapshot } from "../../workspace/contextBuilder";

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

  // Acceptance Confirmation (sdd/ai/04_ai_interaction.md#suggestion-lifecycle):
  // Feature-local, transient view-state only — not a new AI lifecycle state.
  // `assistant.reset()` already returns the hook's own status to "idle" the
  // instant Accept fires; this local state independently controls what renders
  // in the same slot for a brief acknowledgment window afterward.
  const [confirmation, setConfirmation] = useState<{ text: string; rationale?: string } | null>(null);
  const confirmationTimeout = useRef<number | null>(null);

  function clearConfirmation() {
    if (confirmationTimeout.current !== null) {
      window.clearTimeout(confirmationTimeout.current);
      confirmationTimeout.current = null;
    }
    setConfirmation(null);
  }

  // Unmount cleanup only — question-change and new-invocation supersession are
  // each handled where they occur, below.
  useEffect(() => {
    return () => {
      if (confirmationTimeout.current !== null) window.clearTimeout(confirmationTimeout.current);
    };
  }, []);

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
    // Acceptance Confirmation end condition (sdd/ai/04_ai_interaction.md#suggestion-lifecycle):
    // navigating to a different question must not let a still-pending
    // confirmation resurface later against the wrong field.
    clearConfirmation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Acceptance Confirmation end condition (sdd/ai/04_ai_interaction.md#suggestion-lifecycle):
    // a new invocation for the same target supersedes any confirmation still
    // showing from a prior Accept.
    clearConfirmation();

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
    // Captured before reset() wipes the hook's own suggestion state — this is
    // the same in-memory data the Acceptance Confirmation may optionally reuse
    // (sdd/ai/04_ai_interaction.md#suggestion-lifecycle's Optional rationale),
    // never a new fetch or a persisted copy.
    const text = assistant.suggestionText;
    const rationale = assistant.rationale;

    if (text) saveAnswer(text);
    assistant.reset();

    if (text) {
      clearConfirmation();
      setConfirmation({ text, rationale });
      // End condition: intended display period elapses (sdd/ai/04_ai_interaction.md#suggestion-lifecycle).
      confirmationTimeout.current = window.setTimeout(() => {
        confirmationTimeout.current = null;
        setConfirmation(null);
      }, 1600);
    }
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
  const onboarding = onboardingStatus(project);
  // While generating, presets are deliberately never resolved (not even to
  // static) — resolvePresets() falls back to static V1 presets whenever
  // AI-tailored ones aren't ready, and calling it here would show exactly
  // the pre-project-specific flash this loading state exists to prevent.
  // See questionModel.ts's own note on why resolvePresets() itself does
  // not special-case "generating".
  const isGeneratingOnboarding = onboarding === "generating";
  const presets = isGeneratingOnboarding ? [] : resolvePresets(question.questionId, { project, language });
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

          {/* Initial-generation loading state, per the Design System's Loading
              Pattern Policy (sdd/design-system/01_design_system.md#loading-pattern-policy):
              skeleton chips occupy the exact slot and shape Choice List's real
              chips will use — never static presets, never an empty area, never
              interactive placeholder controls. Replaces the preset-chip area
              only — never the whole page, never navigates away, never blocks
              the always-available custom-answer path below. Tied to the actual
              persisted "generating" status (see onboardingStatus()), never an
              arbitrary timer. aria-busy + a concise label carry the loading
              meaning for assistive technology; the skeleton chips themselves
              are aria-hidden and never focusable/selectable (Skeleton's own
              contract). */}
          {isGeneratingOnboarding && (
            <div aria-busy="true" aria-live="polite" style={{ marginBottom: "var(--space-3)" }}>
              <p style={{ margin: "0 0 var(--space-2)", color: "var(--color-neutral-text-muted)" }}>
                {t.businessStructuring.onboardingGeneratingTitle}
              </p>
              <Stack gap="var(--space-2)" style={{ marginBottom: "var(--space-2)" }}>
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} height="48px" borderRadius="var(--radius)" />
                ))}
              </Stack>
              <p style={{ margin: 0, fontSize: "var(--font-size-caption)", color: "var(--color-neutral-text-muted)" }}>
                {t.businessStructuring.onboardingGeneratingHint}
              </p>
            </div>
          )}

          {/* Per ADR-0021: this question's presets always come from exactly one
              provider (AI-tailored or static) and are always a selectable list —
              never replaced or hidden by a non-selectable AI content type. During
              initial generation, presets is deliberately [] (see above) so this
              renders only its always-available "write my own" custom-answer path —
              never static chips, and never a fully empty area (the loading block
              above occupies this same slot). */}
          <ChoiceList
            presets={presets}
            value={value}
            writeMyOwnLabel={t.common.writeMyOwn}
            answerLabel={t.common.yourAnswer}
            answerPlaceholder={t.common.yourAnswerPlaceholder}
            onSelectPreset={handleSelectPreset}
            onCustomChange={saveAnswer}
          />

          {/* Confirmed-fallback note: per this capability's own Acceptance Criteria,
              the preset chips themselves stay visually identical regardless of
              source (provider-agnostic, per the Preset Strategy) — this is a
              separate, unobtrusive line, not a change to the chips, satisfying
              "clearly distinguish fallback from AI-generated" without redesigning
              ChoiceList's own established interaction. */}
          {onboarding === "fallback" && (
            <p style={{ margin: "var(--space-2) 0 0", fontSize: "var(--font-size-caption)", color: "var(--color-neutral-text-muted)" }}>
              {t.businessStructuring.onboardingFallbackNote}
            </p>
          )}

          {/* AI area: the field above remains editable in every state below —
              Manual-first (sdd/ai/04_ai_interaction.md#manual-first-behavior-and-field-editability).
              aria-live announces loading/ready/failed/accepted transitions to
              assistive technology without stealing focus
              (sdd/ai/04#accessibility-ai-interaction-specific-only). The Acceptance
              Confirmation below renders in this exact same slot, ahead of the
              status-based branches, since assistant.status has already returned
              to "idle" by the time it's shown (sdd/ai/04#suggestion-lifecycle). */}
          <div aria-live="polite" aria-atomic="true" style={{ marginTop: "var(--space-3)" }}>
            {confirmation ? (
              <Alert tone="success">
                {confirmation.rationale
                  ? `${t.aiAssistant.appliedLabel} — ${confirmation.rationale}`
                  : t.aiAssistant.appliedLabel}
              </Alert>
            ) : (
              <>
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
              </>
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
