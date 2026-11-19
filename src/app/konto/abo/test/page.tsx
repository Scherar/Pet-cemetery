import { notFound } from 'next/navigation';
import { mockActivate } from '@/app/actions';

export default function Page() {
  if (process.env.PAYPAL_CLIENT_ID) notFound();
  return (
    <form action={mockActivate} className="card mx-auto mt-6 max-w-md space-y-3 p-6">
      <h1 className="font-serif text-2xl">Test-Zahlung</h1>
      <p>Nur für die Entwicklung: simuliert die Freigabe bei PayPal.</p>
      <button className="btn">Zahlung bestätigen</button>
    </form>
  );
}
