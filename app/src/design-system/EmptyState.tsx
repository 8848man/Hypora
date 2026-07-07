import type { ReactNode } from "react";
import "./EmptyState.css";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="ds-empty-state">
      <p className="ds-empty-state__title">{title}</p>
      {description && <p className="ds-empty-state__description">{description}</p>}
      {action}
    </div>
  );
}
