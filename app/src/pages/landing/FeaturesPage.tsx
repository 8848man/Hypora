import { Link } from "react-router-dom";
import { Button, Card, PageHeader, Stack } from "../../design-system";
import { useLandingContext } from "../../layout/LandingLayout";
import { useLocalization } from "../../localization";
import { trackEvent } from "../../platform/analytics";

export function FeaturesPage() {
  const { t } = useLocalization();
  const { variant, assignmentSource } = useLandingContext();
  const content = t.landingVariants[variant];

  // Per sdd/landing/02_information_architecture.md's Navigation Model: the
  // Features deep page carries its own CTA, rather than being a dead end a
  // visitor has to navigate back from.
  const handleCtaClick = () => {
    trackEvent({
      eventName: "cta_clicked",
      pagePath: "/features",
      properties: { cta: "open_workspace", placement: "features_page", variant, assignmentSource },
    });
    trackEvent({
      eventName: "workspace_started",
      pagePath: "/features",
      properties: { source: "features_page" },
    });
  };

  // Feature *names* are identity, shared across every variant — only the
  // description (storytelling) varies, per
  // sdd/context/07_landing_experiment_strategy.md's Experiment Definition.
  const features = [
    { name: t.landing.featureProjectManagementName, description: content.featureProjectManagementDesc },
    { name: t.landing.featureBusinessStructuringName, description: content.featureBusinessStructuringDesc },
    { name: t.landing.featureMvpPlanningName, description: content.featureMvpPlanningDesc },
    { name: t.landing.featureValidationPlanningName, description: content.featureValidationPlanningDesc },
    { name: t.landing.featureProjectSummaryName, description: content.featureProjectSummaryDesc },
  ];

  return (
    <div>
      <PageHeader
        title={content.featuresTitle}
        subtitle={content.featuresSubtitle}
        actions={
          <Link to="/app" onClick={handleCtaClick}>
            <Button className="hover-lift">{content.ctaLabel}</Button>
          </Link>
        }
      />
      <Stack gap="var(--space-3)">
        {features.map((f) => (
          <Card key={f.name}>
            <h3 style={{ margin: "0 0 var(--space-1)" }}>{f.name}</h3>
            <p style={{ margin: 0, color: "var(--color-neutral-text-muted)" }}>{f.description}</p>
          </Card>
        ))}
      </Stack>
    </div>
  );
}
