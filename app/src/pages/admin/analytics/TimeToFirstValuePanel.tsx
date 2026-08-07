// Time to First Value panel — presentation only, per
// sdd/analytics/06_query_and_reporting.md's Dashboard Scope. Answers "which
// screens confuse users" indirectly: elapsed time from Workspace Started to
// the first real value milestone (Business Structuring's Review confirmed).
// Average + median only — a distribution/histogram is deliberately not
// required by the underlying query shape and isn't rendered here.

import { useEffect, useState } from "react";
import { Alert, Card, Stack, LoadingIndicator } from "../../../design-system";
import {
  getTimeToFirstValue,
  type TimeToFirstValueResult,
} from "../../../platform/analytics/query/analyticsQueryService";

const RANGE_DAYS = 30;

function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function TimeToFirstValuePanel() {
  const [result, setResult] = useState<TimeToFirstValueResult>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const since = new Date(Date.now() - RANGE_DAYS * 24 * 60 * 60 * 1000);
    getTimeToFirstValue("workspace_started", "business_structuring_review_confirmed", { since })
      .then(setResult)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load time to first value"));
  }, []);

  if (error) return <Alert tone="danger">{error}</Alert>;
  if (!result) return <LoadingIndicator label="Loading time to first value…" />;
  if (result.sampleSize === 0) {
    return (
      <Card>
        <p style={{ margin: 0, color: "var(--color-neutral-text-muted)" }}>
          No sessions have reached Business Structuring Review in the last {RANGE_DAYS} days yet.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <Stack direction="row" gap="var(--space-5)">
        <div>
          <p style={{ margin: "0 0 var(--space-1)", color: "var(--color-neutral-text-muted)" }}>Average</p>
          <p style={{ margin: 0, fontSize: "var(--font-size-heading-1)" }}>
            {formatDuration(result.averageMs ?? 0)}
          </p>
        </div>
        <div>
          <p style={{ margin: "0 0 var(--space-1)", color: "var(--color-neutral-text-muted)" }}>Median</p>
          <p style={{ margin: 0, fontSize: "var(--font-size-heading-1)" }}>{formatDuration(result.medianMs ?? 0)}</p>
        </div>
        <div>
          <p style={{ margin: "0 0 var(--space-1)", color: "var(--color-neutral-text-muted)" }}>Sessions</p>
          <p style={{ margin: 0, fontSize: "var(--font-size-heading-1)" }}>{result.sampleSize}</p>
        </div>
      </Stack>
    </Card>
  );
}
