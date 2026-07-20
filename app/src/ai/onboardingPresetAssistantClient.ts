// Thin HTTP client for the Onboarding Preset Assistant Capability. Owns only
// request transport and failure-kind classification — never business logic,
// never a Provider concept. Identical shape to projectSummaryAssistantClient.ts.
//
// Unlike every other capability's client, this one has no accompanying
// useXAssistant lifecycle-hook wrapper — per
// sdd/ai/capabilities/07_onboarding_preset_assistant.md's Lifecycle section,
// this capability has no user-facing loading control, no manual Retry
// affordance, and no Suggestion Ready/Accept step at all (Automatic
// Invocation, called exactly once by Project Management — see
// ProjectListPage.tsx). Every failure kind collapses to the same silent
// static-preset Fallback, so there is nothing for a status-driven UI hook to
// branch on; a Feature calling this client directly and handling ok/not-ok
// is the full extent of what's needed.

import type { OnboardingPresetAssistantFailureKind, OnboardingPresetAssistantRequest, OnboardingPresetAssistantResponse } from "./types.ts";

export type OnboardingPresetAssistantResult =
  | { ok: true; data: OnboardingPresetAssistantResponse }
  | { ok: false; failureKind: OnboardingPresetAssistantFailureKind };

const KIND_MAP: Record<string, OnboardingPresetAssistantFailureKind> = {
  timeout: "timeout",
  rate_limited: "rate_limited",
  unavailable: "unavailable",
  network_failure: "unavailable",
  safety_refusal: "safety_refusal",
  validation: "generic",
  invalid_response: "generic",
  unknown: "generic",
  method_not_allowed: "generic",
};

export async function requestOnboardingPresetAssistant(
  request: OnboardingPresetAssistantRequest,
): Promise<OnboardingPresetAssistantResult> {
  try {
    const response = await fetch("/api/onboarding-preset-assistant", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
    });

    if (response.ok) {
      const data = (await response.json()) as OnboardingPresetAssistantResponse;
      return { ok: true, data };
    }

    let kind = "unknown";
    try {
      const body = (await response.json()) as { kind?: string };
      kind = body.kind ?? "unknown";
    } catch {
      // Response body wasn't JSON — fall through to the generic bucket.
    }
    return { ok: false, failureKind: KIND_MAP[kind] ?? "generic" };
  } catch {
    // Network failure / offline — collapses to the same Fallback outcome as
    // every other failure kind, per the capability spec's Failure Scenario
    // Matrix ("Offline / no network").
    return { ok: false, failureKind: "unavailable" };
  }
}
