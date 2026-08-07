// Firestore Provider — the only file in this codebase permitted to import the
// Firebase SDK, per sdd/analytics/03_provider_independence.md (the
// Zero-Provider-Conditional Rule: no code outside a Provider implementation may
// depend on a specific vendor). Firebase Firestore is the Event Model's initial
// storage backend, per sdd/analytics/01_architecture.md and ADR-0013 — not
// Firebase Analytics (GA4); this Provider writes each event as a document, it
// never calls `logEvent`. Initializes lazily, only once real configuration is
// supplied (see ../config.ts) — never at module load time, so importing this
// file has no effect before it is actually selected (see ../container.ts).

import { getFirebaseApp } from "../firebaseApp";
import type { AnalyticsEvent, EventTracker } from "../eventTracker";
import type { FirebaseFirestoreConfig } from "../config";

type FirestoreHandle = {
  firestore: import("firebase/firestore").Firestore;
  collection: typeof import("firebase/firestore").collection;
  addDoc: typeof import("firebase/firestore").addDoc;
};

// Provider-owned persistence schema stamp — distinct from, and not a substitute
// for, the Event Model's own (not-yet-needed) contract versioning, per
// sdd/analytics/02_event_model.md's "Future: Contract Versioning" section.
// Bump only when this Provider's own document shape changes.
const FIRESTORE_DOCUMENT_SCHEMA_VERSION = 1;

export class FirebaseEventTracker implements EventTracker {
  readonly id = "firebase";

  private handlePromise: Promise<FirestoreHandle> | undefined;
  private readonly config: FirebaseFirestoreConfig;

  constructor(config: FirebaseFirestoreConfig) {
    this.config = config;
  }

  private getHandle(): Promise<FirestoreHandle> {
    if (!this.handlePromise) {
      this.handlePromise = this.initialize();
    }
    return this.handlePromise;
  }

  private async initialize(): Promise<FirestoreHandle> {
    const { getFirestore, collection, addDoc } = await import("firebase/firestore");
    const app = await getFirebaseApp(this.config);
    return { firestore: getFirestore(app), collection, addDoc };
  }

  // Mapping the Event Model envelope into a Firestore document is this
  // Provider's own responsibility, per sdd/analytics/03_provider_independence.md's
  // Provider Responsibilities table — the Analytics Service and every emitting
  // call site stay unaware of the collection path or document shape.
  track(event: AnalyticsEvent): void {
    void this.getHandle()
      .then(({ firestore, collection, addDoc }) => {
        const document: Record<string, unknown> = {
          eventId: event.eventId,
          eventName: event.eventName,
          timestamp: event.timestamp,
          sessionId: event.sessionId,
          anonymousUserId: event.anonymousUserId,
          schemaVersion: FIRESTORE_DOCUMENT_SCHEMA_VERSION,
        };
        // Firestore rejects `undefined` field values — an emitting call site
        // supplies exactly one of pagePath (Landing) or feature/screen
        // (Workspace/AI), per the Event Model envelope; only attach whichever
        // optional fields were actually present.
        if (event.pagePath !== undefined) document.pagePath = event.pagePath;
        if (event.feature !== undefined) document.feature = event.feature;
        if (event.screen !== undefined) document.screen = event.screen;
        if (event.projectId !== undefined) document.projectId = event.projectId;
        if (event.properties) document.properties = event.properties;
        return addDoc(collection(firestore, this.config.collectionPath), document);
      })
      .catch((error: unknown) => {
        console.error("[analytics:firebase] failed to record event", event.eventName, error);
      });
  }
}
