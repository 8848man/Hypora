import { NavLink, Outlet, useParams } from "react-router-dom";
import { Badge, LoadingIndicator, Alert } from "../design-system";
import { useProjectLoader, type ProjectContextValue } from "../features/useProject";
import { useLocalization } from "../localization";
import { LanguageSwitcher } from "./LanguageSwitcher";
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
  const { t } = useLocalization();

  if (loading) return <LoadingIndicator label={t.businessStructuring.loadingProject} />;
  if (error || !project) return <Alert>{error ?? t.errors.projectNotFound}</Alert>;

  const context: ProjectContextValue = { project, update, saveError: error };

  return (
    <div className="workspace-shell workspace-project">
      <LanguageSwitcher />

      <header className="workspace-project__header">
        <div>
          <p className="workspace-project__eyebrow">{t.common.projectLabel}</p>
          <h1 className="workspace-project__name">{project.name}</h1>
        </div>
        <Badge tone={STAGE_TONE[project.stage]}>{t.lifecycleStage[project.stage]}</Badge>
      </header>

      <nav className="workspace-project__nav">
        <NavLink to={`/app/projects/${projectId}/canvas`}>{t.nav.businessStructuring}</NavLink>
        <NavLink to={`/app/projects/${projectId}/scope`}>{t.nav.mvpPlanning}</NavLink>
        <NavLink to={`/app/projects/${projectId}/validation`}>{t.nav.validationPlanning}</NavLink>
        <NavLink to={`/app/projects/${projectId}/risks`}>{t.nav.riskMemo}</NavLink>
        <NavLink to={`/app/projects/${projectId}/summary`}>{t.nav.summary}</NavLink>
      </nav>

      <div className="workspace-project__content">
        <Outlet context={context} />
      </div>
    </div>
  );
}
