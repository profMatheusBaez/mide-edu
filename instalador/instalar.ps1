# ============================================================
#  MIDE EDU — instalador do laboratório (Arduino Uno + UNIHIKER K10)
# ------------------------------------------------------------
#  Rode pelo INSTALAR.bat (dois cliques). Não precisa ser
#  administrador. Em cada PC ele:
#    1. copia a IDE para C:\MIDE EDU
#    2. baixa o Python portátil (pasta python\)
#    3. baixa o arduino-cli (pasta arduino-cli\)
#    4. instala o núcleo do Uno e as bibliotecas Servo e
#       LiquidCrystal I2C DENTRO da pasta (arduino-cli\dados)
#    5. instala o suporte C++ da UNIHIKER K10 (pacote oficial
#       UNIHIKER:esp32 0.0.5, ~1,5 GB) também dentro da pasta
#    6. cria o atalho "MIDE EDU" na Área de Trabalho
#    7. confere tudo (compila sketches de teste e lista as portas)
#
#  A K10 em MicroPython não precisa de nada instalado: ela grava
#  pela USB do próprio Chrome/Edge (Preparar K10 na IDE).
#
#  Depois do primeiro PC, a pasta C:\MIDE EDU fica completa:
#  copie-a para um pendrive e rode o INSTALAR.bat dela nos
#  outros PCs — ele não baixa nada de novo (funciona sem internet).
#
#  Opções:  INSTALAR.bat -Destino "D:\MIDE EDU"
#           INSTALAR.bat -SemK10     (pula o suporte C++ da K10)
# ============================================================

param(
    [string]$Destino = "C:\MIDE EDU",
    [switch]$SemK10
)

