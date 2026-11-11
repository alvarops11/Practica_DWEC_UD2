@echo off
cd /d "%~dp0"
call npm ci
if errorlevel 1 exit /b 1
if not exist .env copy .env.example .env
echo Configura SESSION_SECRET en .env y ejecuta npm start.
