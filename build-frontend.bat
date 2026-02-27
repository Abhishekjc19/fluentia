@echo off
echo Building frontend...
cd frontend
call npm install
call npm run build
echo.
echo Build complete! Upload the 'frontend/dist' folder to any static host:
echo - Netlify Drop: https://app.netlify.com/drop
echo - Surge.sh: npm install -g surge && surge dist
echo.
pause
