// Standalone verification for Summary Lifecycle logic (ADR-0016/ADR-0017),
// independent of any HTTP/Provider/React concern. Run via:
//   npm run verify:domain-summary
// Lives under src/ (not server/scripts/) deliberately — this exercises
// Frontend-owned domain logic directly, without crossing the server/Frontend
// runtime boundary the way importing it from a server/scripts/ script would
// (see server/scripts/verifyStage6.ts's own note on why it does not do this).

import { createEmptyProject } from "./types.js";
import { shouldTriggerInitialGeneration, withSummaryOutOfSyncIfChanged } from "./summaryLifecycle.js";

// Throws rather than process.exit(1) — this file is type-checked under
// tsconfig.app.json (DOM lib, no Node types), per this file's own header
// note; `tsx` still runs it fine as a standalone Node script either way, and
// an uncaught throw exits non-zero identically for verify script purposes.
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Summary Lifecycle verification: FAIL - ${message}`);
  }
}

function main(): void {
  const base = createEmptyProject("proj_test", "Test Project");

  // Not eligible: NotGenerated but not yet Validated.
  assert(!shouldTriggerInitialGeneration({ ...base, stage: "validating" }), "must not trigger before Validated");

  // Eligible: Validated + NotGenerated.
  assert(
    shouldTriggerInitialGeneration({ ...base, stage: "validated" }),
    "must trigger once Validated with NotGenerated summary",
  );

  // Not eligible: already Generated.
  assert(
    !shouldTriggerInitialGeneration({
      ...base,
      stage: "validated",
      summary: { text: "x", status: "generated" },
    }),
    "must not re-trigger once already generated",
  );

  // OutOfSync: a Generated summary whose Canvas changed afterward.
  const generated = { ...base, summary: { text: "existing summary", status: "generated" as const } };
  const edited = { ...generated, canvas: { ...generated.canvas, problem: "a new problem statement" } };
  const afterEdit = withSummaryOutOfSyncIfChanged(generated, edited);
  assert(afterEdit.summary.status === "outOfSync", "Canvas edit on a Generated summary must mark it OutOfSync");
  assert(afterEdit.summary.text === "existing summary", "OutOfSync transition must never alter the summary text");

  // No-op: an edit while summary is NotGenerated must not spuriously flip state.
  const notGenerated = { ...base, summary: { text: "", status: "notGenerated" as const } };
  const editedNotGenerated = { ...notGenerated, mvpScope: "changed" };
  const afterEdit2 = withSummaryOutOfSyncIfChanged(notGenerated, editedNotGenerated);
  assert(afterEdit2.summary.status === "notGenerated", "must not affect a NotGenerated summary");

  // No-op: an unrelated field change (e.g. name) must not mark OutOfSync.
  const renamed = { ...generated, name: "Renamed Project" };
  const afterRename = withSummaryOutOfSyncIfChanged(generated, renamed);
  assert(afterRename.summary.status === "generated", "an unrelated field change must not mark OutOfSync");

  console.log("Summary Lifecycle verification: PASS");
}

main();
