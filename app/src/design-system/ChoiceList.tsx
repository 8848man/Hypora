import { useState } from "react";
import { TextArea } from "./Field";
import "./ChoiceList.css";

/**
 * A pick-one-or-customize interaction: 3–5 preset options plus an always-available custom
 * answer path. Per sdd/design-system/01_design_system.md, presets and custom entry are
 * presented as equally valid — custom is never a hidden fallback.
 *
 * `onSelectPreset` and `onCustomChange` are separate so a consumer can auto-advance on a
 * discrete preset pick without doing the same on every custom-text keystroke.
 */
export function ChoiceList({
  presets,
  value,
  onSelectPreset,
  onCustomChange,
}: {
  presets: string[];
  value: string;
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
          Write my own
        </button>
      </div>

      {customMode && (
        <TextArea
          label="Your answer"
          value={matchesPreset ? "" : value}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="Type your own answer…"
          autoFocus
        />
      )}
    </div>
  );
}
