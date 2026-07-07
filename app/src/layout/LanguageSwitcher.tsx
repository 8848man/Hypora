import { Chip } from "../design-system";
import { useLocalization } from "../localization";

/**
 * An app-shell component (per sdd/frontend/01_architecture.md's Component Ownership) — used by
 * both Landing and Workspace, so it lives here rather than inside any single Feature module.
 * Composes the existing Chip primitive; introduces no new Design System component.
 */
export function LanguageSwitcher() {
  const { t, language, setLanguage } = useLocalization();
  return (
    <div className="language-switcher">
      <Chip label={t.language.korean} active={language === "ko"} onToggle={() => setLanguage("ko")} />
      <Chip label={t.language.english} active={language === "en"} onToggle={() => setLanguage("en")} />
    </div>
  );
}
