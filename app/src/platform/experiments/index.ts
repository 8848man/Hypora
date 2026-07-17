// Public surface of the Landing Experiment module. Landing components import
// only from here — never from ./landingExperimentStorage directly
// (sdd/context/07_landing_experiment_strategy.md#local-storage-ownership).

export { useLandingVariant } from "./useLandingVariant";
export type { LandingVariant, AssignmentSource, LandingVariantResolution } from "./landingVariantAssignment";
