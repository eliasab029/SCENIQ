# STORYTUNE – Projektstatus

> **Für die nächste Session zuerst lesen.** Dieses Dokument ist die Übergabe zwischen Sessions.
> Letzte Aktualisierung: **16.11.2026 – Ende Phase 1**

---

## 0. Kurzfassung

| | |
| --- | --- |
| **Aktuelle Phase** | Phase 1 abgeschlossen ✅ – wartet auf Freigabe für Phase 2 |
| **Nächster Schritt** | Phase 2 – Benutzeroberfläche (siehe Abschnitt 9) |
| **Stack** | Expo SDK 58 · React Native 0.88 · React 19 · TypeScript 6 · Expo Router 58 |
| **Läuft auf** | iOS + Android über Expo Go (Web nur als Test-Vorschau) |
| **Laufende Kosten** | 0 € – keine kostenpflichtigen APIs, keine Accounts |

---

## 1. Projektziel

STORYTUNE ist ein persönlicher KI-Musikberater für Instagram Stories:

1. Nutzer lädt ein Foto hoch (Galerie oder Kamera).
2. Optional: gewünschte Wirkung wählen (11 Kategorien + „Überrasche mich“).
3. Eine **lokale** Bild-KI (Ollama auf dem PC) analysiert Inhalt, Farben, Licht, Ästhetik, Stimmung, Emotion.
4. Ein eigenes Empfehlungssystem kombiniert Bildanalyse + Wirkung + **persönliches Musikprofil** → 5–10 Songs mit individueller Begründung.
5. Feedback (Gefällt mir / nicht / Mehr davon / Nicht mein Stil) verbessert das Profil.

**Kernversprechen:** Gleiches Foto, unterschiedliche Personen → unterschiedliche Empfehlungen.

---

## 2. Technische Architektur

