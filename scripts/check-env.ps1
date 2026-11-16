# STORYTUNE - Umgebungscheck fuer Windows
# Ausfuehren im Projektordner:
#   powershell -ExecutionPolicy Bypass -File scripts\check-env.ps1
# Das Skript liest nur Informationen aus. Es installiert und aendert nichts.

$ErrorActionPreference = 'SilentlyContinue'

function Line($label, $value) { Write-Host ("{0,-22} {1}" -f $label, $value) }
function Version($cmd, $arg = '--version') {
  $c = Get-Command $cmd -ErrorAction SilentlyContinue
  if ($c) { return (& $cmd $arg 2>&1 | Select-Object -First 1) } else { return 'NICHT INSTALLIERT' }
}

Write-Host ''
Write-Host '=== STORYTUNE Umgebungscheck ===' -ForegroundColor Magenta
Write-Host ''

Write-Host '--- System ---' -ForegroundColor Cyan
$os = Get-CimInstance Win32_OperatingSystem
$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
$ramGB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 1)
$disk = Get-PSDrive C
Line 'Betriebssystem' $os.Caption
Line 'CPU' ("{0} ({1} Kerne)" -f $cpu.Name.Trim(), $cpu.NumberOfCores)
Line 'Arbeitsspeicher' "$ramGB GB"
Line 'Freier Speicher C:' ("{0} GB" -f [math]::Round($disk.Free / 1GB, 1))

Write-Host ''
Write-Host '--- Grafikkarte ---' -ForegroundColor Cyan
$vramGB = 0
$nvsmi = Get-Command nvidia-smi -ErrorAction SilentlyContinue
if ($nvsmi) {
  $rows = & nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits
  foreach ($r in $rows) {
    $p = $r.Split(',')
    $gb = [math]::Round([double]$p[1].Trim() / 1024, 1)
    if ($gb -gt $vramGB) { $vramGB = $gb }
    Line 'NVIDIA GPU' ("{0} ({1} GB VRAM)" -f $p[0].Trim(), $gb)
  }
} else {
  Get-CimInstance Win32_VideoController | ForEach-Object { Line 'GPU' $_.Name }
  Write-Host '  (Kein nvidia-smi gefunden - VRAM unbekannt. Ohne NVIDIA-GPU rechnet Ollama auf der CPU.)'
}

Write-Host ''
Write-Host '--- Entwicklungswerkzeuge ---' -ForegroundColor Cyan
Line 'Node.js' (Version node '-v')
Line 'npm' (Version npm '-v')
Line 'Git' (Version git)

Write-Host ''
Write-Host '--- Ollama ---' -ForegroundColor Cyan
$ollamaVer = Version ollama
Line 'Ollama' $ollamaVer
if ($ollamaVer -ne 'NICHT INSTALLIERT') {
  Write-Host 'Installierte Modelle:'
  & ollama list
  $listen = netstat -ano | Select-String ':11434' | Select-String 'LISTENING'
  if ($listen -match '0\.0\.0\.0:11434' -or $listen -match '\[::\]:11434') {
    Line 'Netzwerk' 'Ollama ist im WLAN erreichbar (0.0.0.0)'
  } elseif ($listen) {
    Line 'Netzwerk' 'Ollama lauscht NUR lokal (127.0.0.1) -> OLLAMA_HOST=0.0.0.0 setzen'
  } else {
    Line 'Netzwerk' 'Ollama laeuft gerade nicht'
  }
}

Write-Host ''
Write-Host '--- Netzwerk (diese Adresse kommt spaeter in die App) ---' -ForegroundColor Cyan
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } |
  ForEach-Object { Line $_.InterfaceAlias $_.IPAddress }

Write-Host ''
Write-Host '--- Empfehlung Bildmodell ---' -ForegroundColor Cyan
if ($vramGB -ge 10) { $model = 'qwen3-vl:8b'; $why = 'genug VRAM fuer das groessere Modell' }
elseif ($vramGB -ge 5) { $model = 'qwen3-vl:4b'; $why = 'passt komplett in den Grafikspeicher' }
elseif ($ramGB -ge 14) { $model = 'qwen3-vl:4b'; $why = 'laeuft auf der CPU (langsamer, ca. 20-90 s pro Bild)' }
else { $model = 'qwen3-vl:2b'; $why = 'wenig Speicher - kleinstes brauchbares Modell' }
Line 'Empfohlen' "$model ($why)"
Write-Host ''
Write-Host 'Bitte die komplette Ausgabe kopieren und in die naechste Session einfuegen.' -ForegroundColor Yellow
Write-Host ''
