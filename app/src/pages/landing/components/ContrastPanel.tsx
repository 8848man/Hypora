import type { ReactNode } from "react";
import "./ContrastPanel.css";

// Landing-owned, section-specific component — per sdd/landing/03_component_model.md
// (merges the prototype phase's separate 3-card and 2-panel contrast patterns
// into one) and sdd/landing/04_component_contracts.md#contrast-panel.
//
// Purely presentational: receives already-resolved (localized, variant-
// resolved) content and renders it. Holds no animation logic of its own —
// motion state comes from the ancestor `.reveal-section.in-view` (see
// ../motion/useRevealSection.ts) that the composing section applies; this
// component only carries the static `reveal`/`d0`-`d2`/`pulse-emphasis`
// class names motion.css reads.
export interface ContrastPanelItem {
  label: string;
  description: string;
  /** At most one item should be emphasized — the composing section decides which, never this component. */
  emphasized?: boolean;
  /** Optional nested content (e.g. the two validation-check example rows) — never business logic, per the Design System's Shared Component Boundaries. */
  content?: ReactNode;
}

const DELAY_CLASSES = ["d0", "d1", "d2"];

export function ContrastPanel({ items }: { items: ContrastPanelItem[] }) {
  return (
    <div className={`contrast-panel contrast-panel--${items.length}`}>
      {items.map((item, index) => (
        <div
          key={item.label}
          className={[
            "contrast-panel__item",
            item.emphasized ? "contrast-panel__item--emphasized pulse-emphasis" : "",
            "reveal",
            DELAY_CLASSES[index] ?? "d2",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="contrast-panel__label">{item.label}</div>
          <p className="contrast-panel__description">{item.description}</p>
          {item.content}
        </div>
      ))}
    </div>
  );
}
