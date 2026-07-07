import type { ReactNode } from "react";
import "./PageHeader.css";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="ds-page-header">
      <div>
        <h1 className="ds-page-header__title">{title}</h1>
        {subtitle && <div className="ds-page-header__subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="ds-page-header__actions">{actions}</div>}
    </div>
  );
}
