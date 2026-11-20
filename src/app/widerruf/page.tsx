import { Legal } from '@/components/Legal';
import text from '@/legal/widerruf';
export const metadata = { title: 'Widerrufsbelehrung' };
export default function Page() { return <Legal title="Widerrufsbelehrung" text={text} />; }
