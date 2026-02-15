@echo off
title Drive Sync App (v2.1)
cls
echo ===================================================
echo           Drive Sync App Launcher (v2.1)
echo ===================================================
echo.
echo Checking for updates...

cd /d "%~dp0"

:: Always build to ensure updates are applied
echo.
echo [INFO] Building app to ensure latest updates...
call npm run build

:: Open browser
echo.
echo [INFO] Opening Dashboard...
timeout /t 3 /nobreak >nul
start "" "http://localhost:3000/dashboard"

:: Start the server
echo.
echo [SUCCESS] Server is running!
echo Do not close this window while using the app.
echo.
call npm start
pause
