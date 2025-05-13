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
import { ChevronDown, CheckIcon } from 'lucide-react';
import { useId, useState, useEffect } from 'react';
import { Team } from '@/lib/jazz-schema';

interface TeamSelectorProps {
   teams: readonly (Team | null)[];
   team: Team | null | undefined;
   onChange: (team: Team) => void;
}

export function TeamSelector({ teams, team, onChange }: TeamSelectorProps) {
   const id = useId();
   const [open, setOpen] = useState<boolean>(false);
   const [value, setValue] = useState<Team | null | undefined>(team);

   useEffect(() => {
      setValue(team);
   }, [team]);

   const handleTeamChange = (selectedTeam: Team) => {
      setValue(selectedTeam);
      onChange(selectedTeam);
      setOpen(false);
   };

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger asChild>
            <Button
               id={id}
               size="sm"
               variant="outline"
               className="gap-1.5"
               role="combobox"
               aria-expanded={open}
            >
               {value ? (
                  <div className="flex items-center gap-2">
                     <span
                        className="flex items-center justify-center size-6 rounded-md"
                        style={{
                           backgroundColor: value.color ? `${value.color}` : 'var(--primary-10)',
                        }}
                     >
                        {value.icon}
                     </span>
                     <span className="font-medium">{value.name}</span>
                  </div>
               ) : (
                  <span className="font-medium">Select team</span>
               )}
               <ChevronDown className="size-3 opacity-50" />
            </Button>
         </PopoverTrigger>
         <PopoverContent className="border-input w-[220px] p-0" align="start">
            <Command>
               <CommandInput placeholder="Select team..." />
               <CommandList>
                  <CommandEmpty>No teams found.</CommandEmpty>
                  <CommandGroup>
                     {teams?.map(
                        (teamItem) =>
                           teamItem && (
                              <CommandItem
                                 key={String(teamItem.id)}
                                 value={teamItem.name}
                                 onSelect={() => handleTeamChange(teamItem)}
                                 className="flex items-center justify-between"
                              >
                                 <div className="flex items-center gap-2">
                                    <span
                                       className="flex items-center justify-center size-6 rounded-md"
                                       style={{
                                          backgroundColor: teamItem?.color
                                             ? `${teamItem.color}`
                                             : 'var(--primary-10)',
                                       }}
                                    >
                                       {teamItem?.icon}
                                    </span>
                                    {teamItem.name}
                                 </div>
                                 {value?.id === teamItem.id && (
                                    <CheckIcon size={16} className="ml-auto" />
                                 )}
                              </CommandItem>
                           )
                     )}
                  </CommandGroup>
               </CommandList>
            </Command>
         </PopoverContent>
      </Popover>
   );
}
