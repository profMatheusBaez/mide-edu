@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Abre o app sem janela preta. Sem blocos ( ): so goto.
where pyw >nul 2>nul && goto com_pyw
if exist "%LOCALAPPDATA%\Programs\Thonny\pythonw.exe" goto com_thonny_usuario
if exist "%ProgramFiles(x86)%\Thonny\pythonw.exe" goto com_thonny_x86
if exist "%ProgramFiles%\Thonny\pythonw.exe" goto com_thonny
where pythonw >nul 2>nul && goto com_pythonw
echo O Python nao foi encontrado neste computador.
echo Instale em https://www.python.org/downloads/ ou instale o Thonny, e abra este arquivo de novo.
pause
exit /b 1
:com_pyw
start "" pyw -3 "MIDE Joystick.pyw"
exit /b 0
:com_thonny_usuario
start "" "%LOCALAPPDATA%\Programs\Thonny\pythonw.exe" "MIDE Joystick.pyw"
exit /b 0
:com_thonny_x86
start "" "%ProgramFiles(x86)%\Thonny\pythonw.exe" "MIDE Joystick.pyw"
exit /b 0
:com_thonny
start "" "%ProgramFiles%\Thonny\pythonw.exe" "MIDE Joystick.pyw"
exit /b 0
:com_pythonw
start "" pythonw "MIDE Joystick.pyw"
exit /b 0
