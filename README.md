# STORYTUNE

Persönlicher KI-Musikberater für Instagram Stories. Foto hochladen → Wirkung wählen → passende Songs, abgestimmt auf Bild **und** persönlichen Musikgeschmack.

> Projektstand, Architektur und nächste Schritte: **[PROJECT_STATUS.md](./PROJECT_STATUS.md)**

---

## App auf dem Smartphone starten (Expo Go)

### Einmalig auf dem PC

1. **Node.js** installieren – Version **22.13 oder neuer** (LTS) von <https://nodejs.org>.
2. **Git** installieren (empfohlen) – <https://git-scm.com>.
3. Projektordner entpacken, z. B. nach `C:\Projekte\storytune`.
4. Im Projektordner ein Terminal öffnen (Windows: im Ordner `Shift + Rechtsklick` → „In Terminal öffnen“) und ausführen:

```bash
npm install
```

### Einmalig auf dem Smartphone

- **Expo Go** aus dem App Store bzw. Google Play Store installieren (bzw. aktualisieren – das Projekt nutzt **Expo SDK 58**).

### Jedes Mal zum Starten

```bash
npx expo start
```

- Im Terminal erscheint ein QR-Code.
- **Android:** In Expo Go auf „Scan QR code“ tippen.
- **iPhone:** QR-Code mit der normalen Kamera-App scannen.
- PC und Handy müssen im **selben WLAN** sein.

**Verbindet sich nicht?**

- Windows fragt beim ersten Start nach der Firewall → für **private Netzwerke** erlauben.
- Gäste-/Uni-/Firmen-WLANs blockieren oft Geräte untereinander. Dann:

```bash
npx expo start --tunnel
```

- Meldet Expo Go „incompatible SDK“: Expo Go im Store aktualisieren.

---

## Lokale Bild-KI (Ollama) – Vorbereitung für Phase 4

1. Ollama installieren: <https://ollama.com/download>
2. Bildmodell laden (Empfehlung siehe `scripts/check-env.ps1`):

```bash
ollama pull qwen3-vl:4b
```

3. Ollama im WLAN erreichbar machen (Windows):
   - Systemsteuerung → „Umgebungsvariablen für dieses Konto bearbeiten“ → Neu: `OLLAMA_HOST` = `0.0.0.0`
   - Ollama beenden (Tray-Icon) und neu starten.
   - Firewall-Freigabe (PowerShell **als Administrator**):

```powershell
New-NetFirewallRule -DisplayName "Ollama (STORYTUNE)" -Direction Inbound -Protocol TCP -LocalPort 11434 -Action Allow -Profile Private
```

4. In der App: **Einstellungen → Server-Adresse** = IP deines PCs (z. B. `192.168.178.20`) → **Verbindung testen**.

---

## Umgebung prüfen

Windows (PowerShell, im Projektordner):

```powershell
powershell -ExecutionPolicy Bypass -File scripts\check-env.ps1
```

macOS / Linux:

```bash
bash scripts/check-env.sh
```

Das Skript zeigt Node/Git/Ollama-Versionen, RAM, Grafikkarte, die IP-Adresse für die App und empfiehlt ein Bildmodell. Es verändert nichts.

---

## Entwicklerbefehle

| Befehl | Zweck |
| --- | --- |
| `npm start` | Entwicklungsserver (QR-Code für Expo Go) |
| `npm run start:tunnel` | wie oben, über Tunnel (wenn WLAN Geräte isoliert) |
| `npm run check` | TypeScript-Prüfung + Lint |
| `npx expo export` | Test-Build aller Plattformen (prüft, ob alles bündelt) |
