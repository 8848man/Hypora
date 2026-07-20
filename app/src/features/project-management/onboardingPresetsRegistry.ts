// Bridges Project Management's Automatic Invocation trigger (per ADR-0019)
// to whichever component next loads this Project. Necessary because the
// trigger fires here, before navigate() (ADR-0019 Decision 7: never blocks
// entry into Business Structuring), while the call itself resolves *after*
// useProjectLoader (src/features/useProject.ts) has already read the
// Project into React state exactly once, on mount. A Promise cannot survive
// router navigation (not structured-cloneable, so it cannot ride in history
// state) or localStorage (not serializable) — an in-memory map keyed by
// projectId, consumed and cleared once, is the smallest mechanism that
// bridges the two without polling or a new global store.

const pending = new Map<string, Promise<void>>();

export function registerPendingOnboarding(projectId: string, promise: Promise<void>): void {
  pending.set(projectId, promise);
  void promise.finally(() => {
    if (pending.get(projectId) === promise) pending.delete(projectId);
  });
}

export function takePendingOnboarding(projectId: string): Promise<void> | undefined {
  return pending.get(projectId);
}
