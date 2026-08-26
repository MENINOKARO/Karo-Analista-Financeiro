@echo off
title Karo Analista Financeiro (Senior Analyst Pro)
color 0A
cls
echo ================================================================
echo          🏛️ KARO ANALISTA FINANCEIRO - SENIOR ANALYST PRO
echo ================================================================
echo.
echo [*] Verificando dependencias...
if not exist node_modules (
    echo [*] Instalando modulos necessarios...
    call npm install
)
echo [*] Iniciando servidor do Karo Analista Financeiro...
echo [*] Abrindo no navegador: http://localhost:3000
echo.
start http://localhost:3000
call npm run dev
pause