// Internal-operator Authentication — Firebase Authentication only, per
// ADR-0015. This is a narrow, admin-gate-only login for the Analytics
// Dashboard; it is distinct from, and does not accelerate or substitute for,
// the general, still-deferred, multi-user Authentication Platform API
// capability (sdd/context/05_application_responsibilities.md#platform-api).
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
  signOut: typeof import("firebase/auth").signOut;
  onAuthStateChanged: typeof import("firebase/auth").onAuthStateChanged;
};

let handlePromise: Promise<AuthHandle> | undefined;

async function getAuthHandle(): Promise<AuthHandle> {
  if (!handlePromise) {
    handlePromise = (async () => {
      const config = resolveFirebaseCoreConfig();
      if (!config) {
        throw new Error("Admin sign-in requires Firebase configuration (VITE_FIREBASE_*) to be set.");
      }
      const { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } = await import("firebase/auth");
      const app = await getFirebaseApp(config);
      return { auth: getAuth(app), signInWithEmailAndPassword, signOut, onAuthStateChanged };
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
