// Internal-operator login form. Firebase Authentication only, per ADR-0015 —
// this is the UI's only touchpoint with ../../../platform/auth; it never
// imports firebase/auth directly.

import { useState } from "react";
import type { FormEvent } from "react";
import { Alert, Button, Card, TextField } from "../../../design-system";

export function AdminLoginForm({
  onSubmit,
  error,
}: {
  onSubmit: (email: string, password: string) => Promise<void>;
  error: string | undefined;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    await onSubmit(email, password);
    setSubmitting(false);
  };

  return (
    <Card style={{ maxWidth: 360, margin: "var(--space-6) auto" }}>
      <h2 style={{ marginTop: 0 }}>Analytics Dashboard — Sign In</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error && <Alert tone="danger">{error}</Alert>}
        <Button type="submit" disabled={submitting} style={{ marginTop: "var(--space-3)" }}>
          {submitting ? "Signing in…" : "Sign In"}
        </Button>
      </form>
    </Card>
  );
}
