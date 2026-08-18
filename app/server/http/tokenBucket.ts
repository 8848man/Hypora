// Pure token-bucket math — no I/O, no Firestore, so it is fully unit-testable
// on its own (server/scripts/verifyStage9.ts) independent of whether a real
// Firestore project is configured. rateLimiter.ts is the only caller; it owns
// reading/writing the persisted TokenBucketState.

export type TokenBucketState = {
  tokens: number;
  lastRefillMs: number;
};

export type TokenBucketDecision = {
  state: TokenBucketState;
  allowed: boolean;
  retryAfterSeconds?: number;
};

// 20 requests/minute per caller, with a burst capacity of 20 — generous
// enough for a real user's normal AI Capability usage (see
// sdd/architecture/decisions/ADR-0023-public-endpoint-abuse-defense-origin-check-and-rate-limit.md),
// tight enough to bound a single caller's worst-case Gemini spend.
export const TOKEN_BUCKET_CAPACITY = 20;
const REFILL_TOKENS_PER_MINUTE = 20;
const REFILL_TOKENS_PER_MS = REFILL_TOKENS_PER_MINUTE / 60_000;

export function computeTokenBucket(previous: TokenBucketState | undefined, nowMs: number): TokenBucketDecision {
  const state = previous ?? { tokens: TOKEN_BUCKET_CAPACITY, lastRefillMs: nowMs };
  const elapsedMs = Math.max(0, nowMs - state.lastRefillMs);
  const refilled = Math.min(TOKEN_BUCKET_CAPACITY, state.tokens + elapsedMs * REFILL_TOKENS_PER_MS);

  if (refilled >= 1) {
    return { state: { tokens: refilled - 1, lastRefillMs: nowMs }, allowed: true };
  }

  const deficit = 1 - refilled;
  const retryAfterSeconds = Math.max(1, Math.ceil(deficit / REFILL_TOKENS_PER_MS / 1000));
  return { state: { tokens: refilled, lastRefillMs: nowMs }, allowed: false, retryAfterSeconds };
}
