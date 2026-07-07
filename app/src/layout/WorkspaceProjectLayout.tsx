import { NavLink, Outlet, useParams } from "react-router-dom";
import { Badge, LoadingIndicator, Alert } from "../design-system";
import { STAGE_LABELS } from "../domain/lifecycle";
import { useProjectLoader, type ProjectContextValue } from "../features/useProject";
import "./WorkspaceProjectLayout.css";

const STAGE_TONE: Record<string, "neutral" | "success" | "warning" | "primary"> = {
  captured: "neutral",
  structuring: "neutral",
  scoped: "primary",
  validating: "warning",
  validated: "success",
  "build-ready": "success",
  archived: "neutral",
};

export function WorkspaceProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, loading, error, update } = useProjectLoader(projectId);

  if (loading) return <LoadingIndicator label="Loading project…" />;
  if (error || !project) return <Alert>{error ?? "Project not found."}</Alert>;

  const context: ProjectContextValue = { project, update, saveError: error };

  return (
    <div className="workspace-shell workspace-project">
      <header className="workspace-project__header">
        <div>
          <p className="workspace-project__eyebrow">Project</p>
          <h1 className="workspace-project__name">{project.name}</h1>
        </div>
        <Badge tone={STAGE_TONE[project.stage]}>{STAGE_LABELS[project.stage]}</Badge>
      </header>

      <nav className="workspace-project__nav">
        <NavLink to={`/app/projects/${projectId}/canvas`}>Business Canvas</NavLink>
        <NavLink to={`/app/projects/${projectId}/scope`}>MVP Planning</NavLink>
        <NavLink to={`/app/projects/${projectId}/validation`}>Validation Planning</NavLink>
        <NavLink to={`/app/projects/${projectId}/summary`}>Summary</NavLink>
      </nav>

      <div className="workspace-project__content">
        <Outlet context={context} />
      </div>
    </div>
  );
}
