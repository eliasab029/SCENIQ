# STORYTUNE – Projektstatus

> **Für die nächste Session zuerst lesen.** Dieses Dokument ist die Übergabe zwischen Sessions.
> Letzte Aktualisierung: **17.11.2026 – Ende Phase 1 (Umstellung auf Web-App)**

---

## 0. Kurzfassung

| | |
| --- | --- |
| **Aktuelle Phase** | Phase 1 abgeschlossen ✅ – wartet auf Freigabe für Phase 2 |
| **Blockiert durch** | GitHub-Konto des Nutzers (für Online-Link + Speicherung des Codes), siehe Abschnitt 10 |
| **Plattform** | **Web-App (PWA) im Handy-Browser** – der Nutzer kann nichts installieren (Vorgabe vom 17.11.) |
| **Stack** | Expo SDK 58 (Web-Export) · React Native Web · React 19 · TypeScript 6 · Expo Router 58 |
| **Hosting** | GitHub Pages (kostenlos), automatischer Build per GitHub Actions |
| **Bild-KI** | läuft im Browser auf dem Handy (Phase 4), kein Server, kein Konto |
| **Laufende Kosten** | 0 € |

---

## 1. Projektziel

STORYTUNE ist ein persönlicher KI-Musikberater für Instagram Stories:

1. Nutzer lädt ein Foto hoch (Galerie oder Kamera).
2. Optional: gewünschte Wirkung wählen (11 Kategorien + „Überrasche mich“).
3. Eine Bild-KI analysiert Inhalt, Farben, Licht, Ästhetik, Stimmung, Emotion.
4. Ein eigenes Empfehlungssystem kombiniert Bildanalyse + Wirkung + **persönliches Musikprofil** → 5–10 Songs mit individueller Begründung.
5. Feedback (Gefällt mir / nicht / Mehr davon / Nicht mein Stil) verbessert das Profil.

**Kernversprechen:** Gleiches Foto, unterschiedliche Personen → unterschiedliche Empfehlungen.

---

## 2. Technische Architektur

```
┌──────────────────────── Handy-Browser (Safari / Chrome) ─────────────────────┐
│  STORYTUNE als Web-App, optional auf dem Home-Bildschirm                     │
│                                                                              │
│  Screens (src/app, Expo Router)                                              │
│     │                                                                        │
│     ▼                                                                        │
│  Features (src/features)                                                     │
│   ├─ analysis   ImageAnalyzer-Schnittstelle ──┬─ OnDeviceAnalyzer (Phase 4)  │
│   │                                           │    KI-Modell im Browser      │
│   │                                           ├─ DemoAnalyzer (Fallback)     │
│   │                                           └─ (optional später: Cloud)    │
│   ├─ effects    Wirkungs-Kategorien                                          │
│   ├─ music      Song-Katalog (im Code) + Empfehlungsalgorithmus              │
│   └─ profile    Musikprofil + Feedback-Lernen                                │
│     │                                                                        │
│     ▼                                                                        │
│  Data (src/data)                                                             │
│   ├─ store      Dokumentenspeicher: IndexedDB (Web) / SQLite (spätere App)   │
│   └─ settings   kleine Einstellungen (AsyncStorage → localStorage im Web)    │
│                                                                              │
│  Spotify: nur Such-Links (open.spotify.com/search/…) – keine API             │
└──────────────────────────────────────────────────────────────────────────────┘
        ▲ einmaliger Abruf der App-Dateien
        │
  GitHub Pages  ◄── GitHub Actions baut bei jedem Push auf main (deploy-web.yml)
```

**Prinzipien**

- Bildschirme kennen nur Schnittstellen, nie konkrete KI-Anbieter oder Speicher-Technik → beides austauschbar.
- Die Empfehlung liest nur das strukturierte `ImageAnalysis`-Objekt, nie Rohtext einer KI.
- Jede Analyse speichert ihre Quelle (`on-device` | `cloud` | `demo`) → Demo-Ergebnisse werden immer als „Demo“ gekennzeichnet, nie als KI.
- Der Code bleibt Expo/React Native: Eine echte App für App Store / Play Store ist später ohne Neuschreiben möglich.

