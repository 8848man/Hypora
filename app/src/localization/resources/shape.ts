// The Resources shape is shared by every language file — TypeScript enforces "no missing
// keys" at compile time (a language file that omits a key fails to typecheck), satisfying
// sdd/analysis/01_v1_release_specification.md#localization-readiness-gate's "no missing keys"
// checklist item structurally rather than only by manual review.

export interface QuestionResource {
  title: string;
  presets: string[];
}

// Landing Experiment variant content — per
// sdd/context/07_landing_experiment_strategy.md#content-model. Variant is a
// second dimension of content resolution alongside language: `t` is already
// resolved for the current language, so `t.landingVariants[variant]` gives
// that variant's copy in the current language with no separate resolution
// mechanism. Every field here is exactly what
// sdd/context/07_landing_experiment_strategy.md's Experiment Definition
// lists as variant-eligible (headlines, subheadlines, storytelling/section
// copy, CTA copy, Feature descriptions) — Feature *names*, Roadmap content,
// and the few structural example strings shared byte-for-byte across every
// variant (per sdd/landing/02_information_architecture.md's 7-section
// sequence) stay in `landing` below, mirroring how Feature names already
// stay there while Feature descriptions vary here.
//
// Section mapping (sdd/landing/02_information_architecture.md):
// 1 Hero -> hero*/ctaLabel (pre-existing)
// 2 The Gap -> gap*
// 3 How Hypora Thinks -> mechanism* (title/support/points only — the example
//   question/chips/confirmation are identical across variants, see `landing`)
// 4 Structuring vs. Validating -> sv* (the two example checklist rows are
//   identical across variants, see `landing`)
// 5 What Hypora Is Not -> notRow1-4* / notScope
// 6 Vision -> vision* (eyebrow is identical across variants, see `landing`) —
//   Section 6 was Today vs. Tomorrow (a roadmap-style split); Landing no
//   longer presents a product roadmap in any form, per
//   sdd/landing/02_information_architecture.md#vision-section-specification
// 7 Closing -> closing*/microCopy/secondaryLinkLabel (reuses ctaLabel)
export interface LandingVariantResource {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaLabel: string;
  featuresTitle: string;
  featuresSubtitle: string;
  featureProjectManagementDesc: string;
  featureBusinessStructuringDesc: string;
  featureMvpPlanningDesc: string;
  featureValidationPlanningDesc: string;
  featureProjectSummaryDesc: string;

  gapEyebrow: string;
  gapTitle: string;
  gapSupport: string;
  gapNoteToolBody: string;
  gapExecToolBody: string;
  gapHyporaBody: string;

  mechanismTitle: string;
  mechanismSupport: string;
  mechanismPoint1: string;
  mechanismPoint2: string;
  mechanismPoint3: string;

  svEyebrow: string;
  svTitle: string;
  svSupport: string;
  svStructuringLabel: string;
  svStructuringBody: string;
  svValidatingLabel: string;
  svValidatingBody: string;
  svNote: string;

  notTitle: string;
  notRow1Label: string;
  notRow1Desc: string;
  notRow2Label: string;
  notRow2Desc: string;
  notRow3Label: string;
  notRow3Desc: string;
  notRow4Label: string;
  notRow4Desc: string;
  notScope: string;

  visionTitle: string;
  visionSupport: string;
  visionThemes: string[];

  closingTitle: string;
  closingLede: string;
  microCopy: string;
  secondaryLinkLabel: string;
}

