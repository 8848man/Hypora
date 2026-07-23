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
  TextArea,
  LoadingIndicator,
} from "../../design-system";
import { archiveProject as archiveProjectStage } from "../../domain/lifecycle";
import { createEmptyProject } from "../../domain/types";
import { LanguageSwitcher } from "../../layout/LanguageSwitcher";
import { useLocalization, type Language } from "../../localization";
import {
  createProjectId,
  listProjects,
  readProject,
  saveProject,
  type ProjectListEntry,
} from "../../platform/storage";
import { requestOnboardingPresetAssistant } from "../../ai/onboardingPresetAssistantClient";
import { registerPendingOnboarding } from "./onboardingPresetsRegistry";
import { trackEvent } from "../../platform/analytics/analyticsService";

// Onboarding Preset Assistant's one-time, automatic call, per ADR-0019 —
// triggered here (Project Management), never blocking navigation into
// Business Structuring (see handleCreate below: navigate() fires first,
// this promise resolves in the background). Storage is updated directly,
// not via component state, since by the time this resolves the user may
// already have navigated away; whichever screen next reads this Project
// from storage sees the result, per the capability spec's Lifecycle
// section ("Generating" is never itself persisted or user-blocking).
async function triggerOnboardingPresets(
  projectId: string,
  projectName: string,
  projectDescription: string,
  language: Language,
): Promise<void> {
  const result = await requestOnboardingPresetAssistant({
    projectName,
    projectDescription: projectDescription || undefined,
    language,
  });

  const current = readProject(projectId);
  if (!current) return; // Project no longer exists (e.g. already archived/removed) — nothing to update.

  if (!result.ok) {
    saveProject({ ...current, onboardingPresets: { status: "fallback" } });
    return;
  }

  const presets: Partial<Record<string, string[]>> = {};
  for (const set of result.data.presets) presets[set.questionId] = set.options;
  saveProject({ ...current, onboardingPresets: { status: "ready", presets } });
}

export function ProjectListPage() {
  const navigate = useNavigate();
  const { t, language } = useLocalization();
  const [projects, setProjects] = useState<ProjectListEntry[] | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [pendingArchiveId, setPendingArchiveId] = useState<string | null>(null);

  useEffect(() => {
    setProjects(listProjects());
  }, []);

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const id = createProjectId();
    const description = newDescription.trim();
    const project = createEmptyProject(id, name, description);
    // Seeded synchronously, in the same write as creation — never left
    // `undefined` even for one read. `undefined` already means "no AI
    // metadata" (a pre-AI-era Project, see onboardingStatus() in
    // questionModel.ts); persisting "generating" from the first moment is
    // what lets the very first render of Business Structuring tell "AI
    // generation is pending" apart from that case, instead of both reading
    // identically and falling through to static presets before the
    // pending request has even resolved.
    project.onboardingPresets = { status: "generating" };
    saveProject(project);
    trackEvent({ eventName: "project_created", feature: "project-management", projectId: id });
    navigate(`/app/projects/${id}/canvas`);
    // Fire-and-forget, per ADR-0019 Decision 7 — never awaited before
    // navigate() above. Registered so useProjectLoader (mounted by the
    // navigation this triggers) can pick up the result once it resolves —
    // see onboardingPresetsRegistry.ts for why this bridge exists.
    registerPendingOnboarding(id, triggerOnboardingPresets(id, name, description, language));
  }

  function handleArchive(id: string) {
    const project = readProject(id);
    if (!project) return;
    saveProject({ ...project, stage: archiveProjectStage(project) });
    setProjects(listProjects());
    setPendingArchiveId(null);
    trackEvent({ eventName: "project_archived", feature: "project-management", projectId: id });
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
          <TextArea
            label={t.dashboard.projectDescriptionLabel}
            hint={t.dashboard.projectDescriptionHint}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder={t.dashboard.projectDescriptionPlaceholder}
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
                setNewDescription("");
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
                  <Button
                    onClick={() => {
                      trackEvent({ eventName: "project_opened", feature: "project-management", projectId: p.id });
                      navigate(`/app/projects/${p.id}/canvas`);
                    }}
                  >
                    {t.dashboard.open}
                  </Button>
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
