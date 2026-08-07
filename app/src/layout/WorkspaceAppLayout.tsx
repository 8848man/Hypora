import { Outlet } from "react-router-dom";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AccountMenu } from "./AccountMenu";
import "./WorkspaceAppLayout.css";

/**
 * The shared parent of every Workspace route (`/app`, `/app/projects/:id/*`),
 * per ADR-0026 — the one place account/login and the language switcher live,
 * consolidated out of ProjectListPage and WorkspaceProjectLayout (which
 * previously each rendered their own LanguageSwitcher independently). Its own
 * child route content renders via <Outlet/> below; WorkspaceProjectLayout's
 * existing within-Project section nav is unchanged and continues to render
 * beneath this shell.
 */
export function WorkspaceAppLayout() {
  return (
    <div className="workspace-app-shell">
      <header className="workspace-app-shell__bar">
        <span className="workspace-app-shell__brand">Hypora</span>
        <div className="workspace-app-shell__actions">
          <LanguageSwitcher />
          <AccountMenu />
        </div>
      </header>
      <Outlet />
    </div>
  );
}
