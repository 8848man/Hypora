// Server-side counterpart of src/platform/analytics/config.ts's
// resolveFirebaseCoreConfig — same three env vars, same "unset = not
// configured" contract, but read via process.env since server/ code runs
// under Node, not Vite (import.meta.env is a Vite-only construct and is not
// available here). Firebase's web config values are not secrets (safe to
// ship in a client bundle), so reusing the VITE_-prefixed names server-side
// introduces no new credential — Vercel injects every configured env var
// into a Function's process.env regardless of the VITE_ prefix, which only
// controls client-bundle exposure at build time.

export type FirebaseCoreConfig = {
  projectId: string;
  apiKey: string;
  appId: string;
};

export function resolveFirebaseCoreConfig(): FirebaseCoreConfig | undefined {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  const appId = process.env.VITE_FIREBASE_APP_ID;

  if (!projectId || !apiKey || !appId) {
    return undefined;
  }

  return { projectId, apiKey, appId };
}
