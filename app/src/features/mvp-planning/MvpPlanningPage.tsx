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
import { useProjectContext } from "../useProject";

const PRIORITIES: FeaturePriority[] = ["must", "should", "could"];
const PRIORITY_LABEL: Record<FeaturePriority, string> = {
  must: "Must",
  should: "Should",
  could: "Could",
};

export function MvpPlanningPage() {
  const { project, update } = useProjectContext();
  const [newFeatureName, setNewFeatureName] = useState("");

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
      <PageHeader title="MVP Planning" subtitle="Define the smallest valuable version, and what it takes to build it." />

      <Card style={{ marginBottom: "var(--space-5)" }}>
        <TextArea
          label="MVP Scope"
          hint="What counts as your first version? What's explicitly out?"
          value={project.mvpScope}
          onChange={(e) => update({ ...project, mvpScope: e.target.value })}
        />
        <Button
          variant={project.mvpScopeComplete ? "secondary" : "primary"}
          onClick={toggleScopeComplete}
          disabled={!project.mvpScope.trim() && !project.mvpScopeComplete}
        >
          {project.mvpScopeComplete ? "Marked complete ✓" : "Mark Scope complete"}
        </Button>
      </Card>

      <h2 style={{ fontSize: "var(--font-size-heading-3)" }}>Feature Planning</h2>

      <Stack direction="row" style={{ marginBottom: "var(--space-4)" }}>
        <TextField
          label="Add a feature"
          value={newFeatureName}
          onChange={(e) => setNewFeatureName(e.target.value)}
          placeholder="e.g. Search by category"
        />
        <Button onClick={addFeature} disabled={!newFeatureName.trim()}>
          Add
        </Button>
      </Stack>

      {project.features.length === 0 ? (
        <EmptyState title="No features planned yet" description="Add your first feature above." />
      ) : (
        <Stack gap="var(--space-3)">
          {project.features.map((f) => (
            <Card key={f.id}>
              <Stack direction="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{f.name}</p>
                <Button variant="secondary" onClick={() => removeFeature(f.id)}>
                  Remove
                </Button>
              </Stack>
              <Stack direction="row" style={{ marginTop: "var(--space-2)" }}>
                {PRIORITIES.map((p) => (
                  <Chip
                    key={p}
                    label={PRIORITY_LABEL[p]}
                    active={f.priority === p}
                    onToggle={() => updateFeature(f.id, { priority: p })}
                  />
                ))}
                <Chip
                  label={f.inScope ? "In Scope" : "Out of Scope"}
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
        {project.featurePlanningComplete ? "Marked complete ✓" : "Mark Feature Planning complete"}
      </Button>

      {project.stage === "validating" && (
        <div style={{ marginTop: "var(--space-4)" }}>
          <Badge tone="success">Ready for Validation Planning</Badge>
        </div>
      )}
    </div>
  );
}
