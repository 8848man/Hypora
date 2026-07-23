// Local dev orchestrator — starts localDevApiServer.ts (the local stand-in
// for `vercel dev`, port 5191) and the Vite dev server configured with the
// /api -> :5191 proxy (vite.dev.proxy.config.ts, port 5190) together, so AI
// capability endpoints work locally without two manually-run terminals.
// Depends on both of those files existing locally — see their own header
// comments (server/localDevApiServer.ts, vite.dev.proxy.config.ts).

import { spawn, type ChildProcess } from "node:child_process";

const children: ChildProcess[] = [];
let shuttingDown = false;

function startProcess(label: string, command: string, args: string[]): ChildProcess {
  const child = spawn(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  children.push(child);

  child.on("exit", (code) => {
    if (shuttingDown) return;
    console.error(`[runDev] "${label}" exited unexpectedly (code ${code}) — shutting down`);
    shutdown(code ?? 1);
  });

  return child;
}

function shutdown(exitCode: number): void {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(exitCode);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

startProcess("api", "npx", ["tsx", "server/localDevApiServer.ts"]);
startProcess("web", "npx", ["vite", "--config", "vite.dev.proxy.config.ts"]);
