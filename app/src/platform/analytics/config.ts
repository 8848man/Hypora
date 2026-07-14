// Firebase configuration — read from Vite-injected environment variables only,
// per sdd/analytics/03_provider_independence.md (Credential Separation). No
// config value is ever hardcoded here. Firebase's own web config values
// (apiKey, appId, ...) are not secrets in the sense a server credential is —
// they are safe to ship in a client bundle — but are still sourced exclusively
// from configuration, never inlined. See app/.env.example for the expected
// variable names.
//
// Two independent configs are resolved from the same underlying Firebase
// project: Firestore (the real Analytics Provider) and GA4 reporting (a
// separate, optional, non-portable sink — see 03_provider_independence.md's
// GA4 carve-out). Either may be configured without the other.

const DEFAULT_EVENTS_COLLECTION = "events";

export type FirebaseCoreConfig = {
  projectId: string;
  apiKey: string;
  appId: string;
};

export type FirebaseFirestoreConfig = FirebaseCoreConfig & {
  collectionPath: string;
};

export type FirebaseAnalyticsReportingConfig = FirebaseCoreConfig & {
  measurementId: string;
};

export function resolveFirebaseCoreConfig(): FirebaseCoreConfig | undefined {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;

  if (!projectId || !apiKey || !appId) {
    return undefined;
  }

  return { projectId, apiKey, appId };
}

export function resolveFirebaseFirestoreConfig(): FirebaseFirestoreConfig | undefined {
  const core = resolveFirebaseCoreConfig();
  if (!core) {
    return undefined;
  }

  const collectionPath =
    (import.meta.env.VITE_FIREBASE_EVENTS_COLLECTION as string | undefined) ?? DEFAULT_EVENTS_COLLECTION;

  return { ...core, collectionPath };
}

export function resolveFirebaseAnalyticsReportingConfig(): FirebaseAnalyticsReportingConfig | undefined {
  const core = resolveFirebaseCoreConfig();
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined;

  if (!core || !measurementId) {
    return undefined;
  }

  return { ...core, measurementId };
}
