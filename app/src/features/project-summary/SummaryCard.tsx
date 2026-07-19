// The persisted, AI-synthesized Summary artifact's own card — per
// sdd/workspace/features/05_project_summary.md#summary-lifecycle and
// sdd/architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md.
// Always visible, regardless of Summary Lifecycle state (never hidden or
// replaced by a spinner-only state) — ADR-0017's "never blocks, never hides
// the Summary Card" requirement.

import { Badge, Button, Card, LoadingIndicator } from "../../design-system";
import type { ProjectSummary } from "../../domain/types";
import type { Resources } from "../../localization";

export function SummaryCard({
  summary,
  t,
  onOpenSync,
}: {
  summary: ProjectSummary;
  t: Resources;
  onOpenSync: () => void;
}) {
  const isGenerating = summary.status === "generating";
  const isOutOfSync = summary.status === "outOfSync";
  const hasText = summary.text.trim() !== "";

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-2)" }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{t.projectSummary.summaryCardTitle}</p>
        {isOutOfSync && <Badge tone="warning">{t.projectSummary.summaryOutOfSyncBadge}</Badge>}
      </div>

      {/* The previously persisted text, if any, always remains visible during
          Generating — this is never replaced by a spinner-only state, per
          ADR-0017. */}
      {hasText && (
        <p style={{ margin: "var(--space-2) 0 0", whiteSpace: "pre-wrap" }}>{summary.text}</p>
      )}

      {isGenerating && (
        <div style={{ marginTop: "var(--space-2)" }}>
          <LoadingIndicator label={t.projectSummary.summaryGenerating} />
        </div>
      )}

      {!isGenerating && !hasText && (
        <p style={{ margin: "var(--space-2) 0 0", color: "var(--color-neutral-text-muted)" }}>
          {t.projectSummary.summaryNotGenerated}
        </p>
      )}

      {isOutOfSync && (
        <>
          <p style={{ margin: "var(--space-2) 0 0", color: "var(--color-neutral-text-muted)" }}>
            {t.projectSummary.summaryOutOfSyncNotice}
          </p>
          <div style={{ marginTop: "var(--space-2)" }}>
            <Button variant="secondary" onClick={onOpenSync}>
              {t.projectSummary.syncSummaryButton}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
