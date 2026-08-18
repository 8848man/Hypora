// Project Cloud Persistence — the only file in this codebase permitted to
// read or write Project data to/from Firestore, mirroring the existing
// one-file-per-Firestore-concern convention (FirebaseEventTracker,
// FirebaseAnalyticsRepository). Two distinct callers use this module very
// differently:
//
// - storage.ts's anonymous-mode saveProject (ADR-0024): fire-and-forget,
//   best-effort backup under the per-device Anonymous Auth uid.
// - storage.ts's linked-account mode, and accountMigration.ts (ADR-0025):
//   awaited, error-propagating reads/writes against a real account's uid —
//   Firestore is the actual source of truth once an account is linked, so
//   failures here must surface, not be swallowed.

import { getFirebaseApp } from "../analytics/firebaseApp";
import { resolveFirebaseCoreConfig } from "../analytics/config";
import { getAnonymousUid } from "../auth/authService";
import type { Project } from "../../domain/types";

type FirestoreHandle = {
  firestore: import("firebase/firestore").Firestore;
  doc: typeof import("firebase/firestore").doc;
  setDoc: typeof import("firebase/firestore").setDoc;
  getDoc: typeof import("firebase/firestore").getDoc;
  collection: typeof import("firebase/firestore").collection;
  getDocs: typeof import("firebase/firestore").getDocs;
};

let handlePromise: Promise<FirestoreHandle> | undefined;

async function getHandle(): Promise<FirestoreHandle> {
  if (!handlePromise) {
    handlePromise = (async () => {
      const config = resolveFirebaseCoreConfig();
      if (!config) {
        throw new Error("Firestore project persistence requires Firebase configuration (VITE_FIREBASE_*) to be set.");
      }
      const { getFirestore, doc, setDoc, getDoc, collection, getDocs } = await import("firebase/firestore");
      const app = await getFirebaseApp(config);
      return { firestore: getFirestore(app), doc, setDoc, getDoc, collection, getDocs };
    })();
  }
  return handlePromise;
}

/** Awaited, error-propagating write — the primitive every other function here builds on. */
export async function writeProjectToCloud(uid: string, project: Project): Promise<void> {
  const { firestore, doc, setDoc } = await getHandle();
  await setDoc(doc(firestore, "users", uid, "projects", project.id), project);
}

export async function readProjectFromCloud(uid: string, projectId: string): Promise<Project | null> {
  const { firestore, doc, getDoc } = await getHandle();
  const snapshot = await getDoc(doc(firestore, "users", uid, "projects", projectId));
  return snapshot.exists() ? (snapshot.data() as Project) : null;
}

export async function listProjectsFromCloud(uid: string): Promise<Project[]> {
  const { firestore, collection, getDocs } = await getHandle();
  const snapshot = await getDocs(collection(firestore, "users", uid, "projects"));
  return snapshot.docs.map((d) => d.data() as Project);
}

/**
 * Fires a best-effort Firestore backup of `project`, keyed by this browser
 * profile's stable Anonymous Auth uid. Never awaited by its caller, never
 * throws, never retries — a failure here (offline, quota, unconfigured
 * Firebase) simply means this save has no backup yet; the next successful
 * save backs it up then. See ADR-0024 for why this is intentionally
 * fire-and-forget rather than blocking or surfacing errors to the user.
 * Anonymous-mode only — a linked account's saves go through
 * writeProjectToCloud directly and awaited, per ADR-0025.
 */
export function syncProjectInBackground(project: Project): void {
  void (async () => {
    try {
      const uid = await getAnonymousUid();
      await writeProjectToCloud(uid, project);
    } catch {
      // Intentionally silent — see docstring above.
    }
  })();
}
