# WesoSystems - Technisches Handbuch & Systemdokumentation

Dieses Dokument beschreibt die Architektur, die Workflows und die detaillierte Funktionsweise der WesoSystems-Buchungsanwendung.

## 1. System-Workflow & Architektur

Die Anwendung ist um drei zentrale Benutzerrollen (Workflows) herum aufgebaut, die klar voneinander getrennt sind:

1.  **Agentur-Workflow (`/admin`)**: Die Agentur ist der Super-Admin des Systems. Sie kann neue Hotelsysteme anlegen, bestehende verwalten und hat die volle Kontrolle über alle Konfigurationen.
2.  **Hotelier-Workflow (`/hotel-dashboard`)**: Jeder Hotelier hat sein eigenes, abgeschottetes Dashboard. Er kann Buchungen erstellen, den Status verwalten, seine Stammdaten (teilweise) pflegen und hat Einblick in die Statistiken seines Hotels.
3.  **Gast-Workflow (`/guest`)**: Der Gast interagiert nicht direkt mit dem Dashboard. Er erhält einen einzigartigen, sicheren Link, über den er seine persönlichen Daten für eine bestehende Buchung vervollständigt, Dokumente hochlädt und die Zahlungsinformationen erhält.

### Technische Architektur im Überblick

*   **Frontend**: Next.js (App Router) mit React, TypeScript und Tailwind CSS für das Styling.
*   **Backend & Datenbank**: Firebase (Firestore als Datenbank, Firebase Authentication für die Benutzerverwaltung, Firebase Storage für Datei-Uploads).
*   **Server-Side Logic**: Next.js Server Actions für sichere Backend-Operationen (Datenbank schreiben/lesen).
*   **Authentifizierung**: Ein Cookie-basierter Auth-Flow mit einer zentralen `middleware.ts`, die alle Routen absichert und Zugriffsrechte basierend auf Rollen (`agency`, `hotelier`) und IDs (`hotelId`) prüft.

---

## 2. Detaillierte Seiten- und Funktionsbeschreibung

### 2.1. Haupt-Login-Auswahl (`/`)

*   **Zweck**: Bietet eine klare Auswahl zwischen dem Agentur- und dem Hotel-Login.
*   **UI-Elemente**:
    *   Titel: "Alpenlink Booking"
    *   Button: "Agentur-Login" -> Führt zu `/agency/login`.
    *   Button: "Hotel-Login" -> Führt zu `/hotel/login`.

### 2.2. Agentur-Login (`/agency/login`)

*   **Zweck**: Sichere Anmeldung für die Agentur.
*   **UI-Elemente**: Formular mit Feldern für "E-Mail" und "Passwort".
*   **Funktionalität**:
    1.  Die Anmeldung erfolgt clientseitig über ein benutzerdefiniertes Token-Verfahren.
    2.  Ein `useActionState`-Hook ruft die `loginAgencyAction` (Server Action) auf.
    3.  Die Server Action prüft die Anmeldedaten gegen die in den Umgebungsvariablen gespeicherten Werte.
    4.  Bei Erfolg generiert die Action ein `Custom Token` von Firebase Admin.
    5.  Der Client empfängt das Token und meldet sich damit bei Firebase Auth (`signInWithCustomToken`) an.
    6.  Das daraus resultierende ID-Token wird an die API-Route `/api/auth/login` gesendet, die ein sicheres, `httpOnly` Session-Cookie setzt.
    7.  Der Benutzer wird zum Agentur-Dashboard (`/admin`) weitergeleitet.

### 2.3. Agentur-Dashboard (Parent Route: `/admin`)

#### 2.3.1. Hotelübersicht (`/admin`)

*   **Zweck**: Zentrale Ansicht und Verwaltung aller angelegten Hotels.
*   **UI-Elemente**:
    *   Titel: "Hotelübersicht".
    *   Button: "Neues Hotel anlegen" -> Führt zu `/admin/create-hotel`.
    *   **Datentabelle**: Zeigt alle Hotels mit den Spalten "Hotelname", "Domain", "Erstellt am".
        *   **Filter**: Ein Suchfeld, um die Liste der Hotels nach Namen zu filtern.
        *   **Aktionen pro Zeile (Dropdown-Menü)**:
            *   **Hotelier-Dashboard ansehen**: Leitet zum Dashboard des jeweiligen Hotels weiter (`/hotel-dashboard/[hotelId]`).
            *   **Einstellungen**: Führt zur Bearbeitungsseite für dieses Hotel (`/admin/hotel/[hotelId]/edit`).
            *   **Initiale Zugangsdaten kopieren**: Kopiert E-Mail und initiales Passwort in die Zwischenablage.
            *   **Hotel & Benutzer löschen**: Öffnet einen Bestätigungsdialog. Bei Bestätigung wird das Hotel, der Firebase Auth User und alle zugehörigen Daten (Buchungslinks) gelöscht.
