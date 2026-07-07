import { Alert, PageHeader, TextArea } from "../../design-system";
import { advanceAfterCanvasEdit } from "../../domain/lifecycle";
import type { Canvas } from "../../domain/types";
import { useProjectContext } from "../useProject";

const FIELDS: { key: keyof Canvas; label: string; hint: string }[] = [
  { key: "businessIdea", label: "Business Idea", hint: "What's the idea, in a sentence or two?" },
  { key: "problem", label: "Problem", hint: "What problem does this solve, and for whom?" },
  { key: "targetCustomer", label: "Target Customer", hint: "Who specifically has this problem?" },
  { key: "solution", label: "Solution", hint: "What are you proposing to build?" },
  {
    key: "valueProposition",
    label: "Value Proposition",
    hint: "Why would someone choose this over alternatives?",
  },
];

export function CanvasPage() {
  const { project, update, saveError } = useProjectContext();

  function setField(key: keyof Canvas, value: string) {
    const canvas = { ...project.canvas, [key]: value };
    const next = { ...project, canvas };
    next.stage = advanceAfterCanvasEdit(next);
    update(next);
  }

  return (
    <div>
      <PageHeader
        title="Business Canvas"
        subtitle="Structure your idea into a clear hypothesis. Any order is fine — revisit anything anytime."
      />
      {saveError && <Alert>{saveError}</Alert>}

      {FIELDS.map((f) => (
        <TextArea
          key={f.key}
          label={f.label}
          hint={f.hint}
          value={project.canvas[f.key]}
          onChange={(e) => setField(f.key, e.target.value)}
        />
      ))}

      <TextArea
        label="Risk Notes (optional)"
        hint="What could make this idea wrong? This doesn't block progress — it's just for your own reflection."
        value={project.riskNotes}
        onChange={(e) => update({ ...project, riskNotes: e.target.value })}
      />
    </div>
  );
}
