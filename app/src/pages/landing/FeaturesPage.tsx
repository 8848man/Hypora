import { Card, PageHeader, Stack } from "../../design-system";
import { useLocalization } from "../../localization";

export function FeaturesPage() {
  const { t } = useLocalization();

  const features = [
    { name: t.landing.featureProjectManagementName, description: t.landing.featureProjectManagementDesc },
    { name: t.landing.featureBusinessStructuringName, description: t.landing.featureBusinessStructuringDesc },
    { name: t.landing.featureMvpPlanningName, description: t.landing.featureMvpPlanningDesc },
    { name: t.landing.featureValidationPlanningName, description: t.landing.featureValidationPlanningDesc },
    { name: t.landing.featureProjectSummaryName, description: t.landing.featureProjectSummaryDesc },
  ];

  return (
    <div>
      <PageHeader title={t.landing.featuresTitle} subtitle={t.landing.featuresSubtitle} />
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
