import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  LoadingIndicator,
  PageHeader,
  Stack,
  TextField,
} from "../../design-system";
import { advanceToValidated, reopenScope } from "../../domain/lifecycle";
import type { ValidationItem, ValidationStatus } from "../../domain/types";
import { useLocalization } from "../../localization";
import { useValidationPlanningAssistant } from "../../ai/useValidationPlanningAssistant";
import { useProjectContext } from "../useProject";
import { buildMvpScopeContext, buildRiskMemoContext, buildWorkspaceSnapshot } from "../../workspace/contextBuilder";

export function ValidationPage() {
  const { project, update } = useProjectContext();
  const { t, language } = useLocalization();
  const [newAssumption, setNewAssumption] = useState("");

  const assistant = useValidationPlanningAssistant();

  const projectRef = useRef(project);
  projectRef.current = project;
  // The draft field's own live value, read the same way projectRef exposes
  // Project state — needed because this target isn't a Project field itself
  // (Manual-first stale-response guard, sdd/ai/04_ai_interaction.md).
  const draftRef = useRef(newAssumption);
  draftRef.current = newAssumption;

  function handleAskAi() {
    const buildInput = () => ({
      canvasContext: buildWorkspaceSnapshot(projectRef.current),
      riskContext: buildRiskMemoContext(projectRef.current),
      mvpContext: buildMvpScopeContext(projectRef.current),
      language,
      fieldValueAtInvocation: draftRef.current,
    });

    assistant.invoke(buildInput, () => draftRef.current);
  }

  // Auto-populate on Ready — per sdd/ai/capabilities/04_validation_planning_assistant.md's
  // Acceptance Criteria: this capability's real commitment point is the
  // existing Add action below, not a separate Accept click, so a ready
  // suggestion writes directly into the still-editable draft field and the
  // interaction immediately returns to Idle. The stale-response guard inside
  // useAiAssistant (Manual-first) already gates this — a suggestion only
  // ever reaches "ready" if the draft field is unchanged since invocation,
  // so this can never overwrite an in-flight manual edit.
  useEffect(() => {
    if (assistant.status === "ready" && assistant.suggestionText) {
      setNewAssumption(assistant.suggestionText);
      assistant.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assistant.status, assistant.suggestionText]);

  const failureMessage = assistant.failureKind
    ? {
        timeout: t.aiAssistant.failureTimeout,
        rate_limited: t.aiAssistant.failureRateLimited,
        unavailable: t.aiAssistant.failureUnavailable,
        safety_refusal: t.aiAssistant.failureSafetyRefusal,
        generic: t.aiAssistant.failureGeneric,
      }[assistant.failureKind]
    : undefined;

  const canEditChecklist = project.stage === "validating" || project.stage === "validated";

  function addAssumption() {
    if (!newAssumption.trim()) return;
    const item: ValidationItem = {
      id: `val_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      assumption: newAssumption.trim(),
      method: "",
      successCriterion: "",
      status: "open",
    };
    update({ ...project, validationItems: [...project.validationItems, item] });
    setNewAssumption("");
    // The draft target no longer exists once committed as an item — any
    // pending suggestion for it must not resurface later
    // (sdd/ai/04_ai_interaction.md#suggestion-lifecycle's End conditions).
    // Defensive: the auto-populate effect above already resets on Ready, so
    // this is normally a no-op by the time Add is clicked.
    assistant.reset();
  }

  function updateItem(id: string, patch: Partial<ValidationItem>) {
    update({
      ...project,
      validationItems: project.validationItems.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    });
  }

  function resolve(id: string, status: ValidationStatus) {
    const nextItems = project.validationItems.map((i) => (i.id === id ? { ...i, status } : i));
    const next = { ...project, validationItems: nextItems };
    next.stage = advanceToValidated(next);
    update(next);
  }

  function handleReopenScope() {
    update({ ...project, stage: reopenScope(project) });
  }

  const statusLabel: Record<ValidationStatus, string> = {
    open: t.validationPlanning.statusOpen,
    validated: t.validationPlanning.statusValidated,
    invalidated: t.validationPlanning.statusInvalidated,
  };

  if (project.stage === "captured" || project.stage === "structuring" || project.stage === "scoped") {
    return (
      <div>
        <PageHeader title={t.validationPlanning.title} />
        <Alert tone="warning">{t.validationPlanning.notReadyNotice}</Alert>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t.validationPlanning.title}
        subtitle={t.validationPlanning.subtitle}
        actions={
          project.stage === "validating" && (
            <Button variant="secondary" onClick={handleReopenScope}>
              {t.validationPlanning.reopenMvpPlanning}
            </Button>
          )
        }
      />

      {canEditChecklist && (
        <>
          <Stack direction="row" style={{ marginBottom: "var(--space-3)" }}>
            <TextField
              label={t.validationPlanning.addAssumptionLabel}
              value={newAssumption}
              onChange={(e) => setNewAssumption(e.target.value)}
              placeholder={t.validationPlanning.addAssumptionPlaceholder}
            />
            <Button onClick={addAssumption} disabled={!newAssumption.trim()}>
              {t.validationPlanning.add}
            </Button>
          </Stack>

          {/* AI area: the draft field above remains editable in every state
              below — Manual-first (sdd/ai/04_ai_interaction.md#manual-first-behavior-and-field-editability).
              No separate Suggestion Ready UI is rendered — a ready suggestion
              writes directly into the field above (see the effect near
              handleAskAi) and the interaction returns to Idle immediately, so
              "Ask AI" reappears as the way to request another draft. The
              aria-live region still announces the transition to assistive
              technology even though nothing distinct renders for it. */}
          <div aria-live="polite" aria-atomic="true" style={{ marginBottom: "var(--space-4)" }}>
            {assistant.status === "idle" && (
              <Button variant="secondary" onClick={handleAskAi}>
                {t.aiAssistant.askAiLabel}
              </Button>
            )}

            {assistant.status === "loading" && <LoadingIndicator label={t.aiAssistant.loadingLabel} />}

            {assistant.status === "failed" && failureMessage && (
              <Stack gap="var(--space-2)">
                <Alert tone="warning">{failureMessage}</Alert>
                <Button variant="secondary" onClick={assistant.retry}>
                  {t.aiAssistant.retryLabel}
                </Button>
              </Stack>
            )}
          </div>
        </>
      )}

      {project.validationItems.length === 0 ? (
        <EmptyState title={t.validationPlanning.emptyTitle} description={t.validationPlanning.emptyDescription} />
      ) : (
        <Stack gap="var(--space-3)">
          {project.validationItems.map((item) => (
            <Card key={item.id}>
              <p style={{ marginTop: 0, fontWeight: 600 }}>{item.assumption}</p>
              <TextField
                label={t.validationPlanning.methodLabel}
                value={item.method}
                onChange={(e) => updateItem(item.id, { method: e.target.value })}
                placeholder={t.validationPlanning.methodPlaceholder}
              />
              <TextField
                label={t.validationPlanning.criterionLabel}
                value={item.successCriterion}
                onChange={(e) => updateItem(item.id, { successCriterion: e.target.value })}
                placeholder={t.validationPlanning.criterionPlaceholder}
              />
              <Stack direction="row" style={{ alignItems: "center" }}>
                <Badge
                  tone={
                    item.status === "validated" ? "success" : item.status === "invalidated" ? "danger" : "neutral"
                  }
                >
                  {statusLabel[item.status]}
                </Badge>
                <Button
                  variant="secondary"
                  onClick={() => resolve(item.id, "validated")}
                  disabled={!item.method.trim() || !item.successCriterion.trim()}
                >
                  {t.validationPlanning.markValidated}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => resolve(item.id, "invalidated")}
                  disabled={!item.method.trim() || !item.successCriterion.trim()}
                >
                  {t.validationPlanning.markInvalidated}
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {project.stage === "validated" && (
        <div style={{ marginTop: "var(--space-4)" }}>
          <Badge tone="success">{t.validationPlanning.allResolvedNotice}</Badge>
        </div>
      )}
    </div>
  );
}
