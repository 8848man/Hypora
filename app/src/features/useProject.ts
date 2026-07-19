import { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { Project } from "../domain/types";
import { withSummaryOutOfSyncIfChanged } from "../domain/summaryLifecycle";
import { readProject, saveProject } from "../platform/storage";

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
