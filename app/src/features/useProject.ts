import { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { Project } from "../domain/types";
import { withSummaryOutOfSyncIfChanged } from "../domain/summaryLifecycle";
import { readProject, saveProject } from "../platform/storage";
import { takePendingOnboarding } from "./project-management/onboardingPresetsRegistry";

export interface ProjectContextValue {
  project: Project;
  update: (next: Project) => void;
  saveError: string | null;
}

/**
 * Loads a single Project by id and exposes an update function that persists
 * immediately on every call — per sdd/workspace/02_data_and_state.md, field-level
 * edits are saved on leaving the field (the caller debounces/blurs before calling
 * update; this hook itself does not impose UI timing).
 *
 * Used once, by WorkspaceProjectLayout — every child screen reads the same
 * loaded Project via useProjectContext() below, so the persistent nav shell
 * (lifecycle badge) and the active screen never fall out of sync with each
 * other, both reflecting the one shared state.
 */
export function useProjectLoader(projectId: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mirrors `project` for use inside `update` below, so OutOfSync detection
  // (ADR-0016 Decision 3) always compares against the truly-current value,
  // not a stale closure — same ref-mirroring convention already used in
  // BusinessStructuringPage for the analogous problem.
  const projectRef = useRef<Project | null>(null);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  useEffect(() => {
    if (!projectId) {
      setError("No project selected.");
      setLoading(false);
      return;
    }
    const found = readProject(projectId);
    if (!found) {
      setError("This project's data couldn't be loaded.");
    } else {
      setProject(found);
    }
    setLoading(false);

    // If Project Management registered an in-flight Onboarding Preset
    // Assistant call for this Project (per ADR-0019 — see
    // onboardingPresetsRegistry.ts), re-read storage once it resolves so
    // this already-mounted state picks up the result. A plain re-read, not
    // update() -- this is a background refresh of AI-sourced onboarding
    // content, never a user edit, so it must not re-trigger Summary's
    // OutOfSync comparison or write anything back to storage that isn't
    // already there.
    const pendingOnboarding = takePendingOnboarding(projectId);
    if (pendingOnboarding) {
      let cancelled = false;
      void pendingOnboarding.then(() => {
        if (cancelled) return;
        const refreshed = readProject(projectId);
        if (refreshed) setProject(refreshed);
      });
      return () => {
        cancelled = true;
      };
    }

    // Orphaned Generating state: the Project was persisted mid-generation
    // (per ProjectListPage.tsx) but no in-flight promise is registered for
    // it here — this in-memory registry never survives a browser refresh
    // (see onboardingPresetsRegistry.ts), so the original request is
    // unobservable now. Without this, the Project would stay in
    // `generating` forever and Business Structuring would show its loading
    // state with nothing left to end it. Resolves deterministically to
    // Fallback (never a retry — this capability's own Failure Scenario
    // Matrix already treats "lost request" the same as any other failure
    // mode: silent, one-shot, no retry, per ADR-0019 Decision 5).
    if (found?.onboardingPresets?.status === "generating") {
      const resolved: Project = { ...found, onboardingPresets: { status: "fallback" } };
      setProject(resolved);
      saveProject(resolved);
    }
  }, [projectId]);

  const update = useCallback((next: Project) => {
    // Single shared choke point every Feature page's edit passes through, per
    // this hook's own docstring — the natural place to apply Summary
    // Lifecycle's OutOfSync transition (ADR-0016 Decision 3) once, rather than
    // duplicating the check inside every Feature page that can change Canvas,
    // MVP Scope, the Feature list, or the Validation Checklist.
    const prev = projectRef.current;
    const withSummarySync = prev ? withSummaryOutOfSyncIfChanged(prev, next) : next;
    setProject(withSummarySync);
    const ok = saveProject(withSummarySync);
    setError(ok ? null : "Your last change couldn't be saved. Please try again.");
  }, []);

  return { project, loading, error, update };
}

export function useProjectContext(): ProjectContextValue {
  return useOutletContext<ProjectContextValue>();
}