---

## 3. Projektstruktur

```
storytune/
├─ PROJECT_STATUS.md            ← dieses Dokument
├─ README.md                    ← App öffnen, GitHub-Einrichtung, Befehle
├─ AGENTS.md                    ← Hinweise für KI-Assistenten (verweist hierher)
├─ app.json / app.config.js     ← Expo-Konfiguration; app.config.js setzt baseUrl aus EXPO_BASE_URL
├─ .github/workflows/deploy-web.yml ← Build + Veröffentlichung auf GitHub Pages
├─ public/                      ← wird unverändert ausgeliefert: Manifest, App-Icons
├─ scripts/build-web.mjs        ← Web-Build + PWA-/iOS-Meta-Tags + 404.html + .nojekyll
└─ src/
   ├─ app/                      ← NUR Routen (jede Datei = ein Bildschirm)
   │  ├─ _layout.tsx            ← Root: Fonts, Splash, Provider, Stack
   │  ├─ (tabs)/_layout.tsx     ← Tab-Navigation mit eigener Tab-Leiste
   │  ├─ (tabs)/index.tsx       ← Start
   │  ├─ (tabs)/history.tsx     ← Verlauf
   │  ├─ (tabs)/favorites.tsx   ← Favoriten
   │  ├─ (tabs)/profile.tsx     ← Profil
   │  ├─ upload.tsx             ← Foto wählen / aufnehmen / Vorschau
   │  ├─ effect.tsx             ← Gewünschte Wirkung
   │  ├─ settings.tsx           ← Einstellungen, Home-Bildschirm-Hinweis, Speicherstatus
   │  └─ taste-profile.tsx      ← Musikprofil (Vorschau, Editor folgt Phase 3)
   ├─ components/
   │  ├─ ui/                    ← Designsystem-Bausteine (siehe 4.)
   │  ├─ brand/Logo.tsx         ← Logo-Zeichen + Schriftzug
   │  └─ navigation/TabBar.tsx  ← schwebende Tab-Leiste mit zentralem „+“
   ├─ features/
   │  ├─ analysis/              ← types.ts (ImageAnalysis), analyzer.ts (Schnittstelle), draft.ts
   │  ├─ effects/effects.ts     ← 11 Wirkungen + „Überrasche mich“ (stabile IDs)
   │  ├─ music/types.ts         ← Song, Recommendation, Spotify-Link
   │  └─ profile/types.ts       ← MusicProfile, FeedbackKind
   ├─ data/
   │  ├─ store/types.ts         ← DocumentStore-Schnittstelle
   │  ├─ store/index.web.ts     ← IndexedDB (Browser)
   │  ├─ store/index.ts         ← SQLite (nur für eine spätere native App)
   │  └─ settings.tsx           ← Einstellungen (React Context)
   ├─ lib/haptics.ts, lib/pwa.ts ← absturzsichere Haptik; Home-Bildschirm-/OS-Erkennung
   └─ theme/tokens.ts           ← alle Farben, Abstände, Schriften, Radien, Schatten, Animationen
```

---

## 4. Designsystem

Alle Werte in `src/theme/tokens.ts`. Komponenten verwenden **niemals** feste Farb-/Größenwerte.

| Bereich | Festlegung |
| --- | --- |
| Hintergrund | `#0A0A0C` (tiefes Schwarz) → Flächen `#131316` / `#1B1B20` (Anthrazit) |
| Akzent | `#9D8CFF` gedämpftes Lavendel-Violett, sparsam eingesetzt |
| Schrift | **Instrument Serif** (Überschriften, editorial) + **Inter** (UI, Fließtext) – im App-Paket enthalten |
| Typo-Skala | hero 44 · display 34 · title 22 · heading 17 · body 15 · callout 13 · caption 12 · overline 11 |
| Abstände | 4-pt-Raster (4, 8, 12, 16, 20, 24, 32, 48), Seitenrand 20 |
| Radien | 10 · 14 · 20 · 28 · Pill |
| Tiefe | weiche Schatten (`card`), Akzent-Leuchten (`glow`) für die Hauptaktion |
| Bewegung | 150/250/420 ms, Feder-Animation beim Antippen (0,97), gestaffeltes Einblenden (60 ms) |
| App-Icon | Equalizer-Zeichen (5 Balken, einer violett) auf dunklem Verlauf – `public/icon-*.png` |

