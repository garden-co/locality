import HeaderNav from './header-nav';

interface TeamsHeaderProps {
   // viewMode: ViewMode;
   // setViewMode: (mode: ViewMode) => void;
   onSearch: (query: string) => void;
}

export function TeamsHeader({ onSearch }: TeamsHeaderProps) {
   return (
      <div className="w-full flex flex-col items-center">
         <HeaderNav onSearch={onSearch} />
         {/* <HeaderOptions viewMode={viewMode} setViewMode={setViewMode} /> */}
      </div>
   );
}
