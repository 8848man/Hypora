import { useEffect, useRef, useState } from "react";
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

  // Tracks WHY customMode is (or is about to become) true — never rendered,
  // only read to decide autoFocus below. Defaults to "external" so mount-time
  // custom mode (e.g. resuming an already-answered custom question) never
  // autofocuses either.
  const customModeSource = useRef<"user" | "external">("external");

  // Resync when `value` changes for a reason other than this component's own
  // preset/custom toggle — e.g. an AI-accepted suggestion writing straight into
  // the Canvas field. Deliberately keyed on `value` only: including `presets`
  // would re-run this effect whenever the parent recomputes a new preset-array
  // reference on re-render (even though `value` hasn't changed), which would
  // immediately revert a user's "write my own" click made before typing anything
  // (value still equals a preset's text at that moment).
  useEffect(() => {
    customModeSource.current = "external";
    setCustomMode(!presets.includes(value) && value !== "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

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
          onClick={() => {
            customModeSource.current = "user";
            setCustomMode(true);
          }}
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
          // Only autofocus when the user explicitly asked to write their own
          // answer — never when customMode became true because of an external
          // value change (AI Accept, resume/hydration). A prop change on an
          // already-mounted textarea has no effect (React/native autoFocus only
          // acts at mount), so this only matters at the moment of the mount
          // that follows this exact click.
          autoFocus={customModeSource.current === "user"}
        />
      )}
    </div>
  );
}
