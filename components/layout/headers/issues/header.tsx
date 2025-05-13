import HeaderNav from './header-nav';
import HeaderOptions from './header-options';

export function IssuesHeader() {
   return (
      <div className="w-full flex flex-col items-center">
         <HeaderNav />
         <HeaderOptions />
      </div>
   );
}
