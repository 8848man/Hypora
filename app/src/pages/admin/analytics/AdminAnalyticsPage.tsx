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
import { OperationalHealthPanel } from "./OperationalHealthPanel";
import { UsagePulsePanel } from "./UsagePulsePanel";
import { OverviewPanel } from "./OverviewPanel";
import { FunnelPanel } from "./FunnelPanel";
import { AiScorecardPanel } from "./AiScorecardPanel";
import { FeatureAdoptionPanel } from "./FeatureAdoptionPanel";
import { TimeToFirstValuePanel } from "./TimeToFirstValuePanel";
import { EventTimelinePanel } from "./EventTimelinePanel";
import { EventDetailPanel } from "./EventDetailPanel";
import type { AnalyticsEvent, AnalyticsEventName } from "../../../platform/analytics/eventTracker";

// The Workspace lifecycle funnel — a second FunnelPanel instance, per
// sdd/analytics/06_query_and_reporting.md's Query Model ("a funnel is
// configuration, not code"). No Signup step: V1 has no Authentication, so
// signup_started never fires yet — including it would show a permanent,
// meaningless 0% conversion rather than a real finding.
const WORKFLOW_FUNNEL_STEPS: AnalyticsEventName[] = [
  "workspace_started",
  "project_created",
  "business_structuring_review_confirmed",
  "mvp_scope_marked_complete",
  "validation_item_resolved",
];

export function AdminAnalyticsPage() {
  const { status, user, error, signIn, signOut } = useAdminAuth();
  const [selectedEvent, setSelectedEvent] = useState<AnalyticsEvent>();
  const [sessionFilter, setSessionFilter] = useState<string>();

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

      {/* Ordered by decision-density, not by data-pipeline convenience --
          "is analytics itself working" comes first (nothing else here is
          trustworthy if it isn't), then the four product-decision questions
          in order, then the raw log as a drill-down tool, not the headline. */}
      <Stack gap="var(--space-5)">
        <section>
          <h3>Operational Health</h3>
          <OperationalHealthPanel />
        </section>

        <section>
          <h3>Usage Pulse</h3>
          <UsagePulsePanel />
        </section>

        <section>
          <h3>Acquisition Funnel</h3>
          <OverviewPanel />
        </section>

        <section>
          <h3>Workflow Funnel</h3>
          <FunnelPanel steps={WORKFLOW_FUNNEL_STEPS} />
        </section>

        <section>
          <h3>AI Capability Scorecard</h3>
          <AiScorecardPanel />
        </section>

        <section>
          <h3>Feature Adoption</h3>
          <FeatureAdoptionPanel />
        </section>

        <section>
          <h3>Time to First Value</h3>
          <TimeToFirstValuePanel />
        </section>

        <section>
          <h3>Event Timeline</h3>
          <EventTimelinePanel
            onSelectEvent={setSelectedEvent}
            sessionFilter={sessionFilter}
            onClearSessionFilter={() => setSessionFilter(undefined)}
          />
        </section>

        {selectedEvent && (
          <EventDetailPanel
            event={selectedEvent}
            onClose={() => setSelectedEvent(undefined)}
            onFilterSession={(sessionId) => setSessionFilter(sessionId)}
          />
        )}
      </Stack>
    </div>
  );
}
