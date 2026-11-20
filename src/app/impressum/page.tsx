import { Legal } from '@/components/Legal';
import text from '@/legal/impressum';
export const metadata = { title: 'Impressum' };
export default function Page() { return <Legal title="Impressum" text={text} />; }