```
┌──────────────────────────── Smartphone (Expo Go) ────────────────────────────┐
│                                                                              │
│  Screens (src/app, Expo Router)                                              │
│     │                                                                        │
│     ▼                                                                        │
│  Features (src/features)                                                     │
│   ├─ analysis   ImageAnalyzer-Schnittstelle ──┬─ OllamaAnalyzer ──── WLAN ───┼──► PC: Ollama :11434
│   │                                           ├─ DemoAnalyzer (offline)      │      (Bildmodell)
│   │                                           └─ (später: On-Device)         │
│   ├─ effects    Wirkungs-Kategorien                                          │
│   ├─ music      Song-Katalog (lokal) + Empfehlungsalgorithmus                │
│   └─ profile    Musikprofil + Feedback-Lernen                                │
│     │                                                                        │
│     ▼                                                                        │
│  Data (src/data)                                                             │
│   ├─ SQLite (expo-sqlite)        Analysen, Empfehlungen, Feedback, Favoriten, │
│   │                              Profil                                      │
│   └─ AsyncStorage                Einstellungen (Ollama-Adresse, Modell)      │
│                                                                              │
│  Spotify: nur Such-Links (open.spotify.com/search/…) – keine API             │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Prinzipien**

- Bildschirme kennen nur Schnittstellen, nie konkrete KI-Anbieter → KI ist austauschbar.
- Die Empfehlung liest nur das strukturierte `ImageAnalysis`-Objekt, nie Rohtext der KI.
- Jede Analyse speichert ihre Quelle (`ollama` | `on-device` | `demo`) → die UI kennzeichnet Demo-Ergebnisse immer als „Demo“, nie als KI.
- Kein Absturz ohne Ollama: Verbindungsprüfung liefert immer ein Ergebnis-Objekt, wirft nie.

---

## 3. Projektstruktur

```
storytune/
├─ PROJECT_STATUS.md          ← dieses Dokument
├─ README.md                  ← Start-Anleitung (PC + Handy + Ollama)
├─ AGENTS.md                  ← Hinweise von Expo für KI-Assistenten
├─ app.json                   ← Expo-Konfiguration (Name, Dark Mode, Berechtigungen)
├─ metro.config.js            ← .wasm für SQLite-Web-Vorschau
├─ scripts/
│  ├─ check-env.ps1           ← Umgebungscheck Windows
│  └─ check-env.sh            ← Umgebungscheck macOS/Linux
└─ src/
   ├─ app/                    ← NUR Routen (jede Datei = ein Bildschirm)
   │  ├─ _layout.tsx          ← Root: Fonts, Splash, Provider, Stack
   │  ├─ (tabs)/_layout.tsx   ← Tab-Navigation mit eigener Tab-Leiste
   │  ├─ (tabs)/index.tsx     ← Start
   │  ├─ (tabs)/history.tsx   ← Verlauf
   │  ├─ (tabs)/favorites.tsx ← Favoriten
   │  ├─ (tabs)/profile.tsx   ← Profil
   │  ├─ upload.tsx           ← Foto wählen / aufnehmen / Vorschau (Vollbild-Modal)
   │  ├─ effect.tsx           ← Gewünschte Wirkung
   │  ├─ settings.tsx         ← Einstellungen, Ollama-Verbindungstest, DB-Status
   │  └─ taste-profile.tsx    ← Musikprofil (Vorschau, Editor folgt Phase 3)
   ├─ components/
   │  ├─ ui/                  ← Designsystem-Bausteine (siehe 4.)
   │  ├─ brand/Logo.tsx       ← Logo-Zeichen + Schriftzug
   │  └─ navigation/TabBar.tsx← schwebende Tab-Leiste mit zentralem „+“
   ├─ features/
   │  ├─ analysis/            ← types.ts (ImageAnalysis), analyzer.ts (Schnittstelle),
   │  │                         draft.ts (aktueller Foto-Entwurf), providers/ollamaClient.ts
   │  ├─ effects/effects.ts   ← 11 Wirkungen + „Überrasche mich“ (stabile IDs)
   │  ├─ music/types.ts       ← Song, Recommendation, Spotify-Link
   │  └─ profile/types.ts     ← MusicProfile, FeedbackKind
   ├─ data/
   │  ├─ database.ts          ← SQLite öffnen + Migrationen
   │  └─ settings.tsx         ← AsyncStorage-Einstellungen (React Context)
   ├─ lib/haptics.ts          ← absturzsichere Haptik
   └─ theme/tokens.ts         ← alle Farben, Abstände, Schriften, Radien, Schatten, Animationen
```

---

## 4. Designsystem

Alle Werte in `src/theme/tokens.ts`. Komponenten verwenden **niemals** feste Farb-/Größenwerte.

| Bereich | Festlegung |
| --- | --- |
| Hintergrund | `#0A0A0C` (tiefes Schwarz) → Flächen `#131316` / `#1B1B20` (Anthrazit) |
| Akzent | `#9D8CFF` gedämpftes Lavendel-Violett, sparsam eingesetzt |
| Schrift | **Instrument Serif** (Überschriften, editorial) + **Inter** (UI, Fließtext) |
| Typo-Skala | hero 44 · display 34 · title 22 · heading 17 · body 15 · callout 13 · caption 12 · overline 11 |
| Abstände | 4-pt-Raster (4, 8, 12, 16, 20, 24, 32, 48), Seitenrand 20 |
| Radien | 10 · 14 · 20 · 28 · Pill |
| Tiefe | weiche Schatten (`card`), Akzent-Leuchten (`glow`) für die Hauptaktion |
| Bewegung | 150/250/420 ms, Feder-Animation beim Antippen (Skalierung 0,97), gestaffeltes Einblenden (60 ms) |

**Komponenten** (`src/components/ui`): `AppText`, `Button` (primary/secondary/ghost/danger, Ladezustand), `IconButton`, `PressableScale` (Basis für alles Antippbare, inkl. Haptik), `Card`, `Chip`, `TextField`, `ListRow` (mit `plannedPhase`-Kennzeichnung), `StatusPill`, `EmptyState`, `SectionHeader`, `Screen`, `ScreenHeader`.

**Regel:** Noch nicht gebaute Funktionen werden mit `plannedPhase` bzw. einer violetten „Phase X“-Plakette gekennzeichnet und sind nicht antippbar.

