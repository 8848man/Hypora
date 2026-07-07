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
import { useLocalization } from "../../localization";
import { useProjectContext } from "../useProject";

export function ValidationPage() {
  const { project, update } = useProjectContext();
  const { t } = useLocalization();
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
        <Stack direction="row" style={{ marginBottom: "var(--space-4)" }}>
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
