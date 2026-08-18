import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Stack } from "../design-system";
import { useLocalization } from "../localization";
import { signOutAccount, subscribeToAccountState, type AccountUser } from "../platform/auth/authService";

/**
 * App-shell component (per sdd/frontend/01_architecture.md's Component
 * Ownership), rendered by WorkspaceAppLayout — a slim account-state entry
 * point only. The sign-up/sign-in form itself lives at the dedicated
 * `/app/account` route (AccountPage), per ADR-0027 (partially superseding
 * ADR-0026, which originally put the form here inline).
 */
export function AccountMenu() {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [account, setAccount] = useState<AccountUser | null>(null);

  useEffect(() => subscribeToAccountState(setAccount), []);

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

  return (
    <Button variant="secondary" onClick={() => navigate("/app/account")}>
      {t.account.signInLabel}
    </Button>
  );
}
