import { Link } from "react-router-dom";
import { Button, Card, Stack } from "../../design-system";
import { useLocalization } from "../../localization";
import { trackEvent } from "../../platform/analytics";

export function HomePage() {
  const { t } = useLocalization();

  const handleHeroCtaClick = () => {
    trackEvent({
      eventName: "cta_clicked",
      pagePath: "/",
      properties: { cta: "open_workspace", placement: "hero" },
    });
    trackEvent({
      eventName: "workspace_started",
      pagePath: "/",
      properties: { source: "hero" },
    });
  };

  return (
    <div>
      <section style={{ textAlign: "center", padding: "var(--space-7) 0" }}>
        <h1 style={{ fontSize: "var(--font-size-heading-1)", margin: "0 0 var(--space-3)" }}>
          {t.landing.heroTitle}
        </h1>
        <p
          style={{
            fontSize: "var(--font-size-heading-3)",
            color: "var(--color-neutral-text-muted)",
            maxWidth: 640,
            margin: "0 auto var(--space-5)",
          }}
        >
          {t.landing.heroSubtitle}
        </p>
        <Link to="/app" onClick={handleHeroCtaClick}>
          <Button>{t.nav.openWorkspace}</Button>
        </Link>
      </section>

      <Stack direction="row" gap="var(--space-4)" style={{ marginTop: "var(--space-6)" }}>
        <Card style={{ flex: "1 1 240px" }}>
          <h3>{t.landing.valueCard1Title}</h3>
          <p>{t.landing.valueCard1Body}</p>
        </Card>
        <Card style={{ flex: "1 1 240px" }}>
          <h3>{t.landing.valueCard2Title}</h3>
          <p>{t.landing.valueCard2Body}</p>
        </Card>
        <Card style={{ flex: "1 1 240px" }}>
          <h3>{t.landing.valueCard3Title}</h3>
          <p>{t.landing.valueCard3Body}</p>
        </Card>
      </Stack>
    </div>
  );
}
