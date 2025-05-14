'use client';

import { Button } from '@/components/ui/button';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useViewStore, ViewType } from '@/store/view-store';
import { LayoutGrid, LayoutList, SlidersHorizontal } from 'lucide-react';
import { Filter } from './filter';
import { Organization, UserProfile } from '@/lib/jazz-schema';
import { useCoState } from 'jazz-react';
import { useMemo } from 'react';
import { useSearchStore } from '@/store/search-store';

export default function HeaderOptions({
   organization,
}: {
   organization: Organization | undefined;
}) {
   const { viewType, setViewType } = useViewStore();
   const { openFilter, closeFilter } = useSearchStore();

   const handleViewChange = (type: ViewType) => {
      setViewType(type);
   };

   // Load organization with teams and their issues to get all assignees
   const orgWithTeams = useCoState(Organization, organization?.id, {
      resolve: {
         teams: {
            $each: {
               issues: {
                  $each: {
                     assignee: true,
                  },
               },
            },
         },
      },
   });

   // Get users and labels from organization for filter selectors
   const issueOwnerUsers = useMemo(() => {
      if (!orgWithTeams || !orgWithTeams.teams) return [];

      // Collect all unique assignee profiles from all issues
      const profiles: UserProfile[] = [];
      const profileIds = new Set<string>();

      orgWithTeams.teams.forEach((team) => {
         if (team?.issues) {
            team.issues.forEach((issue) => {
               if (issue?.assignee && !profileIds.has(issue.assignee.id)) {
                  profileIds.add(issue.assignee.id);
                  profiles.push(issue.assignee);
               }
            });
         }
      });

      return profiles;
   }, [orgWithTeams]);

   const handleFilterOpenChange = (open: boolean) => {
      // Directly control the filter state based on the requested state
      if (open) {
         openFilter();
      } else {
         closeFilter();
      }
   };

   return (
      <div className="w-full flex justify-between items-center border-b py-1.5 px-6 h-10">
         <Filter
            users={issueOwnerUsers}
            labels={organization?.labels || undefined}
            onOpenChange={handleFilterOpenChange}
         />
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button className="relative" size="xs" variant="secondary">
                  <SlidersHorizontal className="size-4 mr-1" />
                  Display
                  {viewType === 'grid' && (
                     <span className="absolute right-0 top-0 w-2 h-2 bg-orange-500 rounded-full" />
                  )}
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 flex p-3 gap-2" align="end">
               <DropdownMenuItem
                  onClick={() => handleViewChange('list')}
                  className={cn(
                     'w-full text-xs border border-accent flex flex-col gap-1',
                     viewType === 'list' ? 'bg-accent' : ''
                  )}
               >
                  <LayoutList className="size-4" />
                  List
               </DropdownMenuItem>
               <DropdownMenuItem
                  onClick={() => handleViewChange('grid')}
                  className={cn(
                     'w-full text-xs border border-accent flex flex-col gap-1',
                     viewType === 'grid' ? 'bg-accent' : ''
                  )}
               >
                  <LayoutGrid className="size-4" />
                  Board
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      </div>
   );
}
