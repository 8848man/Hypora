// Implements the Language Selection Flow's priority order, per
// sdd/workspace/01_architecture.md#localization:
//   1. User previously selected language (persisted) — permanent, never overridden by detection.
//   2. Device language hint — first-launch convenience only.
//   3. Korean fallback — never a silent fallback to English.

import { readStoredLanguage } from "../platform/storage";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type Language } from "./types";

function detectDeviceLanguageHint(): Language | null {
  if (typeof navigator === "undefined") return null;
  const candidates = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  for (const raw of candidates) {
    if (!raw) continue;
    const primary = raw.split("-")[0].toLowerCase();
    if ((SUPPORTED_LANGUAGES as string[]).includes(primary)) {
      return primary as Language;
    }
  }
  return null;
}

export function resolveInitialLanguage(): Language {
  const stored = readStoredLanguage();
  if (stored) return stored;

  const hint = detectDeviceLanguageHint();
  if (hint) return hint;

  return DEFAULT_LANGUAGE;
}
