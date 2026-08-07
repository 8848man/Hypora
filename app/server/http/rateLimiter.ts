// Per-IP rate limiting (ADR-0023) — durable across separate Vercel Function
// invocations, unlike an in-memory counter, by persisting each caller's
// token-bucket state as a Firestore document. Reuses the same Firebase
// project already provisioned for Analytics (ADR-0013) via the same public
// client config; introduces no new vendor or secret.
//
// Mirrors the Analytics Provider's own "unset config -> Noop" convention
// (src/platform/analytics -- Firestore Provider vs. Noop Provider): if
// Firebase isn't configured in this environment (local dev, CI), rate
// limiting no-ops rather than failing every request closed.

import { resolveFirebaseCoreConfig, type FirebaseCoreConfig } from "./firebaseServerConfig.js";
import { computeTokenBucket, type TokenBucketState } from "./tokenBucket.js";

export type RateLimitDecision = { allowed: boolean; retryAfterSeconds?: number };

export interface RateLimiter {
  checkAndConsume(key: string): Promise<RateLimitDecision>;
}

class NoopRateLimiter implements RateLimiter {
  async checkAndConsume(): Promise<RateLimitDecision> {
    return { allowed: true };
  }
}

const RATE_LIMIT_COLLECTION = "rateLimits";

class FirestoreRateLimiter implements RateLimiter {
  private readonly config: FirebaseCoreConfig;

  constructor(config: FirebaseCoreConfig) {
    this.config = config;
  }

  async checkAndConsume(key: string): Promise<RateLimitDecision> {
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    const { getFirestore, doc, runTransaction } = await import("firebase/firestore");

    const app = getApps().length ? getApp() : initializeApp(this.config);
    const db = getFirestore(app);
    // Firestore document IDs may not contain "/" -- an IPv6 address does; a
    // literal-safe encoding avoids an otherwise-obscure runtime failure on
    // exactly the callers this limiter exists to bound.
    const ref = doc(db, RATE_LIMIT_COLLECTION, encodeURIComponent(key));

    let decision: RateLimitDecision = { allowed: true };
    await runTransaction(db, async (tx) => {
      const snapshot = await tx.get(ref);
      const previous = snapshot.exists() ? (snapshot.data() as TokenBucketState) : undefined;
      const result = computeTokenBucket(previous, Date.now());
      tx.set(ref, result.state);
      decision = { allowed: result.allowed, retryAfterSeconds: result.retryAfterSeconds };
    });
    return decision;
  }
}

export function createRateLimiter(): RateLimiter {
  const config = resolveFirebaseCoreConfig();
  return config ? new FirestoreRateLimiter(config) : new NoopRateLimiter();
}
