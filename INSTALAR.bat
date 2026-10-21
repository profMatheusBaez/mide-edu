@echo off
rem ============================================================
rem  MIDE EDU - instala a IDE neste PC (laboratorio, Arduino Uno)
rem  Dois cliques. Nao precisa ser administrador.
rem  Detalhes em instalador\LEIA-ME-LABORATORIO.md
rem ============================================================
chcp 65001 >nul
title MIDE EDU - instalacao
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalador\instalar.ps1" %*
echo.
pause
