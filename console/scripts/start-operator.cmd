@echo off
REM Starlight Operator — double-click launcher (C940)
setlocal
set "SIS=%USERPROFILE%\Starlight-Intelligence-System"
set "VOICE=%USERPROFILE%\starlight-voice"
set "OPERATOR=http://127.0.0.1:3001/operator"

REM Start console if needed
curl -sf -o NUL --max-time 2 http://127.0.0.1:3001/ >NUL 2>&1
if errorlevel 1 (
  start "starlight-console" /MIN cmd /c "cd /d "%SIS%\console" && pnpm dev"
  timeout /t 5 /nobreak >NUL
)

REM Start voice status server if needed
curl -sf -o NUL --max-time 2 http://127.0.0.1:8765/status >NUL 2>&1
if errorlevel 1 (
  if exist "%VOICE%\dashboard\server.py" (
    start "starlight-voice" /MIN cmd /c "cd /d "%VOICE%" && set PYTHONPATH=sidecar\src && python dashboard\server.py"
  )
)

start "" "%OPERATOR%"
endlocal
