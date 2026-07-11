// Feature: Risk Memo — sdd/workspace/features/06_risk_memo.md. Three
// independently-addressable, optional fields, each with its own field-level
// AI Assist — identical interaction pattern to Business Structuring's Canvas
// Assistant integration (Ask AI / Suggestion Card / Accept / Reject / the
// existing Acceptance Confirmation), confirming sdd/ai/04_ai_interaction.md's
// lifecycle reuse claim against a second, real Feature. No ChoiceList/presets:
// Risk Memo's fields are freeform only, per its own Field Definitions.

import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, LoadingIndicator, PageHeader, Stack, SuggestionCard, TextArea } from "../../design-system";
import { useLocalization } from "../../localization";
import { useRiskMemoAssistant } from "../../ai/useRiskMemoAssistant";
import { useProjectContext } from "../useProject";
import { buildWorkspaceSnapshot } from "../../workspace/contextBuilder";
import type { Project, RiskMemo } from "../../domain/types";
import type { RiskMemoSiblingField, RiskMemoTargetField } from "../../ai/types";

const FIELD_KEY: Record<RiskMemoTargetField, keyof RiskMemo> = {
  technical_risks: "technicalRisks",
  business_risks: "businessRisks",
  open_questions: "openQuestions",
};
const ALL_TARGET_FIELDS: RiskMemoTargetField[] = ["technical_risks", "business_risks", "open_questions"];

export function RiskMemoPage() {
  const { project, update, saveError } = useProjectContext();
  const { t } = useLocalization();

  function saveField(targetField: RiskMemoTargetField, value: string) {
    update({ ...project, riskMemo: { ...project.riskMemo, [FIELD_KEY[targetField]]: value } });
  }

  return (
    <div>
      <PageHeader title={t.riskMemo.title} subtitle={t.riskMemo.subtitle} />
      {saveError && <Alert>{saveError}</Alert>}

      <Stack gap="var(--space-5)">
        <RiskMemoField
          project={project}
          targetField="technical_risks"
          label={t.riskMemo.technicalRisksLabel}
          value={project.riskMemo.technicalRisks}
          onSave={(v) => saveField("technical_risks", v)}
        />
        <RiskMemoField
          project={project}
          targetField="business_risks"
          label={t.riskMemo.businessRisksLabel}
          value={project.riskMemo.businessRisks}
          onSave={(v) => saveField("business_risks", v)}
        />
        <RiskMemoField
          project={project}
          targetField="open_questions"
          label={t.riskMemo.openQuestionsLabel}
          value={project.riskMemo.openQuestions}
          onSave={(v) => saveField("open_questions", v)}
        />
      </Stack>
    </div>
  );
}

// One hook instance per field: three simultaneously-visible fields each need
// their own independent, single-invocation lifecycle (Governing Rule 3,
// sdd/ai/04_ai_interaction.md) — sharing one hook across fields would let two
// fields' invocations interfere with each other, which nothing in this
// Feature requires or should allow.
function RiskMemoField({
  project,
  targetField,
  label,
  value,
  onSave,
}: {
  project: Project;
  targetField: RiskMemoTargetField;
  label: string;
  value: string;
  onSave: (value: string) => void;
}) {
  const { t, language } = useLocalization();
  const assistant = useRiskMemoAssistant();

  // Fresh-on-every-render snapshot, read by buildInput at call time (not
  // capture time) — same reasoning as BusinessStructuringPage's projectRef:
  // Regenerate/Retry reuse the same buildInput reference later, so it must
  // dereference a ref, never close over a stale `project` value.
  const projectRef = useRef(project);
  projectRef.current = project;

  // Local draft + commit-on-blur, per this Feature's own Persistence section
  // ("save on leaving the field"). Resyncs from `value` when it changes
  // externally (e.g. an AI Accept, which updates the parent's project state).
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const [confirmation, setConfirmation] = useState<{ text: string; rationale?: string } | null>(null);
  const confirmationTimeout = useRef<number | null>(null);

  function clearConfirmation() {
    if (confirmationTimeout.current !== null) {
      window.clearTimeout(confirmationTimeout.current);
      confirmationTimeout.current = null;
    }
    setConfirmation(null);
  }

  useEffect(() => {
    return () => {
      if (confirmationTimeout.current !== null) window.clearTimeout(confirmationTimeout.current);
    };
  }, []);

  function handleAskAi() {
    clearConfirmation();

    const buildInput = () => {
      const canvasContext = buildWorkspaceSnapshot(projectRef.current);
      // Sibling context: the Risk Memo's other two fields, never another
      // Feature's data — capability independence, sdd/ai/03_ownership_model.md.
      const siblingFields: RiskMemoSiblingField[] = ALL_TARGET_FIELDS.filter((f) => f !== targetField)
        .map((f) => ({ field: f, value: projectRef.current.riskMemo[FIELD_KEY[f]] }))
        .filter((sf) => sf.value.trim() !== "");

      return {
        canvasContext,
        targetField,
        siblingFields,
        language,
        fieldValueAtInvocation: projectRef.current.riskMemo[FIELD_KEY[targetField]],
      };
    };

    assistant.invoke(buildInput, () => projectRef.current.riskMemo[FIELD_KEY[targetField]]);
  }

  // Accept: identical shape to Business Structuring's own Acceptance
  // Confirmation (sdd/ai/04_ai_interaction.md#suggestion-lifecycle) — Feature-
  // local, transient, no forced focus movement, optional rationale reused
  // from memory before reset() wipes it.
  function handleAcceptSuggestion() {
    const text = assistant.suggestionText;
    const rationale = assistant.rationale;

    if (text) onSave(text);
    assistant.reset();

    if (text) {
      clearConfirmation();
      setConfirmation({ text, rationale });
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

  return (
    <Card>
      <TextArea
        label={label}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== value) onSave(draft);
        }}
      />

      {/* AI area: the field above remains editable in every state below —
          Manual-first (sdd/ai/04_ai_interaction.md#manual-first-behavior-and-field-editability). */}
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
  );
}
