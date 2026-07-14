import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useOutletContext } from "react-router-dom";
import { Button } from "../design-system";
import { useLocalization } from "../localization";
import { trackEvent } from "../platform/analytics";
import { useLandingVariant } from "../platform/experiments";
import type { LandingVariant } from "../platform/experiments";
import { LanguageSwitcher } from "./LanguageSwitcher";
import "./LandingLayout.css";

// Resolved once here (LandingLayout wraps every Landing route and stays
// mounted across Home/Features/Roadmap navigation), then threaded to nested
// pages via Outlet context — mirrors WorkspaceProjectLayout's own
// ProjectContextValue pattern, not a new mechanism.
export type LandingOutletContext = { variant: LandingVariant };

export function useLandingContext(): LandingOutletContext {
  return useOutletContext<LandingOutletContext>();
}

export function LandingLayout() {
  const { t } = useLocalization();
  const location = useLocation();
  const { variant } = useLandingVariant();
  const variantContent = t.landingVariants[variant];

  // One place for all Landing page views, rather than duplicating this call into
  // each of Home/Features/Roadmap — LandingLayout wraps every Landing route.
  useEffect(() => {
    trackEvent({ eventName: "landing_page_view", pagePath: location.pathname });
  }, [location.pathname]);

  const handleOpenWorkspaceClick = () => {
    trackEvent({
      eventName: "cta_clicked",
      pagePath: location.pathname,
      properties: { cta: "open_workspace", placement: "header" },
    });
    trackEvent({
      eventName: "workspace_started",
      pagePath: location.pathname,
      properties: { source: "header" },
    });
  };

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
          <Link to="/app" onClick={handleOpenWorkspaceClick}>
            <Button>{variantContent.ctaLabel}</Button>
          </Link>
        </div>
      </header>

      <main className="landing__main">
        <Outlet context={{ variant } satisfies LandingOutletContext} />
      </main>

      <footer className="landing__footer">
        <p>{t.landing.footer}</p>
      </footer>
    </div>
  );
}
