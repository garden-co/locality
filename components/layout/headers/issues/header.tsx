import HeaderNav from './header-nav';
import HeaderOptions from './header-options';
import { Organization } from '@/lib/jazz-schema';

export function IssuesHeader({ organization }: { organization: Organization | undefined }) {
   return (
      <div className="w-full flex flex-col items-center">
         <HeaderNav />
         <HeaderOptions organization={organization} />
      </div>
   );
}
