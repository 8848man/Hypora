// Shared Firebase App initialization — guards against double-initializing the
// default app when both the Firestore Provider and the GA4 Reporter are active
// simultaneously (they are independent concerns per
// sdd/analytics/03_provider_independence.md's GA4 carve-out, but both target
// the same underlying Firebase project).

export type FirebaseAppConfig = {
  projectId: string;
  apiKey: string;
  appId: string;
  measurementId?: string;
};

let appPromise: Promise<import("firebase/app").FirebaseApp> | undefined;

export function getFirebaseApp(config: FirebaseAppConfig): Promise<import("firebase/app").FirebaseApp> {
  if (!appPromise) {
    appPromise = (async () => {
      const { initializeApp, getApps, getApp } = await import("firebase/app");
      if (getApps().length) {
        return getApp();
      }
      return initializeApp({
        projectId: config.projectId,
        apiKey: config.apiKey,
        appId: config.appId,
        measurementId: config.measurementId,
      });
    })();
  }
  return appPromise;
}
