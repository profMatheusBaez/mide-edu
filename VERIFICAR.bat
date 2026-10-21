@echo off
rem MIDE EDU - confere se este PC esta pronto (compila sketches de teste)
chcp 65001 >nul
title MIDE EDU - conferencia
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalador\verificar.ps1" -Pasta "%~dp0."
echo.
pause
