@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================
echo  Expectaly Shop - Push to GitHub
echo ============================================
echo.

where git >nul 2>&1
if errorlevel 1 (
    echo [ERROR] git was not found. Please install Git and make sure
    echo         it was added to PATH ^(https://git-scm.com/^).
    goto :end
)

echo [1/3] Staging changes ...
git add -A

git diff --cached --quiet
if not errorlevel 1 (
    echo   No changes to commit. Nothing to push.
    goto :end
)

echo.
echo [2/3] Committing ...
git commit -m "Update: %date% %time%"

echo.
echo [3/3] Pushing to origin/main ...
git push origin main

if errorlevel 1 (
    echo.
    echo [ERROR] Push failed. See the message above for details.
    echo         Common causes: not signed in to git, or remote has
    echo         commits you don't have locally ^(run "git pull" first^).
    goto :end
)

echo.
echo Done. Changes pushed to https://github.com/BinXuuu/shop.expectaly

:end
echo.
echo ============================================
echo  Press any key to close this window...
echo ============================================
pause >nul
endlocal
