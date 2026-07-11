// Health validation — round-trips a trivial request through
// Service -> Provider Interface -> Provider, proving the Stage 1 pipeline is actually
// wired (not merely that the process is running).

import { HEALTH_CHECK, type Container } from "./container.js";

export type HealthResult = {
  status: "ok" | "error";
  providerId: string;
  detail?: string;
};

export async function checkAiPlatformHealth(container: Container): Promise<HealthResult> {
  try {
    await container.aiApplicationService.invoke(
      HEALTH_CHECK.capabilityId,
      HEALTH_CHECK.contractVersion,
      "health-check-probe",
    );
    return { status: "ok", providerId: container.providerId };
  } catch (err) {
    return {
      status: "error",
      providerId: container.providerId,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}
