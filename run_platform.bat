@echo off
title Mumbai Tech Career Radar
echo ========================================================
echo       MUMBAI TECH CAREER RADAR PLATFORM LAUNCHER
echo ========================================================
echo.
echo Starting Python FastAPI backend on http://127.0.0.1:8000 ...
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
pause

