import "./SuggestionCard.css";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Stack } from "./Stack";

// Design System primitive per sdd/ai/04_ai_interaction.md's Design System Routing:
// the AI Platform/Frontend owns behavior, state, and interaction; this component
// owns appearance and layout only. It receives all text as data (no hardcoded
// strings, per this Design System's Localization Requirements) and contains no
// business logic, fetch call, or AI-specific state of its own — a caller supplies
// content and callbacks; this renders them.
export function SuggestionCard({
  aiTag,
  suggestionText,
  rationale,
  acceptLabel,
  rejectLabel,
  regenerateLabel,
  onAccept,
  onReject,
  onRegenerate,
}: {
  aiTag: string;
  suggestionText: string;
  rationale?: string;
  acceptLabel: string;
  rejectLabel: string;
  regenerateLabel: string;
  onAccept: () => void;
  onReject: () => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="ds-suggestion-card">
      <Badge tone="primary">{aiTag}</Badge>
      <p className="ds-suggestion-card__text">{suggestionText}</p>
      {rationale && <p className="ds-suggestion-card__rationale">{rationale}</p>}
      <Stack direction="row" gap="var(--space-2)">
        <Button variant="primary" onClick={onAccept}>
          {acceptLabel}
        </Button>
        <Button variant="secondary" onClick={onRegenerate}>
          {regenerateLabel}
        </Button>
        <Button variant="secondary" onClick={onReject}>
          {rejectLabel}
        </Button>
      </Stack>
    </div>
  );
}
