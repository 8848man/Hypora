import { useEffect, useState } from "react";
import { signInAdmin, signOutAdmin, subscribeToAdminAuthState } from "./authService";
import type { AdminUser } from "./authService";

export type AdminAuthStatus = "loading" | "signed-out" | "signed-in";

export type AdminAuthState = {
  status: AdminAuthStatus;
  user: AdminUser | null;
  error: string | undefined;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export function useAdminAuth(): AdminAuthState {
  const [status, setStatus] = useState<AdminAuthStatus>("loading");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    return subscribeToAdminAuthState((nextUser) => {
      setUser(nextUser);
      setStatus(nextUser ? "signed-in" : "signed-out");
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(undefined);
    try {
      await signInAdmin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    }
  };

  const signOut = async () => {
    await signOutAdmin();
  };

  return { status, user, error, signIn, signOut };
}
