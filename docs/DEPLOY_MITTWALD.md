# Test-Betrieb auf mittwald (HTTPS)

Stand: v1. Nur die Schritte, die in diesem Projekt nachgeprüft wurden, sind als geprüft markiert. Die Oberfläche von mStudio kann sich ändern; maßgeblich ist die Doku von mittwald:
[Node.js-Anwendungen](https://developer.mittwald.de/docs/v2/platform/workloads/nodejs/) · [Webserver](https://developer.mittwald.de/docs/v2/platform/workloads/webservers/)

## Prinzip: HTTPS und Port

Die App lauscht auf **einfachem HTTP** an dem Port aus der Umgebungsvariable `PORT`. **HTTPS (Port 443) und das Zertifikat übernimmt mittwald** vor der App. Die App selbst braucht kein Zertifikat und muss nicht auf 443 laufen.

Geprüft: `PORT=8080 npm start` startet die App im Produktionsmodus auf dem gewünschten Port; Daten und Uploads liegen in `DATA_DIR` und `STORAGE_DIR`.

## Voraussetzungen

- **Node.js 22.13 oder neuer** (wegen `node:sqlite`). Ob Ihr Tarif/Ihre Umgebung das anbietet, bitte in mStudio prüfen. Mit Node 20 startet die App nicht. Alternative: Container-Betrieb (siehe unten).
- Eine Domain/Subdomain mit HTTPS auf dem Projekt.

## Variante A: Node.js-App in mStudio (nur mit npm auf dem Server)

1. Repository auf den Server bringen (git clone oder Upload) und im App-Ordner ausführen:
   ```bash
   npm ci
   npm run build
   ```
2. Umgebungsvariablen setzen (nicht ins Repository):
   ```
   NODE_ENV=production
   PORT=<Port der Node.js-App in mStudio>
   APP_URL=https://ihre-domain.de
   ADMIN_EMAILS=ihre@mail.de
   CRON_SECRET=<langer Zufallstext>
   DATA_DIR=<persistenter Ordner, z. B. /home/.../pet-data>
   STORAGE_DIR=<persistenter Ordner, z. B. /home/.../pet-storage>
   SMTP_HOST=, SMTP_PORT=587, SMTP_USER=, SMTP_PASS=, MAIL_FROM=   (siehe Variante B: E-Mail-Versand ist Pflicht)
   ```
   `DATA_DIR` und `STORAGE_DIR` müssen **außerhalb** des Programmordners liegen, sonst gehen Datenbank und Uploads bei einem neuen Deployment verloren.
3. Startbefehl: `npm start`.
4. Domain auf die App legen (Ingress/Proxy auf den App-Port), HTTPS aktivieren.

## Variante B: Container (empfohlen, wenn auf dem Server kein npm vorhanden ist)

Auf dem Server wird weder npm noch Node installiert: Das Image enthält alles. Gebaut wird es automatisch bei GitHub (`.github/workflows/docker.yml`) bei jedem Push auf `main` und unter Actions auch per Hand startbar. Der Workflow startet das Image einmal zur Probe (Startseite muss 200 liefern) und veröffentlicht es dann unter
`ghcr.io/scherar/pet-cemetery:latest`.

**Einmalig bei GitHub:** Nach dem ersten erfolgreichen Lauf unter dem Repository „Packages“ das Paket öffnen. Standardmäßig ist es privat. Zwei Wege:
- Paket auf **öffentlich** stellen (einfach; das Image enthält keine Zugangsdaten, aber den Programmcode), oder
- privat lassen und in mittwald Zugangsdaten für die Registry `ghcr.io` hinterlegen (GitHub-Token mit Leserecht `read:packages`).

**In mStudio** (Bezeichnungen können abweichen, siehe mittwald-Doku zu Containern):
1. Neuen Container aus dem Image `ghcr.io/scherar/pet-cemetery:latest` anlegen.
2. Port **3000** (HTTP) mit Ihrer Domain verbinden; HTTPS übernimmt mittwald.
3. Zwei persistente Volumes einbinden: `/data` (Datenbank) und `/storage` (Uploads).
4. Umgebungsvariablen setzen (nicht ins Repository):
   ```
   APP_URL=https://ihre-domain.de
   ADMIN_EMAILS=ihre@mail.de
   CRON_SECRET=<langer Zufallstext>
   SMTP_HOST=<Mailserver Ihres Postfachs>
   SMTP_PORT=587
   SMTP_USER=<Postfach/Benutzername>
   SMTP_PASS=<Passwort>   (Geheimnis, nicht in den Chat oder ins Repository)
   MAIL_FROM=<Absenderadresse, z. B. noreply@ihre-domain.de>
   ```
   **E-Mail-Versand ist Pflicht:** Neue Konten müssen ihre E-Mail-Adresse per Link bestätigen, bevor sie sich anmelden können. Ohne SMTP-Zugang kommt keine Mail an, und niemand kann sich registrieren. Die Zugangsdaten bekommen Sie von dem Postfach, über das gesendet werden soll (Server, Port und Benutzer entnehmen Sie den Einstellungen des Postfachs in mStudio). Ein Test: Registrieren Sie sich mit einer eigenen Adresse; die Mail muss ankommen.
   `NODE_ENV`, `PORT=3000`, `DATA_DIR=/data` und `STORAGE_DIR=/storage` sind im Image bereits gesetzt.
5. Container starten. Update später: Image neu ziehen/Container neu starten.

Nicht geprüft: Der Image-Build lief in dieser Entwicklungsumgebung nicht (kein Docker-Dienst). Der erste echte Build ist der GitHub-Lauf; schlägt er fehl, bitte die Logs unter Actions weitergeben.

## Nach dem Start prüfen

- `https://ihre-domain.de/` lädt, Schloss im Browser vorhanden.
- Registrieren: Die Bestätigungs-Mail muss ankommen (auch im Spam-Ordner prüfen). Erst nach Klick auf den Link ist die Anmeldung möglich.
- Anmelden (Cookies sind im Produktionsmodus „secure“, funktionieren also nur über HTTPS).
- Mit der Adresse aus `ADMIN_EMAILS` registrieren: Menüpunkt „Prüfung“ erscheint.
- Abo-Seite zeigt „Test-Modus“, solange keine PayPal-Zugangsdaten gesetzt sind.

## Täglicher Job (Erinnerungen)

Einmal täglich, z. B. als Cronjob in mStudio:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://ihre-domain.de/api/cron/reminders
```

## Grenzen dieses Testbetriebs

- **Datenbank:** SQLite in einer Datei. Für einen Test ausreichend, für den Livebetrieb Postgres einplanen.
- **Uploads:** lokale Dateien. Backups von `DATA_DIR` und `STORAGE_DIR` selbst einrichten.
- **Mails:** Versand per SMTP (siehe oben). Ohne SMTP-Zugang werden Mails nur als Datei in `STORAGE_DIR/outbox` abgelegt, nicht verschickt; dann kann sich niemand registrieren.
- **PayPal:** Test-Modus. Für echte Zahlungen Sandbox-Zugangsdaten und Plan-IDs eintragen (`.env.example`).
- Nur eine App-Instanz betreiben (SQLite und lokale Dateien).
