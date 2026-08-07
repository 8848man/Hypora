// Credential Loader — resolves a symbolic secretRef (sdd/ai/02's Provider
// Configuration Schema) into an actual value from the environment at runtime.
// Never logs, stores, or returns a credential except directly to its caller.

export function tryResolveCredential(envVarName: string): string | undefined {
  return process.env[envVarName] || undefined;
}
