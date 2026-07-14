// Firebase Analytics Repository — the only file in this codebase permitted to
// query Firestore for analytics events, per sdd/analytics/06_query_and_reporting.md
// (mirrors FirebaseEventTracker's own exclusivity on the write side). Firestore-
// specific querying only: translates the Repository Interface's time-range/
// eventName parameters into Firestore query mechanics and maps results back
// into the Event Model envelope, stripping the write-side's own schemaVersion
// stamp. Reuses the same shared Firebase App instance as the write path and
// the GA4 Reporter — no second Firebase App initialization.

import { getFirebaseApp } from "../../firebaseApp";
import type { AnalyticsEvent } from "../../eventTracker";
import type { FirebaseFirestoreConfig } from "../../config";
import type { AnalyticsRepository, EventQueryFilter } from "../analyticsRepository";

type FirestoreQueryHandle = {
  firestore: import("firebase/firestore").Firestore;
  collection: typeof import("firebase/firestore").collection;
  query: typeof import("firebase/firestore").query;
  where: typeof import("firebase/firestore").where;
  orderBy: typeof import("firebase/firestore").orderBy;
  limit: typeof import("firebase/firestore").limit;
  getDocs: typeof import("firebase/firestore").getDocs;
};

// Firestore's `in` operator supports at most 10 values — the Event Catalog's
// Landing section has 5, well within range. A filter needing more would
// require multiple queries merged client-side; not needed at this scope.
const FIRESTORE_IN_OPERATOR_LIMIT = 10;

export class FirebaseAnalyticsRepository implements AnalyticsRepository {
  readonly id = "firebase";

  private handlePromise: Promise<FirestoreQueryHandle> | undefined;
  private readonly config: FirebaseFirestoreConfig;

  constructor(config: FirebaseFirestoreConfig) {
    this.config = config;
  }

  private getHandle(): Promise<FirestoreQueryHandle> {
    if (!this.handlePromise) {
      this.handlePromise = this.initialize();
    }
    return this.handlePromise;
  }

  private async initialize(): Promise<FirestoreQueryHandle> {
    const { getFirestore, collection, query, where, orderBy, limit, getDocs } = await import("firebase/firestore");
    const app = await getFirebaseApp(this.config);
    return { firestore: getFirestore(app), collection, query, where, orderBy, limit, getDocs };
  }

  async queryEvents(filter: EventQueryFilter): Promise<AnalyticsEvent[]> {
    const { firestore, collection, query, where, orderBy, limit: limitTo, getDocs } = await this.getHandle();

    if (filter.eventNames && filter.eventNames.length > FIRESTORE_IN_OPERATOR_LIMIT) {
      throw new Error(
        `Analytics Repository: cannot filter by more than ${FIRESTORE_IN_OPERATOR_LIMIT} event names in one query`,
      );
    }

    // `timestamp` is stored as an ISO 8601 UTC string (Event Model envelope),
    // which sorts and range-compares correctly as a plain string — no
    // Firestore Timestamp conversion needed.
    const constraints: import("firebase/firestore").QueryConstraint[] = [
      where("timestamp", ">=", filter.since.toISOString()),
    ];
    if (filter.until) {
      constraints.push(where("timestamp", "<=", filter.until.toISOString()));
    }
    if (filter.eventNames && filter.eventNames.length > 0) {
      constraints.push(where("eventName", "in", filter.eventNames));
    }
    constraints.push(orderBy("timestamp", "desc"));
    if (filter.limit) {
      constraints.push(limitTo(filter.limit));
    }

    const snapshot = await getDocs(query(collection(firestore, this.config.collectionPath), ...constraints));

    return snapshot.docs.map((doc): AnalyticsEvent => {
      const data = doc.data();
      const event: AnalyticsEvent = {
        eventId: data.eventId,
        eventName: data.eventName,
        timestamp: data.timestamp,
        sessionId: data.sessionId,
        anonymousUserId: data.anonymousUserId,
        pagePath: data.pagePath,
      };
      if (data.properties) {
        event.properties = data.properties;
      }
      return event;
    });
  }
}
