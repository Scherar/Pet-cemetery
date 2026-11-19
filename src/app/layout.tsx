import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { currentUser } from '@/server/auth';
import { logout } from './actions';
import { de } from '@/i18n/de';

export const metadata: Metadata = {
  title: { default: de.brand, template: `%s · ${de.brand}` }, description: de.tagline,
  metadataBase: new URL(process.env.APP_URL ?? 'http://localhost:3000'),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  return (
    <html lang="de">
      <body className="min-h-screen">
        <a href="#inhalt" className="sr-only focus:not-sr-only">Zum Inhalt springen</a>
        <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/" className="font-serif text-xl">{de.brand}</Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm" aria-label="Hauptnavigation">
            {u ? (<>
              <Link href="/konto" className="underline">Mein Bereich</Link>
              {u.isAdmin && <Link href="/admin" className="underline">Prüfung</Link>}
              <form action={logout}><button className="underline">Abmelden</button></form>
            </>) : (<>
              <Link href="/anmelden" className="underline">Anmelden</Link>
              <Link href="/registrieren" className="btn">Registrieren</Link>
            </>)}
          </nav>
        </header>
        <main id="inhalt" className="mx-auto max-w-5xl px-4 pb-16">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 pb-10 text-sm text-[var(--muted)]">
          <p>{de.fictionNote}</p>
          <p className="mt-2 flex gap-4">
            <Link href="/impressum">Impressum</Link><Link href="/datenschutz">Datenschutz</Link><Link href="/agb">AGB</Link><Link href="/widerruf">Widerruf</Link>
          </p>
        </footer>
      </body>
    </html>
  );
}
