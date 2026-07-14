// Overview panel — presentation only, per sdd/analytics/06_query_and_reporting.md
// (Analytics Dashboard "Owns: presentation only"). Requests data through the
// Analytics Query Service; never queries Firestore or knows a collection path
// exists.

import { useEffect, useState } from "react";
import { Card, LoadingIndicator, Stack } from "../../../design-system";
import { getFunnel } from "../../../platform/analytics/query/analyticsQueryService";
import type { FunnelResult } from "../../../platform/analytics/query/analyticsQueryService";

const OVERVIEW_FUNNEL_STEPS = ["landing_page_view", "cta_clicked", "workspace_started"] as const;
const OVERVIEW_RANGE_DAYS = 30;

const STEP_LABELS: Record<string, string> = {
  landing_page_view: "Landing Views",
  cta_clicked: "CTA Clicks",
  workspace_started: "Workspace Started",
};

export function OverviewPanel() {
  const [funnel, setFunnel] = useState<FunnelResult>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const since = new Date(Date.now() - OVERVIEW_RANGE_DAYS * 24 * 60 * 60 * 1000);
    getFunnel([...OVERVIEW_FUNNEL_STEPS], { since })
      .then(setFunnel)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load overview"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingIndicator label="Loading overview…" />;
  if (error) return <Card><p style={{ color: "var(--color-danger-text, crimson)" }}>{error}</p></Card>;
  if (!funnel) return null;

  const firstCount = funnel.steps[0]?.sessionCount ?? 0;
  const lastCount = funnel.steps.at(-1)?.sessionCount ?? 0;
  const overallConversionPercent = firstCount > 0 ? Math.round((lastCount / firstCount) * 1000) / 10 : 0;

  return (
    <Stack direction="row" gap="var(--space-4)">
      {funnel.steps.map((step) => (
        <Card key={step.eventName} style={{ flex: "1 1 160px", textAlign: "center" }}>
          <p style={{ margin: "0 0 var(--space-2)", color: "var(--color-neutral-text-muted)" }}>
            {STEP_LABELS[step.eventName] ?? step.eventName}
          </p>
          <p style={{ margin: 0, fontSize: "var(--font-size-heading-1)" }}>{step.sessionCount}</p>
          {step.conversionFromPreviousPercent !== null && (
            <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-neutral-text-muted)" }}>
              {step.conversionFromPreviousPercent}% of previous
            </p>
          )}
        </Card>
      ))}
      <Card style={{ flex: "1 1 160px", textAlign: "center" }}>
        <p style={{ margin: "0 0 var(--space-2)", color: "var(--color-neutral-text-muted)" }}>
          Overall Conversion
        </p>
        <p style={{ margin: 0, fontSize: "var(--font-size-heading-1)" }}>{overallConversionPercent}%</p>
      </Card>
    </Stack>
  );
}
