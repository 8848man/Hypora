import { useEffect, useState } from "react";
import { Button, Card, Stack, TextField } from "../design-system";
import { useLocalization } from "../localization";
import {
  signInOrLinkAccount,
  signOutAccount,
  subscribeToAccountState,
  type AccountUser,
} from "../platform/auth/authService";
import { migrateLocalStorageToAccount } from "../platform/storage";

/**
 * App-shell component (per sdd/frontend/01_architecture.md's Component
 * Ownership), per ADR-0026 — the one place login/account state lives,
 * rendered by WorkspaceAppLayout. Composes only existing Design System
 * primitives; no new one introduced (ADR-0026 Decision 2).
 *
 * On a successful sign-in/link, immediately triggers ADR-0025's migration
 * (one-directional, LocalStorage -> account, per-Project confirm-then-delete)
 * — automatic, no separate user confirmation step, per that ADR's Decision 3.
 */
export function AccountMenu() {
  const { t } = useLocalization();
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => subscribeToAccountState(setAccount), []);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const user = await signInOrLinkAccount(email, password);
      // Fire-and-forget from this form's own perspective — a failed
      // migration leaves LocalStorage untouched (ADR-0025's own
      // confirm-then-delete guarantee), so there is nothing this form needs
      // to block on or surface as a sign-in failure.
      void migrateLocalStorageToAccount(user.uid);
      setFormOpen(false);
      setEmail("");
      setPassword("");
    } catch {
      setError(t.account.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  if (account && !account.isAnonymous) {
    return (
      <Stack direction="row" gap="var(--space-2)" style={{ alignItems: "center" }}>
        <span className="account-menu__signed-in">{t.account.signedInAs(account.email ?? "")}</span>
        <Button variant="secondary" onClick={() => void signOutAccount()}>
          {t.account.signOutLabel}
        </Button>
      </Stack>
    );
  }

  if (!formOpen) {
    return (
      <Button variant="secondary" onClick={() => setFormOpen(true)}>
        {t.account.signInLabel}
      </Button>
    );
  }

  return (
    <Card className="account-menu__form">
      <Stack gap="var(--space-2)">
        <TextField
          label={t.account.emailLabel}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
        <TextField
          label={t.account.passwordLabel}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <span className="account-menu__error">{error}</span>}
        <Stack direction="row" gap="var(--space-2)">
          <Button onClick={() => void handleSubmit()} disabled={submitting || !email || !password}>
            {t.account.submitLabel}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setFormOpen(false);
              setError(null);
            }}
          >
            {t.account.cancelLabel}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
