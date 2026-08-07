// Minimal trend-line primitive — a small inline SVG polyline, no charting
// library dependency. Deliberately the only chart primitive this Design
// System has: per the Analytics Dashboard's own scoping, a chart is added
// only where a trend (not a snapshot) is the actual question, so one small,
// reusable shape covers every such need rather than a general charting API.
export function Sparkline({
  values,
  width = 160,
  height = 32,
  label,
}: {
  values: number[];
  width?: number;
  height?: number;
  label: string;
}) {
  if (values.length < 2) return null;

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  const points = values
    .map((v, i) => `${i * stepX},${height - ((v - min) / range) * height}`)
    .join(" ");

  return (
    <svg
      role="img"
      aria-label={label}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block" }}
    >
      <polyline points={points} fill="none" stroke="var(--color-primary, #3b82f6)" strokeWidth={2} />
    </svg>
  );
}
