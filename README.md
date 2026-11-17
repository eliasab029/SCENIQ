# SCENIQ

Persönlicher KI-Musikberater für Instagram Stories. Foto hochladen → Wirkung wählen → passende Songs, abgestimmt auf Bild **und** persönlichen Musikgeschmack.

SCENIQ ist eine **Web-App für den Handy-Browser**: Link öffnen, fertig. Es muss nichts installiert werden, weder auf dem PC noch auf dem Handy.

> Projektstand, Architektur und nächste Schritte: **[PROJECT_STATUS.md](./PROJECT_STATUS.md)**

---

## App öffnen

1. **https://eliasab029.github.io/SCENIQ/** im Handy-Browser öffnen (Safari auf dem iPhone, Chrome auf Android).
2. **Empfohlen:** zum Home-Bildschirm hinzufügen. Dann startet die App im Vollbild wie eine normale App, und der Browser löscht ihre Daten nicht so leicht.
   - **iPhone (Safari):** unten auf „Teilen“ tippen → „Zum Home-Bildschirm“
   - **Android (Chrome):** oben rechts ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“

## Wie die App online kommt

Die App liegt kostenlos auf **GitHub Pages**. Bei jeder Änderung am Code baut GitHub sie automatisch neu und veröffentlicht sie (`.github/workflows/deploy-web.yml`).

Repository: <https://github.com/eliasab029/SCENIQ> (öffentlich).
Einmalige Einstellung im Repository: **Settings → Pages → Source: „GitHub Actions“**.

Den Fortschritt eines Builds sieht man im Reiter **Actions** des Repositorys.

---

## Für Entwickler

| Befehl | Zweck |
| --- | --- |
| `npm run web` | Entwicklungsserver im Browser |
| `npm run check` | TypeScript-Prüfung + Lint |
| `npm run build:web` | Web-Build nach `dist/` (`EXPO_BASE_URL=/repo` für eine Unterseite) |
| `npm run preview:web` | fertigen Build lokal ansehen |
| `npm start` | Entwicklung mit Expo Go (für eine spätere native App) |

Voraussetzung nur für Entwickler: Node.js ≥ 22.13.
