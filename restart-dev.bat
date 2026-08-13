@echo off
setlocal enabledelayedexpansion
set PORT=3100

cd /d "%~dp0"

echo ============================================
echo  Expectaly Shop - Dev Server Restart
echo ============================================
echo.

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm was not found. Please install Node.js and make sure
    echo         it was added to PATH ^(https://nodejs.org/^).
    echo.
    pause
    exit /b 1
)

echo [1/3] Stopping any process already listening on port %PORT% ...
set FOUND=0
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do (
    set FOUND=1
    echo   Killing PID %%P
    taskkill /F /PID %%P >nul 2>&1
)
if "!FOUND!"=="0" echo   No process was using port %PORT%.

echo.
echo [2/3] This machine can be reached at:
echo   http://localhost:%PORT%
for /f "usebackq delims=" %%A in (`powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -ExpandProperty IPAddress"`) do (
    echo   http://%%A:%PORT%
)
echo   ^(If LAN/Tailscale devices cannot connect, check that Windows Firewall
echo    allows inbound connections on port %PORT%.^)

echo.
echo Note: Next.js/Turbopack may open an extra "next-server" console window on
echo       Windows. A background helper will keep it hidden automatically.
start "" /b powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0hide-next-server-window.ps1" >nul 2>&1

echo.
echo [3/3] Starting dev server on 0.0.0.0:%PORT% ...
echo        Closing this window stops the server. Logs will stream below.
echo.

call npm run dev -- -p %PORT% -H 0.0.0.0

echo.
echo Server stopped.
pause
endlocal
