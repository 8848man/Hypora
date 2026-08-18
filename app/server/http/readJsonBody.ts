// HTTP body reading — generic, capability-agnostic transport concern. Not part of
// the AI Platform; belongs to the HTTP layer only.

import type { IncomingMessage } from "node:http";

export class HttpBodyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HttpBodyError";
  }
}

export class HttpBodyTooLargeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HttpBodyTooLargeError";
  }
}

// Every AI Capability request is a small JSON object (canvasContext arrays,
// a handful of strings) — 256KB is generous headroom over any legitimate
// request while still bounding a single connection's memory/CPU cost, per
// the Request Defense rule in sdd/ai/04_ai_interaction.md.
const MAX_BODY_BYTES = 256 * 1024;

export function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    let rejected = false;

    req.on("data", (chunk: Buffer) => {
      if (rejected) return;
      totalBytes += chunk.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        rejected = true;
        req.destroy();
        reject(new HttpBodyTooLargeError(`Request body exceeds the ${MAX_BODY_BYTES}-byte limit`));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (rejected) return;
      if (totalBytes === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new HttpBodyError("Request body was not valid JSON"));
      }
    });
    req.on("error", (err: unknown) => {
      if (!rejected) reject(err);
    });
  });
}
