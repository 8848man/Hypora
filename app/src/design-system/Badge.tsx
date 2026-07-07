import "./Badge.css";

type Tone = "neutral" | "success" | "warning" | "danger" | "primary";

export function Badge({ children, tone = "neutral" }: { children: string; tone?: Tone }) {
  return <span className={`ds-badge ds-badge--${tone}`}>{children}</span>;
}