---

## 5. Datenmodell

**SQLite** (`storytune.db`, Schema-Version 1, Migrationen über `PRAGMA user_version`):

| Tabelle | Inhalt |
| --- | --- |
| `analyses` | id, Zeitpunkt, Bild-URI, gewünschte Wirkung, Quelle, Modell, Analyse als JSON |
| `recommendations` | Song-ID, Slot (perfect/aesthetic/emotional/unexpected/hidden_gem), Position, Score, Begründungen (JSON) |
| `feedback` | Song-ID, Analyse-ID, Art (like/dislike/more/not_my_style), Zeitpunkt |
| `favorites` | Song-ID, Herkunfts-Analyse, Zeitpunkt |
| `profile` | Schlüssel/Wert-Dokumente (Musikprofil als JSON) |

**AsyncStorage**: `storytune.settings.v1` → `{ ollamaUrl, ollamaModel, forceDemoMode }`.

**Song-Katalog**: als TypeScript-Datei im Code (nicht in SQLite) – leicht überprüfbar, versionierbar, erweiterbar. Felder siehe `src/features/music/types.ts`; unsichere Angaben werden in `unverifiedFields` markiert.

**Bildanalyse-Schema** (`src/features/analysis/types.ts`): `content` (Inhalt, Situation) · `visual` (Farben, Licht, Ästhetik) · `mood` (Atmosphäre, Emotionen, energy 0–1, valence 0–1) · `music` (Genres, Tempo, Kontrast-Ideen) · `tags` (normiertes Vokabular für das Matching).

---

## 6. Wichtige technische Entscheidungen

| # | Entscheidung | Begründung |
| --- | --- | --- |
| E1 | **Expo SDK 58** (aktuell stabil seit 29.09.2026) | Expo Go unterstützt immer nur die neueste SDK-Version. |
| E2 | **Expo Go** statt eigenem Build während der Entwicklung | Kein Xcode/Android Studio nötig, kostenlos. Alle Pakete sind Expo-Go-kompatibel (Versionen aus Expos eigener Kompatibilitätsliste). |
| E3 | **Ollama auf dem PC** als Bild-KI, Zugriff übers WLAN | Kostenlos, lokal, kein API-Key. Nachteil: funktioniert nur im Heim-WLAN mit laufendem PC → Demo-Modus als Fallback. |
| E4 | Standardmodell **`qwen3-vl:4b`** (Alternativen: `qwen3-vl:2b` für schwache PCs, `qwen3-vl:8b` ab ~10 GB VRAM, `gemma3:4b` als Ausweichmodell) | Gute strukturierte JSON-Ausgabe, versteht Stimmung/Ästhetik, gut auf Deutsch, ~3–4 GB. **Endgültige Wahl nach Hardware-Check** – Modell ist in den Einstellungen frei änderbar. |
| E5 | **SQLite** für strukturierte Daten, **AsyncStorage** nur für Einstellungen | Wie im Auftrag gefordert; SQLite erlaubt Abfragen (Verlauf, Feedback-Statistik). |
| E6 | Song-Katalog **im Code**, nicht in der DB | Überprüfbar, keine erfundenen Daten, später per Migration in SQLite übertragbar. |
| E7 | **Eigene Tab-Leiste** (`expo-router/js-tabs` + `TabBar.tsx`) statt nativer Tabs | Volle gestalterische Kontrolle; zentraler „+“-Button für die Hauptfunktion. |
| E8 | **Eigene Kopfzeilen** (`ScreenHeader`) statt nativer Header | Einheitliches Design auf iOS und Android. |
| E9 | Foto-Entwurf im Speicher (`draft.ts`), nicht in der URL | Bild-URIs können sehr lang sein; erst eine fertige Analyse wird in SQLite gespeichert. |
| E10 | Spotify nur über **Such-Links** | Kein Konto, kein Premium, keine API nötig. |
| E11 | Reanimated-Werte über `.get()`/`.set()` | Nötig für den aktivierten React Compiler (Lint-Regel). |

---

## 7. Empfehlungsalgorithmus – Entwurf (umgesetzt in Phase 5)

