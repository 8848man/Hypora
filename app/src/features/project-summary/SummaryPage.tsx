import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, PageHeader, ReadinessCallout, Stack } from "../../design-system";
import { blockingReason, canConfirmBuildReady, confirmBuildReady } from "../../domain/lifecycle";
import { shouldTriggerInitialGeneration } from "../../domain/summaryLifecycle";
import { useLocalization } from "../../localization";
import { useProjectSummaryAssistant } from "../../ai/useProjectSummaryAssistant";
import { useProjectContext } from "../useProject";
import { buildProjectSummaryRequest } from "./buildSummaryRequest";
import { SummaryCard } from "./SummaryCard";
import { SyncSummaryDialog } from "./SyncSummaryDialog";

export function SummaryPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, update } = useProjectContext();
  const { t, language } = useLocalization();
  const navigate = useNavigate();
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);

  // ADR-0017's sole Automatic Invocation: fires at most once per Project, the
  // moment it's first found reaching Validated with Summary still
  // NotGenerated. Scoped to this Feature's own page per this Feature's
  // ownership of the trigger (sdd/workspace/features/05_project_summary.md) —
  // hosting it here, rather than in the shared project-loading hook, keeps
  // the trigger's ownership local to the one Feature that owns it.
  const initialGeneration = useProjectSummaryAssistant();
  // Closes a React 18 Strict Mode double-effect / async-state race: without
  // this, two synchronous effect runs could both observe
  // status === "notGenerated"/"idle" before either state update commits and
  // fire two automatic invocations. Set synchronously before invoke(), so the
  // very next effect run (even one fired before any state has re-rendered)
  // sees it. Reset only when the Project itself changes.
  const hasTriggeredRef = useRef(false);
  useEffect(() => {
    hasTriggeredRef.current = false;
  }, [project.id]);
  useEffect(() => {
    if (!hasTriggeredRef.current && shouldTriggerInitialGeneration(project)) {
      hasTriggeredRef.current = true;
      update({ ...project, summary: { ...project.summary, status: "generating" } });
      initialGeneration.invoke(() => buildProjectSummaryRequest(project, language, "initial_generation"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.stage, project.summary.status]);

  useEffect(() => {
    if (initialGeneration.status === "ready" && initialGeneration.summaryText !== undefined) {
      update({
        ...project,
        summary: { text: initialGeneration.summaryText, status: "generated", generatedAt: new Date().toISOString() },
      });
      initialGeneration.reset();
    } else if (initialGeneration.status === "failed") {
      // Per ADR-0017 Decision 6: return to NotGenerated, never a stuck
      // Generating or dead-end Failed state — safely re-attempted the next
      // time the trigger condition re-evaluates.
      update({ ...project, summary: { ...project.summary, status: "notGenerated" } });
      initialGeneration.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialGeneration.status]);

  function handleApplySync(text: string) {
    update({
      ...project,
      summary: { text, status: "generated", generatedAt: new Date().toISOString() },
    });
    setSyncDialogOpen(false);
  }

  const blockingCode = blockingReason(project);
  const canvasFieldsFilled = Object.values(project.canvas).filter((v) => v.trim() !== "").length;
  const resolvedValidation = project.validationItems.filter((i) => i.status !== "open").length;

  function handleConfirmBuildReady() {
    update({ ...project, stage: confirmBuildReady(project) });
  }

  const routeFor = (section: "canvas" | "scope" | "validation") => `/app/projects/${projectId}/${section}`;

  const blockingMessage =
    blockingCode &&
    ({
      canvas: t.projectSummary.blockingCanvas,
      scope: t.projectSummary.blockingScope,
      "feature-planning": t.projectSummary.blockingFeaturePlanning,
      "validation-empty": t.projectSummary.blockingValidationEmpty,
      "validation-open": t.projectSummary.blockingValidationOpen,
      confirm: t.projectSummary.blockingConfirm,
    }[blockingCode]);

  const blockingLink =
    blockingCode === "canvas"
      ? { label: t.projectSummary.goToCanvas, route: routeFor("canvas") }
      : blockingCode === "scope" || blockingCode === "feature-planning"
        ? { label: t.projectSummary.goToMvpPlanning, route: routeFor("scope") }
        : blockingCode === "validation-empty" || blockingCode === "validation-open"
          ? { label: t.projectSummary.goToValidationPlanning, route: routeFor("validation") }
          : null;

  return (
    <div>
      <PageHeader title={t.projectSummary.title} subtitle={t.projectSummary.subtitle} />

      {blockingMessage && (
        <ReadinessCallout
          message={blockingMessage}
          linkLabel={blockingLink?.label}
          onNavigate={blockingLink ? () => navigate(blockingLink.route) : undefined}
        />
      )}

      <Stack gap="var(--space-3)">
        <SummaryCard summary={project.summary} t={t} onOpenSync={() => setSyncDialogOpen(true)} />
        <Card>
          <p style={{ margin: 0, fontWeight: 600 }}>{t.projectSummary.businessCanvasTitle}</p>
          <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-neutral-text-muted)" }}>
            {t.projectSummary.fieldsCompleted(canvasFieldsFilled, 5)}
          </p>
        </Card>
        <Card>
          <p style={{ margin: 0, fontWeight: 600 }}>{t.projectSummary.mvpPlanningTitle}</p>
          <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-neutral-text-muted)" }}>
            {t.projectSummary.mvpPlanningStatus(
              project.mvpScopeComplete,
              project.features.length,
              project.featurePlanningComplete,
            )}
          </p>
        </Card>
        <Card>
          <p style={{ margin: 0, fontWeight: 600 }}>{t.projectSummary.validationPlanningTitle}</p>
          <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-neutral-text-muted)" }}>
            {t.projectSummary.validationStatus(resolvedValidation, project.validationItems.length)}
          </p>
        </Card>
      </Stack>

      <div style={{ marginTop: "var(--space-5)" }}>
        {project.stage === "build-ready" ? (
          <Badge tone="success">{t.projectSummary.isBuildReady}</Badge>
        ) : (
          <Button onClick={handleConfirmBuildReady} disabled={!canConfirmBuildReady(project)}>
            {t.projectSummary.confirmBuildReady}
          </Button>
        )}
      </div>

      {syncDialogOpen && (
        <SyncSummaryDialog
          project={project}
          language={language}
          t={t}
          onApply={handleApplySync}
          onCancel={() => setSyncDialogOpen(false)}
        />
      )}
    </div>
  );
}
