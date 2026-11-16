#!/usr/bin/env bash
# STORYTUNE – Umgebungscheck für macOS / Linux
# Ausführen im Projektordner:  bash scripts/check-env.sh
# Liest nur Informationen aus. Installiert und ändert nichts.

line() { printf "%-22s %s\n" "$1" "$2"; }
ver() { command -v "$1" >/dev/null 2>&1 && "$1" ${2:---version} 2>&1 | head -1 || echo "NICHT INSTALLIERT"; }

echo
echo "=== STORYTUNE Umgebungscheck ==="
echo
echo "--- System ---"
OS="$(uname -s)"
if [ "$OS" = "Darwin" ]; then
  line "Betriebssystem" "macOS $(sw_vers -productVersion)"
  line "CPU" "$(sysctl -n machdep.cpu.brand_string)"
  RAM_GB=$(( $(sysctl -n hw.memsize) / 1073741824 ))
else
  line "Betriebssystem" "$(. /etc/os-release 2>/dev/null; echo "${PRETTY_NAME:-Linux}")"
  line "CPU" "$(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2 | xargs)"
  RAM_GB=$(( $(grep MemTotal /proc/meminfo | awk '{print $2}') / 1048576 ))
fi
line "Arbeitsspeicher" "${RAM_GB} GB"
line "Freier Speicher" "$(df -h "$HOME" | awk 'NR==2{print $4}')"

echo
echo "--- Grafikkarte ---"
VRAM_GB=0
if command -v nvidia-smi >/dev/null 2>&1; then
  while IFS=, read -r name mem; do
    gb=$(( ${mem// /} / 1024 )); [ "$gb" -gt "$VRAM_GB" ] && VRAM_GB=$gb
    line "NVIDIA GPU" "$name (${gb} GB VRAM)"
  done < <(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits)
elif [ "$OS" = "Darwin" ] && [ "$(uname -m)" = "arm64" ]; then
  line "GPU" "Apple Silicon (gemeinsamer Speicher: ${RAM_GB} GB)"
  VRAM_GB=$(( RAM_GB * 2 / 3 ))
else
  line "GPU" "keine NVIDIA-GPU erkannt – Ollama rechnet auf der CPU"
fi

echo
echo "--- Entwicklungswerkzeuge ---"
line "Node.js" "$(ver node -v)"
line "npm" "$(ver npm -v)"
line "Git" "$(ver git)"

echo
echo "--- Ollama ---"
line "Ollama" "$(ver ollama)"
if command -v ollama >/dev/null 2>&1; then
  echo "Installierte Modelle:"; ollama list 2>&1
fi

echo
echo "--- Netzwerk (diese Adresse kommt später in die App) ---"
if [ "$OS" = "Darwin" ]; then
  for i in en0 en1; do ip=$(ipconfig getifaddr $i 2>/dev/null) && line "$i" "$ip"; done
else
  hostname -I 2>/dev/null | tr ' ' '\n' | grep -v '^$' | while read -r ip; do line "IP" "$ip"; done
fi

echo
echo "--- Empfehlung Bildmodell ---"
if   [ "$VRAM_GB" -ge 10 ]; then line "Empfohlen" "qwen3-vl:8b"
elif [ "$VRAM_GB" -ge 5 ];  then line "Empfohlen" "qwen3-vl:4b"
elif [ "$RAM_GB" -ge 14 ];  then line "Empfohlen" "qwen3-vl:4b (CPU, langsamer)"
else                             line "Empfohlen" "qwen3-vl:2b"
fi
echo
echo "Bitte die komplette Ausgabe kopieren und in die nächste Session einfügen."
echo
