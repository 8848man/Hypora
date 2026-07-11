import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  LoadingIndicator,
  PageHeader,
  Stack,
  SuggestionCard,
  TextArea,
  TextField,
} from "../../design-system";
import { advanceToValidating } from "../../domain/lifecycle";
import type { FeaturePriority, PlannedFeature } from "../../domain/types";
import { useLocalization } from "../../localization";
import { useMvpPlanningAssistant } from "../../ai/useMvpPlanningAssistant";
import { useProjectContext } from "../useProject";
import { buildRiskMemoContext, buildWorkspaceSnapshot } from "../../workspace/contextBuilder";

const PRIORITIES: FeaturePriority[] = ["must", "should", "could"];

export function MvpPlanningPage() {
  const { project, update } = useProjectContext();
  const { t, language } = useLocalization();
  const [newFeatureName, setNewFeatureName] = useState("");

  const assistant = useMvpPlanningAssistant();

  // Fresh-on-every-render snapshot, read by buildInput at call time (not
  // capture time) — same reasoning as RiskMemoPage's projectRef: Regenerate/
  // Retry reuse the same buildInput reference later, so it must dereference a
  // ref, never close over a stale `project` value.
  const projectRef = useRef(project);
  projectRef.current = project;

  // Acceptance Confirmation (sdd/ai/04_ai_interaction.md#suggestion-lifecycle):
  // Feature-local, transient view-state only — identical shape to Business
  // Structuring's and Risk Memo's own.
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

    const buildInput = () => ({
      canvasContext: buildWorkspaceSnapshot(projectRef.current),
      riskContext: buildRiskMemoContext(projectRef.current),
      language,
      fieldValueAtInvocation: projectRef.current.mvpScope,
    });

    assistant.invoke(buildInput, () => projectRef.current.mvpScope);
  }

  function handleAcceptSuggestion() {
    const text = assistant.suggestionText;
    const rationale = assistant.rationale;

    if (text) update({ ...projectRef.current, mvpScope: text });
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

  const priorityLabel: Record<FeaturePriority, string> = {
    must: t.mvpPlanning.priorityMust,
    should: t.mvpPlanning.priorityShould,
    could: t.mvpPlanning.priorityCould,
  };

  function addFeature() {
    if (!newFeatureName.trim()) return;
    const feature: PlannedFeature = {
      id: `feat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: newFeatureName.trim(),
      priority: "should",
      inScope: true,
    };
    update({ ...project, features: [...project.features, feature] });
    setNewFeatureName("");
  }

  function updateFeature(id: string, patch: Partial<PlannedFeature>) {
    update({
      ...project,
      features: project.features.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });
  }

  function removeFeature(id: string) {
    update({ ...project, features: project.features.filter((f) => f.id !== id) });
  }

  function toggleScopeComplete() {
    const next = { ...project, mvpScopeComplete: !project.mvpScopeComplete };
    next.stage = advanceToValidating(next);
    update(next);
  }

  function toggleFeaturePlanningComplete() {
    const next = { ...project, featurePlanningComplete: !project.featurePlanningComplete };
    next.stage = advanceToValidating(next);
    update(next);
  }

  return (
    <div>
      <PageHeader title={t.mvpPlanning.title} subtitle={t.mvpPlanning.subtitle} />

      <Card style={{ marginBottom: "var(--space-5)" }}>
        <TextArea
          label={t.mvpPlanning.scopeLabel}
          hint={t.mvpPlanning.scopeHint}
          value={project.mvpScope}
          onChange={(e) => update({ ...project, mvpScope: e.target.value })}
        />

        {/* AI area: the field above remains editable in every state below —
            Manual-first (sdd/ai/04_ai_interaction.md#manual-first-behavior-and-field-editability). */}
        <div aria-live="polite" aria-atomic="true" style={{ margin: "var(--space-3) 0" }}>
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

        <Button
          variant={project.mvpScopeComplete ? "secondary" : "primary"}
          onClick={toggleScopeComplete}
          disabled={!project.mvpScope.trim() && !project.mvpScopeComplete}
        >
          {project.mvpScopeComplete ? t.mvpPlanning.markedComplete : t.mvpPlanning.markScopeComplete}
        </Button>
      </Card>

      <h2 style={{ fontSize: "var(--font-size-heading-3)" }}>{t.mvpPlanning.featurePlanningTitle}</h2>

      <Stack direction="row" style={{ marginBottom: "var(--space-4)" }}>
        <TextField
          label={t.mvpPlanning.addFeatureLabel}
          value={newFeatureName}
          onChange={(e) => setNewFeatureName(e.target.value)}
          placeholder={t.mvpPlanning.addFeaturePlaceholder}
        />
        <Button onClick={addFeature} disabled={!newFeatureName.trim()}>
          {t.mvpPlanning.add}
        </Button>
      </Stack>

      {project.features.length === 0 ? (
        <EmptyState title={t.mvpPlanning.emptyFeaturesTitle} description={t.mvpPlanning.emptyFeaturesDescription} />
      ) : (
        <Stack gap="var(--space-3)">
          {project.features.map((f) => (
            <Card key={f.id}>
              <Stack direction="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{f.name}</p>
                <Button variant="secondary" onClick={() => removeFeature(f.id)}>
                  {t.mvpPlanning.remove}
                </Button>
              </Stack>
              <Stack direction="row" style={{ marginTop: "var(--space-2)" }}>
                {PRIORITIES.map((p) => (
                  <Chip
                    key={p}
                    label={priorityLabel[p]}
                    active={f.priority === p}
                    onToggle={() => updateFeature(f.id, { priority: p })}
                  />
                ))}
                <Chip
                  label={f.inScope ? t.mvpPlanning.inScope : t.mvpPlanning.outOfScope}
                  active={f.inScope}
                  onToggle={() => updateFeature(f.id, { inScope: !f.inScope })}
                />
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      <Button
        variant={project.featurePlanningComplete ? "secondary" : "primary"}
        onClick={toggleFeaturePlanningComplete}
        disabled={project.features.length === 0 && !project.featurePlanningComplete}
        style={{ marginTop: "var(--space-4)" }}
      >
        {project.featurePlanningComplete ? t.mvpPlanning.markedComplete : t.mvpPlanning.markFeaturePlanningComplete}
      </Button>

      {project.stage === "validating" && (
        <div style={{ marginTop: "var(--space-4)" }}>
          <Badge tone="success">{t.mvpPlanning.readyForValidation}</Badge>
        </div>
      )}
    </div>
  );
}
