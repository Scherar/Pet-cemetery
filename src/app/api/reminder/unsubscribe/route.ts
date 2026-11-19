import { run } from '@/server/db';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token');
  if (token) run('UPDATE graves SET remind = 0, remind_confirmed = 0 WHERE remind_token = ?', token);
  return new Response('Die Erinnerung wurde abbestellt.', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
