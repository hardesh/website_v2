import StructuredPage, { structuredMeta } from '@/components/StructuredPage';
import { pageMeta } from '@/lib/seo';

export const generateMetadata = () => pageMeta(structuredMeta('work'));

export default function Page() {
  return <StructuredPage slug="work" />;
}
