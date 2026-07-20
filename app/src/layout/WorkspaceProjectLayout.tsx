import { NavLink, Outlet, useLocation, useParams } from "react-router-dom";
import { Badge, LoadingIndicator, Alert } from "../design-system";
import { useProjectLoader, type ProjectContextValue } from "../features/useProject";
import { useLocalization } from "../localization";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { resolveNavigationState, type RequiredStageId } from "../domain/navigationState";
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

// Decorative only -- aria-hidden, never the sole carrier of state (the
// completed/next text is separate, per Navigation State Semantics'
// "no state is ever conveyed by color alone" rule).
function CheckIcon() {
  return (
    <svg className="nav-status-icon" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" focusable="false">
      <path
        d="M3 8.3l3.2 3.2L13 4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="nav-status-icon" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
      <path
        d="M2.5 8h9M8.5 3.5L13 8l-4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WorkspaceProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, loading, error, update } = useProjectLoader(projectId);
  const { t } = useLocalization();
  const location = useLocation();

  if (loading) return <LoadingIndicator label={t.businessStructuring.loadingProject} />;
  if (error || !project) return <Alert>{error ?? t.errors.projectNotFound}</Alert>;

  const context: ProjectContextValue = { project, update, saveError: error };

  // Which required stage (if any) the current route is on -- computed once,
  // per sdd/workspace/01_architecture.md#navigation-state-semantics, and fed
  // to resolveNavigationState() for each required item below so the
  // current+next dedup rule (ADR-0022 Decision 5) applies consistently.
  const currentStage: RequiredStageId | null = location.pathname.endsWith("/canvas")
    ? "canvas"
    : location.pathname.endsWith("/scope")
      ? "mvp"
      : location.pathname.endsWith("/validation")
        ? "validation"
        : null;

  const requiredItems: { stage: RequiredStageId; path: string; label: string }[] = [
    { stage: "canvas", path: "canvas", label: t.nav.businessStructuring },
    { stage: "mvp", path: "scope", label: t.nav.mvpPlanning },
    { stage: "validation", path: "validation", label: t.nav.validationPlanning },
  ];

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

      {/* Per sdd/workspace/01_architecture.md#navigation-state-semantics
          (ADR-0022): required workflow stages are visually grouped and
          separate from optional tools / the always-available summary.
          Every item remains an ordinary, always-clickable NavLink --
          nothing here changes route access; only presentation. */}
      <nav className="workspace-project__nav" aria-label={t.nav.landmarkLabel}>
        <ul className="workspace-project__nav-group workspace-project__nav-group--required">
          {requiredItems.map((item) => {
            const state = resolveNavigationState(project, item.stage, currentStage);
            return (
              <li key={item.stage}>
                <NavLink
                  to={`/app/projects/${projectId}/${item.path}`}
                  className={({ isActive }) =>
                    ["nav-link", isActive ? "active" : "", state.next ? "nav-link--next" : ""]
                      .filter(Boolean)
                      .join(" ")
                  }
                >
                  {state.completed && (
                    <>
                      <CheckIcon />
                      <span className="sr-only">{t.nav.statusCompletedSr}</span>
                    </>
                  )}
                  <span className="nav-link__label">{item.label}</span>
                  {state.next && (
                    <Badge tone="info" className="nav-link__badge">
                      <ArrowIcon />
                      {t.nav.statusNextLabel}
                      <span className="sr-only">{" "}({t.nav.statusNextSr})</span>
                    </Badge>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <span className="workspace-project__nav-divider" aria-hidden="true" />

        <ul className="workspace-project__nav-group workspace-project__nav-group--utility">
          <li>
            <NavLink
              to={`/app/projects/${projectId}/risks`}
              className={({ isActive }) => ["nav-link", "nav-link--optional", isActive ? "active" : ""].filter(Boolean).join(" ")}
            >
              <span className="nav-link__label">{t.nav.riskMemo}</span>
              <span className="nav-link__tag">{t.nav.statusOptionalLabel}</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/app/projects/${projectId}/summary`}
              className={({ isActive }) => ["nav-link", "nav-link--summary", isActive ? "active" : ""].filter(Boolean).join(" ")}
            >
              <span className="nav-link__label">{t.nav.summary}</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="workspace-project__content">
        <Outlet context={context} />
      </div>
    </div>
  );
}
