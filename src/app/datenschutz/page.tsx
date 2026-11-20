import { Legal } from '@/components/Legal';
import text from '@/legal/datenschutz';
export const metadata = { title: 'Datenschutzerklärung' };
export default function Page() { return <Legal title="Datenschutzerklärung" text={text} />; }
