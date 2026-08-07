// KST display formatting for the internal Analytics Dashboard only — per
// sdd/analytics/06_query_and_reporting.md's Event Timeline scope
// ("operator-local display, e.g. KST"). This is presentation only: stored
// timestamps remain ISO 8601 UTC (Event Model envelope), never converted at
// rest or in any query boundary.

const KST_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatKst(isoTimestamp: string): string {
  return `${KST_FORMATTER.format(new Date(isoTimestamp))} KST`;
}

export function formatRelativeTime(isoTimestamp: string): string {
  const deltaMs = Date.now() - new Date(isoTimestamp).getTime();
  const deltaSeconds = Math.round(deltaMs / 1000);
  if (deltaSeconds < 60) return "just now";
  const deltaMinutes = Math.round(deltaSeconds / 60);
  if (deltaMinutes < 60) return `${deltaMinutes}m ago`;
  const deltaHours = Math.round(deltaMinutes / 60);
  if (deltaHours < 24) return `${deltaHours}h ago`;
  const deltaDays = Math.round(deltaHours / 24);
  return `${deltaDays}d ago`;
}