**Komponenten** (`src/components/ui`): `AppText`, `Button`, `IconButton`, `PressableScale`, `Card`, `Chip`, `TextField`, `ListRow` (mit `plannedPhase`), `StatusPill`, `EmptyState`, `SectionHeader`, `Screen`, `ScreenHeader`.

**Regel:** Noch nicht gebaute Funktionen tragen eine violette „Phase X“-Plakette und sind nicht antippbar.

---

## 5. Datenmodell

**Dokumentenspeicher** (`src/data/store`): Sammlungen `analyses`, `favorites`, `feedback`, `profile`; jedes Dokument ist ein JSON-Objekt mit einer ID.

- Web: IndexedDB-Datenbank `storytune` (Version 1, ein Object Store pro Sammlung). Beim Start wird der Browser gebeten, die Daten dauerhaft zu behalten (`navigator.storage.persist`).
- Native (später): SQLite-Tabelle `documents(collection, id, value_json, updated_at)`.
- Die Repositories (Analysen speichern, Feedback auswerten …) entstehen in Phase 3 auf dieser Schnittstelle.

**Einstellungen**: `storytune.settings.v2` → `{ forceDemoMode }` (Schalter folgt in Phase 4).

**Song-Katalog**: TypeScript-Datei im Code – überprüfbar, versionierbar. Unsichere Angaben stehen in `unverifiedFields`.

**Bildanalyse-Schema** (`src/features/analysis/types.ts`): `content` · `visual` · `mood` (energy 0–1, valence 0–1) · `music` (Genres, Tempo, Kontrast-Ideen) · `tags` (normiertes Vokabular für das Matching).

---

## 6. Wichtige technische Entscheidungen

| # | Entscheidung | Begründung |
| --- | --- | --- |
| E1 | Expo SDK 58 | Aktuelle stabile Version (seit 29.09.2026). |
| E2 | **Web-App (PWA) statt Expo Go** – *geändert 17.11.* | Der Nutzer kann auf seinem PC nichts installieren. Die Web-App braucht weder auf dem PC noch auf dem Handy eine Installation. Gleicher Code; eine native App bleibt später möglich. |
| E3 | **GitHub Pages** als Hosting | Kostenlos, eigene HTTPS-Adresse, automatischer Build. claude.ai-Artifacts wurden geprüft und verworfen: Sie blockieren Downloads von anderen Servern (KI-Modell), Kamera und Unterseiten-Navigation und gelten für Daten als unzuverlässig. |
| E4 | **Bild-KI im Browser auf dem Handy** – *ersetzt Ollama* | Ollama setzt eine Installation auf dem PC voraus. Außerdem darf eine `https`-Seite ohnehin nicht auf ein `http`-Gerät im Heimnetz zugreifen (Mixed Content). Kandidaten für Phase 4: CLIP (Zero-Shot-Einordnung nach Stimmung, Ort, Licht, Ästhetik über Transformers.js/ONNX) und ein kleines Bild-Sprach-Modell (z. B. SmolVLM) für freie Beschreibungen, falls das auf Handys schnell genug läuft. **Wird in Phase 4 gemessen und entschieden.** |
| E5 | **IndexedDB** statt SQLite im Browser – *geändert 17.11.* | SQLite läuft im Browser nur mit speziellen Server-Headern (SharedArrayBuffer), die GitHub Pages nicht setzen kann. IndexedDB ist in allen Browsern eingebaut. |
| E6 | Song-Katalog im Code | Überprüfbar, keine erfundenen Daten. |
| E7 | Eigene Tab-Leiste (`expo-router/js-tabs`) | Volle gestalterische Kontrolle; zentrales „+“. |
| E8 | Eigene Kopfzeilen (`ScreenHeader`) | Einheitliches Design. |
| E9 | Foto-Entwurf im Speicher (`draft.ts`), nicht in der URL | Bild-Adressen sind im Browser sehr lang (blob/data). |
| E10 | Spotify nur über Such-Links | Kein Konto, kein Premium, keine API. |
| E11 | Reanimated-Werte über `.get()`/`.set()` | Pflicht für den aktivierten React Compiler. |
| E12 | `baseUrl` aus `EXPO_BASE_URL` + `404.html`-Kopie | Die App läuft unter `/<repository>/`; Direktlinks wie `/settings` funktionieren trotz statischem Hosting. |

