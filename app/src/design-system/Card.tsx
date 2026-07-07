import type { CSSProperties, ReactNode } from "react";
import "./Card.css";

export function Card({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={["ds-card", className].filter(Boolean).join(" ")} style={style}>
      {children}
    </div>
  );
}