*   **Funktionalität**:
    *   Die Hotelliste wird in Echtzeit aus der Firestore-Collection `/hotels` geladen.
    *   Nach der Erstellung eines neuen Hotels erscheint ein **Modal-Fenster**, das das generierte Passwort anzeigt und eine Kopierfunktion bietet.

#### 2.3.2. Neues Hotel anlegen (`/admin/create-hotel`)

*   **Zweck**: Ein mehrstufiges Formular, um ein komplettes Hotelsystem zu erstellen.
*   **UI-Elemente**:
    *   Karten für: "Basisinformationen", "Hotelier-Zugang", "Bankverbindung", "E-Mail-Versand (SMTP)", "Buchungskonfiguration".
    *   Alle Felder sind Pflichtfelder.
    *   **Passwort generieren**: Button, um ein sicheres Passwort für den Hotelier zu erstellen.
    *   **Sticky Actions Card**: Ein "Hotel erstellen"-Button, der beim Scrollen sichtbar bleibt.
*   **Funktionalität**:
    1.  Beim Absenden wird die `createHotelAction` aufgerufen.
    2.  Diese Aktion:
        *   Erstellt einen neuen Benutzer in Firebase Authentication.
        *   Speichert alle Hotel-Daten in einem neuen Dokument in der `/hotels`-Collection in Firestore.
        *   **Wichtig**: Weist dem neuen Auth-Benutzer Custom Claims zu (`role: 'hotelier'`, `hotelId: [ID des neuen Hotels]`). Diese Claims sind entscheidend für die Zugriffssteuerung.
    3.  Nach Erfolg wird der Nutzer zur Hotelübersicht (`/admin`) zurückgeleitet.

#### 2.3.3. Hotel bearbeiten (`/admin/hotel/[hotelId]/edit`)

*   **Zweck**: Bearbeiten der Stammdaten eines bestehenden Hotels durch die Agentur.
*   **UI-Elemente**: Ähnlich wie die Erstellungsseite, aber mit vorausgefüllten Daten des Hotels. Das Passwortfeld ist für eine optionale Änderung vorgesehen.
*   **Funktionalität**: Ruft die `updateHotelByAgencyAction` auf, die alle geänderten Daten im entsprechenden Hotel-Dokument in Firestore aktualisiert.

#### 2.3.4. Agenturprofil (`/admin/profile`)

*   **Zweck**: Verwaltung des globalen Agentur-Accounts.
*   **UI-Elemente**: Zeigt die E-Mail der Agentur an und enthält ein Formular zum Ändern des Passworts (aktuell nicht funktional, da die Logik für Umgebungsvariablen anders gehandhabt werden muss).
*   **Navigation**: Über das Benutzer-Icon oben rechts erreichbar.

#### 2.3.5. Buchungswidget (`/admin/widget`)

*   **Zweck**: Platzhalterseite für eine zukünftige Funktion.
*   **UI-Elemente**: Zeigt eine "Seite in Entwicklung"-Meldung.

### 2.4. Hotelier-Login (`/hotel/login`)

*   **Zweck**: Sichere Anmeldung für Hotel-Besitzer.
*   **UI-Elemente**: Formular mit "E-Mail" und "Passwort".
*   **Funktionalität**:
    1.  Der Login geschieht **clientseitig** mit `signInWithEmailAndPassword` von Firebase.
    2.  Nach erfolgreichem Login wird das ID-Token des Benutzers an die Server-API `/api/auth/login` gesendet.
    3.  Die API verifiziert das Token, erstellt ein sicheres Session-Cookie und sendet es an den Browser.
    4.  Der Client liest die `hotelId` aus den Custom Claims des ID-Tokens und leitet den Benutzer zu seinem Dashboard (`/hotel-dashboard/[hotelId]`) weiter.

### 2.5. Hotelier-Dashboard (Parent Route: `/hotel-dashboard/[hotelId]`)

#### 2.5.1. Übersicht (`/hotel-dashboard/[hotelId]`)

