import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Stack,
  TextField,
} from "../../design-system";
import { advanceToValidated, reopenScope } from "../../domain/lifecycle";
import type { ValidationItem, ValidationStatus } from "../../domain/types";
import { useProjectContext } from "../useProject";

export function ValidationPage() {
  const { project, update } = useProjectContext();
  const [newAssumption, setNewAssumption] = useState("");

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

  if (project.stage === "captured" || project.stage === "structuring" || project.stage === "scoped") {
    return (
      <div>
        <PageHeader title="Validation Planning" />
        <Alert tone="warning">
          Complete Business Structuring and MVP Planning first — Validation Planning becomes available once
          MVP Scope and Feature Planning are both marked complete.
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Validation Planning"
        subtitle="Turn your hypothesis into testable assumptions."
        actions={
          project.stage === "validating" && (
            <Button variant="secondary" onClick={handleReopenScope}>
              Reopen MVP Planning
            </Button>
          )
        }
      />

      {canEditChecklist && (
        <Stack direction="row" style={{ marginBottom: "var(--space-4)" }}>
          <TextField
            label="Add an assumption"
            value={newAssumption}
            onChange={(e) => setNewAssumption(e.target.value)}
            placeholder="e.g. Customers will pay $10/month for this"
          />
          <Button onClick={addAssumption} disabled={!newAssumption.trim()}>
            Add
          </Button>
        </Stack>
      )}

      {project.validationItems.length === 0 ? (
        <EmptyState
          title="No assumptions yet"
          description="Add at least one assumption — an empty checklist can't be marked Validated."
        />
      ) : (
        <Stack gap="var(--space-3)">
          {project.validationItems.map((item) => (
            <Card key={item.id}>
              <p style={{ marginTop: 0, fontWeight: 600 }}>{item.assumption}</p>
              <TextField
                label="Validation method"
                value={item.method}
                onChange={(e) => updateItem(item.id, { method: e.target.value })}
                placeholder="How will you check this?"
              />
              <TextField
                label="Success criterion"
                value={item.successCriterion}
                onChange={(e) => updateItem(item.id, { successCriterion: e.target.value })}
                placeholder="What result counts as confirmed?"
              />
              <Stack direction="row" style={{ alignItems: "center" }}>
                <Badge
                  tone={
                    item.status === "validated"
                      ? "success"
                      : item.status === "invalidated"
                        ? "danger"
                        : "neutral"
                  }
                >
                  {item.status === "open" ? "Open" : item.status === "validated" ? "Validated" : "Invalidated"}
                </Badge>
                <Button
                  variant="secondary"
                  onClick={() => resolve(item.id, "validated")}
                  disabled={!item.method.trim() || !item.successCriterion.trim()}
                >
                  Mark Validated
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => resolve(item.id, "invalidated")}
                  disabled={!item.method.trim() || !item.successCriterion.trim()}
                >
                  Mark Invalidated
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {project.stage === "validated" && (
        <div style={{ marginTop: "var(--space-4)" }}>
          <Badge tone="success">All assumptions resolved — see Summary to confirm Build-Ready</Badge>
        </div>
      )}
    </div>
  );
}
