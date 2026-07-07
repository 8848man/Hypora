import { useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, PageHeader, ReadinessCallout, Stack } from "../../design-system";
import { blockingReason, canConfirmBuildReady, confirmBuildReady } from "../../domain/lifecycle";
import { useLocalization } from "../../localization";
import { useProjectContext } from "../useProject";

export function SummaryPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, update } = useProjectContext();
  const { t } = useLocalization();
  const navigate = useNavigate();

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
    </div>
  );
}
