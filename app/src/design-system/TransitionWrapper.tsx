import type { ReactNode } from "react";
import "./TransitionWrapper.css";

/**
 * A generic enter transition between two sequential views. Remounts (via `stepKey`) to
 * replay the animation on each step change — used by Business Structuring's question-to-
 * question advancement, but generic to any sequential flow.
 */
export function TransitionWrapper({ stepKey, children }: { stepKey: string | number; children: ReactNode }) {
  return (
    <div key={stepKey} className="ds-transition">
      {children}
    </div>
  );
}
