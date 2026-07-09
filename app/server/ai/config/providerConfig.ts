// Provider Configuration — logical schema per sdd/ai/02_provider_independence_and_configuration.md
// ("Provider Configuration Schema"). Fields only; no real secret values ever live here
// (secretRef is a symbolic reference, resolved elsewhere by a future Credential Loader —
// out of scope until a real Provider needs a real secret, per Stage 4).

export type ProviderConfigProfile = {
  providerId: string;
  capabilityId: string;
  contractVersion: string;
  model: string;
  providerParameters: Record<string, unknown>;
  secretRef?: string;
};

export type ProviderConfigRegistry = {
  resolve(capabilityId: string, contractVersion: string): ProviderConfigProfile;
};

function validateProfile(profile: ProviderConfigProfile): void {
  if (!profile.providerId) throw new Error("ProviderConfigProfile.providerId is required");
  if (!profile.capabilityId) throw new Error("ProviderConfigProfile.capabilityId is required");
  if (!profile.contractVersion) throw new Error("ProviderConfigProfile.contractVersion is required");
  if (!profile.model) throw new Error("ProviderConfigProfile.model is required");
}

export function createInMemoryProviderConfig(profiles: ProviderConfigProfile[]): ProviderConfigRegistry {
  for (const profile of profiles) validateProfile(profile);

  return {
    resolve(capabilityId: string, contractVersion: string): ProviderConfigProfile {
      const match = profiles.find(
        (profile) => profile.capabilityId === capabilityId && profile.contractVersion === contractVersion,
      );
      if (!match) {
        throw new Error(
          `No provider configuration profile for capability "${capabilityId}" contract "${contractVersion}"`,
        );
      }
      return match;
    },
  };
}
