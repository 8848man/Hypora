// Dependency Injection composition root — Stage 1.
//
// This is the ONLY place a concrete Provider is selected. Swapping Fake -> Gemini
// (Stage 4) must touch only this file's `overrideProvider` default; Capability,
// Service, config-shape, and Frontend code must never change as a result
// (ADR-0007's provider-independence guarantee, made concrete).

import { FakeProvider } from "./provider/FakeProvider.ts";
import { GeminiProvider } from "./provider/GeminiProvider.ts";
import { tryResolveCredential } from "./config/credentialLoader.ts";
import { createInMemoryProviderConfig } from "./config/providerConfig.ts";
import { AiApplicationService } from "./AiApplicationService.ts";
import { CanvasAssistantCapability, CANVAS_ASSISTANT } from "./capabilities/canvasAssistant/CanvasAssistantCapability.ts";
import type { Provider } from "./provider/ProviderInterface.ts";

const GEMINI_MODEL = "gemini-2.5-flash";

// Default provider selection: Gemini if a credential is configured, Fake otherwise.
// This is the ONLY place that decision is made — swapping which Provider backs the
// default never requires touching Capability, Service, DTO, or Frontend code
// (ADR-0007). Explicit callers of createContainer(overrideProvider) are unaffected
// either way (Stage 1-3's verification scripts always pass FakeProvider explicitly).
function selectDefaultProvider(): Provider {
  const apiKey = tryResolveCredential("GEMINI_API_KEY");
  if (apiKey) {
    return new GeminiProvider({ apiKey, model: GEMINI_MODEL, temperature: 0.7 });
  }
  return new FakeProvider();
}

export type Container = {
  aiApplicationService: AiApplicationService;
  canvasAssistant: CanvasAssistantCapability;
  providerId: string;
};

// "platform.health-check" is a Stage 1 placeholder capability id used only to prove
// the routing/wiring mechanism. It is NOT a real AI Capability and is never registered
// in sdd/ai/capabilities/000_index.md — Canvas Assistant (Stage 2) is the first real one.
const HEALTH_CHECK_CAPABILITY_ID = "platform.health-check";
const HEALTH_CHECK_CONTRACT_VERSION = "0.0";

export function createContainer(overrideProvider?: Provider): Container {
  const provider = overrideProvider ?? selectDefaultProvider();

  const config = createInMemoryProviderConfig([
    {
      providerId: provider.id,
      capabilityId: HEALTH_CHECK_CAPABILITY_ID,
      contractVersion: HEALTH_CHECK_CONTRACT_VERSION,
      model: "n/a",
      providerParameters: {},
    },
    {
      providerId: provider.id,
      capabilityId: CANVAS_ASSISTANT.capabilityId,
      contractVersion: CANVAS_ASSISTANT.contractVersion,
      model: "n/a",
      providerParameters: {},
    },
  ]);

  const aiApplicationService = new AiApplicationService({ provider, config });
  const canvasAssistant = new CanvasAssistantCapability(aiApplicationService);

  return { aiApplicationService, canvasAssistant, providerId: provider.id };
}

export const HEALTH_CHECK = {
  capabilityId: HEALTH_CHECK_CAPABILITY_ID,
  contractVersion: HEALTH_CHECK_CONTRACT_VERSION,
};
