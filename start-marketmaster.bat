@echo off
title MarketMaster AI - Senior Analyst Pro
echo ========================================================
echo   MARKETMASTER AI - INICIANDO ECOSSISTEMA INSTITUCIONAL
echo ========================================================
echo.
echo 1. Abrindo Servidor Next.js (Dashboard Web / Mobile)...
start cmd /k "npm run dev"
echo.
echo 2. Abrindo Scanner 5 Minutos Continuo...
start cmd /k "npm run scanner"
echo.
echo Ecossistema ativo! Acesse no navegador: http://localhost:3000
timeout /t 3
start http://localhost:3000
