import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  ChoiceList,
  PageHeader,
  ProgressIndicator,
  Stack,
  TextArea,
  TransitionWrapper,
} from "../../design-system";
import { advanceAfterCanvasEdit } from "../../domain/lifecycle";
import { useProjectContext } from "../useProject";
import { QUESTIONS, resumeQuestionIndex, v1StaticPresetProvider } from "./questionModel";

const FIELD_LABELS: Record<string, string> = {
  businessIdea: "Business Idea",
  problem: "Problem",
  targetCustomer: "Target Customer",
  solution: "Solution",
  valueProposition: "Value Proposition",
};

export function BusinessStructuringPage() {
  const { project, update, saveError } = useProjectContext();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Resume position derived from Canvas completeness, computed once on mount — never persisted
  // separately (per sdd/workspace/02_data_and_state.md). Backward/forward movement afterward is
  // purely local view state.
  const [currentIndex, setCurrentIndex] = useState(() => resumeQuestionIndex(project.canvas));
  const advanceTimeout = useRef<number | null>(null);

  const total = QUESTIONS.length;
  const onReview = currentIndex >= total;

  function saveAnswer(value: string) {
    const canvas = { ...project.canvas, [QUESTIONS[currentIndex].id]: value };
    const next = { ...project, canvas };
    next.stage = advanceAfterCanvasEdit(next);
    update(next);
  }

  function handleSelectPreset(value: string) {
    saveAnswer(value);
    // Brief delay so the Transition Wrapper's enter animation is visible before advancing.
    if (advanceTimeout.current) window.clearTimeout(advanceTimeout.current);
    advanceTimeout.current = window.setTimeout(() => goNext(), 350);
  }

  function goNext() {
    setCurrentIndex((i) => Math.min(i + 1, total));
  }

  function goBack() {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }

  if (onReview) {
    return (
      <ReviewStep
        onEditQuestion={(i) => setCurrentIndex(i)}
        onConfirm={() => navigate(`/app/projects/${projectId}/scope`)}
      />
    );
  }

  const question = QUESTIONS[currentIndex];
  const value = project.canvas[question.id];
  const presets = v1StaticPresetProvider(question.id, { project });

  return (
    <div>
      <PageHeader title="Business Structuring" subtitle="One focused question at a time." />
      {saveError && <Alert>{saveError}</Alert>}

      <ProgressIndicator current={currentIndex} total={total} />

      <TransitionWrapper stepKey={question.id}>
        <Card>
          <p style={{ margin: "0 0 var(--space-1)", fontSize: "var(--font-size-caption)", color: "var(--color-neutral-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {FIELD_LABELS[question.id]}
          </p>
          <h2 style={{ margin: "0 0 var(--space-4)" }}>{question.purpose}</h2>

          <ChoiceList
            presets={presets}
            value={value}
            onSelectPreset={handleSelectPreset}
            onCustomChange={saveAnswer}
          />
        </Card>
      </TransitionWrapper>

      <Stack direction="row" style={{ marginTop: "var(--space-5)", justifyContent: "space-between" }}>
        <Button variant="secondary" onClick={goBack} disabled={currentIndex === 0}>
          Back
        </Button>
        <Button onClick={goNext} disabled={!value.trim()}>
          {currentIndex === total - 1 ? "Continue to Review" : "Continue"}
        </Button>
      </Stack>
    </div>
  );
}

function ReviewStep({
  onEditQuestion,
  onConfirm,
}: {
  onEditQuestion: (index: number) => void;
  onConfirm: () => void;
}) {
  const { project, update } = useProjectContext();

  return (
    <div>
      <PageHeader title="Review Your Business Canvas" subtitle="Everything in one place — edit anything before confirming." />

      <Stack gap="var(--space-3)">
        {QUESTIONS.map((q, i) => (
          <Card key={q.id}>
            <Stack direction="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{FIELD_LABELS[q.id]}</p>
                <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-neutral-text-muted)" }}>
                  {project.canvas[q.id]}
                </p>
              </div>
              <Button variant="secondary" onClick={() => onEditQuestion(i)}>
                Edit
              </Button>
            </Stack>
          </Card>
        ))}

        <Card>
          <TextArea
            label="Risk Notes (optional)"
            hint="What could make this idea wrong? This doesn't block completion — it's just for your own reflection."
            value={project.riskNotes}
            onChange={(e) => update({ ...project, riskNotes: e.target.value })}
          />
        </Card>
      </Stack>

      <Button onClick={onConfirm} style={{ marginTop: "var(--space-5)" }}>
        Confirm and Continue to MVP Planning
      </Button>
    </div>
  );
}
