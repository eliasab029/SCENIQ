# STORYTUNE

Persönlicher KI-Musikberater für Instagram Stories. Foto hochladen → Wirkung wählen → passende Songs, abgestimmt auf Bild **und** persönlichen Musikgeschmack.

STORYTUNE ist eine **Web-App für den Handy-Browser**: Link öffnen, fertig. Es muss nichts installiert werden, weder auf dem PC noch auf dem Handy.

> Projektstand, Architektur und nächste Schritte: **[PROJECT_STATUS.md](./PROJECT_STATUS.md)**

---

## App öffnen

1. Den Link der App im Handy-Browser öffnen (Safari auf dem iPhone, Chrome auf Android).
   Der Link hat die Form `https://<github-name>.github.io/<repository>/`.
2. **Empfohlen:** zum Home-Bildschirm hinzufügen. Dann startet die App im Vollbild wie eine normale App, und der Browser löscht ihre Daten nicht so leicht.
   - **iPhone (Safari):** unten auf „Teilen“ tippen → „Zum Home-Bildschirm“
   - **Android (Chrome):** oben rechts ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“

## Wie die App online kommt

Die App liegt kostenlos auf **GitHub Pages**. Bei jeder Änderung am Code baut GitHub sie automatisch neu und veröffentlicht sie (`.github/workflows/deploy-web.yml`).

Einmalige Einrichtung, komplett im Browser:

1. Kostenloses Konto auf <https://github.com> anlegen.
2. Auf claude.ai das GitHub-Konto mit Claude verbinden.
3. Ein leeres Repository anlegen, z. B. `storytune`.
4. Im Repository: **Settings → Pages → Source: „GitHub Actions“**.

Danach kann Claude den Code direkt dorthin übertragen, und die App ist unter `https://<github-name>.github.io/storytune/` erreichbar.

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
