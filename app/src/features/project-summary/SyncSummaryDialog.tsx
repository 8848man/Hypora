// The Synchronization Dialog — per
// sdd/workspace/features/05_project_summary.md#synchronization-dialog.
// Opening this dialog makes no AI request (Governing Rule 1 unaffected by
// ADR-0017, which covers Initial Generation only); only pressing "AI Summary
// Update" invokes the capability's `sync` Operation, as an ordinary Manual
// Invocation.

import { useState } from "react";
import { Button, TextArea } from "../../design-system";
import type { Project } from "../../domain/types";
import type { Language, Resources } from "../../localization";
import { useProjectSummaryAssistant } from "../../ai/useProjectSummaryAssistant";
import { buildProjectSummaryRequest } from "./buildSummaryRequest";
import "./SyncSummaryDialog.css";

export function SyncSummaryDialog({
  project,
  language,
  t,
  onApply,
  onCancel,
}: {
  project: Project;
  language: Language;
  t: Resources;
  onApply: (text: string) => void;
  onCancel: () => void;
}) {
  // As-Is: fixed for the entire time this dialog is open — read once from the
  // persisted Summary at mount, never re-read from `project` afterward, per
  // this Feature's own Synchronization Dialog contract ("never changes while
  // the dialog is open").
  const [asIsText] = useState(project.summary.text);

  // To-Be: the dialog-local editable draft. Initially empty; only populated
  // once the user presses "AI Summary Update" below (never on dialog open).
  const [toBeText, setToBeText] = useState("");

  const assistant = useProjectSummaryAssistant();

  function handleAiSummaryUpdate() {
    assistant.invoke(() => buildProjectSummaryRequest(project, language, "sync"));
  }

  // A successful response populates the editable draft as an offer, never an
  // auto-apply — the user may still freely revise it before Apply, per
  // sdd/ai/capabilities/06_project_summary_synthesis_assistant.md.
  if (assistant.status === "ready" && assistant.summaryText !== undefined && toBeText === "") {
    setToBeText(assistant.summaryText);
  }

  const isGenerating = assistant.status === "loading";
  const failed = assistant.status === "failed";

  return (
    <div className="ds-dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="ds-dialog sync-summary-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sync-summary-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="sync-summary-dialog-title" className="ds-dialog__title">
          {t.projectSummary.syncDialogTitle}
        </h3>

        <div className="sync-summary-dialog__columns">
          <div className="sync-summary-dialog__column">
            <p className="sync-summary-dialog__column-label">{t.projectSummary.syncDialogAsIsLabel}</p>
            <div className="sync-summary-dialog__asis" aria-readonly="true">
              {asIsText || t.projectSummary.summaryNotGenerated}
            </div>
          </div>

          <div className="sync-summary-dialog__column">
            <p className="sync-summary-dialog__column-label">{t.projectSummary.syncDialogToBeLabel}</p>
            {toBeText === "" && !isGenerating ? (
              <p className="sync-summary-dialog__hint">{t.projectSummary.syncDialogToBeEmptyHint}</p>
            ) : (
              <TextArea
                label={t.projectSummary.syncDialogToBeLabel}
                value={toBeText}
                onChange={(e) => setToBeText(e.target.value)}
                disabled={isGenerating}
                rows={8}
              />
            )}
            <div style={{ marginTop: "var(--space-2)" }}>
              <Button variant="secondary" onClick={handleAiSummaryUpdate} disabled={isGenerating}>
                {isGenerating ? t.aiAssistant.loadingLabel : t.projectSummary.aiSummaryUpdateButton}
              </Button>
            </div>
            {failed && <p className="sync-summary-dialog__error">{t.aiAssistant.failureGeneric}</p>}
          </div>
        </div>

        <div className="ds-dialog__actions">
          <Button variant="secondary" onClick={onCancel}>
            {t.common.cancel}
          </Button>
          <Button variant="primary" onClick={() => onApply(toBeText)} disabled={toBeText.trim() === ""}>
            {t.projectSummary.applyButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
