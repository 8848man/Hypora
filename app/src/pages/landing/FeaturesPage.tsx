import { Card, PageHeader, Stack } from "../../design-system";

const FEATURES = [
  {
    name: "Project Management",
    description: "Create and manage every business idea you're structuring, in one dashboard.",
  },
  {
    name: "Business Structuring",
    description: "A five-part Canvas — Business Idea, Problem, Target Customer, Solution, Value Proposition.",
  },
  {
    name: "MVP Planning",
    description: "Draw your scope boundary and prioritize the features that make the first version.",
  },
  {
    name: "Validation Planning",
    description: "Turn your hypothesis into testable assumptions, each with a method and a success criterion.",
  },
  {
    name: "Project Summary",
    description: "See readiness at a glance, and confirm when a plan is Build-Ready.",
  },
];

export function FeaturesPage() {
  return (
    <div>
      <PageHeader title="Features" subtitle="Everything you need to go from idea to validated plan." />
      <Stack gap="var(--space-3)">
        {FEATURES.map((f) => (
          <Card key={f.name}>
            <h3 style={{ margin: "0 0 var(--space-1)" }}>{f.name}</h3>
            <p style={{ margin: 0, color: "var(--color-neutral-text-muted)" }}>{f.description}</p>
          </Card>
        ))}
      </Stack>
    </div>
  );
}
