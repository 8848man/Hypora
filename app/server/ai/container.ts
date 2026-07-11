// Dependency Injection composition root — Stage 1.
//
// This is the ONLY place a concrete Provider is selected. Swapping Fake -> Gemini
// (Stage 4) must touch only this file's `overrideProvider` default; Capability,
// Service, config-shape, and Frontend code must never change as a result
// (ADR-0007's provider-independence guarantee, made concrete).

import { FakeProvider } from "./provider/FakeProvider.js";
import { GeminiProvider } from "./provider/GeminiProvider.js";
import { tryResolveCredential } from "./config/credentialLoader.js";
import { createInMemoryProviderConfig } from "./config/providerConfig.js";
import { AiApplicationService } from "./AiApplicationService.js";
import { CanvasAssistantCapability, CANVAS_ASSISTANT } from "./capabilities/canvasAssistant/CanvasAssistantCapability.js";
import { RiskMemoAssistantCapability, RISK_MEMO_ASSISTANT } from "./capabilities/riskMemoAssistant/RiskMemoAssistantCapability.js";
import type { Provider } from "./provider/ProviderInterface.js";

// A "-latest" alias rather than a pinned version: Gemini model versions have been
// observed to be deprecated (404) faster than expected — this alias always
// resolves to the current recommended flash model instead of requiring a code
// change each time a pinned version is retired.
const GEMINI_MODEL = "gemini-flash-latest";

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
  riskMemoAssistant: RiskMemoAssistantCapability;
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
    {
      providerId: provider.id,
      capabilityId: RISK_MEMO_ASSISTANT.capabilityId,
      contractVersion: RISK_MEMO_ASSISTANT.contractVersion,
      model: "n/a",
      providerParameters: {},
    },
  ]);

  const aiApplicationService = new AiApplicationService({ provider, config });
  const canvasAssistant = new CanvasAssistantCapability(aiApplicationService);
  const riskMemoAssistant = new RiskMemoAssistantCapability(aiApplicationService);

  return { aiApplicationService, canvasAssistant, riskMemoAssistant, providerId: provider.id };
}

export const HEALTH_CHECK = {
  capabilityId: HEALTH_CHECK_CAPABILITY_ID,
  contractVersion: HEALTH_CHECK_CONTRACT_VERSION,
};
