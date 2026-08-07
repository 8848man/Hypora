// The single persistence-access module — per sdd/frontend/01_architecture.md's LocalStorage
// Ownership rule, this is the ONLY file permitted to call localStorage directly. Conceptually,
// this is where Platform API's V1 implementation lives inside the shared codebase (see
// sdd/context/05_application_responsibilities.md and sdd/workspace/02_data_and_state.md).
//
// Dual-mode since ADR-0025: an anonymous (or signed-out) caller reads/writes
// LocalStorage synchronously-in-effect (wrapped in a resolved Promise, per
// that ADR's Decision 4); a linked/real-account caller reads/writes Firestore
// instead, via projectCloudSync.ts. Every exported Project function is
// therefore Promise-returning — see ADR-0025 for why this is a bounded,
// deliberate contract change rather than an accidental one.

import { emptyProjectSummary, emptyRiskMemo, type Project } from "../domain/types";
import type { Language } from "../localization/types";
import { SUPPORTED_LANGUAGES } from "../localization/types";
import { getCurrentAccountState } from "./auth/authService";
import {
  listProjectsFromCloud,
  readProjectFromCloud,
  syncProjectInBackground,
  writeProjectToCloud,
} from "./persistence/projectCloudSync";

// Forward-compatibility (sdd/workspace/02_data_and_state.md's Local Persistence
// rule): a field added after some Projects were already stored (riskMemo,
// summary) must read back as an empty default, never a read error or an
// undefined crash. `summary` defaults to NotGenerated, per ADR-0016 —
// an already-stored Project with no summary field simply hasn't been
// through Initial Generation yet, identical to a Project created after this
// field existed.
function withDefaults(project: Project): Project {
  return {
    ...project,
    description: project.description ?? "",
    riskMemo: project.riskMemo ?? { ...emptyRiskMemo },
    featureHistory: project.featureHistory ?? [],
    summary: project.summary ?? { ...emptyProjectSummary },
    // onboardingPresets deliberately has no default fill-in here -- absent
    // already means "static fallback" to questionModel.ts's resolvePresets(),
    // identically to a Project created before this field existed.
  };
}

const INDEX_KEY = "hypora:project-ids";
const LANGUAGE_KEY = "hypora:language";
const projectKey = (id: string) => `hypora:project:${id}`;

export interface ProjectListEntry {
  id: string;
  name: string;
  stage: Project["stage"];
  createdAt: string;
}

function toListEntry(project: Project): ProjectListEntry {
  return { id: project.id, name: project.name, stage: project.stage, createdAt: project.createdAt };
}

function readIndexLocal(): string[] {
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupted index — treated as empty per the Error States table (no crash, no data loss claim).
    return [];
  }
}

function writeIndexLocal(ids: string[]): boolean {
  try {
    window.localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
}

function readProjectLocal(id: string): Project | null {
  try {
    const raw = window.localStorage.getItem(projectKey(id));
    if (!raw) return null;
    return withDefaults(JSON.parse(raw) as Project);
  } catch {
    // Corrupted/unreadable project data — surfaced by the caller as a recoverable error state,
    // never a silent crash (per sdd/workspace/02_data_and_state.md Error States).
    return null;
  }
}

function saveProjectLocal(project: Project): boolean {
  try {
    window.localStorage.setItem(projectKey(project.id), JSON.stringify(project));
    const ids = readIndexLocal();
    if (!ids.includes(project.id)) {
      writeIndexLocal([...ids, project.id]);
    }
    return true;
  } catch {
    return false;
  }
}

/** Removes one Project from LocalStorage — migration's own cleanup step (ADR-0025), never called otherwise. */
function deleteProjectLocal(id: string): void {
  try {
    window.localStorage.removeItem(projectKey(id));
    writeIndexLocal(readIndexLocal().filter((existing) => existing !== id));
  } catch {
    // Best-effort cleanup only — if this fails, the next migration attempt
    // simply re-uploads (harmless, per ADR-0025's overwrite policy) and
    // retries the removal.
  }
}

function listProjectsLocal(): ProjectListEntry[] {
  return readIndexLocal()
    .map((id) => readProjectLocal(id))
    .filter((project): project is Project => project !== null)
    .map(toListEntry);
}

async function isLinkedAccount(): Promise<string | null> {
  const account = await getCurrentAccountState();
  return account && !account.isAnonymous ? account.uid : null;
}

export async function listProjects(): Promise<ProjectListEntry[]> {
  const uid = await isLinkedAccount();
  if (uid) {
    const projects = await listProjectsFromCloud(uid);
    return projects.map(toListEntry);
  }
  return listProjectsLocal();
}

export async function readProject(id: string): Promise<Project | null> {
  const uid = await isLinkedAccount();
  if (uid) {
    return readProjectFromCloud(uid, id);
  }
  return readProjectLocal(id);
}

export async function saveProject(project: Project): Promise<boolean> {
  const uid = await isLinkedAccount();
  if (uid) {
    try {
      await writeProjectToCloud(uid, project);
      return true;
    } catch {
      return false;
    }
  }
  const ok = saveProjectLocal(project);
  if (ok) {
    // Best-effort durable backup (ADR-0024) — fire-and-forget, never awaited,
    // never able to affect this function's own success/failure or timing.
    // LocalStorage above remains this branch's actual source of truth.
    syncProjectInBackground(project);
  }
  return ok;
}

/**
 * Per-ADR-0025: on every successful sign-up/sign-in/account-link, every
 * LocalStorage Project is written to `uid`'s Firestore store — one-directional,
 * unconditionally overwriting whatever (if anything) already exists there at
 * the same id — and only removed from LocalStorage once *that specific
 * Project's* write is confirmed. A failure partway through leaves the
 * remainder safely in LocalStorage, retried on the next migration call
 * (idempotent, since a re-write is just another overwrite). Never called
 * automatically by this module — the caller (authService's sign-in flow)
 * decides when a migration should run.
 */
export async function migrateLocalStorageToAccount(uid: string): Promise<{ migratedCount: number; failedCount: number }> {
  let migratedCount = 0;
  let failedCount = 0;
  for (const id of readIndexLocal()) {
    const project = readProjectLocal(id);
    if (!project) continue;
    try {
      await writeProjectToCloud(uid, project);
      deleteProjectLocal(id);
      migratedCount++;
    } catch {
      failedCount++;
    }
  }
  return { migratedCount, failedCount };
}

export function createProjectId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * The persisted `language` concept — per sdd/workspace/02_data_and_state.md's
 * Application-Level State (Non-Project) section: a third, independent persisted concept,
 * separate from both the Project-list index and any individual Project's data. Reading or
 * writing it never touches Project storage. Unaffected by ADR-0025 — language preference
 * stays LocalStorage-only regardless of account state, out of that ADR's scope.
 */
export function readStoredLanguage(): Language | null {
  try {
    const raw = window.localStorage.getItem(LANGUAGE_KEY);
    if (raw && (SUPPORTED_LANGUAGES as string[]).includes(raw)) {
      return raw as Language;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeStoredLanguage(language: Language): boolean {
  try {
    window.localStorage.setItem(LANGUAGE_KEY, language);
    return true;
  } catch {
    return false;
  }
}
