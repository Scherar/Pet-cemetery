import { runReminders } from '@/server/reminders';

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return new Response('Nicht erlaubt', { status: 401 });
  return Response.json(await runReminders());
}
