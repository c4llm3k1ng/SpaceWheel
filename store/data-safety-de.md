# Data-Safety-Fragebogen — Antwortvorlage

Ausfüllen in der Play Console unter **App-Inhalte → Datensicherheit**.
Die Formulierungen in der Console können leicht abweichen; die Antworten unten
sind gegen den tatsächlichen Code von Space Wheel abgeglichen (Stand: 2026-09-14).

---

## Übersicht: Was die App wirklich speichert

**Auf dem Server (Google Firebase), nur bei angelegtem Konto:**

| Feld | Inhalt |
|---|---|
| `username` | frei gewählter Nutzername, öffentlich in der Bestenliste |
| `friendCode` | zufällig erzeugter 6-stelliger Code |
| `highscore` | bester Punktestand |
| `friends` | interne Nutzer-IDs akzeptierter Freunde |
| `pendingRequests` | interne Nutzer-IDs offener Anfragen |
| `tutorialAsked` | Merker, ob die Tutorial-Frage schon gestellt wurde |
| Firebase Auth | interne Kennung + Passwort (nur als Hash) |

**Nur auf dem Gerät (localStorage), verlässt das Gerät nicht:**
`orbit_highscore_v46`, `sw_hs_owner`, `sw_music`, `sw_sfx`, `sw_tutorial_asked`

**Wird ausdrücklich NICHT erhoben:** echte E-Mail-Adresse, Klarname, Standort,
Geräte- oder Werbe-IDs, Kontakte, Fotos, Mikrofon, Zahlungsdaten, Analytics.
Die App fragt an keiner Stelle eine E-Mail-Adresse ab. Intern bildet Firebase Auth
aus dem Nutzernamen eine technische Kennung der Form `nutzername@orbit-sync.app` —
das ist **kein** echtes Postfach und keine Kontaktadresse des Nutzers.

---

## Antworten auf die Formularfragen

### Werden Nutzerdaten erhoben oder weitergegeben?
**Ja** (sobald ein Konto angelegt wird).

### Werden alle erhobenen Daten bei der Übertragung verschlüsselt?
**Ja.** Die App wird ausschließlich über HTTPS ausgeliefert, und die Verbindung
zu Firebase Authentication und Cloud Firestore läuft über TLS.

### Können Nutzer die Löschung ihrer Daten verlangen?
**Ja.** Löschung direkt in der App unter *Einstellungen → Konto löschen*,
zusätzlich per E-Mail.

### URL zur Datenlöschung
```
https://c4llm3k1ng.github.io/SpaceWheel/delete-account.html
```

### Datenschutzerklärung
```
https://c4llm3k1ng.github.io/SpaceWheel/privacy-de.html
```

---

## Datentypen

### 1. Personenbezogene Daten → Nutzer-IDs

| Frage | Antwort |
|---|---|
| Erhoben | **Ja** |
| Weitergegeben | **Nein** |
| Verarbeitung nur vorübergehend | Nein (dauerhaft gespeichert) |
| Erhebung ist erforderlich | **Nein, optional** — das Spiel ist ohne Konto vollständig spielbar |
| Zweck | **App-Funktionalität** (Konto, Bestenliste, Freundschaftssystem) |

Betrifft: Nutzername, Freundescode, interne Nutzer-ID sowie die Nutzer-IDs in
Freundesliste und offenen Anfragen.

### 2. App-Aktivität → App-Interaktionen

| Frage | Antwort |
|---|---|
| Erhoben | **Ja** |
| Weitergegeben | **Nein** |
| Verarbeitung nur vorübergehend | Nein |
| Erhebung ist erforderlich | **Nein, optional** |
| Zweck | **App-Funktionalität** (Bestenliste) |

Betrifft: den Highscore und den Merker, ob die Tutorial-Frage gestellt wurde.

### 3. Alle übrigen Kategorien

**Nicht erhoben und nicht weitergegeben:** Standort, Name, E-Mail-Adresse,
Telefonnummer, Adresse, Zahlungs- und Finanzdaten, Gesundheit und Fitness,
Nachrichten, Fotos und Videos, Audiodateien, Musikdateien, sonstige Dateien,
Kalender, Kontakte, Such- und Browserverlauf, Geräte- oder andere IDs,
App-Leistungsdaten (Abstürze, Diagnose).

---

## Zwei Punkte, die du selbst entscheiden musst

**„Name" statt „Nutzer-IDs"?** Google zählt unter *Name* auch Spitznamen. Da der
Nutzername bei Space Wheel frei erfunden ist, nicht auf einen echten Namen geprüft
wird und nur als Kontobezeichnung dient, ist *Nutzer-IDs* die passende Kategorie.
Wenn du ganz auf der sicheren Seite sein willst, kannst du zusätzlich *Name*
angeben — das ist strenger als nötig, aber niemals falsch.

**Firebase-Infrastrukturdaten.** Firebase Authentication protokolliert serverseitig
unter anderem IP-Adressen zur Missbrauchsabwehr. Das geschieht bei Google als
Auftragsverarbeiter und nicht durch eigenen Code. Google stellt für Firebase eine
eigene Hilfeseite zum Data-Safety-Abschnitt bereit — wirf einen Blick darauf und
folge im Zweifel deren Empfehlung, da Google die Anforderungen gelegentlich ändert.

*Hinweis: Diese Vorlage ist eine technische Aufstellung, keine Rechtsberatung.
Die Angaben in der Console verantwortest du als Entwickler.*
