// AI Capability Scorecard — presentation only, per
// sdd/analytics/06_query_and_reporting.md's Dashboard Scope. Answers "which
// AI capabilities deserve investment": total requests, accept rate, failure
// rate per capability, with high-usage/low-acceptance and high-failure rows
// visually distinguished (no new query per highlighted condition — this is
// styling over the AI Capability Scorecard query's own result).

import { useEffect, useState } from "react";
import { Alert, Card, LoadingIndicator } from "../../../design-system";
import {
  getAiCapabilityScorecard,
  type AiCapabilityScorecardRow,
} from "../../../platform/analytics/query/analyticsQueryService";

const RANGE_DAYS = 30;
// Thresholds are presentation heuristics, not a new query — a capability with
// meaningful volume (enough requests for the rate to be a signal, not noise)
// and either a low accept rate or a high failure rate is worth a second look.
const MEANINGFUL_VOLUME = 10;
const LOW_ACCEPT_RATE_PERCENT = 30;
const HIGH_FAILURE_RATE_PERCENT = 15;

function rowTone(row: AiCapabilityScorecardRow): "danger" | "warning" | undefined {
  if (row.totalRequests < MEANINGFUL_VOLUME) return undefined;
  if (row.failureRate !== null && row.failureRate >= HIGH_FAILURE_RATE_PERCENT) return "danger";
  if (row.acceptRate !== null && row.acceptRate < LOW_ACCEPT_RATE_PERCENT) return "warning";
  return undefined;
}

const TONE_STYLE: Record<"danger" | "warning", string> = {
  danger: "var(--color-danger-surface, #fef2f2)",
  warning: "var(--color-warning-surface, #fffbeb)",
};

export function AiScorecardPanel() {
  const [rows, setRows] = useState<AiCapabilityScorecardRow[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const since = new Date(Date.now() - RANGE_DAYS * 24 * 60 * 60 * 1000);
    getAiCapabilityScorecard({ since })
      .then(setRows)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load AI scorecard"));
  }, []);

  if (error) return <Alert tone="danger">{error}</Alert>;
  if (!rows) return <LoadingIndicator label="Loading AI capability scorecard…" />;
  if (rows.length === 0) {
    return (
      <Card>
        <p style={{ margin: 0, color: "var(--color-neutral-text-muted)" }}>
          No AI capability invocations recorded in the last {RANGE_DAYS} days yet.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-neutral-border, #ddd)" }}>
            <th style={{ padding: "var(--space-2)" }}>Capability</th>
            <th style={{ padding: "var(--space-2)" }}>Total Requests</th>
            <th style={{ padding: "var(--space-2)" }}>Accept Rate</th>
            <th style={{ padding: "var(--space-2)" }}>Failure Rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const tone = rowTone(row);
            return (
              <tr
                key={row.capabilityId}
                style={{
                  borderBottom: "1px solid var(--color-neutral-border, #eee)",
                  backgroundColor: tone ? TONE_STYLE[tone] : undefined,
                }}
              >
                <td style={{ padding: "var(--space-2)" }}>{row.capabilityId}</td>
                <td style={{ padding: "var(--space-2)" }}>{row.totalRequests}</td>
                <td style={{ padding: "var(--space-2)" }}>{row.acceptRate === null ? "—" : `${row.acceptRate}%`}</td>
                <td style={{ padding: "var(--space-2)" }}>{row.failureRate === null ? "—" : `${row.failureRate}%`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
