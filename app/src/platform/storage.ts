// The single persistence-access module — per sdd/frontend/01_architecture.md's LocalStorage
// Ownership rule, this is the ONLY file permitted to call localStorage directly. Conceptually,
// this is where Platform API's V1 implementation lives inside the shared codebase (see
// sdd/context/05_application_responsibilities.md and sdd/workspace/02_data_and_state.md).

import type { Project } from "../domain/types";

const INDEX_KEY = "hypora:project-ids";
const projectKey = (id: string) => `hypora:project:${id}`;

export interface ProjectListEntry {
  id: string;
  name: string;
  stage: Project["stage"];
  createdAt: string;
}

function readIndex(): string[] {
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

function writeIndex(ids: string[]): boolean {
  try {
    window.localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
}

export function listProjects(): ProjectListEntry[] {
  const ids = readIndex();
  const entries: ProjectListEntry[] = [];
  for (const id of ids) {
    const project = readProject(id);
    if (project) {
      entries.push({
        id: project.id,
        name: project.name,
        stage: project.stage,
        createdAt: project.createdAt,
      });
    }
  }
  return entries;
}

export function readProject(id: string): Project | null {
  try {
    const raw = window.localStorage.getItem(projectKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as Project;
  } catch {
    // Corrupted/unreadable project data — surfaced by the caller as a recoverable error state,
    // never a silent crash (per sdd/workspace/02_data_and_state.md Error States).
    return null;
  }
}

export function saveProject(project: Project): boolean {
  try {
    window.localStorage.setItem(projectKey(project.id), JSON.stringify(project));
    const ids = readIndex();
    if (!ids.includes(project.id)) {
      writeIndex([...ids, project.id]);
    }
    return true;
  } catch {
    return false;
  }
}

export function createProjectId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
