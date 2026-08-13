@echo off
setlocal enabledelayedexpansion
set PORT=3100
cd /d "%~dp0"

echo ============================================ > dev-server.log
echo  Expectaly Shop - Dev Server (background)    >> dev-server.log
echo  Started at %DATE% %TIME%                    >> dev-server.log
echo ============================================ >> dev-server.log

for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do (
    echo Killing PID %%P that was already using port %PORT% >> dev-server.log
    taskkill /F /PID %%P >nul 2>&1
)

echo Starting background window-hider for the extra next-server console window >> dev-server.log
start "" /b powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0hide-next-server-window.ps1" >nul 2>&1

echo Starting dev server on 0.0.0.0:%PORT% ... >> dev-server.log
call npm run dev -- -p %PORT% -H 0.0.0.0 >> dev-server.log 2>&1

echo Dev server process exited at %DATE% %TIME% >> dev-server.log
endlocal
