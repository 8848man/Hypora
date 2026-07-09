// HTTP body reading — generic, capability-agnostic transport concern. Not part of
// the AI Platform; belongs to the HTTP layer only.

import type { IncomingMessage } from "node:http";

export class HttpBodyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HttpBodyError";
  }
}

export function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer) => {
      data += chunk.toString("utf8");
    });
    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new HttpBodyError("Request body was not valid JSON"));
      }
    });
    req.on("error", (err: unknown) => reject(err));
  });
}
