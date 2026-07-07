import { Link } from "react-router-dom";
import { Button, Card, Stack } from "../../design-system";

export function HomePage() {
  return (
    <div>
      <section style={{ textAlign: "center", padding: "var(--space-7) 0" }}>
        <h1 style={{ fontSize: "var(--font-size-heading-1)", margin: "0 0 var(--space-3)" }}>
          Turn a business idea into a validated MVP plan.
        </h1>
        <p
          style={{
            fontSize: "var(--font-size-heading-3)",
            color: "var(--color-neutral-text-muted)",
            maxWidth: 640,
            margin: "0 auto var(--space-5)",
          }}
        >
          Hypora is a structured workspace for founders — no AI, no backend, just a clear path
          from idea to a scoped, validated plan.
        </p>
        <Link to="/app">
          <Button>Open Workspace</Button>
        </Link>
      </section>

      <Stack direction="row" gap="var(--space-4)" style={{ marginTop: "var(--space-6)" }}>
        <Card style={{ flex: "1 1 240px" }}>
          <h3>Structure the idea</h3>
          <p>Business Idea, Problem, Target Customer, Solution, Value Proposition — one Canvas.</p>
        </Card>
        <Card style={{ flex: "1 1 240px" }}>
          <h3>Scope the MVP</h3>
          <p>Decide what's in your first version, and prioritize the features that matter.</p>
        </Card>
        <Card style={{ flex: "1 1 240px" }}>
          <h3>Validate before you build</h3>
          <p>Turn assumptions into testable checks — know what's confirmed, not just hoped.</p>
        </Card>
      </Stack>
    </div>
  );
}
