import "./ProgressIndicator.css";

export function ProgressIndicator({ current, total }: { current: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100);
  return (
    <div className="ds-progress" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
      <div className="ds-progress__label">
        Question {Math.min(current + 1, total)} of {total}
      </div>
      <div className="ds-progress__track">
        <div className="ds-progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
