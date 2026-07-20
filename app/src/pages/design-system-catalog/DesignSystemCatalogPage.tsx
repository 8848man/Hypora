// Design System HTML Catalog — living documentation, per
// sdd/design-system/01_design_system.md#html-catalog. Composes the *real*
// imported Design System primitives directly (never a hand-copied
// reimplementation of their markup/CSS) specifically so this page cannot
// drift from the actual implementation the way a static mock-up could —
// updating a primitive's real code updates what renders here automatically.
// Internal tooling, not part of Landing/Workspace IA or localization scope,
// same category as /admin/analytics.

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  ChoiceList,
  Chip,
  ConfirmDialog,
  EmptyState,
  LoadingIndicator,
  PageHeader,
  ProgressIndicator,
  ReadinessCallout,
  Skeleton,
  Stack,
  Stepper,
  SuggestionCard,
  TextArea,
  TextField,
  TransitionWrapper,
} from "../../design-system";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "var(--space-7)" }}>
      <h2 style={{ borderBottom: "1px solid var(--color-neutral-border)", paddingBottom: "var(--space-2)" }}>
        {title}
      </h2>
      <Stack gap="var(--space-4)">{children}</Stack>
    </section>
  );
}

function Swatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: 96,
          height: 64,
          borderRadius: "var(--radius)",
          border: "1px solid var(--color-neutral-border)",
          background: `var(${varName})`,
        }}
      />
      <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--font-size-caption)" }}>{name}</p>
      <code style={{ fontSize: "var(--font-size-caption)" }}>{varName}</code>
    </div>
  );
}

