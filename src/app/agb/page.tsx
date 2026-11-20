import { Legal } from '@/components/Legal';
import text from '@/legal/agb';
export const metadata = { title: 'Allgemeine Geschäftsbedingungen' };
export default function Page() { return <Legal title="Allgemeine Geschäftsbedingungen" text={text} />; }
