// Feature-local preview surface for Feature Suggestion Assistant — per
// sdd/ai/capabilities/05_feature_suggestion_assistant.md#acceptance-criteria.
// Renders entirely within the single, already-existing Suggestion Ready
// lifecycle state (sdd/ai/04_ai_interaction.md#interaction-lifecycle) — the
// per-row checkbox/inline edits below are ordinary component state, not a new
// AI Interaction Lifecycle state, and trigger no additional AI invocation.

import { useEffect, useState } from "react";
import { Badge, Button, Card, Chip, Stack, TextField } from "../../design-system";
import { useLocalization } from "../../localization";
import type { FeaturePriority } from "../../domain/types";
import type { FeatureSuggestionItem } from "../../ai/types";

const PRIORITIES: FeaturePriority[] = ["must", "should", "could"];

export type AcceptedProposal = {
  name: string;
  priority: FeaturePriority;
  inScope: boolean;
};

type RowState = {
  checked: boolean;
  name: string;
  priority: FeaturePriority;
  inScope: boolean;
};

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export function FeatureSuggestionPreview({
  proposals,
  existingFeatureNames,
  onAccept,
  onReject,
  onRegenerate,
}: {
  proposals: FeatureSuggestionItem[];
  existingFeatureNames: string[];
  onAccept: (accepted: AcceptedProposal[]) => void;
  onReject: () => void;
  onRegenerate: () => void;
}) {
  const { t } = useLocalization();

  const priorityLabel: Record<FeaturePriority, string> = {
    must: t.mvpPlanning.priorityMust,
    should: t.mvpPlanning.priorityShould,
    could: t.mvpPlanning.priorityCould,
  };

  const [rows, setRows] = useState<RowState[]>([]);

  // Reseed whenever a new batch arrives (initial invocation or Regenerate) —
  // per the capability spec, Regenerate always replaces the entire unaccepted
  // batch, discarding any in-preview edits/selections made so far. Duplicate
  // matches -- against existing Features or an earlier proposal in this same
  // batch -- default unchecked; everything else defaults checked.
  useEffect(() => {
    const existingLower = existingFeatureNames.map(normalizeName);
    setRows(
      proposals.map((p, index) => {
        const duplicateOfExisting = existingLower.includes(normalizeName(p.name));
        const duplicateOfEarlierProposal = proposals
          .slice(0, index)
          .some((other) => normalizeName(other.name) === normalizeName(p.name));
        return {
          checked: !(duplicateOfExisting || duplicateOfEarlierProposal),
          name: p.name,
          priority: p.priority,
          inScope: true,
        };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposals]);

  // Recomputed against the *current* (possibly user-edited) row names, not
  // only the original AI-proposed names — so the indicator stays accurate if
  // a user edits a name into or out of a collision. Never auto-toggles a
  // row's own checked state after the initial seed above.
  function isDuplicate(index: number): boolean {
    const name = normalizeName(rows[index]?.name ?? "");
    if (name === "") return false;
    if (existingFeatureNames.map(normalizeName).includes(name)) return true;
    return rows.some((row, i) => i !== index && normalizeName(row.name) === name);
  }

  function updateRow(index: number, patch: Partial<RowState>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  if (proposals.length === 0 || rows.length !== proposals.length) return null;

  const checkedCount = rows.filter((r) => r.checked).length;

  function handleAccept() {
    const accepted = rows
      .filter((r) => r.checked)
      .map((r) => ({ name: r.name.trim(), priority: r.priority, inScope: r.inScope }));
    onAccept(accepted);
  }

  return (
    <Card>
      <h3 style={{ marginTop: 0 }}>{t.mvpPlanning.suggestedFeaturesTitle}</h3>

      <Stack gap="var(--space-4)">
        {rows.map((row, index) => {
          const proposal = proposals[index];
          const duplicate = isDuplicate(index);
          return (
            <Stack key={index} direction="row" style={{ alignItems: "flex-start" }}>
              <input
                type="checkbox"
                checked={row.checked}
                onChange={(e) => updateRow(index, { checked: e.target.checked })}
                aria-label={row.name || t.mvpPlanning.addFeatureLabel}
                style={{ marginTop: "calc(var(--space-2) + 2px)" }}
              />
              <div style={{ flex: 1 }}>
                <TextField
                  id={`suggestion-name-${index}`}
                  label={t.mvpPlanning.addFeatureLabel}
                  value={row.name}
                  onChange={(e) => updateRow(index, { name: e.target.value })}
                />
                {duplicate && (
                  <Badge tone="warning">{t.mvpPlanning.duplicateIndicator}</Badge>
                )}
                <p style={{ color: "var(--color-neutral-text-muted)", margin: "var(--space-2) 0" }}>
                  {proposal.rationale}
                </p>
                <p style={{ color: "var(--color-neutral-text-muted)", margin: "0 0 var(--space-3)" }}>
                  {proposal.primaryUserValue}
                </p>
                <Stack direction="row">
                  {PRIORITIES.map((p) => (
                    <Chip
                      key={p}
                      label={priorityLabel[p]}
                      active={row.priority === p}
                      onToggle={() => updateRow(index, { priority: p })}
                    />
                  ))}
                  <Chip
                    label={row.inScope ? t.mvpPlanning.inScope : t.mvpPlanning.outOfScope}
                    active={row.inScope}
                    onToggle={() => updateRow(index, { inScope: !row.inScope })}
                  />
                </Stack>
              </div>
            </Stack>
          );
        })}
      </Stack>

      <Stack direction="row" style={{ marginTop: "var(--space-5)" }}>
        <Button onClick={handleAccept} disabled={checkedCount === 0}>
          {t.aiAssistant.acceptLabel}
        </Button>
        <Button variant="secondary" onClick={onRegenerate}>
          {t.aiAssistant.regenerateLabel}
        </Button>
        <Button variant="secondary" onClick={onReject}>
          {t.aiAssistant.rejectLabel}
        </Button>
      </Stack>
    </Card>
  );
}
