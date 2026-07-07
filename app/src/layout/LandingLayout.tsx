import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "../design-system";
import { useLocalization } from "../localization";
import { LanguageSwitcher } from "./LanguageSwitcher";
import "./LandingLayout.css";

export function LandingLayout() {
  const { t } = useLocalization();

  return (
    <div className="landing">
      <header className="landing__header">
        {/* "Hypora" is the product's brand name, not localized content — proper nouns are
            outside this document's UI-text scope, consistent with product/brand names never
            being translated. */}
        <Link to="/" className="landing__logo">
          Hypora
        </Link>
        <nav className="landing__nav">
          <NavLink to="/" end>
            {t.nav.home}
          </NavLink>
          <NavLink to="/features">{t.nav.features}</NavLink>
          <NavLink to="/roadmap">{t.nav.roadmap}</NavLink>
        </nav>
        <div className="landing__header-actions">
          <LanguageSwitcher />
          <Link to="/app">
            <Button>{t.nav.openWorkspace}</Button>
          </Link>
        </div>
      </header>

      <main className="landing__main">
        <Outlet />
      </main>

      <footer className="landing__footer">
        <p>{t.landing.footer}</p>
      </footer>
    </div>
  );
}
