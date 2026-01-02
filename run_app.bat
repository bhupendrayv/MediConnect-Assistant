@echo off
setlocal
echo ============================================
echo Smart Healthcare Assistant - Automated Launcher
echo ============================================

REM Explicitly set Node.js path for this session
set "PATH=%PATH%;C:\Program Files\nodejs"

echo Cleaning up old processes...
taskkill /F /IM node.exe /T >nul 2>&1

echo Checking Environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found at C:\Program Files\nodejs
    echo Please ensure Node.js is installed correctly.
    pause
    exit /b
)

echo [OK] Node.js found.

echo.
echo Starting Backend Server in a new window...
start "BACKEND" cmd /k "set PATH=%%PATH%%;C:\Program Files\nodejs && cd server && npm run dev"

echo Starting Frontend Client in a new window...
start "FRONTEND" cmd /k "set PATH=%%PATH%%;C:\Program Files\nodejs && cd client && npm run dev"

echo.
echo ============================================
echo SUCCESS: Both servers are starting!
echo 1. Wait for "Server running" in the BACKEND window.
echo 2. Wait for "Local: http://localhost:5173" in the FRONTEND window.
echo 3. Open your browser and go to: http://localhost:5173
echo ============================================
pause