export function DesignSystemCatalogPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [choiceValue, setChoiceValue] = useState("Preset A");
  const [checked, setChecked] = useState(true);

  return (
    <div style={{ padding: "var(--space-5)", maxWidth: "var(--max-content-width)", margin: "0 auto" }}>
      <PageHeader
        title="Hypora Design System Catalog"
        subtitle="Living documentation — renders the real, imported components. See sdd/design-system/01_design_system.md."
      />

      <Section title="Typography">
        <p style={{ fontSize: "var(--font-size-heading-1)", margin: 0 }}>Heading 1 — var(--font-size-heading-1)</p>
        <p style={{ fontSize: "var(--font-size-heading-2)", margin: 0 }}>Heading 2 — var(--font-size-heading-2)</p>
        <p style={{ fontSize: "var(--font-size-heading-3)", margin: 0 }}>Heading 3 — var(--font-size-heading-3)</p>
        <p style={{ fontSize: "var(--font-size-body)", margin: 0 }}>Body — var(--font-size-body)</p>
        <p style={{ fontSize: "var(--font-size-caption)", margin: 0, color: "var(--color-neutral-text-muted)" }}>
          Caption — var(--font-size-caption)
        </p>
      </Section>

      <Section title="Color Palette">
        <Stack direction="row" gap="var(--space-4)">
          <Swatch name="Primary" varName="--color-primary" />
          <Swatch name="Neutral BG" varName="--color-neutral-bg" />
          <Swatch name="Neutral Surface" varName="--color-neutral-surface" />
          <Swatch name="Neutral Border" varName="--color-neutral-border" />
          <Swatch name="Success" varName="--color-success" />
          <Swatch name="Warning" varName="--color-warning" />
          <Swatch name="Danger" varName="--color-danger" />
        </Stack>
      </Section>

      <Section title="Spacing">
        <Stack direction="row" gap="var(--space-4)" style={{ alignItems: "flex-end" }}>
          {["1", "2", "3", "4", "5", "6", "7"].map((step) => (
            <div key={step} style={{ textAlign: "center" }}>
              <div style={{ width: `var(--space-${step})`, height: `var(--space-${step})`, background: "var(--color-primary)" }} />
              <code style={{ fontSize: "var(--font-size-caption)" }}>--space-{step}</code>
            </div>
          ))}
        </Stack>
      </Section>

      <Section title="Buttons">
        <Stack direction="row" gap="var(--space-3)">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="text">Text</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </Stack>
        <p style={{ color: "var(--color-neutral-text-muted)" }}>
          Hover/focus states are the real CSS — interact with the buttons above directly.
        </p>
      </Section>

      <Section title="Inputs">
        <TextField label="Text Field" placeholder="Placeholder text" />
        <TextField label="Disabled Text Field" placeholder="Disabled" disabled />
      </Section>

      <Section title="Text Areas">
        <TextArea label="Text Area" placeholder="Multi-line input" hint="Optional hint text" />
      </Section>

      <Section title="Checkboxes">
        <Stack direction="row" gap="var(--space-4)" style={{ alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
            Checked / Unchecked (click to toggle)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Checkbox disabled checked />
            Disabled
          </label>
        </Stack>
      </Section>

      <Section title="Cards">
        <Card>
          <p style={{ margin: 0 }}>A Card is a plain presentational container — no variants.</p>
        </Card>
      </Section>

      <Section title="Dialogs">
        <Button onClick={() => setDialogOpen(true)}>Open Confirm Dialog</Button>
        {dialogOpen && (
          <ConfirmDialog
            title="Confirm Action"
            description="This demonstrates the ConfirmDialog primitive's default state."
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            onConfirm={() => setDialogOpen(false)}
            onCancel={() => setDialogOpen(false)}
          />
        )}
      </Section>

      <Section title="Badges">
        <Stack direction="row" gap="var(--space-2)">
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="primary">Primary</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="danger">Danger</Badge>
          <Badge tone="info">Info</Badge>
        </Stack>
      </Section>

      <Section title="Chips">
        <Stack direction="row" gap="var(--space-2)">
          <Chip label="Inactive" active={false} />
          <Chip label="Active / Selected" active={true} />
        </Stack>
      </Section>

      <Section title="Icons">
        <p style={{ color: "var(--color-neutral-text-muted)" }}>
          No dedicated Icon component exists in the current implementation — a handful of
          plain unicode glyphs are used inline where a Feature needs one (shown below). A
          real Icon primitive is a future extension point, not fabricated here without a
          concrete second consumer, per this Design System's own promotion rule.
        </p>
        <Stack direction="row" gap="var(--space-4)" style={{ fontSize: "var(--font-size-heading-2)" }}>
          <span title="Close">×</span>
          <span title="Navigate">→</span>
          <span title="Funnel step">↓</span>
        </Stack>
      </Section>

      <Section title="Empty State">
        <EmptyState title="No items yet" description="An example of the Empty State pattern." />
      </Section>

      <Section title="Loading Indicator">
        <LoadingIndicator label="Loading…" />
      </Section>

      <Section title="Skeleton">
        <p style={{ color: "var(--color-neutral-text-muted)" }}>
          Per sdd/design-system/01_design_system.md's Loading Pattern Policy — a Feature composes
          this block to mirror its own final layout (shown here as a stand-in for Business
          Structuring's onboarding recommendation chips).
        </p>
        <Stack gap="var(--space-2)">
          <Skeleton height="48px" borderRadius="var(--radius)" />
          <Skeleton height="48px" borderRadius="var(--radius)" />
          <Skeleton height="48px" borderRadius="var(--radius)" />
        </Stack>
      </Section>

      <Section title="Alerts">
        <Alert tone="danger">Danger alert — e.g., a persistence failure.</Alert>
        <Alert tone="warning">Warning alert.</Alert>
        <Alert tone="success">Success alert.</Alert>
      </Section>

      <Section title="Readiness Callout">
        <ReadinessCallout message="Validation Planning is incomplete." linkLabel="Go to Validation" onNavigate={() => {}} />
      </Section>

      <Section title="Stepper">
        <Stepper
          steps={[
            { name: "V1", description: "MVP" },
            { name: "V2", description: "AI Assist" },
            { name: "V3", description: "Market Intelligence" },
          ]}
        />
      </Section>

      <Section title="Progress Indicator">
        <ProgressIndicator current={2} total={5} label="Question 2 of 5" />
      </Section>

      <Section title="Choice List">
        <ChoiceList
          presets={["Preset A", "Preset B", "Preset C"]}
          value={choiceValue}
          writeMyOwnLabel="Write my own"
          answerLabel="Your answer"
          answerPlaceholder="Type your own answer"
          onSelectPreset={setChoiceValue}
          onCustomChange={setChoiceValue}
        />
      </Section>

      <Section title="Transition Wrapper">
        <TransitionWrapper stepKey="catalog-demo">
          <Card>
            <p style={{ margin: 0 }}>Content wrapped in a TransitionWrapper (remount to replay).</p>
          </Card>
        </TransitionWrapper>
      </Section>

      <Section title="Suggestion Card (AI)">
        <SuggestionCard
          aiTag="AI Suggestion"
          suggestionText="An example AI-generated suggestion."
          rationale="An example rationale explaining the suggestion."
          acceptLabel="Accept"
          rejectLabel="Reject"
          regenerateLabel="Regenerate"
          onAccept={() => {}}
          onReject={() => {}}
          onRegenerate={() => {}}
        />
      </Section>

      <Section title="Layout Primitives (Stack)">
        <p style={{ color: "var(--color-neutral-text-muted)" }}>Row direction:</p>
        <Stack direction="row" gap="var(--space-2)">
          <Card style={{ flex: 1 }}>Item 1</Card>
          <Card style={{ flex: 1 }}>Item 2</Card>
          <Card style={{ flex: 1 }}>Item 3</Card>
        </Stack>
      </Section>
    </div>
  );
}
