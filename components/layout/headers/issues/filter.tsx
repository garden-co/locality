'use client';

import { Button } from '@/components/ui/button';
import { ListFilter, X } from 'lucide-react';
import { useSearchStore } from '@/store/search-store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StatusSelector } from '@/components/layout/sidebar/create-new-issue/status-selector';
import { PrioritySelector } from '@/components/layout/sidebar/create-new-issue/priority-selector';
import { AssigneeSelector } from '@/components/layout/sidebar/create-new-issue/assignee-selector';
import { LabelSelector } from '@/components/layout/sidebar/create-new-issue/label-selector';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { Label, LabelList, UserProfile } from '@/lib/jazz-schema';

interface FilterProps {
   users?: UserProfile[];
   labels?: LabelList;
   onOpenChange?: (open: boolean) => void;
}

export function Filter({ users = [], labels, onOpenChange }: FilterProps) {
   const {
      isFilterOpen,
      filters,
      setStatusFilter,
      setPriorityFilter,
      setAssigneeFilter,
      setLabelsFilter,
      resetFilters,
   } = useSearchStore();

   const [activeFilterCount, setActiveFilterCount] = useState(0);

   // Calculate active filter count whenever filters change
   useEffect(() => {
      let count = 0;
      if (filters.status) count++;
      if (filters.priority) count++;
      if (filters.assignee) count++;
      if (filters.labels && filters.labels.length > 0) count++;
      setActiveFilterCount(count);
   }, [filters]);

   return (
      <div className="flex items-center">
         <Popover open={isFilterOpen} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
               <Button
                  size="xs"
                  variant={activeFilterCount > 0 ? 'default' : 'ghost'}
                  className="flex gap-1"
               >
                  <ListFilter className="size-4" />
                  Filter
                  {activeFilterCount > 0 && (
                     <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                        {activeFilterCount}
                     </Badge>
                  )}
               </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="start" sideOffset={8}>
               <div className="space-y-4 py-2">
                  <div className="flex justify-between items-center">
                     <h3 className="font-medium">Filters</h3>
                     {activeFilterCount > 0 && (
                        <Button
                           variant="ghost"
                           size="xs"
                           onClick={resetFilters}
                           className="text-xs h-7"
                        >
                           <X className="size-3 mr-1" />
                           Clear all
                        </Button>
                     )}
                  </div>

                  <div className="filter-selectors">
                     <h4 className="text-xs font-medium text-muted-foreground mb-1">Status</h4>
                     <StatusSelector
                        status={filters.status || 'backlog'}
                        onChange={setStatusFilter}
                     />
                  </div>

                  <div className="filter-selectors">
                     <h4 className="text-xs font-medium text-muted-foreground mb-1">Priority</h4>
                     <PrioritySelector
                        priority={filters.priority || 'no-priority'}
                        onChange={setPriorityFilter}
                     />
                  </div>

                  <div className="filter-selectors">
                     <h4 className="text-xs font-medium text-muted-foreground mb-1">Assignee</h4>
                     <AssigneeSelector
                        assignee={filters.assignee}
                        users={users}
                        onChange={setAssigneeFilter}
                     />
                  </div>

                  <div className="filter-selectors">
                     <h4 className="text-xs font-medium text-muted-foreground mb-1">Labels</h4>
                     {labels && (
                        <LabelSelector
                           availableLabels={labels}
                           selectedLabels={
                              filters.labels ? LabelList.create(filters.labels as Label[]) : null
                           }
                           onChange={(newLabels) => {
                              if (newLabels) {
                                 const labelArray = [...newLabels].filter(Boolean) as Label[];
                                 setLabelsFilter(labelArray);
                              } else {
                                 setLabelsFilter(undefined);
                              }
                           }}
                        />
                     )}
                  </div>
               </div>
            </PopoverContent>
         </Popover>
      </div>
   );
}
