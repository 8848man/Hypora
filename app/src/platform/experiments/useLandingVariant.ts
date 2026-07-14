import { useState } from "react";
import { resolveLandingVariant } from "./landingVariantAssignment";
import type { LandingVariantResolution } from "./landingVariantAssignment";

// Resolved once, at mount, via lazy initial state — not re-evaluated on
// re-render, mirroring how the Localization Layer resolves its own initial
// language once (resolveInitialLanguage) rather than on every render.
export function useLandingVariant(): LandingVariantResolution {
  const [resolution] = useState<LandingVariantResolution>(() => resolveLandingVariant());
  return resolution;
}
