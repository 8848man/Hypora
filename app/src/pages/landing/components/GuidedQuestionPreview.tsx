import "./GuidedQuestionPreview.css";

// Landing-owned, section-specific component — per sdd/landing/03_component_model.md
// and sdd/landing/04_component_contracts.md#guided-question-preview.
//
// A MARKETING SIMULATION ONLY. It never reads or writes real Workspace/
// Project state, never queries a real Question Model instance, and never
// reuses Workspace's actual guided-flow component — every value below is
// ordinary Landing content, passed in exactly like any other localized copy
// (see sdd/landing/01_architecture.md#responsibilities' "no Workspace logic"
// boundary, enforced here at the component level).
export function GuidedQuestionPreview({
  questionLabel,
  questionText,
  chips,
  selectedIndex,
  resultLabel,
}: {
  questionLabel: string;
  questionText: string;
  chips: string[];
  selectedIndex: number;
  resultLabel: string;
}) {
  return (
    <div className="guided-preview">
      <div className="guided-preview__step reveal d0">
        <div className="guided-preview__question-label">{questionLabel}</div>
        <p className="guided-preview__question-text">{questionText}</p>
        <div className="guided-preview__chip-row" role="list" aria-label={questionText}>
          {chips.map((chip, index) => {
            const isSelected = index === selectedIndex;
            return (
              <span
                key={chip}
                role="listitem"
                aria-current={isSelected ? "true" : undefined}
                className={["guided-preview__chip", isSelected ? "guided-preview__chip--selected reveal-highlight" : ""]
                  .filter(Boolean)
                  .join(" ")}
              >
                {chip}
              </span>
            );
          })}
        </div>
      </div>
      <div className="guided-preview__result reveal reveal-after-highlight">{resultLabel}</div>
    </div>
  );
}
