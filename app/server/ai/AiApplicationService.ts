// AI Application Service — Stage 1 skeleton only.
//
// Per ADR-0006/sdd/ai/01_architecture.md this is the shared runtime behind every AI
// Capability. At this stage no Capability exists yet (Canvas Assistant lands in
// Stage 2, per 03_ownership_model.md's prompt/context/response ownership split) — this
// class only proves the pipeline: Capability id + contract version resolves a
// Provider configuration profile, then the Provider Interface is invoked. It carries
// no prompt/context/response logic yet; that is added in Stage 2 without changing this
// file's public shape.

import type { Provider, ProviderResponse } from "./provider/ProviderInterface.js";
import type { ProviderConfigRegistry } from "./config/providerConfig.js";

export type AiApplicationServiceDeps = {
  provider: Provider;
  config: ProviderConfigRegistry;
};

export class AiApplicationService {
  private readonly provider: Provider;
  private readonly config: ProviderConfigRegistry;

  constructor(deps: AiApplicationServiceDeps) {
    this.provider = deps.provider;
    this.config = deps.config;
  }

  async invoke(
    capabilityId: string,
    contractVersion: string,
    prompt: string,
    parameters?: Record<string, unknown>,
  ): Promise<ProviderResponse> {
    // Provider x Capability routing (sdd/ai/02) — resolved, not yet consumed for
    // anything beyond existence-checking until a real capability's config varies by profile.
    this.config.resolve(capabilityId, contractVersion);
    // `parameters` is opaque here (Record<string, unknown>) — the Service never
    // inspects it. A Capability may use it to carry a generic hint (e.g. a
    // response-shape request); only the Provider interprets it (ADR-0007). This
    // keeps structured-output generation a Provider responsibility, not a Service one.
    return this.provider.generate({ prompt, parameters });
  }
}
