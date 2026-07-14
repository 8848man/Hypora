import { Link } from "react-router-dom";
import { Button, Card, Stack } from "../../design-system";
import { useLandingContext } from "../../layout/LandingLayout";
import { useLocalization } from "../../localization";
import { trackEvent } from "../../platform/analytics";

export function HomePage() {
  const { t } = useLocalization();
  const { variant } = useLandingContext();
  const content = t.landingVariants[variant];

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
          {content.heroTitle}
        </h1>
        <p
          style={{
            fontSize: "var(--font-size-heading-3)",
            color: "var(--color-neutral-text-muted)",
            maxWidth: 640,
            margin: "0 auto var(--space-5)",
          }}
        >
          {content.heroSubtitle}
        </p>
        <Link to="/app" onClick={handleHeroCtaClick}>
          <Button>{content.ctaLabel}</Button>
        </Link>
      </section>

      <Stack direction="row" gap="var(--space-4)" style={{ marginTop: "var(--space-6)" }}>
        <Card style={{ flex: "1 1 240px" }}>
          <h3>{content.valueCard1Title}</h3>
          <p>{content.valueCard1Body}</p>
        </Card>
        <Card style={{ flex: "1 1 240px" }}>
          <h3>{content.valueCard2Title}</h3>
          <p>{content.valueCard2Body}</p>
        </Card>
        <Card style={{ flex: "1 1 240px" }}>
          <h3>{content.valueCard3Title}</h3>
          <p>{content.valueCard3Body}</p>
        </Card>
      </Stack>
    </div>
  );
}
