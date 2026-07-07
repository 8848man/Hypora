import type { CSSProperties, ReactNode } from "react";

export function Stack({
  children,
  gap = "var(--space-4)",
  direction = "column",
  style,
}: {
  children: ReactNode;
  gap?: string;
  direction?: "row" | "column";
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        gap,
        flexWrap: direction === "row" ? "wrap" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
