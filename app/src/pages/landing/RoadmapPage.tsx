import { PageHeader, Stepper } from "../../design-system";

const STAGES = [
  { name: "V1 — Manual Workspace", description: "Structure and validate ideas manually, no AI, no backend." },
  { name: "V2 — AI Canvas Assistant", description: "AI assistance directly inside the Canvas." },
  { name: "V3 — Market Intelligence", description: "Similar service discovery, competitor research, market trends." },
  {
    name: "V4 — Go-to-Market Planning",
    description: "Marketing channel recommendations, validation experiments, early customer strategy.",
  },
  {
    name: "V5 — AI Product Builder",
    description: "Requirement generation, SDD generation, development planning.",
  },
];

export function RoadmapPage() {
  return (
    <div>
      <PageHeader
        title="Roadmap"
        subtitle="Hypora grows from a manual workspace into an AI Co-founder — one stage at a time."
      />
      <Stepper steps={STAGES} />
    </div>
  );
}
