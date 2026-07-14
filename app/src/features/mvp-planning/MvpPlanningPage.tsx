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
import { useFeatureSuggestionAssistant } from "../../ai/useFeatureSuggestionAssistant";
import { useProjectContext } from "../useProject";
import { buildRiskMemoContext, buildWorkspaceSnapshot } from "../../workspace/contextBuilder";
import { FeatureSuggestionPreview, type AcceptedProposal } from "./FeatureSuggestionPreview";
import { createHistoryEvent } from "./featureHistory";

const PRIORITIES: FeaturePriority[] = ["must", "should", "could"];

export function MvpPlanningPage() {
  const { project, update } = useProjectContext();
  const { t, language } = useLocalization();
  const [newFeatureName, setNewFeatureName] = useState("");

  const assistant = useMvpPlanningAssistant();
  const featureSuggestion = useFeatureSuggestionAssistant();

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

  // Feature Suggestion Assistant — its own independent Suggestion Ready cycle,
  // separate from the Scope-field assistant above (sdd/ai/04_ai_interaction.md
  // Governing Rule 3: one invocation per capability instance).
  const [featureSuggestionConfirmation, setFeatureSuggestionConfirmation] = useState<string | null>(null);
  const featureSuggestionConfirmationTimeout = useRef<number | null>(null);

  function clearFeatureSuggestionConfirmation() {
    if (featureSuggestionConfirmationTimeout.current !== null) {
      window.clearTimeout(featureSuggestionConfirmationTimeout.current);
      featureSuggestionConfirmationTimeout.current = null;
    }
    setFeatureSuggestionConfirmation(null);
  }

  useEffect(() => {
    return () => {
      if (featureSuggestionConfirmationTimeout.current !== null) {
        window.clearTimeout(featureSuggestionConfirmationTimeout.current);
      }
    };
  }, []);

  function handleSuggestFeatures() {
    clearFeatureSuggestionConfirmation();

    featureSuggestion.invoke(() => ({
      canvasContext: buildWorkspaceSnapshot(projectRef.current),
      mvpScopeContext:
        projectRef.current.mvpScope.trim() === "" ? [] : [{ field: "mvpScope", value: projectRef.current.mvpScope }],
      // Every existing Feature, unfiltered (including inScope: false), per
      // sdd/ai/capabilities/05_feature_suggestion_assistant.md's Request Contract.
      existingFeatures: projectRef.current.features.map((f) => ({
        name: f.name,
        priority: f.priority,
        inScope: f.inScope,
      })),
      riskContext: buildRiskMemoContext(projectRef.current),
      language,
    }));
  }

  // Accept mechanics, per sdd/ai/capabilities/05_feature_suggestion_assistant.md#acceptance-criteria:
  // ids minted here (client-side, at Accept time, same format as manual
  // addFeature()); checked proposals appended preserving their response
  // order, existing entries never read/matched/overwritten; one History
  // Created event per accepted Feature, never one combined "batch" event;
  // count-based confirmation content, since no single rationale applies to a
  // batch.
  function handleAcceptProposals(accepted: AcceptedProposal[]) {
    const newFeatures: PlannedFeature[] = accepted.map((a) => ({
      id: `feat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: a.name,
      priority: a.priority,
      inScope: a.inScope,
    }));
    const newHistoryEvents = newFeatures.map((f) => createHistoryEvent(f.id, f.name, "created"));

    update({
      ...projectRef.current,
      features: [...projectRef.current.features, ...newFeatures],
      featureHistory: [...projectRef.current.featureHistory, ...newHistoryEvents],
    });

    featureSuggestion.reset();

    if (newFeatures.length > 0) {
      clearFeatureSuggestionConfirmation();
      setFeatureSuggestionConfirmation(t.mvpPlanning.featuresAddedLabel(newFeatures.length));
      featureSuggestionConfirmationTimeout.current = window.setTimeout(() => {
        featureSuggestionConfirmationTimeout.current = null;
        setFeatureSuggestionConfirmation(null);
      }, 1600);
    }
  }

  // Empty response handling, per sdd/ai/capabilities/05_feature_suggestion_assistant.md#edge-cases:
  // an empty array is "nothing to suggest," not an error — this must never
  // render as an open preview panel with zero rows. Reset to Idle immediately
  // and show a brief neutral notice instead.
  useEffect(() => {
    if (featureSuggestion.status === "ready" && featureSuggestion.proposals?.length === 0) {
      featureSuggestion.reset();
      clearFeatureSuggestionConfirmation();
      setFeatureSuggestionConfirmation(t.mvpPlanning.suggestedFeaturesEmptyNotice);
      featureSuggestionConfirmationTimeout.current = window.setTimeout(() => {
        featureSuggestionConfirmationTimeout.current = null;
        setFeatureSuggestionConfirmation(null);
      }, 1600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureSuggestion.status, featureSuggestion.proposals]);

  const featureSuggestionFailureMessage = featureSuggestion.failureKind
    ? {
        timeout: t.aiAssistant.failureTimeout,
        rate_limited: t.aiAssistant.failureRateLimited,
        unavailable: t.aiAssistant.failureUnavailable,
        safety_refusal: t.aiAssistant.failureSafetyRefusal,
        generic: t.aiAssistant.failureGeneric,
      }[featureSuggestion.failureKind]
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
    update({
      ...project,
      features: [...project.features, feature],
      featureHistory: [...project.featureHistory, createHistoryEvent(feature.id, feature.name, "created")],
    });
    setNewFeatureName("");
  }

  function updateFeature(id: string, patch: Partial<PlannedFeature>) {
    update({
      ...project,
      features: project.features.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });
  }

  function removeFeature(id: string) {
    const removed = project.features.find((f) => f.id === id);
    update({
      ...project,
      features: project.features.filter((f) => f.id !== id),
      featureHistory: removed
        ? [...project.featureHistory, createHistoryEvent(removed.id, removed.name, "removed")]
        : project.featureHistory,
    });
  }

  function annotateHistoryEvent(eventId: string, annotation: string) {
    update({
      ...project,
      featureHistory: project.featureHistory.map((e) => (e.id === eventId ? { ...e, annotation } : e)),
    });
  }

  const [showHistory, setShowHistory] = useState(false);

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

      {/* Feature Suggestion Assistant — its own Suggestion Ready cycle, distinct
          from the Scope-field assistant above. The Feature list above and below
          remains editable in every state here — Manual-first. */}
      <div aria-live="polite" aria-atomic="true" style={{ marginBottom: "var(--space-4)" }}>
        {featureSuggestionConfirmation ? (
          <Alert tone="success">{featureSuggestionConfirmation}</Alert>
        ) : (
          <>
            {featureSuggestion.status === "idle" && (
              <Button variant="secondary" onClick={handleSuggestFeatures}>
                {t.mvpPlanning.suggestFeaturesLabel}
              </Button>
            )}

            {featureSuggestion.status === "loading" && <LoadingIndicator label={t.aiAssistant.loadingLabel} />}

            {featureSuggestion.status === "ready" && featureSuggestion.proposals && (
              <FeatureSuggestionPreview
                proposals={featureSuggestion.proposals}
                existingFeatureNames={project.features.map((f) => f.name)}
                onAccept={handleAcceptProposals}
                onReject={featureSuggestion.reject}
                onRegenerate={featureSuggestion.regenerate}
              />
            )}

            {featureSuggestion.status === "failed" && featureSuggestionFailureMessage && (
              <Stack gap="var(--space-2)">
                <Alert tone="warning">{featureSuggestionFailureMessage}</Alert>
                <Button variant="secondary" onClick={featureSuggestion.retry}>
                  {t.aiAssistant.retryLabel}
                </Button>
              </Stack>
            )}
          </>
        )}
      </div>

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

      {/* Feature History — sdd/workspace/features/03_mvp_planning.md#history.
          Passive record only: automatic Created/Removed events, never a
          required step of adding or removing a Feature above. Annotation is
          entered only here, optionally, after the fact. */}
      <div style={{ marginTop: "var(--space-5)" }}>
        <Button variant="secondary" onClick={() => setShowHistory((v) => !v)}>
          {t.mvpPlanning.historyToggleLabel}
        </Button>

        {showHistory && (
          <Card style={{ marginTop: "var(--space-3)" }}>
            <h3 style={{ marginTop: 0 }}>{t.mvpPlanning.historyTitle}</h3>
            {project.featureHistory.length === 0 ? (
              <p style={{ color: "var(--color-neutral-text-muted)" }}>{t.mvpPlanning.historyEmptyDescription}</p>
            ) : (
              <Stack gap="var(--space-3)">
                {[...project.featureHistory].reverse().map((event) => (
                  <div key={event.id}>
                    <p style={{ margin: 0 }}>
                      <strong>{event.featureName}</strong> —{" "}
                      {event.eventType === "created" ? t.mvpPlanning.historyCreatedLabel : t.mvpPlanning.historyRemovedLabel}
                    </p>
                    <TextField
                      id={`history-annotation-${event.id}`}
                      label={t.mvpPlanning.historyAnnotationPlaceholder}
                      value={event.annotation ?? ""}
                      placeholder={t.mvpPlanning.historyAnnotationPlaceholder}
                      onChange={(e) => annotateHistoryEvent(event.id, e.target.value)}
                    />
                  </div>
                ))}
              </Stack>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
