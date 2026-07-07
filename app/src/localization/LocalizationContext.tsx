import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { writeStoredLanguage } from "../platform/storage";
import { resolveInitialLanguage } from "./detectLanguage";
import { en } from "./resources/en";
import { ko } from "./resources/ko";
import type { Resources } from "./resources/shape";
import type { Language } from "./types";

const RESOURCES: Record<Language, Resources> = { ko, en };

interface LocalizationContextValue {
  language: Language;
  /** Explicit user action only — per sdd/workspace/02_data_and_state.md, `language` is
   *  written only through an explicit switch, never inferred after first-launch detection. */
  setLanguage: (language: Language) => void;
  /** Resolved resource tree for the current language — the sole way Feature Modules and
   *  UI Components obtain display text, per sdd/frontend/01_architecture.md#localization-layer. */
  t: Resources;
}

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

export function LocalizationProvider({ children }: { children: ReactNode }) {
  // Lazy init: resolved once via the Language Selection Flow's priority order
  // (stored > device hint > Korean fallback) — never re-run on subsequent renders.
  const [language, setLanguageState] = useState<Language>(() => resolveInitialLanguage());

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    writeStoredLanguage(next);
  }, []);

  const value = useMemo<LocalizationContextValue>(
    () => ({ language, setLanguage, t: RESOURCES[language] }),
    [language, setLanguage],
  );

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

/** The Localization Layer's single access point for Feature Modules — per
 *  sdd/frontend/01_architecture.md#localization-layer's "consistent access pattern" rule. */
export function useLocalization(): LocalizationContextValue {
  const ctx = useContext(LocalizationContext);
  if (!ctx) throw new Error("useLocalization must be used within a LocalizationProvider");
  return ctx;
}
