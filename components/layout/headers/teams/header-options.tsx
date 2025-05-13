'use client';

import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type ViewMode = 'all' | 'joined' | 'not-joined';

interface HeaderOptionsProps {
   viewMode: ViewMode;
   setViewMode: (mode: ViewMode) => void;
}

export default function HeaderOptions({ viewMode, setViewMode }: HeaderOptionsProps) {
   return (
      <div className="w-full flex justify-end items-center border-b py-1.5 px-6 h-10">
         {/* <Button size="xs" variant="ghost">
            <ListFilter className="size-4 mr-1" />
            Filter
         </Button> */}
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button className="relative" size="xs" variant="secondary">
                  <SlidersHorizontal className="size-4 mr-1" />
                  Display
                  {viewMode !== 'all' && (
                     <span className="absolute right-0 top-0 w-2 h-2 bg-orange-500 rounded-full" />
                  )}
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 p-1" align="end">
               <DropdownMenuItem
                  onClick={() => setViewMode('all')}
                  className={cn('w-full text-xs', viewMode === 'all' ? 'bg-accent' : '')}
               >
                  All Teams
               </DropdownMenuItem>
               <DropdownMenuItem
                  onClick={() => setViewMode('joined')}
                  className={cn('w-full text-xs', viewMode === 'joined' ? 'bg-accent' : '')}
               >
                  Joined Teams
               </DropdownMenuItem>
               <DropdownMenuItem
                  onClick={() => setViewMode('not-joined')}
                  className={cn('w-full text-xs', viewMode === 'not-joined' ? 'bg-accent' : '')}
               >
                  Not Joined Teams
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      </div>
   );
}
