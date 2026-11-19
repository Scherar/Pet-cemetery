# Test-Betrieb auf mittwald (HTTPS)

Stand: v1. Nur die Schritte, die in diesem Projekt nachgeprüft wurden, sind als geprüft markiert. Die Oberfläche von mStudio kann sich ändern; maßgeblich ist die Doku von mittwald:
[Node.js-Anwendungen](https://developer.mittwald.de/docs/v2/platform/workloads/nodejs/) · [Webserver](https://developer.mittwald.de/docs/v2/platform/workloads/webservers/)

## Prinzip: HTTPS und Port

Die App lauscht auf **einfachem HTTP** an dem Port aus der Umgebungsvariable `PORT`. **HTTPS (Port 443) und das Zertifikat übernimmt mittwald** vor der App. Die App selbst braucht kein Zertifikat und muss nicht auf 443 laufen.

Geprüft: `PORT=8080 npm start` startet die App im Produktionsmodus auf dem gewünschten Port; Daten und Uploads liegen in `DATA_DIR` und `STORAGE_DIR`.

## Voraussetzungen

- **Node.js 22.13 oder neuer** (wegen `node:sqlite`). Ob Ihr Tarif/Ihre Umgebung das anbietet, bitte in mStudio prüfen. Mit Node 20 startet die App nicht. Alternative: Container-Betrieb (siehe unten).
- Eine Domain/Subdomain mit HTTPS auf dem Projekt.

## Variante A: Node.js-App in mStudio

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
   ```
   `DATA_DIR` und `STORAGE_DIR` müssen **außerhalb** des Programmordners liegen, sonst gehen Datenbank und Uploads bei einem neuen Deployment verloren.
3. Startbefehl: `npm start`.
4. Domain auf die App legen (Ingress/Proxy auf den App-Port), HTTPS aktivieren.

## Variante B: Container

Es gibt ein `Dockerfile` (Node 22). Es lauscht auf Port 3000 und erwartet zwei Volumes: `/data` (Datenbank) und `/storage` (Uploads). Die Umgebungsvariablen wie oben, `PORT=3000`. In mStudio den Container-Port 3000 mit der Domain verbinden und die beiden Volumes einrichten.
Nicht geprüft: Der Image-Build wurde hier nicht ausgeführt.

## Nach dem Start prüfen

- `https://ihre-domain.de/` lädt, Schloss im Browser vorhanden.
- Registrieren, anmelden (Cookies sind im Produktionsmodus „secure“, funktionieren also nur über HTTPS).
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
- **Mails:** werden nur als Datei in `STORAGE_DIR/outbox` abgelegt, nicht verschickt (Mail-Anbieter fehlt noch).
- **PayPal:** Test-Modus. Für echte Zahlungen Sandbox-Zugangsdaten und Plan-IDs eintragen (`.env.example`).
- Nur eine App-Instanz betreiben (SQLite und lokale Dateien).
