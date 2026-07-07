import { PageHeader, Stepper } from "../../design-system";
import { useLocalization } from "../../localization";

export function RoadmapPage() {
  const { t } = useLocalization();

  const stages = [
    { name: t.landing.roadmapV1Name, description: t.landing.roadmapV1Desc },
    { name: t.landing.roadmapV2Name, description: t.landing.roadmapV2Desc },
    { name: t.landing.roadmapV3Name, description: t.landing.roadmapV3Desc },
    { name: t.landing.roadmapV4Name, description: t.landing.roadmapV4Desc },
    { name: t.landing.roadmapV5Name, description: t.landing.roadmapV5Desc },
  ];

  return (
    <div>
      <PageHeader title={t.landing.roadmapTitle} subtitle={t.landing.roadmapSubtitle} />
      <Stepper steps={stages} />
    </div>
  );
}
