// Credential Loader — resolves a symbolic secretRef (sdd/ai/02's Provider
// Configuration Schema) into an actual value from the environment at runtime.
// Never logs, stores, or returns a credential except directly to its caller.

export class CredentialResolutionError extends Error {
  constructor(envVarName: string) {
    super(`Required credential environment variable "${envVarName}" is not set`);
    this.name = "CredentialResolutionError";
  }
}

export function resolveCredential(envVarName: string): string {
  const value = process.env[envVarName];
  if (!value) {
    throw new CredentialResolutionError(envVarName);
  }
  return value;
}

export function tryResolveCredential(envVarName: string): string | undefined {
  return process.env[envVarName] || undefined;
}
