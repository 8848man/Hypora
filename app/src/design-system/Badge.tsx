import "./Badge.css";

type Tone = "neutral" | "success" | "warning" | "danger" | "primary";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: string;
  tone?: Tone;
  className?: string;
}) {
  return <span className={["ds-badge", `ds-badge--${tone}`, className].filter(Boolean).join(" ")}>{children}</span>;
}
