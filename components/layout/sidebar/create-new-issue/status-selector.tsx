'use client';

import { Button } from '@/components/ui/button';
import {
   Command,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StatusType } from '@/lib/jazz-schema';
// import { useIssuesStore } from '@/store/issues-store';
import { status as allStatus } from '@/lib/status';
import { CheckIcon } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

interface StatusSelectorProps {
   status: typeof StatusType;
   onChange: (status: typeof StatusType) => void;
}

export function StatusSelector({ status, onChange }: StatusSelectorProps) {
   const id = useId();
   const [open, setOpen] = useState<boolean>(false);
   const [value, setValue] = useState<string>(status);

   // const { filterByStatus } = useIssuesStore();

   useEffect(() => {
      setValue(status);
   }, [status]);

   const handleStatusChange = (statusType: typeof StatusType) => {
      setValue(statusType);
      setOpen(false);

      const newStatus = allStatus.find((s) => s.type === statusType);
      if (newStatus) {
         onChange(statusType);
      }
   };

   return (
      <div className="*:not-first:mt-2">
         <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
               <Button
                  id={id}
                  className="flex items-center justify-center"
                  size="xs"
                  variant="secondary"
                  role="combobox"
                  aria-expanded={open}
               >
                  {(() => {
                     const selectedItem = allStatus.find((item) => item.type === value);
                     if (selectedItem) {
                        const Icon = selectedItem.icon;
                        return <Icon />;
                     }
                     return null;
                  })()}
                  <span>{value ? allStatus.find((s) => s.type === value)?.name : 'To do'}</span>
               </Button>
            </PopoverTrigger>
            <PopoverContent
               className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
               align="start"
            >
               <Command>
                  <CommandInput placeholder="Set status..." />
                  <CommandList>
                     <CommandEmpty>No status found.</CommandEmpty>
                     <CommandGroup>
                        {allStatus.map((item) => (
                           <CommandItem
                              key={item.type}
                              value={item.type}
                              onSelect={() => handleStatusChange(item.type as typeof StatusType)}
                              className="flex items-center justify-between"
                           >
                              <div className="flex items-center gap-2">
                                 <item.icon />
                                 {item.name}
                              </div>
                              {value === item.type && <CheckIcon size={16} className="ml-auto" />}
                              <span className="text-muted-foreground text-xs">
                                 {/* {filterByStatus(item.id).length} */}
                                 {item.type}
                              </span>
                           </CommandItem>
                        ))}
                     </CommandGroup>
                  </CommandList>
               </Command>
            </PopoverContent>
         </Popover>
      </div>
   );
}
