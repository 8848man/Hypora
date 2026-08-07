// Usage Pulse panel — presentation only, per sdd/analytics/06_query_and_reporting.md's
// Dashboard Scope. Answers "are people using Hypora": today/yesterday/weekly
// active devices, new-vs-returning split, and a trend sparkline — no
// all-time total (rejected as a non-actionable, ever-increasing number
// during this dashboard's own design review).

import { useEffect, useState } from "react";
import { Alert, Card, LoadingIndicator, Sparkline, Stack } from "../../../design-system";
import {
  getUsagePulse,
  getDailyActiveDeviceTrend,
  type UsagePulseResult,
} from "../../../platform/analytics/query/analyticsQueryService";

const TREND_DAYS = 14;

function startOfDaysAgo(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

export function UsagePulsePanel() {
  const [today, setToday] = useState<UsagePulseResult>();
  const [yesterday, setYesterday] = useState<UsagePulseResult>();
  const [weekly, setWeekly] = useState<UsagePulseResult>();
  const [trend, setTrend] = useState<number[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    Promise.all([
      getUsagePulse({ since: startOfDaysAgo(0) }),
      getUsagePulse({ since: startOfDaysAgo(1), until: startOfDaysAgo(0) }),
      getUsagePulse({ since: startOfDaysAgo(7) }),
      getDailyActiveDeviceTrend(TREND_DAYS),
    ])
      .then(([t, y, w, tr]) => {
        setToday(t);
        setYesterday(y);
        setWeekly(w);
        setTrend(tr);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load usage pulse"));
  }, []);

  if (error) return <Alert tone="danger">{error}</Alert>;
  if (!today || !yesterday || !weekly || !trend) return <LoadingIndicator label="Loading usage pulse…" />;

  const trendArrow = today.activeDevices >= yesterday.activeDevices ? "▲" : "▼";

  return (
    <Card>
      <Stack direction="row" gap="var(--space-4)" style={{ alignItems: "flex-end", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: "0 0 var(--space-1)", color: "var(--color-neutral-text-muted)" }}>
            Today’s devices {trendArrow}
          </p>
          <p style={{ margin: 0, fontSize: "var(--font-size-heading-1)" }}>{today.activeDevices}</p>
          <p style={{ margin: 0, fontSize: "var(--font-size-caption)", color: "var(--color-neutral-text-muted)" }}>
            vs. {yesterday.activeDevices} yesterday
          </p>
        </div>
        <div>
          <p style={{ margin: "0 0 var(--space-1)", color: "var(--color-neutral-text-muted)" }}>
            Weekly devices
          </p>
          <p style={{ margin: 0, fontSize: "var(--font-size-heading-1)" }}>{weekly.activeDevices}</p>
          <p style={{ margin: 0, fontSize: "var(--font-size-caption)", color: "var(--color-neutral-text-muted)" }}>
            {weekly.newDevices} new · {weekly.returningDevices} returning
          </p>
        </div>
        <div>
          <p style={{ margin: "0 0 var(--space-1)", color: "var(--color-neutral-text-muted)" }}>
            {TREND_DAYS}-day trend
          </p>
          <Sparkline values={trend} label={`Daily active devices over the last ${TREND_DAYS} days`} />
        </div>
      </Stack>
    </Card>
  );
}
