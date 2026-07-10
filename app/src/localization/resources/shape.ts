// The Resources shape is shared by every language file — TypeScript enforces "no missing
// keys" at compile time (a language file that omits a key fails to typecheck), satisfying
// sdd/analysis/01_v1_release_specification.md#localization-readiness-gate's "no missing keys"
// checklist item structurally rather than only by manual review.

export interface QuestionResource {
  title: string;
  presets: string[];
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
    roadmap: string;
    openWorkspace: string;
    businessStructuring: string;
    mvpPlanning: string;
    validationPlanning: string;
    summary: string;
  };
  language: {
    korean: string;
    english: string;
  };
  landing: {
    heroTitle: string;
    heroSubtitle: string;
    valueCard1Title: string;
    valueCard1Body: string;
    valueCard2Title: string;
    valueCard2Body: string;
    valueCard3Title: string;
    valueCard3Body: string;
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
    roadmapTitle: string;
    roadmapSubtitle: string;
    roadmapV1Name: string;
    roadmapV1Desc: string;
    roadmapV2Name: string;
    roadmapV2Desc: string;
    roadmapV3Name: string;
    roadmapV3Desc: string;
    roadmapV4Name: string;
    roadmapV4Desc: string;
    roadmapV5Name: string;
    roadmapV5Desc: string;
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
