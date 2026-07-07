import "./LoadingIndicator.css";

export function LoadingIndicator({ label }: { label: string }) {
  return (
    <div className="ds-loading" role="status">
      <span className="ds-loading__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
