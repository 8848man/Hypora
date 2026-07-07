import "./Chip.css";

export function Chip({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      className={`ds-chip ${active ? "ds-chip--active" : ""}`}
      onClick={onToggle}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
