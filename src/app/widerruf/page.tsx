import { de } from '@/i18n/de';
export const metadata = { title: 'Widerrufsbelehrung' };
export default function Page() {
  return (<article className="card mx-auto mt-6 max-w-2xl space-y-3 p-6"><h1 className="font-serif text-2xl">Widerrufsbelehrung</h1><p>{de.legal}</p></article>);
}
