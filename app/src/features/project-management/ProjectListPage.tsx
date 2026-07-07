import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Stack,
  Badge,
  TextField,
  LoadingIndicator,
} from "../../design-system";
import { STAGE_LABELS } from "../../domain/lifecycle";
import { createEmptyProject } from "../../domain/types";
import {
  createProjectId,
  listProjects,
  readProject,
  saveProject,
  type ProjectListEntry,
} from "../../platform/storage";
import { archiveProject as archiveProjectStage } from "../../domain/lifecycle";

export function ProjectListPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectListEntry[] | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [pendingArchiveId, setPendingArchiveId] = useState<string | null>(null);

  useEffect(() => {
    setProjects(listProjects());
  }, []);

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const id = createProjectId();
    const project = createEmptyProject(id, name);
    saveProject(project);
    navigate(`/app/projects/${id}/canvas`);
  }

  function handleArchive(id: string) {
    const project = readProject(id);
    if (!project) return;
    saveProject({ ...project, stage: archiveProjectStage(project) });
    setProjects(listProjects());
    setPendingArchiveId(null);
  }

  if (projects === null) return <LoadingIndicator label="Loading projects…" />;

  const visible = projects.filter((p) => showArchived || p.stage !== "archived");
  const archivedCount = projects.filter((p) => p.stage === "archived").length;

  return (
    <div className="workspace-shell">
      <PageHeader
        title="Your Projects"
        subtitle="Every business idea you're structuring, in one place."
        actions={
          !creating && <Button onClick={() => setCreating(true)}>New Project</Button>
        }
      />

      {creating && (
        <Card className="create-project-card">
          <TextField
            label="Project name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Neighborhood tool-lending app"
            autoFocus
          />
          <Stack direction="row" gap="var(--space-2)">
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              Create
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setCreating(false);
                setNewName("");
              }}
            >
              Cancel
            </Button>
          </Stack>
        </Card>
      )}

      {visible.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start structuring an idea."
        />
      ) : (
        <Stack gap="var(--space-3)">
          {visible.map((p) => (
            <Card key={p.id}>
              <Stack direction="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{p.name}</p>
                  <Badge tone="neutral">{STAGE_LABELS[p.stage]}</Badge>
                </div>
                <Stack direction="row" gap="var(--space-2)">
                  <Button onClick={() => navigate(`/app/projects/${p.id}/canvas`)}>
                    Open
                  </Button>
                  {p.stage !== "archived" && (
                    <Button variant="secondary" onClick={() => setPendingArchiveId(p.id)}>
                      Archive
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {archivedCount > 0 && (
        <button
          type="button"
          onClick={() => setShowArchived((v) => !v)}
          style={{
            marginTop: "var(--space-4)",
            background: "none",
            border: "none",
            color: "var(--color-neutral-text-muted)",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {showArchived ? "Hide" : "Show"} archived projects ({archivedCount})
        </button>
      )}

      {pendingArchiveId && (
        <ConfirmDialog
          title="Archive this project?"
          description="It will be hidden from your default list but not deleted — you can reveal archived projects at any time."
          confirmLabel="Archive"
          onConfirm={() => handleArchive(pendingArchiveId)}
          onCancel={() => setPendingArchiveId(null)}
        />
      )}
    </div>
  );
}