*   **Zweck**: Startseite mit den wichtigsten Kennzahlen und Aktivitäten für den Hotelier.
*   **UI-Elemente**:
    *   Karten für "Gesamtumsatz", "Gesamtbuchungen", "Heutige Anreisen", "Ausstehende Aktionen".
    *   Systemstatus-Anzeige.
    *   Liste der letzten Buchungs-Aktivitäten.
    *   Kalender zur Visualisierung (Funktion noch nicht implementiert).
*   **Funktionalität**: Daten werden in Echtzeit aus der `bookings`-Subcollection des Hotels geladen.

#### 2.5.2. Buchungsübersicht (`/hotel-dashboard/[hotelId]/bookings`)

*   **Zweck**: Anzeigen und Verwalten aller Buchungen eines Hotels.
*   **UI-Elemente**:
    *   Button: "Neue Buchung" -> Führt zu `/hotel-dashboard/[hotelId]/bookings/create`.
    *   **Datentabelle**: Zeigt alle Buchungen mit Spalten für "ID", "Gast", "Check-in/out", "Status", "Letzte Änderung", "Zahlungsstatus".
        *   **Filter**: Suchfeld für Gastnamen und ein Dropdown zum Filtern nach Buchungsstatus.
        *   **Massenaktionen**: Checkboxen zum Auswählen mehrerer Buchungen. Ein "Löschen"-Button erscheint, der nach Bestätigung alle ausgewählten Buchungen und deren Buchungslinks löscht.
        *   **Aktionen pro Zeile (Dropdown-Menü)**:
            *   **Buchung ansehen**: Führt zur Detailseite (`.../bookings/[bookingId]`).
            *   **Buchung bearbeiten**: Führt zur Bearbeitungsseite (`.../bookings/[bookingId]/edit`).
            *   **Buchungslink kopieren**: Kopiert den Gast-Link in die Zwischenablage.
            *   **Status ändern**: Erlaubt die direkte Änderung des Buchungsstatus.
            *   **Stornieren**: Ändert den Status auf "Cancelled" nach Bestätigung.

#### 2.5.3. Buchung erstellen/bearbeiten (`.../create` & `.../edit`)

*   **Zweck**: Erstellen oder Bearbeiten einer Buchung.
*   **UI-Elemente**: Ein Formular zur Erfassung von Gastnamen, Zeitraum, Preis, Verpflegung, Zimmerdetails und internen Notizen.
*   **Funktionalität**:
    *   Beim Erstellen (`createBookingAction`) wird ein neues Dokument in der `bookings`-Subcollection angelegt UND ein separates Dokument in der `/bookingLinks`-Collection erstellt, das alle Buchungsdaten enthält. Der generierte Link wird in die Zwischenablage kopiert.
    *   Beim Bearbeiten (`updateBookingAction`) werden die Daten sowohl im Buchungs-Dokument als auch im zugehörigen Link-Dokument aktualisiert.

#### 2.5.4. Buchungsdetails (`.../[bookingId]`)

*   **Zweck**: Detaillierte Ansicht aller Informationen zu einer einzelnen Buchung.
*   **UI-Elemente**: Zeigt alle Gast- und Buchungsdaten, inklusive der hochgeladenen Dokumente (Ausweise, Zahlungsbeleg) und Namen der Mitreisenden und Kleinkinder.
*   **Funktionalität**: Reine Leseansicht. Dokumente können über einen Link in einem neuen Tab geöffnet werden.

#### 2.5.5. Hotelier Profil & Einstellungen (`.../profile` & `.../settings`)

*   **Profil**: Ermöglicht dem Hotelier, sein Logo und seine Zugangsdaten (E-Mail, Passwort) zu ändern.
*   **Einstellungen**: Zeigt die Stammdaten des Hotels (Name, Domain, Kontaktdaten, Bankverbindung). Bankdaten sind nur bearbeitbar, wenn die Agentur die Berechtigung erteilt hat.

### 2.6. Gast-Workflow (`/guest/[linkId]`)

#### 2.6.1. Gast-Buchungs-Wizard (`/guest/[linkId]`)

*   **Zweck**: Ermöglicht dem Gast, seine Daten für eine vom Hotelier vorbereitete Buchung einzugeben.
*   **UI-Elemente**: Ein mehrstufiger "Wizard":
    1.  **Gast**: Eingabe der persönlichen Daten und Entscheidung über den Ausweis-Upload (falls nicht verpflichtend).
    2.  **Mitreiser**: Eingabe der Namen von Mitreisenden und Kleinkindern sowie deren Ausweis-Upload (falls "jetzt hochladen" gewählt wurde).
    3.  **Zahlung**: Wahl zwischen Anzahlung (30%) und Komplettzahlung.
    4.  **Details**: Anzeige der Bankverbindung des Hotels und Upload des Zahlungsbelegs.
    5.  **Prüfung**: Zusammenfassung und finale Bestätigung mit AGB-Checkbox.
