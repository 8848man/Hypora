import "./ReadinessCallout.css";

export function ReadinessCallout({
  message,
  linkLabel,
  onNavigate,
}: {
  message: string;
  linkLabel?: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="ds-readiness-callout">
      <p className="ds-readiness-callout__message">{message}</p>
      {linkLabel && onNavigate && (
        <button type="button" className="ds-readiness-callout__link" onClick={onNavigate}>
          {linkLabel} →
        </button>
      )}
    </div>
  );
}
