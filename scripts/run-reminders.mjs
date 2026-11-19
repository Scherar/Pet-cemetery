// Täglich per Cron aufrufen (z. B. 08:00 Europe/Berlin):
// curl -H "Authorization: Bearer $CRON_SECRET" $APP_URL/api/cron/reminders
const url = `${process.env.APP_URL ?? 'http://localhost:3000'}/api/cron/reminders`;
const r = await fetch(url, { headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` } });
console.log(r.status, await r.text());
