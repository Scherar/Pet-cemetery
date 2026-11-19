import { run, get } from '@/server/db';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token');
  if (!token || !get('SELECT 1 FROM graves WHERE remind_token = ?', token)) return new Response('Link ungültig.', { status: 400 });
  run('UPDATE graves SET remind_confirmed = 1, remind = 1 WHERE remind_token = ?', token);
  return new Response('Danke, die Erinnerung ist bestätigt.', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
