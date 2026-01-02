@echo off
echo Starting Smart Healthcare Assistant Setup...

echo ==========================================
echo Setting up Backend Server...
echo ==========================================
start "Backend Server" cmd /k "cd server && echo Installing Dependencies... && npm install && echo Starting Server... && npm run dev"

echo ==========================================
echo Setting up Frontend Client...
echo ==========================================
start "Frontend Client" cmd /k "cd client && echo Installing Dependencies... && npm install && echo Starting Client... && npm run dev"

echo ==========================================
echo Setup Initiated!
echo Please check the opened terminal windows for progress.
echo Once running, the app should open in your browser or go to http://localhost:5173
echo ==========================================
pause
