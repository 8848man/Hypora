import { useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, PageHeader, ReadinessCallout, Stack } from "../../design-system";
import { blockingReason, canConfirmBuildReady, confirmBuildReady } from "../../domain/lifecycle";
import { useProjectContext } from "../useProject";

export function SummaryPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, update } = useProjectContext();
  const navigate = useNavigate();

  const blocking = blockingReason(project);
  const canvasFieldsFilled = Object.values(project.canvas).filter((v) => v.trim() !== "").length;
  const resolvedValidation = project.validationItems.filter((i) => i.status !== "open").length;

  function handleConfirmBuildReady() {
    update({ ...project, stage: confirmBuildReady(project) });
  }

  const routeFor = (section: "canvas" | "scope" | "validation") => `/app/projects/${projectId}/${section}`;

  return (
    <div>
      <PageHeader title="Project Summary" subtitle="Readiness at a glance, aggregated from every section." />

      {blocking && (
        <ReadinessCallout
          message={blocking}
          linkLabel={
            project.stage === "captured" || project.stage === "structuring"
              ? "Go to Business Canvas"
              : project.stage === "scoped"
                ? "Go to MVP Planning"
                : project.stage === "validating"
                  ? "Go to Validation Planning"
                  : undefined
          }
          onNavigate={() => {
            if (project.stage === "captured" || project.stage === "structuring") navigate(routeFor("canvas"));
            else if (project.stage === "scoped") navigate(routeFor("scope"));
            else if (project.stage === "validating") navigate(routeFor("validation"));
          }}
        />
      )}

      <Stack gap="var(--space-3)">
        <Card>
          <p style={{ margin: 0, fontWeight: 600 }}>Business Canvas</p>
          <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-neutral-text-muted)" }}>
            {canvasFieldsFilled} of 5 fields completed
          </p>
        </Card>
        <Card>
          <p style={{ margin: 0, fontWeight: 600 }}>MVP Planning</p>
          <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-neutral-text-muted)" }}>
            Scope {project.mvpScopeComplete ? "complete" : "in progress"} · {project.features.length} feature(s)
            planned, Feature Planning {project.featurePlanningComplete ? "complete" : "in progress"}
          </p>
        </Card>
        <Card>
          <p style={{ margin: 0, fontWeight: 600 }}>Validation Planning</p>
          <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-neutral-text-muted)" }}>
            {resolvedValidation} of {project.validationItems.length} assumptions resolved
          </p>
        </Card>
      </Stack>

      <div style={{ marginTop: "var(--space-5)" }}>
        {project.stage === "build-ready" ? (
          <Badge tone="success">This project is Build-Ready</Badge>
        ) : (
          <Button onClick={handleConfirmBuildReady} disabled={!canConfirmBuildReady(project)}>
            Confirm Build-Ready
          </Button>
        )}
      </div>
    </div>
  );
}
