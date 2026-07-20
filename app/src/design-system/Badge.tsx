import type { ReactNode } from "react";
import "./Badge.css";

type Tone = "neutral" | "success" | "warning" | "danger" | "primary" | "info";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  // ReactNode, not just string -- ADR-0022's next-recommended badge composes
  // an icon with text (e.g. an arrow + "Next"), which a string-only prop
  // can't express. Every existing caller already passes a plain string,
  // which is a valid ReactNode, so this is additive, not a behavior change.
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return <span className={["ds-badge", `ds-badge--${tone}`, className].filter(Boolean).join(" ")}>{children}</span>;
}
