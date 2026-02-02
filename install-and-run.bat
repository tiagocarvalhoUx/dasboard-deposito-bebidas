@echo off
cd /d "C:\Users\Casa-PC\OneDrive\Documentos\Projects\dashboard-deposito\Kimi_Agent_Link-Dashboard\app"
echo Instalando dependencias...
call npm install
echo.
echo Dependencias instaladas! Iniciando servidor de desenvolvimento...
echo.
call npm run dev
