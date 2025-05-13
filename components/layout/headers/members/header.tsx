import HeaderNav from './header-nav';
import HeaderOptions from './header-options';
import { Group } from 'jazz-tools';

export default function Header({ members }: { members: Group['members'] | undefined }) {
   return (
      <div className="w-full flex flex-col items-center">
         <HeaderNav members={members} />
         <HeaderOptions />
      </div>
   );
}
