// Feature-local Feature History utility — per
// sdd/workspace/features/03_mvp_planning.md#history. Automatic Created/Removed
// events only; never a field-level edit log, never a Feature's origin
// (manual vs. AI-accepted). Workspace/MVP-Planning-owned data, unrelated to
// any AI capability's own interaction state.

import type { FeatureHistoryEvent, FeatureHistoryEventType } from "../../domain/types";

export function createHistoryEvent(
  featureId: string,
  featureName: string,
  eventType: FeatureHistoryEventType,
): FeatureHistoryEvent {
  return {
    id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    featureId,
    featureName,
    eventType,
    timestamp: new Date().toISOString(),
  };
}
