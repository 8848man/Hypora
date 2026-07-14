// Analytics Dashboard — internal operations tool, per
// sdd/analytics/06_query_and_reporting.md. Not a Workspace Feature, not
// localized, no end-user audience (see that document's Non-Goals). Access is
// gated by Firebase Authentication (../../platform/auth); the actual data
// boundary is enforced by Firestore Security Rules, per ADR-0015 — this
// component's own gate is UX only, not the real security boundary.

import { useState } from "react";
import { Button, LoadingIndicator, PageHeader, Stack } from "../../../design-system";
import { useAdminAuth } from "../../../platform/auth/useAdminAuth";
import { AdminLoginForm } from "./AdminLoginForm";
import { OverviewPanel } from "./OverviewPanel";
import { EventTimelinePanel } from "./EventTimelinePanel";
import { FunnelPanel } from "./FunnelPanel";
import { EventDetailPanel } from "./EventDetailPanel";
import type { AnalyticsEvent } from "../../../platform/analytics/eventTracker";

export function AdminAnalyticsPage() {
  const { status, user, error, signIn, signOut } = useAdminAuth();
  const [selectedEvent, setSelectedEvent] = useState<AnalyticsEvent>();

  if (status === "loading") {
    return <LoadingIndicator label="Checking sign-in status…" />;
  }

  if (status === "signed-out") {
    return <AdminLoginForm onSubmit={signIn} error={error} />;
  }

  return (
    <div style={{ padding: "var(--space-5)" }}>
      <PageHeader
        title="Analytics Dashboard"
        subtitle={user?.email ?? undefined}
      />
      <Button variant="secondary" onClick={() => void signOut()} style={{ marginBottom: "var(--space-4)" }}>
        Sign Out
      </Button>

      <Stack gap="var(--space-5)">
        <section>
          <h3>Overview</h3>
          <OverviewPanel />
        </section>

        <section>
          <h3>Funnel Analysis</h3>
          <FunnelPanel />
        </section>

        <section>
          <h3>Event Timeline</h3>
          <EventTimelinePanel onSelectEvent={setSelectedEvent} />
        </section>

        {selectedEvent && <EventDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(undefined)} />}
      </Stack>
    </div>
  );
}
