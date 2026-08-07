// Origin/Referer allowlist (ADR-0023) — defense against a browser-based
// scraper or a third-party site embedding a direct call to this deployment's
// AI Capability endpoints. Not a hard security boundary (a caller that sets
// its own headers, e.g. a plain script, bypasses this trivially) -- the
// durable rate limit in rateLimiter.ts is the defense that still applies
// when this one doesn't.

import type { IncomingMessage } from "node:http";

function deploymentOrigins(): string[] {
  // Vercel injects these automatically on every deployment (production and
  // preview); all three are absent together only in local dev, which is
  // exactly when this check should not enforce anything (see isEnforced
  // below) -- there is no reliable "local dev origin" to allowlist instead.
  const hosts = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
    .filter((host): host is string => Boolean(host))
    .map((host) => `https://${host}`);

  const extra = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return [...hosts, ...extra];
}

function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export type OriginCheckResult = { allowed: boolean };

export function checkOrigin(req: IncomingMessage): OriginCheckResult {
  const allowlist = deploymentOrigins();

  // No Vercel deployment env vars and no explicit ALLOWED_ORIGINS -> this is
  // local dev or a non-Vercel environment; enforcing an allowlist with no
  // real entries would reject every request, including legitimate local
  // ones, so the check is skipped entirely rather than failing closed.
  if (allowlist.length === 0) {
    return { allowed: true };
  }

  const originHeader = req.headers.origin;
  const refererHeader = req.headers.referer;
  const candidate = typeof originHeader === "string" ? originHeader : typeof refererHeader === "string" ? originOf(refererHeader) : null;

  // Absent on both headers: allowed, not rejected -- some legitimate
  // non-browser tooling and browser configurations omit both, and the cost
  // of a false-positive block is judged higher than the marginal defense
  // gained (see ADR-0023, Option 4).
  if (!candidate) {
    return { allowed: true };
  }

  return { allowed: allowlist.includes(candidate) };
}
