import "./Skeleton.css";

/**
 * The one shared skeleton primitive — a non-interactive, theme-aware
 * placeholder block a Feature composes to mirror the shape of whatever it's
 * waiting on (a text line, a chip, a card region). Per
 * sdd/design-system/01_design_system.md's Loading Pattern Policy, this is
 * deliberately the *only* skeleton component in the Design System today —
 * SkeletonText/SkeletonCard/SkeletonList are named there as compositions to
 * add once a second real, differently-shaped consumer needs one, per this
 * project's existing promote-on-second-need discipline; they are not
 * speculatively built ahead of that.
 */
export function Skeleton({
  width,
  height,
  borderRadius,
  className,
}: {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}) {
  return (
    <div
      className={`ds-skeleton${className ? ` ${className}` : ""}`}
      style={{ width, height, borderRadius }}
      // Never announced as real content, never focusable, never
      // selectable/activatable — per the Loading Pattern Policy's
      // Accessibility requirements. The containing region (not this
      // element) owns aria-busy/aria-live and any assistive-technology
      // loading text.
      aria-hidden="true"
    />
  );
}