Für jeden Song wird ein Score 0–1 berechnet:

| Faktor | Gewicht | Quelle |
| --- | --- | --- |
| Bildstimmung (Atmosphäre/Mood-Tags, Energie, Valenz) | 0,30 | ImageAnalysis |
| Gewünschte Wirkung | 0,20 | Auswahl des Nutzers (bei „Überrasche mich“/keine Auswahl: auf Bild + Profil verteilt) |
| Persönlicher Geschmack (Genres, Künstler, Stimmungen, gelernte Affinitäten) | 0,25 | MusicProfile |
| Musikalische Eigenschaften (Energie, Tempo, Jahrzehnt) | 0,10 | Song vs. Analyse/Profil |
| Bekanntheit vs. Entdeckerlust | 0,10 | Profil |
| Neuheit (nicht kürzlich gezeigt) | 0,05 | Verlauf |

- **Harte Filter:** abgelehnte Songs, „Nicht mein Stil“-Genres.
- **Abwechslung:** max. 1 Song pro Künstler, Abzug für kürzlich gezeigte Songs, leichte Zufallsstreuung.
- **5 Ansätze (Slots):** Perfekter Match (Gesamtscore) · Ästhetischer Match (visuelle Atmosphäre) · Emotionaler Match (Wirkung + Mood) · Unerwarteter Match (bewusster **Kontrast**, z. B. Energie invertiert, aber innerhalb des Geschmacks) · Geheimtipp (Nischen-Song mit hohem Geschmacks-Score).
- Gewichte werden als Konstanten zentral abgelegt und dokumentiert.

---

## 8. Stand der Funktionen

### Fertig (Phase 1)

- [x] Expo + TypeScript + Expo Router eingerichtet, Vorlagen-Inhalte entfernt
- [x] Designsystem (Tokens + 13 UI-Komponenten + Logo + Tab-Leiste), Dark Mode, eigene Schriften
- [x] Navigation: 4 Tabs + zentrale „+“-Aktion, Stack-Bildschirme mit Übergängen
- [x] **Start:** Logo, Begrüßung (tageszeitabhängig), großer Foto-Bereich, Schnellzugriff Musikprofil/Favoriten, leerer Zustand „Letzte Analysen“
- [x] **Foto-Upload (funktioniert echt):** Galerie, Kamera (mit Berechtigungsabfrage), große Vorschau im richtigen Seitenverhältnis, Foto tauschen
- [x] **Wirkung:** 11 Kategorien + „Überrasche mich“, optional, an-/abwählbar
- [x] **Einstellungen:** Ollama-Adresse + Modell (gespeichert), **echter Verbindungstest** (Erreichbarkeit, Version, installierte Modelle, Bildfähigkeit des Modells), Modell per Antippen übernehmen, DB-Status
- [x] Lokale SQLite-Datenbank mit Schema v1 + Migrationssystem (wird beim Start angelegt)
- [x] Verlauf, Favoriten, Profil, Musikprofil als Bildschirme mit ehrlichen leeren Zuständen
- [x] Umgebungscheck-Skripte (Windows/macOS/Linux)

### Geprüft

- `tsc --noEmit` ✅ · `expo lint` ✅ (0 Fehler, 0 Warnungen)
- `expo export` für **Android, iOS und Web** ✅ (alle drei Bundles bauen)
- Web-Vorschau im Handyformat (393×852) durchgeklickt: Start → + → Galerie → Vorschau → Weiter → Wirkung wählen; Einstellungen → Verbindungstest (Fehlerfall). Keine Laufzeitfehler.

### Bewusst noch nicht gebaut (gekennzeichnet in der App)

- „Analyse starten“ ist deaktiviert mit Hinweis „Bildanalyse folgt in Phase 4“
- „Musikprofil zurücksetzen“, „Alle Analysen löschen“ → Plakette „Phase 3“
- Musikprofil-Editor/Onboarding → Hinweis „Wird in Phase 3 eingerichtet“

---

## 9. Bekannte Einschränkungen / offene Punkte

