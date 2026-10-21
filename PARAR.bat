@echo off
rem ============================================================
rem  Encerra o servidor do MIDE EDU.
rem  No dia a dia nao e preciso: use Arquivo > Sair dentro da
rem  propria IDE, ou simplesmente deixe — o servidor se desliga
rem  sozinho depois de 15 minutos sem ninguem usando.
rem ============================================================
cd /d "%~dp0"

rem 1) pedido educado ao proprio servidor
curl -s -X POST http://127.0.0.1:8080/api/encerrar >nul 2>&1

rem 2) garantia: derruba qualquer python rodando o servidor.py desta pasta
powershell -NoProfile -Command ^
  "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*servidor.py*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo Servidor encerrado.
timeout /t 2 >nul
