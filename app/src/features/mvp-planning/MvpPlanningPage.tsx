import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  PageHeader,
  Stack,
  TextArea,
  TextField,
} from "../../design-system";
import { advanceToValidating } from "../../domain/lifecycle";
import type { FeaturePriority, PlannedFeature } from "../../domain/types";
import { useLocalization } from "../../localization";
import { useProjectContext } from "../useProject";

const PRIORITIES: FeaturePriority[] = ["must", "should", "could"];

export function MvpPlanningPage() {
  const { project, update } = useProjectContext();
  const { t } = useLocalization();
  const [newFeatureName, setNewFeatureName] = useState("");

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
