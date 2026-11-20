import { consumeVerification } from '@/server/verify';
import { appUrl } from '@/server/paypal';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token') ?? '';
  const ok = token.length > 20 && consumeVerification(token);
  const target = ok ? '/anmelden?bestaetigt=1' : `/anmelden?fehler=${encodeURIComponent('Der Bestätigungslink ist ungültig oder abgelaufen. Sie können unten einen neuen anfordern.')}&neu=1`;
  return Response.redirect(new URL(target, appUrl()), 303);
}
