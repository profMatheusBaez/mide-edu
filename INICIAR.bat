@echo off
rem ============================================================
rem  Atalho alternativo. O jeito recomendado e dar dois cliques
rem  em "MIDE EDU.vbs", que nao mostra janela nenhuma.
rem  Este .bat existe para quem preferir passar opcoes, por
rem  exemplo:  INICIAR.bat --porta 8090
rem ============================================================
cd /d "%~dp0"

if exist "%~dp0python\pythonw.exe" (
    start "" "%~dp0python\pythonw.exe" servidor.py %*
    exit /b
)

where pythonw >nul 2>&1
if %errorlevel%==0 (
    start "" pythonw servidor.py %*
    exit /b
)

where pyw >nul 2>&1
if %errorlevel%==0 (
    start "" pyw -3 servidor.py %*
    exit /b
)

where python >nul 2>&1
if %errorlevel%==0 (
    start "" /min python servidor.py %*
    exit /b
)

echo.
echo  Python 3 nao foi encontrado neste computador.
echo  Instale em https://www.python.org/downloads/ marcando
echo  a opcao "Add python.exe to PATH" e rode este arquivo de novo.
echo.
pause
