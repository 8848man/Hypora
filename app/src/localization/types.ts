// Per sdd/workspace/02_data_and_state.md#application-level-state-non-project and
// sdd/frontend/01_architecture.md#localization-layer.

export type Language = "ko" | "en";

export const SUPPORTED_LANGUAGES: Language[] = ["ko", "en"];
export const DEFAULT_LANGUAGE: Language = "ko";
