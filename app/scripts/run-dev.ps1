# Local dev orchestrator — starts localDevApiServer.ts (the local stand-in
# for `vercel dev`, port 5191) and the Vite dev server configured with the
# /api -> :5191 proxy (vite.dev.proxy.config.ts, port 5190) together, so AI
# capability endpoints work locally without two manually-run terminals.
# Depends on both of those files existing locally — see their own header
# comments (server/localDevApiServer.ts, vite.dev.proxy.config.ts).

$ErrorActionPreference = "Stop"

# This script lives in app/scripts/; both child processes must run from app/.
Set-Location (Split-Path -Parent $PSScriptRoot)

$apiProcess = $null
$webProcess = $null

function Stop-Children {
    foreach ($p in @($apiProcess, $webProcess)) {
        if ($p -and -not $p.HasExited) {
            # Stop-Process only kills the immediate process. npx.cmd spawns
            # node.exe as a detached child of that shim, so Stop-Process alone
            # leaves the real server/vite process (and the port it's bound
            # to) running. taskkill /T kills the whole process tree.
            & taskkill /PID $p.Id /T /F 2>$null | Out-Null
        }
    }
}

try {
    # npx resolves to npx.cmd on Windows — not a native executable, so
    # Start-Process needs the .cmd shim named explicitly (a bare "npx" fails
    # with "not a valid Win32 application").
    $apiProcess = Start-Process -FilePath "npx.cmd" -ArgumentList "tsx", "server/localDevApiServer.ts" -NoNewWindow -PassThru
    $webProcess = Start-Process -FilePath "npx.cmd" -ArgumentList "vite", "--config", "vite.dev.proxy.config.ts" -NoNewWindow -PassThru

    while (-not $apiProcess.HasExited -and -not $webProcess.HasExited) {
        Start-Sleep -Milliseconds 500
    }

    if ($apiProcess.HasExited) {
        Write-Error "[run-dev] localDevApiServer exited unexpectedly (code $($apiProcess.ExitCode)) — shutting down"
    }
    if ($webProcess.HasExited) {
        Write-Error "[run-dev] vite exited unexpectedly (code $($webProcess.ExitCode)) — shutting down"
    }
}
finally {
    Stop-Children
}
