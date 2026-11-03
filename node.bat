@echo off
title Inicializacion Node.js - UD2

echo ========================================
echo   Inicializando proyecto Node.js - UD2
echo ========================================
echo.

echo [1/4] Inicializando Node.js...
call npm init -y

echo.
echo [2/4] Instalando dependencias...
echo.

call npm install express ejs express-session bcrypt express-rate-limit --save-dev vitest supertest

echo.
echo [3/4] Configurando package.json...
echo.

powershell -Command "$p = Get-Content package.json -Raw | ConvertFrom-Json; $p.type = 'module'; $p.scripts = [ordered]@{ start = 'node --env-file=.env src/server.js'; dev = 'node --watch --env-file=.env src/server.js'; test = 'vitest run' }; $p | ConvertTo-Json -Depth 10 | Set-Content package.json"

echo.
echo [4/4] Creando carpetas y archivos...
echo.

if not exist src mkdir src
if not exist views mkdir views
if not exist tests mkdir tests

if not exist src\server.js type nul > src\server.js
if not exist .env type nul > .env

echo.
echo ========================================
echo   PROYECTO CREADO CORRECTAMENTE
echo ========================================
echo.

pause