# 'Continue': no PowerShell 5.1, um aviso do arduino-cli no stderr viraria
# erro fatal com 'Stop'. As falhas importantes são conferidas uma a uma.
$ErrorActionPreference = 'Continue'
$ProgressPreference    = 'SilentlyContinue'   # sem isso o download fica 10x mais lento
try {
    [Net.ServicePointManager]::SecurityProtocol =
        [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
} catch { }

$Origem   = Split-Path -Parent $PSScriptRoot          # pasta onde está o INSTALAR.bat
$VERSAO_PY = '3.12.10'
$CLI_FIXA  = '1.3.1'                                  # reserva, se o "latest" falhar
$K10_INDEX = 'https://downloadcd.dfrobot.com.cn/UNIHIKER/package_unihiker_index.json'
$K10_CORE  = 'UNIHIKER:esp32@0.0.5'                   # o mesmo do servidor.py (k10_support.py)
$TOTAL     = 7
$Is64      = [Environment]::Is64BitOperatingSystem

function Titulo($n, $texto) {
    Write-Host ""
    Write-Host "[$n/$TOTAL] $texto" -ForegroundColor Cyan
}
function Ok($texto)    { Write-Host "      OK  $texto" -ForegroundColor Green }
function Aviso($texto) { Write-Host "      !!  $texto" -ForegroundColor Yellow }
function Falha($texto) { Write-Host "      XX  $texto" -ForegroundColor Red }

function Baixar($urls, $arquivo) {
    foreach ($u in $urls) {
        try {
            Write-Host "      baixando $u"
            Invoke-WebRequest -Uri $u -OutFile $arquivo -UseBasicParsing -ErrorAction Stop
            if ((Get-Item $arquivo).Length -gt 100000) { return $true }
        } catch {
            Aviso "não consegui baixar de $u ($($_.Exception.Message))"
        }
    }
    return $false
}

Write-Host ""
Write-Host "  ======================================================" -ForegroundColor White
Write-Host "   MIDE EDU — instalação do laboratório (Uno + K10)" -ForegroundColor White
Write-Host "  ======================================================" -ForegroundColor White

# ------------------------------------------------------------
# 1. Copiar a IDE
# ------------------------------------------------------------
Titulo 1 "Copiando a IDE para $Destino"

# Se a IDE já estiver aberta neste PC, desliga o servidor para
# poder trocar os arquivos.
try {
    Invoke-WebRequest -Uri 'http://127.0.0.1:8080/api/encerrar' -Method Post `
        -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop | Out-Null
    Start-Sleep -Seconds 2
} catch { }

try {
    if (-not (Test-Path $Destino)) { New-Item -ItemType Directory -Path $Destino -ErrorAction Stop | Out-Null }
} catch {
    $novo = Join-Path $env:LOCALAPPDATA 'MIDE EDU'
    Aviso "sem permissão para criar $Destino; usando $novo (só este usuário do Windows)"
    $Destino = $novo
    New-Item -ItemType Directory -Path $Destino -Force | Out-Null
}

# Todos os usuários do PC (grupo "Usuários", SID S-1-5-32-545) podem
# gravar na pasta: o arduino-cli e o log do servidor escrevem nela.
# Feito ANTES de copiar, para os arquivos novos herdarem a permissão.
& icacls "$Destino" /grant '*S-1-5-32-545:(OI)(CI)M' /Q | Out-Null
if ($LASTEXITCODE -ne 0) { Aviso "não consegui liberar a pasta para os outros usuários do Windows" }

$mesmaPasta = ((Resolve-Path $Origem).Path.TrimEnd('\') -ieq (Resolve-Path $Destino).Path.TrimEnd('\'))
if ($mesmaPasta) {
    Ok "a IDE já está em $Destino"
} else {
    & robocopy "$Origem" "$Destino" /E /R:1 /W:1 /NFL /NDL /NJH /NJS /NP `
        /XD output "Claude outputs" __pycache__ ferramentas node_modules `
        /XF servidor.log | Out-Null
    if ($LASTEXITCODE -ge 8) { Falha "erro ao copiar (robocopy $LASTEXITCODE)"; exit 1 }
    Ok "arquivos copiados"
}
# Arquivos vindos de um zip baixado da internet ficam "bloqueados" pelo
# Windows e o .vbs pediria confirmação a cada aluno.
Get-ChildItem -Path $Destino -Recurse -File -ErrorAction SilentlyContinue |
    Unblock-File -ErrorAction SilentlyContinue

# ------------------------------------------------------------
# 2. Python portátil
# ------------------------------------------------------------
Titulo 2 "Python portátil"
$pyDir = Join-Path $Destino 'python'
if (Test-Path (Join-Path $pyDir 'pythonw.exe')) {
    Ok "já está na pasta"
} else {
    $arq  = if ($Is64) { "python-$VERSAO_PY-embed-amd64.zip" } else { "python-$VERSAO_PY-embed-win32.zip" }
    $zip  = Join-Path $env:TEMP $arq
    if (-not (Baixar @("https://www.python.org/ftp/python/$VERSAO_PY/$arq") $zip)) {
        Falha "não consegui baixar o Python. Confira a internet e rode o INSTALAR.bat de novo."
        exit 1
    }
    Expand-Archive -Path $zip -DestinationPath $pyDir -Force -ErrorAction Stop
    Remove-Item $zip -ErrorAction SilentlyContinue
    Ok "Python $VERSAO_PY instalado em $pyDir"
}

# ------------------------------------------------------------
# 3. arduino-cli
# ------------------------------------------------------------
Titulo 3 "arduino-cli"
$cliDir = Join-Path $Destino 'arduino-cli'
$cli    = Join-Path $cliDir 'arduino-cli.exe'
if (Test-Path $cli) {
    Ok "já está na pasta"
} else {
    New-Item -ItemType Directory -Path $cliDir -Force | Out-Null
    $bits = if ($Is64) { '64bit' } else { '32bit' }
    $zip  = Join-Path $env:TEMP "arduino-cli_Windows_$bits.zip"
    $urls = @(
        "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_$bits.zip",
        "https://github.com/arduino/arduino-cli/releases/download/v$CLI_FIXA/arduino-cli_${CLI_FIXA}_Windows_$bits.zip"
    )
    if (-not (Baixar $urls $zip)) {
        Falha "não consegui baixar o arduino-cli. Confira a internet e rode o INSTALAR.bat de novo."
        exit 1
    }
    Expand-Archive -Path $zip -DestinationPath $cliDir -Force -ErrorAction Stop
    Remove-Item $zip -ErrorAction SilentlyContinue
    Ok ((& $cli version) -join ' ')
}

# O núcleo e as bibliotecas ficam dentro da pasta da IDE, e não no
# perfil de quem está instalando (o servidor.py usa o mesmo lugar).
$dados = Join-Path $cliDir 'dados'
New-Item -ItemType Directory -Path $dados -Force | Out-Null
$env:ARDUINO_DIRECTORIES_DATA      = $dados
$env:ARDUINO_DIRECTORIES_DOWNLOADS = Join-Path $dados 'staging'
$env:ARDUINO_DIRECTORIES_USER      = Join-Path $cliDir 'sketchbook'
$env:ARDUINO_UPDATER_ENABLE_NOTIFICATION = 'false'

# ------------------------------------------------------------
# 4. Núcleo do Uno + bibliotecas
# ------------------------------------------------------------
Titulo 4 "Núcleo do Arduino Uno e bibliotecas"
$cores = (& $cli core list --format json 2>$null) -join "`n"
if ($cores -match '"arduino:avr"') {
    Ok "núcleo arduino:avr já instalado"
} else {
    Write-Host "      atualizando a lista de placas..."
    & $cli core update-index | Out-Null
    Write-Host "      instalando arduino:avr (uns 150 MB, pode levar alguns minutos)..."
    & $cli core install arduino:avr
    if ($LASTEXITCODE -ne 0) { Falha "não consegui instalar o núcleo arduino:avr"; exit 1 }
    Ok "núcleo arduino:avr instalado"
}

$libs = (& $cli lib list --format json 2>$null) -join "`n"
foreach ($lib in @('Servo', 'LiquidCrystal I2C')) {
    if ($libs -match ('"name":\s*"' + [regex]::Escape($lib) + '"')) {
        Ok "biblioteca $lib já instalada"
        continue
    }
    & $cli lib update-index | Out-Null
    & $cli lib install "$lib"
    if ($LASTEXITCODE -ne 0) { Falha "não consegui instalar a biblioteca $lib" }
    else { Ok "biblioteca $lib instalada" }
}

# ------------------------------------------------------------
# 5. Suporte C++ da UNIHIKER K10 (opcional: -SemK10)
# ------------------------------------------------------------
Titulo 5 "Suporte C++ da UNIHIKER K10"
if ($SemK10) {
    Aviso "pulado (-SemK10). A K10 continua funcionando em MicroPython pelo navegador."
} else {
    $cores = (& $cli core list --format json 2>$null) -join "`n"
    if ($cores -match '"UNIHIKER:esp32"') {
        Ok "pacote UNIHIKER:esp32 já instalado"
    } else {
        Write-Host "      atualizando a lista de placas da DFRobot..."
        & $cli core update-index --additional-urls $K10_INDEX | Out-Null
        Write-Host "      instalando $K10_CORE (uns 1,5 GB: pode levar de 10 a 40 minutos)..."
        & $cli core install $K10_CORE --additional-urls $K10_INDEX
        if ($LASTEXITCODE -ne 0) {
            Aviso "não consegui instalar o suporte C++ da K10 (internet ou site da DFRobot fora do ar)."
            Aviso "a IDE funciona assim mesmo: Uno em C++ e K10 em MicroPython. Rode o INSTALAR.bat de novo depois."
        } else {
            Ok "suporte C++ da K10 instalado"
        }
    }
}

# Os pacotes baixados (staging) não servem mais: apagar deixa a pasta
# bem menor para copiar por pendrive.
Remove-Item (Join-Path $dados 'staging') -Recurse -Force -ErrorAction SilentlyContinue

# ------------------------------------------------------------
# 5. Atalho na Área de Trabalho
# ------------------------------------------------------------
Titulo 6 "Atalho na Área de Trabalho"
$sh = New-Object -ComObject WScript.Shell
function CriarAtalho($pasta) {
    $lnk = $sh.CreateShortcut((Join-Path $pasta 'MIDE EDU.lnk'))
    $lnk.TargetPath       = Join-Path $env:WINDIR 'System32\wscript.exe'
    $lnk.Arguments        = '"' + (Join-Path $Destino 'MIDE EDU.vbs') + '"'
    $lnk.WorkingDirectory = $Destino
    $lnk.IconLocation     = (Join-Path $Destino 'assets\academy\mide.ico') + ',0'
    $lnk.Description      = 'MIDE EDU — IDE gamificada (Arduino Uno e UNIHIKER K10)'
    $lnk.Save()
}
$publica = [Environment]::GetFolderPath('CommonDesktopDirectory')
try {
    CriarAtalho $publica
    Ok "atalho criado na Área de Trabalho de TODOS os usuários"
} catch {
    CriarAtalho ([Environment]::GetFolderPath('Desktop'))
    Ok "atalho criado na Área de Trabalho deste usuário"
    Aviso "para aparecer para todos os alunos, rode o INSTALAR.bat como administrador"
    Aviso "(ou copie o atalho para a Área de Trabalho de cada usuário)"
}

# ------------------------------------------------------------
# 6. Conferência
# ------------------------------------------------------------
Titulo 7 "Conferindo a instalação"
& (Join-Path $Destino 'instalador\verificar.ps1') -Pasta $Destino
exit $LASTEXITCODE
