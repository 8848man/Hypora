import "./ComparisonTable.css";

// Landing-owned, section-specific component — per sdd/landing/03_component_model.md
// and sdd/landing/04_component_contracts.md#comparison-table. Deliberately
// the lightest-touch motion treatment on the page (fast stagger, no slide) —
// this section's job is quick disambiguation, not a slow reveal, per
// sdd/landing/06_motion_system.md's Section Motion Guidelines for "What
// Hypora Is Not".
const DELAY_CLASSES = ["f0", "f1", "f2", "f3"];

export function ComparisonTable({ rows }: { rows: { label: string; description: string }[] }) {
  return (
    <div className="comparison-table" role="table">
      {rows.map((row, index) => (
        <div
          key={row.label}
          role="row"
          className={["comparison-table__row", "reveal-sm", DELAY_CLASSES[index] ?? "f3"].join(" ")}
        >
          <div role="cell" className="comparison-table__label">
            {row.label}
          </div>
          <div role="cell" className="comparison-table__desc">
            {row.description}
          </div>
        </div>
      ))}
    </div>
  );
}
