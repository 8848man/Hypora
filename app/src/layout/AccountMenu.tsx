import { useEffect, useState } from "react";
import { Button, Card, Stack, TextField } from "../design-system";
import { useLocalization } from "../localization";
import {
  classifyAuthError,
  signInOrLinkAccount,
  signOutAccount,
  subscribeToAccountState,
  type AccountUser,
  type AuthErrorKind,
} from "../platform/auth/authService";
import { migrateLocalStorageToAccount } from "../platform/storage";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

type Mode = "signUp" | "signIn";

/**
 * App-shell component (per sdd/frontend/01_architecture.md's Component
 * Ownership), per ADR-0026 — the one place login/account state lives,
 * rendered by WorkspaceAppLayout. Composes only existing Design System
 * primitives; no new one introduced (ADR-0026 Decision 2).
 *
 * Sign Up and Sign In share one underlying call (signInOrLinkAccount, per
 * ADR-0025 -- it already handles both a new email and an existing one), so
 * `mode` here only changes which fields/copy/client-side checks are shown,
 * never a different network call.
 *
 * On a successful sign-in/link, immediately triggers ADR-0025's migration
 * (one-directional, LocalStorage -> account, per-Project confirm-then-delete)
 * — automatic, no separate user confirmation step, per that ADR's Decision 3.
 */
export function AccountMenu() {
  const { t } = useLocalization();
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("signUp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => subscribeToAccountState(setAccount), []);

  function resetForm() {
    setFormOpen(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  }

  function errorMessage(kind: AuthErrorKind): string {
    switch (kind) {
      case "weak-password":
        return t.account.errorWeakPassword;
      case "invalid-email":
        return t.account.errorInvalidEmail;
      case "wrong-credentials":
        return t.account.errorWrongCredentials;
      default:
        return t.account.errorGeneric;
    }
  }

  async function handleSubmit() {
    // Client-side checks first -- cheaper than a round trip, and each maps
    // to the same specific message a server-side rejection of the same
    // problem would (kept in sync deliberately: EMAIL_PATTERN/MIN_PASSWORD_LENGTH
    // here are a fast-path, not a second source of truth -- Firebase's own
    // rules are still the actual enforcement, via classifyAuthError below).
    if (!EMAIL_PATTERN.test(email)) {
      setError(t.account.errorInvalidEmail);
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t.account.errorWeakPassword);
      return;
    }
    if (mode === "signUp" && password !== confirmPassword) {
      setError(t.account.errorPasswordMismatch);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const user = await signInOrLinkAccount(email, password);
      // Fire-and-forget from this form's own perspective — a failed
      // migration leaves LocalStorage untouched (ADR-0025's own
      // confirm-then-delete guarantee), so there is nothing this form needs
      // to block on or surface as a sign-in failure.
      void migrateLocalStorageToAccount(user.uid);
      resetForm();
    } catch (err) {
      setError(errorMessage(classifyAuthError(err)));
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
        <Stack direction="row" gap="var(--space-2)">
          <Button
            variant={mode === "signUp" ? "primary" : "secondary"}
            onClick={() => {
              setMode("signUp");
              setError(null);
            }}
          >
            {t.account.signUpTabLabel}
          </Button>
          <Button
            variant={mode === "signIn" ? "primary" : "secondary"}
            onClick={() => {
              setMode("signIn");
              setConfirmPassword("");
              setError(null);
            }}
          >
            {t.account.signInTabLabel}
          </Button>
        </Stack>

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
        {mode === "signUp" && (
          <TextField
            label={t.account.confirmPasswordLabel}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}
        {error && <span className="account-menu__error">{error}</span>}
        <Stack direction="row" gap="var(--space-2)">
          <Button
            onClick={() => void handleSubmit()}
            disabled={submitting || !email || !password || (mode === "signUp" && !confirmPassword)}
          >
            {mode === "signUp" ? t.account.signUpSubmitLabel : t.account.signInSubmitLabel}
          </Button>
          <Button variant="secondary" onClick={resetForm}>
            {t.account.cancelLabel}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
