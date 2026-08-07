// Project Cloud Backup — the only file in this codebase permitted to write
// Project data to Firestore, mirroring the existing one-file-per-Firestore-
// concern convention (FirebaseEventTracker, FirebaseAnalyticsRepository).
// Per ADR-0024: LocalStorage (src/platform/storage.ts) remains the
// synchronous source of truth for every existing read/write call site; this
// module only backs Projects up, best-effort, in the background. It must
// never throw into a caller and must never block or slow down a save.

import { getFirebaseApp } from "../analytics/firebaseApp";
import { resolveFirebaseCoreConfig } from "../analytics/config";
import { getAnonymousUid } from "../auth/authService";
import type { Project } from "../../domain/types";

type FirestoreHandle = {
  firestore: import("firebase/firestore").Firestore;
  doc: typeof import("firebase/firestore").doc;
  setDoc: typeof import("firebase/firestore").setDoc;
};

let handlePromise: Promise<FirestoreHandle> | undefined;

async function getHandle(): Promise<FirestoreHandle> {
  if (!handlePromise) {
    handlePromise = (async () => {
      const config = resolveFirebaseCoreConfig();
      if (!config) {
        throw new Error("Firestore project backup requires Firebase configuration (VITE_FIREBASE_*) to be set.");
      }
      const { getFirestore, doc, setDoc } = await import("firebase/firestore");
      const app = await getFirebaseApp(config);
      return { firestore: getFirestore(app), doc, setDoc };
    })();
  }
  return handlePromise;
}

/**
 * Fires a best-effort Firestore backup of `project`, keyed by this browser
 * profile's stable Anonymous Auth uid. Never awaited by its caller, never
 * throws, never retries — a failure here (offline, quota, unconfigured
 * Firebase) simply means this save has no backup yet; the next successful
 * save backs it up then. See ADR-0024 for why this is intentionally
 * fire-and-forget rather than blocking or surfacing errors to the user.
 */
export function syncProjectInBackground(project: Project): void {
  void (async () => {
    try {
      const uid = await getAnonymousUid();
      const { firestore, doc, setDoc } = await getHandle();
      await setDoc(doc(firestore, "users", uid, "projects", project.id), project);
    } catch {
      // Intentionally silent — see docstring above.
    }
  })();
}
