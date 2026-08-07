// Firebase Authentication — two narrow, independent uses, per ADR-0015 (admin
// gate) and ADR-0024 (per-device Project backup identity). Neither is, nor
// accelerates, the general, still-deferred, multi-user Authentication
// Platform API capability (sdd/context/05_application_responsibilities.md#platform-api).
// The only file in this codebase permitted to import firebase/auth. Reuses
// the same shared Firebase App instance as the Analytics Platform Service
// (../analytics/firebaseApp.ts) — no second Firebase App initialization.

import { getFirebaseApp } from "../analytics/firebaseApp";
import { resolveFirebaseCoreConfig } from "../analytics/config";

export type AdminUser = {
  uid: string;
  email: string | null;
};

type AuthHandle = {
  auth: import("firebase/auth").Auth;
  signInWithEmailAndPassword: typeof import("firebase/auth").signInWithEmailAndPassword;
  signInAnonymously: typeof import("firebase/auth").signInAnonymously;
  signOut: typeof import("firebase/auth").signOut;
  onAuthStateChanged: typeof import("firebase/auth").onAuthStateChanged;
};

let handlePromise: Promise<AuthHandle> | undefined;

async function getAuthHandle(): Promise<AuthHandle> {
  if (!handlePromise) {
    handlePromise = (async () => {
      const config = resolveFirebaseCoreConfig();
      if (!config) {
        throw new Error("Firebase Authentication requires Firebase configuration (VITE_FIREBASE_*) to be set.");
      }
      const { getAuth, signInWithEmailAndPassword, signInAnonymously, signOut, onAuthStateChanged } = await import(
        "firebase/auth"
      );
      const app = await getFirebaseApp(config);
      return { auth: getAuth(app), signInWithEmailAndPassword, signInAnonymously, signOut, onAuthStateChanged };
    })();
  }
  return handlePromise;
}

export async function signInAdmin(email: string, password: string): Promise<void> {
  const { auth, signInWithEmailAndPassword } = await getAuthHandle();
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signOutAdmin(): Promise<void> {
  const { auth, signOut } = await getAuthHandle();
  await signOut(auth);
}

// Per-device identity for the Project backup (ADR-0024) — anonymous only,
// never tied to a real account. Firebase persists the resulting uid across
// sessions for the same browser profile, so a second call from the same
// profile returns the same uid rather than minting a new one each time.
export async function getAnonymousUid(): Promise<string> {
  const { auth, signInAnonymously } = await getAuthHandle();
  if (auth.currentUser) {
    return auth.currentUser.uid;
  }
  const credential = await signInAnonymously(auth);
  return credential.user.uid;
}

// Returns an unsubscribe function, mirroring Firebase's own onAuthStateChanged
// contract, even though the handle itself resolves asynchronously.
export function subscribeToAdminAuthState(callback: (user: AdminUser | null) => void): () => void {
  let unsubscribe: (() => void) | undefined;
  let cancelled = false;

  void getAuthHandle().then(({ auth, onAuthStateChanged }) => {
    if (cancelled) return;
    unsubscribe = onAuthStateChanged(auth, (user) => {
      callback(user ? { uid: user.uid, email: user.email } : null);
    });
  });

  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}
