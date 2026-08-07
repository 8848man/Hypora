// Shared helpers for the verifyStage*.ts scripts — a mock Node
// IncomingMessage/ServerResponse pair and a minimal fail-fast assert, used
// identically by every script that exercises a real HTTP handler with a
// mocked request/response rather than an actual socket.

import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";

export function createAssert(scriptLabel: string): (condition: boolean, message: string) => void {
  return function assert(condition: boolean, message: string): void {
    if (!condition) {
      console.error(`${scriptLabel}: FAIL - ${message}`);
      process.exit(1);
    }
  };
}

export function createMockRequest(method: string, body: unknown): IncomingMessage {
  const bodyStr = body === undefined ? "" : typeof body === "string" ? body : JSON.stringify(body);
  const readable = Readable.from([Buffer.from(bodyStr, "utf8")]) as unknown as IncomingMessage;
  (readable as unknown as { method: string }).method = method;
  return readable;
}

export function createMockResponse(): { res: ServerResponse; status: () => number; body: () => string } {
  let statusCode = 0;
  let body = "";
  const res = {
    setHeader: () => {},
    end: (chunk: string) => {
      body = chunk;
    },
  } as unknown as ServerResponse;
  Object.defineProperty(res, "statusCode", {
    get: () => statusCode,
    set: (v: number) => {
      statusCode = v;
    },
  });
  return { res, status: () => statusCode, body: () => body };
}