*   **Funktionalität**:
    *   Die Seite lädt alle Buchungs- und Hoteldaten aus dem Dokument der `/bookingLinks`-Collection.
    *   Alle Texte werden in der vom Hotelier festgelegten Sprache (DE, EN, IT) angezeigt.
    *   Dateien werden komprimiert (falls Bilder) und in den Firebase Storage hochgeladen.
    *   Beim finalen Absenden (`finalizeBookingAction`) werden alle Gastdaten, Dokumenten-URLs und Zahlungsinformationen in das ursprüngliche Buchungsdokument in der Hotel-Subcollection geschrieben, der Status wird auf `Data Provided` gesetzt und der Link wird als `used` markiert, um eine erneute Verwendung zu verhindern.
    *   Zuletzt wird der Gast zur Danke-Seite weitergeleitet.

#### 2.6.2. Danke-Seite (`.../thank-you`)

*   **Zweck**: Bestätigung des erfolgreichen Abschlusses.
*   **UI-Elemente**: Zeigt eine Erfolgsmeldung, eine Zusammenfassung der Buchung und informiert den Gast, dass er eine Bestätigungs-E-Mail erhält.

---

## 3. Technische Prozessabläufe (Workflows)

### Workflow 1: Agentur erstellt ein neues Hotel

1.  **Route**: `/admin/create-hotel`
2.  **Aktion**: Agentur füllt das Formular aus und klickt "Hotel erstellen".
3.  **`createHotelAction` (Server Action)**:
    *   `auth.createUser()`: Erstellt einen neuen Benutzer in **Firebase Authentication** mit E-Mail und Passwort.
    *   `db.collection('hotels').add()`: Schreibt alle Hoteldaten (Name, SMTP, Bank etc.) in ein neues Dokument in der **Firestore**-Collection `/hotels`.
    *   `auth.setCustomUserClaims()`: Fügt dem gerade erstellten Auth-Benutzer die Claims `{ role: 'hotelier', hotelId: '...' }` hinzu.
4.  **Ergebnis**:
    *   Weiterleitung zu `/admin`.
    *   Ein Modal zeigt das initial generierte Passwort für den Hotelier an.
    *   Der neue Hotelier kann sich nun unter `/hotel/login` anmelden.

### Workflow 2: Hotelier erstellt eine Buchung und Gast füllt Daten aus

1.  **Route**: `/hotel-dashboard/[hotelId]/bookings/create`
2.  **Aktion**: Hotelier füllt das Buchungsformular aus (Gastname, Preis, Zimmer etc.) und klickt "Buchung erstellen".
3.  **`createBookingAction` (Server Action)**:
    *   `db.collection('hotels').doc(hotelId).collection('bookings').add()`: Erstellt die Kernbuchung in der Subcollection des Hotels. Status ist `Pending`.
    *   `db.collection('bookingLinks').add()`: Erstellt ein **separates Link-Dokument**. Dieses Dokument enthält eine Kopie **aller** relevanten Buchungs- und Hoteldaten, die der Gast sehen muss.
4.  **Ergebnis (für Hotelier)**:
    *   Der Link (`/guest/[linkId]`) wird in die Zwischenablage kopiert.
    *   Der Hotelier sendet diesen Link an den Gast.
5.  **Aktion (Gast)**:
    *   Gast öffnet den Link. Die Seite `/guest/[linkId]` lädt alle Daten aus dem Link-Dokument.
    *   Gast durchläuft den Wizard (siehe 2.6.1).
6.  **`finalizeBookingAction` (Server Action)**:
    *   Der Link wird geprüft (`status` muss `active` sein).
    *   Alle vom Gast eingegebenen Daten und Datei-URLs werden in das **ursprüngliche Buchungsdokument** unter `/hotels/[hotelId]/bookings/[bookingId]` geschrieben.
    *   Der Status der Buchung wird auf `Data Provided` aktualisiert.
    *   Der Status des Link-Dokuments wird auf `used` gesetzt.
    *   `sendBookingConfirmation()`: Eine Bestätigungs-E-Mail wird im Hintergrund an den Gast gesendet.
7.  **Ergebnis (für Gast)**:
    *   Weiterleitung zur Danke-Seite (`/guest/[linkId]/thank-you`). Der Prozess ist abgeschlossen.
    *   Der Buchungslink ist nun ungültig.
