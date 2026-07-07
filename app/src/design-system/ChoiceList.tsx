import { useState } from "react";
import { TextArea } from "./Field";
import "./ChoiceList.css";

/**
 * A pick-one-or-customize interaction: 3–5 preset options plus an always-available custom
 * answer path. Per sdd/design-system/01_design_system.md, presets and custom entry are
 * presented as equally valid — custom is never a hidden fallback. Per this document's
 * Localization Requirements, all display text is passed in as data, never hardcoded.
 *
 * `onSelectPreset` and `onCustomChange` are separate so a consumer can auto-advance on a
 * discrete preset pick without doing the same on every custom-text keystroke.
 */
export function ChoiceList({
  presets,
  value,
  writeMyOwnLabel,
  answerLabel,
  answerPlaceholder,
  onSelectPreset,
  onCustomChange,
}: {
  presets: string[];
  value: string;
  writeMyOwnLabel: string;
  answerLabel: string;
  answerPlaceholder: string;
  onSelectPreset: (value: string) => void;
  onCustomChange: (value: string) => void;
}) {
  const matchesPreset = presets.includes(value);
  const [customMode, setCustomMode] = useState(!matchesPreset && value !== "");

  return (
    <div className="ds-choice-list">
      <div className="ds-choice-list__options">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`ds-choice-list__option ${!customMode && value === preset ? "ds-choice-list__option--selected" : ""}`}
            onClick={() => {
              setCustomMode(false);
              onSelectPreset(preset);
            }}
          >
            {preset}
          </button>
        ))}
        <button
          type="button"
          className={`ds-choice-list__option ds-choice-list__option--custom ${customMode ? "ds-choice-list__option--selected" : ""}`}
          onClick={() => setCustomMode(true)}
        >
          {writeMyOwnLabel}
        </button>
      </div>

      {customMode && (
        <TextArea
          label={answerLabel}
          value={matchesPreset ? "" : value}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder={answerPlaceholder}
          autoFocus
        />
      )}
    </div>
  );
}
