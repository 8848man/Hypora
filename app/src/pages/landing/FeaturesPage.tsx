import { Card, PageHeader, Stack } from "../../design-system";
import { useLandingContext } from "../../layout/LandingLayout";
import { useLocalization } from "../../localization";

export function FeaturesPage() {
  const { t } = useLocalization();
  const { variant } = useLandingContext();
  const content = t.landingVariants[variant];

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
      <PageHeader title={content.featuresTitle} subtitle={content.featuresSubtitle} />
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
