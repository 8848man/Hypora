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
import { useLocalization } from "../../localization";
import { useProjectContext } from "../useProject";
import { QUESTIONS, resumeQuestionIndex, v1StaticPresetProvider } from "./questionModel";

export function BusinessStructuringPage() {
  const { project, update, saveError } = useProjectContext();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLocalization();

  // Resume position derived from Canvas completeness, computed once on mount — never persisted
  // separately (per sdd/workspace/02_data_and_state.md). Backward/forward movement afterward is
  // purely local view state.
  const [currentIndex, setCurrentIndex] = useState(() => resumeQuestionIndex(project.canvas));
  const advanceTimeout = useRef<number | null>(null);

  const total = QUESTIONS.length;
  const onReview = currentIndex >= total;

  function saveAnswer(value: string) {
    const canvas = { ...project.canvas, [QUESTIONS[currentIndex].relatedCanvasField]: value };
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
  const value = project.canvas[question.relatedCanvasField];
  const presets = v1StaticPresetProvider(question.questionId, { project, language });
  const questionText = t.question[question.localizationKey].title;

  return (
    <div>
      <PageHeader title={t.businessStructuring.title} subtitle={t.businessStructuring.subtitle} />
      {saveError && <Alert>{saveError}</Alert>}

      <ProgressIndicator
        current={currentIndex}
        total={total}
        label={t.businessStructuring.progressLabel(Math.min(currentIndex + 1, total), total)}
      />

      <TransitionWrapper stepKey={question.questionId}>
        <Card>
          <h2 style={{ margin: "0 0 var(--space-4)" }}>{questionText}</h2>

          <ChoiceList
            presets={presets}
            value={value}
            writeMyOwnLabel={t.common.writeMyOwn}
            answerLabel={t.common.yourAnswer}
            answerPlaceholder={t.common.yourAnswerPlaceholder}
            onSelectPreset={handleSelectPreset}
            onCustomChange={saveAnswer}
          />
        </Card>
      </TransitionWrapper>

      <Stack direction="row" style={{ marginTop: "var(--space-5)", justifyContent: "space-between" }}>
        <Button variant="secondary" onClick={goBack} disabled={currentIndex === 0}>
          {t.common.back}
        </Button>
        <Button onClick={goNext} disabled={!value.trim()}>
          {currentIndex === total - 1 ? t.businessStructuring.continueToReview : t.common.continue}
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
  const { t } = useLocalization();

  return (
    <div>
      <PageHeader title={t.businessStructuring.reviewTitle} subtitle={t.businessStructuring.reviewSubtitle} />

      <Stack gap="var(--space-3)">
        {QUESTIONS.map((q, i) => (
          <Card key={q.questionId}>
            <Stack direction="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{t.question[q.localizationKey].title}</p>
                <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-neutral-text-muted)" }}>
                  {project.canvas[q.relatedCanvasField]}
                </p>
              </div>
              <Button variant="secondary" onClick={() => onEditQuestion(i)}>
                {t.common.edit}
              </Button>
            </Stack>
          </Card>
        ))}

        <Card>
          <TextArea
            label={t.businessStructuring.riskNotesLabel}
            hint={t.businessStructuring.riskNotesHint}
            value={project.riskNotes}
            onChange={(e) => update({ ...project, riskNotes: e.target.value })}
          />
        </Card>
      </Stack>

      <Button onClick={onConfirm} style={{ marginTop: "var(--space-5)" }}>
        {t.businessStructuring.confirmAndContinue}
      </Button>
    </div>
  );
}
