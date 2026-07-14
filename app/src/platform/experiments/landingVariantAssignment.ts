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

export function resolveLandingVariant(): LandingVariantResolution {
  const override = readUrlOverride();
  if (override) {
    return { variant: override, assignmentSource: "url_override" };
  }

  const stored = readLandingVariantAssignment();
  if (stored) {
    return { variant: stored.variant, assignmentSource: "storage" };
  }

  const variant = randomVariant();
  writeLandingVariantAssignment(variant);
  return { variant, assignmentSource: "random" };
}
