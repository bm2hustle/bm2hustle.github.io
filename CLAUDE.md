# BM2 Hustle – Arbeitsregeln

Statische Lernseite der Klasse BMGV26b, live unter https://bm2hustle.github.io (GitHub Pages, Branch `main`).

## Dateien
- `index.html` – die Seite (Start, Kalender, Fächer-Leiste, Suche, Melden, Fach-Abschnitte)
- `hub-data.js` – alle Daten; wird mit `node tools/build-hub-data.js <data.js> <spiele.js> [YYYY-MM-DD]` aus Robins Lern-Dashboard erzeugt
- `tools/theory-map.json` – welche Theorie (Dashboard-`readings`) zu welcher Prüfung gehört
- `tools/extra.json` – Zusätzliches (z. B. Medienprojekt-Gruppen)
- `tools/extra-exams.json` – neue/korrigierte Termine aus OneDrive oder Meldungen (gleiche `id` ersetzt, `"remove": true` löscht)
- `tools/last-check.txt` – Zeitpunkt der letzten automatischen Prüfung
- `soz.html` – Soziologie-Comic

## Was direkt live darf
- Neue/geänderte Prüfungsdaten, Zeiten, Stoff, Lernziele, Hausaufgaben, Abgaben

## Was zuerst als Testversion zu Robin muss
- Neue Theorie, Quizfragen, Lernkarten, Comics, Probeprüfungen, Vokabel-Sets
- Jede Design- oder Funktionsänderung
Testversion = Ordner `test/` (Kopie der Seite), erreichbar unter https://bm2hustle.github.io/test/. Erst nach Robins OK nach oben kopieren.

## Nie auf die Seite
- Noten, Notenrechner, persönlicher Lernplan, Training/Matches, XP/Badges, OneDrive-Pfade, Namen von Mitschülern (Gruppen nur als G1–G7)

## Git
- Committen als `Claude <noreply@anthropic.com>`; push mit `git -c push.negotiate=true push`.

## Führung (Tour)
- In `index.html` steht das Array `TOUR`. Für jede neue sichtbare Funktion einen Schritt mit **neuer `id`** anhängen (z. B. `t3-vokabeln`). Jeder Browser sieht nur Schritte, deren `id` er noch nicht kennt – also nur Neues.

## Figuren (in allen Fächern gleich, auch in NotebookLM-Podcasts/Videos)
- **Nico** – Hauptfigur, BM-Schüler, Lehre als Elektriker EFZ, spielt Fussball (Verteidiger, später Captain)
- **Lars** – Nicos bester Kollege, neu im Team, macht Fehler, fragt nach
- **Mia** – ehrgeizig, Klassenbeste, korrigiert und fasst zusammen
- **Trainer Beni** – Fussballtrainer (Regeln, Druck, Motivation)
- **Herr Huber** – Chef im Elektro-Lehrbetrieb (Arbeit, Verträge, Geld)
- **Opa Ernst** – Nicos Grossvater (früher vs. heute, Geschichte)
Nie Robins echte Hobbys/Beruf/Wohnort verwenden (kein Unihockey, keine Zimmerei, kein Rapperswil).

## Teilbereiche (tools/extra.json → "parts")
- Mathe mat3 ist in quad/text/daten aufgeteilt; die Index-Bereiche (quiz, decks, pairs, cloze, order, theory, topics) zeigen auf die Reihenfolge in hub-data. Wenn sich die Spiele/Themen von mat3 im Dashboard ändern, die Bereiche prüfen.
- Mathe-Coach: mathe.html (eigene Aufgaben) + mathe-buch.js (Buch-Begleiter: nur Seite/Nr. + eigene Tipps, NIE Buchtext kopieren).
