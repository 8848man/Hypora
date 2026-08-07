// Firebase Authentication — three narrow, independent uses, per ADR-0015
// (admin gate), ADR-0024 (per-device Project backup identity), and ADR-0025
// (account sign-up/sign-in, migrating that per-device identity's data to the
// account). None is, nor accelerates, the general Authentication Platform API
// capability beyond what ADR-0025 itself scopes
// (sdd/context/05_application_responsibilities.md#platform-api).
// The only file in this codebase permitted to import firebase/auth. Reuses
// the same shared Firebase App instance as the Analytics Platform Service
// (../analytics/firebaseApp.ts) — no second Firebase App initialization.

import { getFirebaseApp } from "../analytics/firebaseApp";
import { resolveFirebaseCoreConfig } from "../analytics/config";

export type AdminUser = {
  uid: string;
  email: string | null;
};

export type AccountUser = {
  uid: string;
  email: string | null;
  isAnonymous: boolean;
};

type AuthHandle = {
  auth: import("firebase/auth").Auth;
  signInWithEmailAndPassword: typeof import("firebase/auth").signInWithEmailAndPassword;
  signInAnonymously: typeof import("firebase/auth").signInAnonymously;
  linkWithCredential: typeof import("firebase/auth").linkWithCredential;
  EmailAuthProvider: typeof import("firebase/auth").EmailAuthProvider;
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
      const {
        getAuth,
        signInWithEmailAndPassword,
        signInAnonymously,
        linkWithCredential,
        EmailAuthProvider,
        signOut,
        onAuthStateChanged,
      } = await import("firebase/auth");
      const app = await getFirebaseApp(config);
      return {
        auth: getAuth(app),
        signInWithEmailAndPassword,
        signInAnonymously,
        linkWithCredential,
        EmailAuthProvider,
        signOut,
        onAuthStateChanged,
      };
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

function isFirebaseAuthError(err: unknown, code: string): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === code;
}

/**
 * One form, both "sign up" and "sign in" — per ADR-0025. Always upgrades the
 * current Anonymous session in place via linkWithCredential when possible
 * (preserving its uid, and therefore everything ADR-0024 already backed up
 * under it); falls back to an ordinary sign-in only when the email already
 * belongs to an existing account (the standard "returning user, fresh
 * browser/session" case). Every caller (storage.ts's migration path) treats
 * the returned uid as "whichever account is now current," regardless of
 * which branch was taken.
 */
export async function signInOrLinkAccount(email: string, password: string): Promise<AccountUser> {
  const { auth, signInAnonymously, signInWithEmailAndPassword, linkWithCredential, EmailAuthProvider } =
    await getAuthHandle();

  if (!auth.currentUser) {
    // Mirrors getAnonymousUid()'s own guarantee -- every visitor already has
    // an anonymous session by the time a login form could exist (ADR-0024),
    // but this keeps the function correct even if called before that.
    await signInAnonymously(auth);
  }

  const credential = EmailAuthProvider.credential(email, password);

  if (auth.currentUser?.isAnonymous) {
    try {
      const result = await linkWithCredential(auth.currentUser, credential);
      return { uid: result.user.uid, email: result.user.email, isAnonymous: false };
    } catch (err) {
      const alreadyInUse =
        isFirebaseAuthError(err, "auth/email-already-in-use") || isFirebaseAuthError(err, "auth/credential-already-in-use");
      if (!alreadyInUse) throw err;
      // Fall through to an ordinary sign-in against the pre-existing account.
    }
  }

  const result = await signInWithEmailAndPassword(auth, email, password);
  return { uid: result.user.uid, email: result.user.email, isAnonymous: false };
}

export async function signOutAccount(): Promise<void> {
  const { auth, signOut } = await getAuthHandle();
  await signOut(auth);
}

export type AuthErrorKind = "weak-password" | "invalid-email" | "wrong-credentials" | "generic";

/**
 * Keeps every Firebase error code this codebase reacts to confined to this
 * sole firebase/auth-importing file — a caller (AccountMenu) never inspects
 * `err.code` itself, only this classification, so it stays free to change
 * without a second file needing to know Firebase's own code strings.
 * `wrong-credentials` deliberately covers both "no such account" and "wrong
 * password" identically -- never revealing which, a standard practice
 * against account enumeration.
 */
export function classifyAuthError(err: unknown): AuthErrorKind {
  if (isFirebaseAuthError(err, "auth/weak-password")) return "weak-password";
  if (isFirebaseAuthError(err, "auth/invalid-email")) return "invalid-email";
  if (
    isFirebaseAuthError(err, "auth/wrong-password") ||
    isFirebaseAuthError(err, "auth/user-not-found") ||
    isFirebaseAuthError(err, "auth/invalid-credential")
  ) {
    return "wrong-credentials";
  }
  return "generic";
}

/**
 * A one-shot read of the current auth state, for callers (storage.ts) that
 * need to branch synchronously-in-effect on "is this a real, linked account"
 * without subscribing. Never triggers a sign-in of any kind, unlike
 * getAnonymousUid()/signInOrLinkAccount() above.
 */
export async function getCurrentAccountState(): Promise<AccountUser | null> {
  const { auth } = await getAuthHandle();
  const user = auth.currentUser;
  if (!user) return null;
  return { uid: user.uid, email: user.email, isAnonymous: user.isAnonymous };
}

// Returns an unsubscribe function, mirroring Firebase's own onAuthStateChanged
// contract, even though the handle itself resolves asynchronously.
export function subscribeToAccountState(callback: (user: AccountUser | null) => void): () => void {
  let unsubscribe: (() => void) | undefined;
  let cancelled = false;

  void getAuthHandle().then(({ auth, onAuthStateChanged }) => {
    if (cancelled) return;
    unsubscribe = onAuthStateChanged(auth, (user) => {
      callback(user ? { uid: user.uid, email: user.email, isAnonymous: user.isAnonymous } : null);
    });
  });

  return () => {
    cancelled = true;
    unsubscribe?.();
  };
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
