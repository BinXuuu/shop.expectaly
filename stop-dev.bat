@echo off
setlocal enabledelayedexpansion
set PORT=3100

echo Stopping dev server on port %PORT% ...
set FOUND=0
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do (
    set FOUND=1
    echo   Killing PID %%P
    taskkill /F /PID %%P >nul 2>&1
)
if "!FOUND!"=="0" (
    echo   No process was using port %PORT%.
) else (
    echo   Done.
)
pause
endlocal