---

## 7. Empfehlungsalgorithmus – Entwurf (umgesetzt in Phase 5)

| Faktor | Gewicht | Quelle |
| --- | --- | --- |
| Bildstimmung (Atmosphäre/Mood-Tags, Energie, Valenz) | 0,30 | ImageAnalysis |
| Gewünschte Wirkung | 0,20 | Nutzerauswahl (bei „Überrasche mich“/keine Auswahl: auf Bild + Profil verteilt) |
| Persönlicher Geschmack (Genres, Künstler, Stimmungen, gelernte Affinitäten) | 0,25 | MusicProfile |
| Musikalische Eigenschaften (Energie, Tempo, Jahrzehnt) | 0,10 | Song vs. Analyse/Profil |
| Bekanntheit vs. Entdeckerlust | 0,10 | Profil |
| Neuheit (nicht kürzlich gezeigt) | 0,05 | Verlauf |

- **Harte Filter:** abgelehnte Songs, „Nicht mein Stil“-Genres.
- **Abwechslung:** max. 1 Song pro Künstler, Abzug für kürzlich gezeigte Songs, leichte Zufallsstreuung.
- **5 Ansätze:** Perfekter Match · Ästhetischer Match · Emotionaler Match · Unerwarteter Match (bewusster **Kontrast**, innerhalb des Geschmacks) · Geheimtipp (Nische mit hohem Geschmacks-Score).

---

## 8. Stand der Funktionen

### Fertig (Phase 1)

- [x] Expo + TypeScript + Expo Router, Web-Export als PWA (Manifest, App-Icons, iOS-Meta-Tags, Vollbild auf dem Home-Bildschirm)
- [x] Designsystem (Tokens + 13 UI-Komponenten + Logo + Tab-Leiste), Dark Mode, eigene Schriften
- [x] Navigation: 4 Tabs + zentrale „+“-Aktion, Stack-Bildschirme; Direktlinks funktionieren
- [x] **Start:** Logo, Begrüßung, großer Foto-Bereich, Schnellzugriffe, leerer Zustand „Letzte Analysen“
- [x] **Foto-Upload:** Galerie, Kamera (im Handy-Browser öffnet sich direkt die Kamera), große Vorschau, Foto tauschen
- [x] **Wirkung:** 11 Kategorien + „Überrasche mich“, optional
- [x] **Einstellungen:** Anleitung „Zum Home-Bildschirm“ (passend für iPhone/Android, ausgeblendet wenn schon installiert), Status des lokalen Speichers, Bild-KI als „Phase 4“ gekennzeichnet
- [x] Lokaler Dokumentenspeicher (IndexedDB) mit Persistenz-Anfrage
- [x] Automatische Veröffentlichung auf GitHub Pages (Workflow fertig, wartet auf Repository)

### Geprüft (17.11.)

- `tsc` ✅ · `expo lint` ✅ · Export für Web, Android und iOS ✅
- Web-Build unter `/storytune/` mit GitHub-Pages-Verhalten (unbekannte Pfade → `404.html`) im Handyformat getestet: Tabs, Direktlink `/settings`, Manifest, Icons – keine fehlgeschlagenen Dateien, keine Laufzeitfehler.
- IndexedDB: Testeintrag übersteht ein Neuladen der Seite.
- Upload-Ablauf (Galerie → Vorschau → Wirkung) am 16.11. durchgeklickt.

### Bewusst noch nicht gebaut (in der App gekennzeichnet)

