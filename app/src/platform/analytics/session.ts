// Session/Anonymous Identity — envelope fields normalized once, here, rather than
// at each call site. Per sdd/analytics/01_architecture.md's Responsibility Split,
// "normalizing the envelope ... attaching the current sessionId" is the Analytics
// Service's job, not the emitting Feature/page's.

const SESSION_STORAGE_KEY = "hypora.analytics.sessionId";
const ANONYMOUS_ID_STORAGE_KEY = "hypora.analytics.anonymousUserId";

export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// sessionStorage: one id per browser tab/session, per sdd/analytics/02_event_model.md's
// `sessionId` ("identifies one continuous usage session").
export function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const generated = generateId();
    sessionStorage.setItem(SESSION_STORAGE_KEY, generated);
    return generated;
  } catch {
    return generateId();
  }
}

// localStorage: stable per browser/device across sessions, per this document's
// `anonymousUserId` ("a pre-authentication identity ... stable for one
// browser/device via local persistence").
export function getAnonymousUserId(): string {
  try {
    const existing = localStorage.getItem(ANONYMOUS_ID_STORAGE_KEY);
    if (existing) return existing;
    const generated = generateId();
    localStorage.setItem(ANONYMOUS_ID_STORAGE_KEY, generated);
    return generated;
  } catch {
    return generateId();
  }
}
