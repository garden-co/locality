'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useSearchStore } from '@/store/search-store';
import { Plus, SearchIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { CreateTeamModal } from '@/components/common/teams/create-team-modal';

interface HeaderNavProps {
   onSearch: (query: string) => void;
}

export default function HeaderNav({ onSearch }: HeaderNavProps) {
   const { isSearchOpen, toggleSearch, closeSearch, setSearchQuery, searchQuery } =
      useSearchStore();
   const searchInputRef = useRef<HTMLInputElement>(null);
   const searchContainerRef = useRef<HTMLDivElement>(null);
   const previousValueRef = useRef<string>('');

   useEffect(() => {
      // Focus the search input when search is opened
      if (isSearchOpen && searchInputRef.current) {
         searchInputRef.current.focus();
      }
   }, [isSearchOpen]);

   useEffect(() => {
      // Handle clicking outside of the search container
      const handleClickOutside = (event: MouseEvent) => {
         if (
            searchContainerRef.current &&
            !searchContainerRef.current.contains(event.target as Node) &&
            isSearchOpen
         ) {
            closeSearch();
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, [closeSearch, isSearchOpen]);

   // Update parent component when search query changes
   useEffect(() => {
      onSearch(searchQuery);
   }, [searchQuery, onSearch]);

   return (
      <div className="w-full flex justify-between items-center border-b py-1.5 px-6 h-10">
         <div className="flex items-center gap-2">
            <SidebarTrigger className="" />
            <div className="flex items-center gap-1">
               <span className="text-sm font-medium">Teams</span>
            </div>
         </div>

         <div className="flex items-center gap-2">
            {isSearchOpen ? (
               <div
                  ref={searchContainerRef}
                  className="relative flex items-center justify-center w-64 transition-all duration-200 ease-in-out"
               >
                  <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                     type="search"
                     ref={searchInputRef}
                     value={searchQuery}
                     onChange={(e) => {
                        previousValueRef.current = searchQuery;
                        const newValue = e.target.value;
                        setSearchQuery(newValue);
                        if (previousValueRef.current && newValue === '') {
                           closeSearch();
                        }
                     }}
                     placeholder="Search teams..."
                     className="pl-8 h-7 text-sm"
                     onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                           closeSearch();
                        }
                     }}
                  />
               </div>
            ) : (
               <>
                  <Button
                     variant="ghost"
                     size="icon"
                     onClick={toggleSearch}
                     className="h-8 w-8"
                     aria-label="Search"
                  >
                     <SearchIcon className="h-4 w-4" />
                  </Button>
                  <CreateTeamModal
                     trigger={
                        <Button className="relative" size="xs" variant="secondary">
                           <Plus className="size-4" />
                           Create
                        </Button>
                     }
                  />
               </>
            )}
         </div>
      </div>
   );
}
