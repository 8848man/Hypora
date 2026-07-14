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
import { archiveProject as archiveProjectStage } from "../../domain/lifecycle";
import { createEmptyProject } from "../../domain/types";
import { LanguageSwitcher } from "../../layout/LanguageSwitcher";
import { useLocalization } from "../../localization";
import {
  createProjectId,
  listProjects,
  readProject,
  saveProject,
  type ProjectListEntry,
} from "../../platform/storage";

export function ProjectListPage() {
  const navigate = useNavigate();
  const { t } = useLocalization();
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

  if (projects === null) return <LoadingIndicator label={t.dashboard.loadingProjects} />;

  const visible = projects.filter((p) => showArchived || p.stage !== "archived");
  const archivedCount = projects.filter((p) => p.stage === "archived").length;

  return (
    <div className="workspace-shell">
      <LanguageSwitcher />
      <PageHeader
        title={t.dashboard.title}
        subtitle={t.dashboard.subtitle}
        actions={!creating && <Button onClick={() => setCreating(true)}>{t.dashboard.newProject}</Button>}
      />

      {creating && (
        <Card className="create-project-card">
          <TextField
            label={t.dashboard.projectNameLabel}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t.dashboard.projectNamePlaceholder}
            autoFocus
          />
          <Stack direction="row" gap="var(--space-2)">
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              {t.common.create}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setCreating(false);
                setNewName("");
              }}
            >
              {t.common.cancel}
            </Button>
          </Stack>
        </Card>
      )}

      {visible.length === 0 ? (
        <EmptyState title={t.dashboard.emptyTitle} description={t.dashboard.emptyDescription} />
      ) : (
        <Stack gap="var(--space-3)">
          {visible.map((p) => (
            <Card key={p.id}>
              <Stack direction="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{p.name}</p>
                  <Badge tone="neutral">{t.lifecycleStage[p.stage]}</Badge>
                </div>
                <Stack direction="row" gap="var(--space-2)">
                  <Button onClick={() => navigate(`/app/projects/${p.id}/canvas`)}>{t.dashboard.open}</Button>
                  {p.stage !== "archived" && (
                    <Button variant="secondary" onClick={() => setPendingArchiveId(p.id)}>
                      {t.common.archive}
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {archivedCount > 0 && (
        <Button variant="text" onClick={() => setShowArchived((v) => !v)} style={{ marginTop: "var(--space-4)" }}>
          {showArchived ? t.dashboard.hideArchived : t.dashboard.showArchived} ({archivedCount})
        </Button>
      )}

      {pendingArchiveId && (
        <ConfirmDialog
          title={t.dashboard.archiveConfirmTitle}
          description={t.dashboard.archiveConfirmDescription}
          confirmLabel={t.common.archive}
          cancelLabel={t.common.cancel}
          onConfirm={() => handleArchive(pendingArchiveId)}
          onCancel={() => setPendingArchiveId(null)}
        />
      )}
    </div>
  );
}
