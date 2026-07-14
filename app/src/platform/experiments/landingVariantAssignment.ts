// Landing Experiment variant resolution — per
// sdd/context/07_landing_experiment_strategy.md. Resolution order: URL
// override (never persisted) > existing non-expired stored assignment >
// fresh random assignment (persisted). Never touches Local Storage directly
// — delegates to ./landingExperimentStorage, the sole owner of that access.

import { readLandingVariantAssignment, writeLandingVariantAssignment } from "./landingExperimentStorage";
import type { LandingVariant } from "./landingExperimentStorage";

export type { LandingVariant } from "./landingExperimentStorage";

export type AssignmentSource = "random" | "storage" | "url_override";

export type LandingVariantResolution = {
  variant: LandingVariant;
  assignmentSource: AssignmentSource;
};

const VARIANTS: LandingVariant[] = ["a", "b", "c"];

function readUrlOverride(): LandingVariant | undefined {
  if (typeof window === "undefined") return undefined;
  const value = new URLSearchParams(window.location.search).get("variant");
  return (VARIANTS as string[]).includes(value ?? "") ? (value as LandingVariant) : undefined;
}

function randomVariant(): LandingVariant {
  return VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
}

// Memoized at module scope, mirroring ../analytics/container.ts's
// activeTracker singleton pattern — deliberately not left as a per-call
// resolution. A fresh random assignment writes to storage as a real side
// effect; calling this from a React state lazy-initializer without caching
// would let React 18 StrictMode's intentional development-mode double-invoke
// call it twice, with the second call reading back what the first just
// wrote and silently reporting "storage" instead of "random" for a true
// first visit. Module-level caching also more precisely matches "resolved
// once per page load" than per-component-mount state would, since an ES
// module only re-evaluates on an actual fresh page load.
let cachedResolution: LandingVariantResolution | undefined;

export function resolveLandingVariant(): LandingVariantResolution {
  if (cachedResolution) return cachedResolution;

  const override = readUrlOverride();
  if (override) {
    cachedResolution = { variant: override, assignmentSource: "url_override" };
    return cachedResolution;
  }

  const stored = readLandingVariantAssignment();
  if (stored) {
    cachedResolution = { variant: stored.variant, assignmentSource: "storage" };
    return cachedResolution;
  }

  const variant = randomVariant();
  writeLandingVariantAssignment(variant);
  cachedResolution = { variant, assignmentSource: "random" };
  return cachedResolution;
}
