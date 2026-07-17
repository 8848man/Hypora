import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useOutletContext } from "react-router-dom";
import { Button } from "../design-system";
import { useLocalization } from "../localization";
import { trackEvent } from "../platform/analytics";
import { useLandingVariant } from "../platform/experiments";
import type { AssignmentSource, LandingVariant } from "../platform/experiments";
import { LanguageSwitcher } from "./LanguageSwitcher";
import "../pages/landing/motion/motion.css";
import "./LandingLayout.css";

// Resolved once here (LandingLayout wraps every Landing route and stays
// mounted across Home/Features navigation), then threaded to nested
// pages via Outlet context — mirrors WorkspaceProjectLayout's own
// ProjectContextValue pattern, not a new mechanism.
export type LandingOutletContext = { variant: LandingVariant; assignmentSource: AssignmentSource };

export function useLandingContext(): LandingOutletContext {
  return useOutletContext<LandingOutletContext>();
}

export function LandingLayout() {
  const { t } = useLocalization();
  const location = useLocation();
  const { variant, assignmentSource } = useLandingVariant();
  const variantContent = t.landingVariants[variant];

  // Scroll-chrome — per sdd/landing/06_motion_system.md's Motion Utilities;
  // header starts transparent and gains a background/blur once scrolled past
  // a small threshold, matching the prototype-phase behavior 1:1.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // One place for all Landing page views, rather than duplicating this call into
  // each of Home/Features — LandingLayout wraps every Landing route.
  // variant/assignmentSource extend the existing landing_page_view event
  // (additive properties, per sdd/context/07_landing_experiment_strategy.md#analytics)
  // rather than introducing a new event.
  useEffect(() => {
    trackEvent({
      eventName: "landing_page_view",
      pagePath: location.pathname,
      properties: { variant, assignmentSource },
    });
    // variant/assignmentSource are resolved once per LandingLayout mount and
    // never change during it — intentionally excluded from the dependency
    // array so this effect still only reruns on an actual route change.
    // eslint-disable-next-line
  }, [location.pathname]);

  const handleOpenWorkspaceClick = () => {
    trackEvent({
      eventName: "cta_clicked",
      pagePath: location.pathname,
      properties: { cta: "open_workspace", placement: "header", variant, assignmentSource },
    });
    trackEvent({
      eventName: "workspace_started",
      pagePath: location.pathname,
      properties: { source: "header" },
    });
  };

  return (
    <div className="landing">
      <header className={`landing__header scroll-chrome${scrolled ? " landing__header--scrolled" : ""}`}>
        <div className="landing__header-inner">
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
          </nav>
          <div className="landing__header-actions">
            <LanguageSwitcher />
            <Link to="/app" onClick={handleOpenWorkspaceClick}>
              <Button className="hover-lift">{variantContent.ctaLabel}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="landing__main">
        <Outlet context={{ variant, assignmentSource } satisfies LandingOutletContext} />
      </main>

      <footer className="landing__footer">
        <p>{t.landing.footer}</p>
      </footer>
    </div>
  );
}