export interface Resources {
  lifecycleStage: {
    captured: string;
    structuring: string;
    scoped: string;
    validating: string;
    validated: string;
    "build-ready": string;
    archived: string;
  };
  common: {
    back: string;
    continue: string;
    cancel: string;
    create: string;
    archive: string;
    edit: string;
    loading: string;
    writeMyOwn: string;
    yourAnswer: string;
    yourAnswerPlaceholder: string;
    projectLabel: string;
  };
  nav: {
    home: string;
    features: string;
    openWorkspace: string;
    businessStructuring: string;
    mvpPlanning: string;
    validationPlanning: string;
    riskMemo: string;
    summary: string;
  };
  language: {
    korean: string;
    english: string;
  };
  landingVariants: {
    a: LandingVariantResource;
    b: LandingVariantResource;
    c: LandingVariantResource;
  };
  landing: {
    footer: string;
    featuresTitle: string;
    featuresSubtitle: string;
    featureProjectManagementName: string;
    featureProjectManagementDesc: string;
    featureBusinessStructuringName: string;
    featureBusinessStructuringDesc: string;
    featureMvpPlanningName: string;
    featureMvpPlanningDesc: string;
    featureValidationPlanningName: string;
    featureValidationPlanningDesc: string;
    featureProjectSummaryName: string;
    featureProjectSummaryDesc: string;
    // Structural example content shared byte-for-byte across every landing
    // variant (per sdd/landing/02_information_architecture.md) — never
    // narrative copy, so it stays here rather than in landingVariants.
    gapNoteToolTag: string;
    gapExecToolTag: string;
    gapHyporaTag: string;
    mechanismQuestionLabel: string;
    mechanismQuestionText: string;
    mechanismChip1: string;
    mechanismChip2: string;
    mechanismChip3: string;
    mechanismChip4: string;
    mechanismResultLabel: string;
    svCheckOpenLabel: string;
    svCheckDoneLabel: string;
    mechanismEyebrow: string;
    notEyebrow: string;
    visionEyebrow: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    newProject: string;
    projectNameLabel: string;
    projectNamePlaceholder: string;
    emptyTitle: string;
    emptyDescription: string;
    open: string;
    showArchived: string;
    hideArchived: string;
    archiveConfirmTitle: string;
    archiveConfirmDescription: string;
    loadingProjects: string;
  };
  businessStructuring: {
    title: string;
    subtitle: string;
    progressLabel: (current: number, total: number) => string;
    continueToReview: string;
    reviewTitle: string;
    reviewSubtitle: string;
    riskNotesLabel: string;
    riskNotesHint: string;
    confirmAndContinue: string;
    loadingProject: string;
    guardedNotice: string;
  };
  riskMemo: {
    title: string;
    subtitle: string;
    technicalRisksLabel: string;
    businessRisksLabel: string;
    openQuestionsLabel: string;
  };
  question: {
    businessIdea: QuestionResource;
    problem: QuestionResource;
    targetCustomer: QuestionResource;
    solution: QuestionResource;
    valueProposition: QuestionResource;
  };
  mvpPlanning: {
    title: string;
    subtitle: string;
    scopeLabel: string;
    scopeHint: string;
    markScopeComplete: string;
    markedComplete: string;
    featurePlanningTitle: string;
    addFeatureLabel: string;
    addFeaturePlaceholder: string;
    add: string;
    remove: string;
    emptyFeaturesTitle: string;
    emptyFeaturesDescription: string;
    markFeaturePlanningComplete: string;
    priorityMust: string;
    priorityShould: string;
    priorityCould: string;
    inScope: string;
    outOfScope: string;
    readyForValidation: string;
    suggestFeaturesLabel: string;
    suggestedFeaturesTitle: string;
    suggestedFeaturesEmptyNotice: string;
    duplicateIndicator: string;
    featuresAddedLabel: (count: number) => string;
    historyToggleLabel: string;
    historyTitle: string;
    historyEmptyDescription: string;
    historyCreatedLabel: string;
    historyRemovedLabel: string;
    historyAnnotationPlaceholder: string;
  };
  validationPlanning: {
    title: string;
    subtitle: string;
    reopenMvpPlanning: string;
    addAssumptionLabel: string;
    addAssumptionPlaceholder: string;
    add: string;
    emptyTitle: string;
    emptyDescription: string;
    methodLabel: string;
    methodPlaceholder: string;
    criterionLabel: string;
    criterionPlaceholder: string;
    statusOpen: string;
    statusValidated: string;
    statusInvalidated: string;
    markValidated: string;
    markInvalidated: string;
    notReadyNotice: string;
    allResolvedNotice: string;
  };
  projectSummary: {
    title: string;
    subtitle: string;
    businessCanvasTitle: string;
    fieldsCompleted: (done: number, total: number) => string;
    mvpPlanningTitle: string;
    mvpPlanningStatus: (
      scopeComplete: boolean,
      featureCount: number,
      planningComplete: boolean,
    ) => string;
    validationPlanningTitle: string;
    validationStatus: (resolved: number, total: number) => string;
    confirmBuildReady: string;
    isBuildReady: string;
    blockingCanvas: string;
    blockingScope: string;
    blockingFeaturePlanning: string;
    blockingValidationEmpty: string;
    blockingValidationOpen: string;
    blockingConfirm: string;
    goToCanvas: string;
    goToMvpPlanning: string;
    goToValidationPlanning: string;
  };
  aiAssistant: {
    askAiLabel: string;
    aiTag: string;
    loadingLabel: string;
    acceptLabel: string;
    rejectLabel: string;
    regenerateLabel: string;
    retryLabel: string;
    appliedLabel: string;
    failureGeneric: string;
    failureTimeout: string;
    failureRateLimited: string;
    failureUnavailable: string;
    failureSafetyRefusal: string;
  };
  errors: {
    projectNotFound: string;
    saveFailed: string;
  };
}