- „Analyse starten“ deaktiviert → „Bildanalyse folgt in Phase 4“
- „Musikprofil zurücksetzen“, „Alle Analysen löschen“ → „Phase 3“
- Bild-KI → „Phase 4“; Musikprofil-Editor → „Phase 3“

---

## 9. Bekannte Einschränkungen / offene Punkte

| # | Punkt | Auswirkung | Lösung / wann |
| --- | --- | --- | --- |
| O1 | **Noch kein öffentlicher Link.** GitHub ist nicht verbunden. | Nutzer kann die App noch nicht auf dem Handy öffnen. | Nutzer richtet GitHub ein (Abschnitt 10) → Code pushen → Link testen. |
| O2 | **Noch nicht auf einem echten Handy getestet**, nur im Browser im Handyformat. | Safe Areas, Kamera, Home-Bildschirm-Modus ungeprüft. | Sobald der Link steht. |
| O3 | **iPhone/Safari löscht Website-Daten nach 7 Tagen ohne Nutzung**, wenn die App nicht auf dem Home-Bildschirm liegt. | Verlauf/Profil könnten verloren gehen. | Hinweis in den Einstellungen; in Phase 3 zusätzlich Export/Import des Profils prüfen. |
| O4 | Fotos aus der Auswahl sind im Browser nur temporäre `blob:`-Adressen. | Für den Verlauf müssen sie verkleinert in IndexedDB gespeichert werden. | Phase 3. |
| O5 | KI-Modell im Browser: Größe (ca. 20–90 MB beim ersten Laden) und Geschwindigkeit auf älteren Handys unbekannt. | Bestimmt die Modellwahl. | Phase 4: messen; Demo-Modus als Fallback. |
| O6 | Native App-Icons/Splash (für eine spätere Store-App) sind noch Expo-Standard. | Betrifft nur native Builds. | Phase 6. |
| O7 | `npm install` meldet 3 „moderate“ Hinweise in Entwicklungs-Abhängigkeiten. | Betrifft nicht die App. | Nicht mit `--force` beheben. |

---

## 10. Nächste Schritte

### Vom Nutzer (ca. 10 Minuten, alles im Browser)

1. Kostenloses GitHub-Konto anlegen: <https://github.com/signup>.
2. Auf claude.ai GitHub mit Claude verbinden (Einstellungen → Konnektoren/GitHub).
3. Leeres Repository `storytune` anlegen.
4. Im Repository: **Settings → Pages → Source: „GitHub Actions“**.
5. In der nächsten Session den Repository-Namen nennen (`<github-name>/storytune`).

### Von Claude, sobald GitHub steht

1. Projekt in das Repository übertragen → GitHub baut und veröffentlicht automatisch.
2. Link prüfen; Nutzer öffnet ihn auf dem Handy und legt die App auf den Home-Bildschirm.

### Phase 2 – Benutzeroberfläche (wartet auf Freigabe)

1. Ladebildschirm „Analyse läuft“ (animiert, mit Abbruch).
2. Ergebnis-Bildschirm `analysis/[id]`: Foto, Stimmungs-Tags, Farbpalette, 5–10 Song-Karten.
3. Song-Karte: Titel, Künstler, Album, Genre, Begründungen, Ansatz, Spotify-Button, 4 Feedback-Knöpfe, Favorit.
4. Verlauf- und Favoriten-Listen mit klar als Beispiel markierten Testdaten.
5. Onboarding-Ablauf (Gestaltung) für das Musikprofil.
6. Einheitliche Fehler-, Lade- und Leerzustände; Feinschliff der Animationen im Browser.

Danach: Phase 3 Musikprofil + Speicherung → Phase 4 KI im Browser → Phase 5 Empfehlungen → Phase 6 Qualität.

---

## 11. Arbeitsweise über mehrere Sessions

- Claudes Arbeitsumgebung ist ein Cloud-Container, der nach der Session gelöscht wird. Der Code muss deshalb ins GitHub-Repository (empfohlen) oder als ZIP gesichert werden.
- Das Projekt ist ein Git-Repository (Branch `main`); jede Phase endet mit einem Commit.
- Zu Beginn jeder Session: dieses Dokument lesen, `npm install`, `npm run check`.
