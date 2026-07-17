// Landing Experiment storage — the sole owner of Local Storage access for the
// Landing storytelling experiment, per
// sdd/context/07_landing_experiment_strategy.md#local-storage-ownership and
// sdd/frontend/01_architecture.md#localstorage-ownership. No Landing page or
// component reads/writes this key directly.

export type LandingVariant = "a" | "b" | "c";

const STORAGE_KEY = "hypora.experiment.landing_story";

// 7 days — sdd/context/07_landing_experiment_strategy.md#variant-assignment.
// A deliberate product-stage decision (documented there), not a statistical one.
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type StoredLandingAssignment = {
  variant: LandingVariant;
  assignedAt: number;
};

function isValidVariant(value: unknown): value is LandingVariant {
  return value === "a" || value === "b" || value === "c";
}

function isStoredAssignment(value: unknown): value is StoredLandingAssignment {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return isValidVariant(record.variant) && typeof record.assignedAt === "number";
}

// Returns the current assignment only if it exists, is well-formed, and has
// not expired. Corrupt JSON, an unexpected shape, a missing key, and an
// expired assignment all resolve to `undefined` — graceful recovery, never a
// thrown error, per this module's own validation requirement.
export function readLandingVariantAssignment(): StoredLandingAssignment | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;

    const parsed: unknown = JSON.parse(raw);
    if (!isStoredAssignment(parsed)) return undefined;

    if (Date.now() - parsed.assignedAt > TTL_MS) return undefined;

    return parsed;
  } catch {
    return undefined;
  }
}

export function writeLandingVariantAssignment(variant: LandingVariant): StoredLandingAssignment {
  const assignment: StoredLandingAssignment = { variant, assignedAt: Date.now() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignment));
  } catch {
    // Storage unavailable (private browsing, quota exceeded) — the caller
    // still gets a variant for this page load, it just won't persist.
  }
  return assignment;
}
