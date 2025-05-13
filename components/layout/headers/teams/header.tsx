import HeaderNav from './header-nav';
import HeaderOptions, { ViewMode } from './header-options';

interface TeamsHeaderProps {
   viewMode: ViewMode;
   setViewMode: (mode: ViewMode) => void;
   onSearch: (query: string) => void;
}

export function TeamsHeader({ viewMode, setViewMode, onSearch }: TeamsHeaderProps) {
   return (
      <div className="w-full flex flex-col items-center">
         <HeaderNav onSearch={onSearch} />
         <HeaderOptions viewMode={viewMode} setViewMode={setViewMode} />
      </div>
   );
}