| # | Punkt | Auswirkung | Lösung / wann |
| --- | --- | --- | --- |
| O1 | **Noch nicht auf einem echten Handy getestet.** Phase 1 wurde in einer Cloud-Umgebung gebaut; dort gibt es kein Smartphone. | SQLite, Kamera, Haptik nur per Typprüfung/Bundle verifiziert, nicht live. | **Erster Schritt der nächsten Session:** Nutzer startet `npx expo start` und testet mit Expo Go. |
| O2 | **Hardware des PCs unbekannt.** | Modellwahl (E4) ist vorläufig. | Nutzer führt `scripts/check-env.ps1` aus und fügt die Ausgabe ein. |
| O3 | App-Icon und Splash-Bild sind noch die Expo-Standardgrafiken (Hintergrund bereits dunkel). | Nur optisch. | Phase 6 (eigenes Icon). |
| O4 | Für spätere eigenständige Builds muss HTTP zu Ollama erlaubt werden (Android `usesCleartextTraffic`, iOS Local-Network-Hinweis). In Expo Go bereits erlaubt. | Erst beim eigenen Build relevant. | Phase 6 (`expo-build-properties`). |
| O5 | Fotos aus der Galerie liegen im Cache-Ordner. | Für den Verlauf müssen sie dauerhaft kopiert werden. | Phase 3 (`expo-file-system`). |
| O6 | `npm install` meldet 3 „moderate“ Sicherheitshinweise in Entwicklungs-Abhängigkeiten von Expo. | Betrifft nicht die App auf dem Handy. | Nicht mit `npm audit fix --force` beheben (würde Expo-Versionen brechen). |
| O7 | Modell-Tags von Ollama (`qwen3-vl:*`) konnten aus der Cloud-Umgebung nicht direkt auf ollama.com geprüft werden. | Falls `ollama pull qwen3-vl:4b` fehlschlägt → `gemma3:4b`. | Phase 4. |

---

## 10. Nächste Schritte

### Vor Phase 2 (Nutzer, ca. 15 Minuten)

1. Projekt entpacken, `npm install`, `npx expo start`, mit Expo Go öffnen → kurz Rückmeldung, ob alles startet.
2. `scripts\check-env.ps1` ausführen → Ausgabe in die nächste Session kopieren.
3. Optional schon: Ollama installieren und `ollama pull qwen3-vl:4b` (bzw. Empfehlung des Skripts).
4. Für dauerhafte Speicherung: GitHub-Konto mit Claude verbinden und ein leeres Repository anlegen (siehe Abschnitt 11).

### Phase 2 – Benutzeroberfläche (wartet auf Freigabe)

1. Ladebildschirm „Analyse läuft“ (animiert, mit Abbruch).
2. Ergebnis-Bildschirm `analysis/[id]`: Foto groß, Stimmungs-Tags, Farbpalette, 5–10 Song-Karten.
3. Song-Karte: Titel, Künstler, Album, Genre, Begründungen, Slot-Kennzeichnung, Spotify-Button, 4 Feedback-Knöpfe, Favorit.
4. Verlauf- und Favoriten-Listen mit realistischen, klar als Beispiel markierten Testdaten.
5. Onboarding-Ablauf (Gestaltung) für das Musikprofil.
6. Einheitliche Fehler-, Lade- und Leerzustände; Feinschliff der Animationen.

### Danach

Phase 3 Musikprofil + Speicherung → Phase 4 KI-Bildanalyse → Phase 5 Empfehlungen → Phase 6 Qualität & Build.

---

## 11. Arbeitsweise über mehrere Sessions

- Die Entwicklungsumgebung von Claude ist ein **Cloud-Container, der nach der Session gelöscht wird**. Alles Wichtige muss deshalb entweder
  - in ein **GitHub-Repository** gepusht werden (empfohlen – dann kann jede Session direkt weiterarbeiten), oder
  - als ZIP heruntergeladen und in der nächsten Session wieder hochgeladen werden.
- Das Projekt ist ein Git-Repository; jede Phase endet mit einem Commit.
- Zu Beginn jeder Session: dieses Dokument lesen, `npm install`, `npm run check`.
