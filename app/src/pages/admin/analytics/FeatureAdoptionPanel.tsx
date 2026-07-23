// Feature Adoption panel — presentation only, per
// sdd/analytics/06_query_and_reporting.md's Dashboard Scope. Answers "which
// features create value / which are rarely used": most/least-used Workspace
// Features, grouped by the `feature` envelope field, with distinct-device
// counts (labeled "devices," not "users" — V1 has no Authentication, this is
// anonymousUserId, not a real user identity).

import { useEffect, useState } from "react";
import { Alert, Card, LoadingIndicator } from "../../../design-system";
import {
  getFeatureAdoption,
  type FeatureAdoptionRow,
} from "../../../platform/analytics/query/analyticsQueryService";

const RANGE_DAYS = 30;

export function FeatureAdoptionPanel() {
  const [rows, setRows] = useState<FeatureAdoptionRow[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const since = new Date(Date.now() - RANGE_DAYS * 24 * 60 * 60 * 1000);
    getFeatureAdoption({ since })
      .then(setRows)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load feature adoption"));
  }, []);

  if (error) return <Alert tone="danger">{error}</Alert>;
  if (!rows) return <LoadingIndicator label="Loading feature adoption…" />;
  if (rows.length === 0) {
    return (
      <Card>
        <p style={{ margin: 0, color: "var(--color-neutral-text-muted)" }}>
          No feature-attributed events recorded in the last {RANGE_DAYS} days yet.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-neutral-border, #ddd)" }}>
            <th style={{ padding: "var(--space-2)" }}>Feature</th>
            <th style={{ padding: "var(--space-2)" }}>Actions</th>
            <th style={{ padding: "var(--space-2)" }}>Unique Devices</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature} style={{ borderBottom: "1px solid var(--color-neutral-border, #eee)" }}>
              <td style={{ padding: "var(--space-2)" }}>{row.feature}</td>
              <td style={{ padding: "var(--space-2)" }}>{row.eventCount}</td>
              <td style={{ padding: "var(--space-2)" }}>{row.distinctUserCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
