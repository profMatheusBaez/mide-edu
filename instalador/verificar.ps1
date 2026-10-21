# ============================================================
#  MIDE EDU — conferência do PC (Arduino Uno)
# ------------------------------------------------------------
#  Rode pelo VERIFICAR.bat. Sobe o servidor da IDE escondido numa
#  porta de teste, pede para ele COMPILAR de verdade dois sketches
#  (a escada de PWM e um com Servo + LCD I2C), lista as placas
#  conectadas e confere o driver CH340 dos clones. Não grava nada
#  na placa.
# ============================================================

param(
    [string]$Pasta = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Continue'
$ProgressPreference    = 'SilentlyContinue'
$PORTA   = 8099
$URL     = "http://127.0.0.1:$PORTA"
$problemas = @()

function Ok($texto)    { Write-Host "      OK  $texto" -ForegroundColor Green }
function Aviso($texto) { Write-Host "      !!  $texto" -ForegroundColor Yellow }
function Falha($texto) { Write-Host "      XX  $texto" -ForegroundColor Red; $script:problemas += $texto }

function Api($rota, $corpo) {
    $req = @{ Uri = "$URL$rota"; UseBasicParsing = $true; TimeoutSec = 300; ErrorAction = 'Stop' }
    if ($corpo) {
        $req.Method      = 'Post'
        $req.ContentType = 'application/json; charset=utf-8'
        $req.Body        = [Text.Encoding]::UTF8.GetBytes(($corpo | ConvertTo-Json -Compress))
    }
    $r = Invoke-WebRequest @req
    $texto = [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray())
    return $texto | ConvertFrom-Json
}

# ---- Python -------------------------------------------------
$py = Join-Path $Pasta 'python\python.exe'
if (-not (Test-Path $py)) {
    $cmd = Get-Command python -ErrorAction SilentlyContinue
    if ($cmd) { $py = $cmd.Source; Aviso "usando o Python do sistema ($py)" }
    else { Falha "Python não encontrado (rode o INSTALAR.bat)"; $py = $null }
}
if ($py) { Ok ("Python " + ((& $py --version 2>&1) -join ' ')) }

# ---- arduino-cli --------------------------------------------
$cli = Join-Path $Pasta 'arduino-cli\arduino-cli.exe'
if (Test-Path $cli) { Ok ("arduino-cli " + ((& $cli version) -join ' ')) }
else { Falha "arduino-cli não encontrado em $cli (rode o INSTALAR.bat)" }

# ---- Servidor + compilação de verdade ----------------------
$proc = $null
if ($py -and (Test-Path $cli)) {
    $proc = Start-Process -FilePath $py -WindowStyle Hidden -PassThru `
        -WorkingDirectory $Pasta `
        -ArgumentList @('"' + (Join-Path $Pasta 'servidor.py') + '"', '--porta', $PORTA, '--sem-navegador')
    $status = $null
    for ($i = 0; $i -lt 30 -and -not $status; $i++) {
        Start-Sleep -Milliseconds 500
        try { $status = Api '/api/status' } catch { }
    }
    if (-not $status) {
        Falha "o servidor da IDE não respondeu (veja servidor.log na pasta da IDE)"
    } else {
        Ok "servidor da IDE responde (versão $($status.versao_ide))"
        if (-not $status.arduino_cli) { Falha "o servidor não achou o arduino-cli" }

        $escada = @"
void setup() {
  pinMode(11, OUTPUT);
}

void loop() {
  analogWrite(11, 0);
  delay(500);
  analogWrite(11, 50);
  delay(500);
  analogWrite(11, 100);
  delay(500);
  analogWrite(11, 150);
  delay(500);
  analogWrite(11, 200);
  delay(500);
  analogWrite(11, 250);
  delay(500);
}
"@
        $bibliotecas = @"
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Servo.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
Servo servo;

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.print("MIDE EDU");
  servo.attach(9);
  servo.write(90);
}

void loop() {
}
"@
        foreach ($t in @(
            @{ nome = 'escada_pwm';  rotulo = 'fase "Escada de brilho com PWM"'; codigo = $escada },
            @{ nome = 'bibliotecas'; rotulo = 'bibliotecas Servo + LiquidCrystal I2C'; codigo = $bibliotecas })) {
            Write-Host "      compilando $($t.rotulo)..."
            try {
                $r = Api '/api/compilar' @{ codigo = $t.codigo; nome = $t.nome; fqbn = 'arduino:avr:uno' }
                if ($r.ok) { Ok "compila: $($t.rotulo)" }
                else {
                    Falha "não compila: $($t.rotulo)"
                    ($r.log -split "`n" | Select-Object -Last 8) | ForEach-Object { Write-Host "          $_" }
                }
            } catch { Falha "erro ao compilar $($t.rotulo): $($_.Exception.Message)" }
        }

        # ---- Placas conectadas ----
        try {
            $p = Api '/api/portas'
            $portas = @($p.portas)
            if ($portas.Count -eq 0) {
                Aviso "nenhuma placa conectada agora (normal se o Arduino não estiver no USB)"
            } else {
                foreach ($x in $portas) { Ok "placa em $($x.porta): $($x.placa)" }
            }
        } catch { Aviso "não consegui listar as portas" }

        try { Api '/api/encerrar' @{ } | Out-Null } catch { }
    }
    Start-Sleep -Milliseconds 800
    if ($proc -and -not $proc.HasExited) { try { $proc.Kill() } catch { } }
}

# ---- Driver CH340 (clones) -----------------------------------
try {
    $ch = @(Get-PnpDevice -ErrorAction Stop | Where-Object { $_.InstanceId -match 'VID_1A86' })
    $semDriver = @($ch | Where-Object { $_.Status -ne 'OK' -and $_.Present })
    if ($semDriver.Count -gt 0) {
        Falha "há um Arduino clone (CH340) conectado SEM driver — instale o driver CH340 (precisa de administrador)"
    } elseif (@($ch | Where-Object { $_.Present }).Count -gt 0) {
        Ok "driver CH340 funcionando"
    }
} catch { }

# ---- Resultado -----------------------------------------------
Write-Host ""
if ($problemas.Count -eq 0) {
    Write-Host "  ======================================================" -ForegroundColor Green
    Write-Host "   PRONTO! Este PC está preparado para a MIDE EDU."      -ForegroundColor Green
    Write-Host "   Abra pelo atalho 'MIDE EDU' na Área de Trabalho."     -ForegroundColor Green
    Write-Host "  ======================================================" -ForegroundColor Green
    exit 0
} else {
    Write-Host "  ======================================================" -ForegroundColor Red
    Write-Host "   Faltou resolver $($problemas.Count) item(ns):"         -ForegroundColor Red
    $problemas | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    Write-Host "  ======================================================" -ForegroundColor Red
    exit 1
}
