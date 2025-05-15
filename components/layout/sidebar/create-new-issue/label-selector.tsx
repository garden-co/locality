'use client';

import { Button } from '@/components/ui/button';
import {
   Command,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
   CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckIcon, PlusIcon, TagIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/lib/utils';
import { Label, LabelList } from '@/lib/jazz-schema';
import {
   Dialog,
   DialogContent,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface LabelSelectorProps {
   availableLabels: LabelList;
   selectedLabels: LabelList | null;
   onChange: (labels: LabelList) => void;
   onCreateLabel?: (label: typeof Label.prototype) => void;
}

export function LabelSelector({
   availableLabels,
   selectedLabels,
   onChange,
   onCreateLabel,
}: LabelSelectorProps) {
   const id = useId();
   const [open, setOpen] = useState<boolean>(false);
   const [newLabelDialog, setNewLabelDialog] = useState<boolean>(false);
   const [newLabelName, setNewLabelName] = useState<string>('');
   const [newLabelColor, setNewLabelColor] = useState<string>('#3b82f6');

   const handleLabelToggle = (label: typeof Label.prototype) => {
      // Create a new LabelList if selectedLabels is null
      const currentLabels = selectedLabels || LabelList.create([], availableLabels._owner);

      const isSelected = currentLabels.some((l) => l?.id === label?.id);
      const newLabels = LabelList.create([], availableLabels._owner);

      if (isSelected) {
         // Remove the label
         currentLabels
            .filter((l) => l?.id !== label?.id)
            .forEach((l) => {
               if (l) newLabels.push(l);
            });
      } else {
         // Add the label
         currentLabels.forEach((l) => {
            if (l) newLabels.push(l);
         });
         newLabels.push(label);
      }

      onChange(newLabels);
   };

   const handleCreateLabel = () => {
      if (!newLabelName.trim()) {
         toast.error('Label name is required');
         return;
      }

      // Create new label instance
      const newLabel = Label.create(
         {
            name: newLabelName,
            color: newLabelColor,
         },
         availableLabels._owner
      );

      // Add to organization labels via callback
      if (onCreateLabel) {
         onCreateLabel(newLabel);
      }

      // Add to selected labels
      const currentLabels = selectedLabels || LabelList.create([], availableLabels._owner);
      const newLabels = LabelList.create([], availableLabels._owner);

      currentLabels.forEach((l) => {
         if (l) newLabels.push(l);
      });

      newLabels.push(newLabel);
      onChange(newLabels);

      // Reset form and close dialog
      setNewLabelName('');
      setNewLabelColor('#3b82f6');
      setNewLabelDialog(false);
      toast.success('New label created');
   };

   return (
      <div className="*:not-first:mt-2">
         <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
               <Button
                  id={id}
                  className={cn(
                     'flex items-center justify-center',
                     (!selectedLabels || selectedLabels.length === 0) && 'size-7'
                  )}
                  size={selectedLabels && selectedLabels.length > 0 ? 'xs' : 'icon'}
                  variant="secondary"
                  role="combobox"
                  aria-expanded={open}
               >
                  <TagIcon className="size-4" />
                  {selectedLabels && selectedLabels.length > 0 && (
                     <div className="flex -space-x-0.5">
                        {selectedLabels.map((label) => (
                           <div
                              key={label?.id}
                              className={`size-3 rounded-full`}
                              style={{ backgroundColor: label?.color }}
                           />
                        ))}
                     </div>
                  )}
               </Button>
            </PopoverTrigger>
            <PopoverContent
               className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
               align="start"
            >
               <Command>
                  <CommandInput placeholder="Search labels..." />
                  <CommandList>
                     <CommandEmpty>
                        <div className="flex flex-col items-center justify-center py-4 gap-2">
                           <p>No labels found.</p>
                           <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                 setNewLabelDialog(true);
                                 setOpen(false);
                              }}
                           >
                              <PlusIcon className="size-4 mr-2" />
                              Create new label
                           </Button>
                        </div>
                     </CommandEmpty>
                     <CommandGroup>
                        {availableLabels.map((label) => {
                           if (!label) return null;
                           const isSelected =
                              selectedLabels?.some((l) => l?.id === label?.id) ?? false;
                           return (
                              <CommandItem
                                 key={label?.id}
                                 value={label?.name}
                                 onSelect={() => handleLabelToggle(label)}
                                 className="flex items-center justify-between"
                              >
                                 <div className="flex items-center gap-2">
                                    <div
                                       className={`size-3 rounded-full`}
                                       style={{ backgroundColor: label.color }}
                                    />
                                    <span>{label.name}</span>
                                 </div>
                                 {isSelected && <CheckIcon size={16} className="ml-auto" />}
                              </CommandItem>
                           );
                        })}
                     </CommandGroup>
                     <CommandSeparator />
                     <CommandGroup>
                        <CommandItem
                           onSelect={() => {
                              setNewLabelDialog(true);
                              setOpen(false);
                           }}
                        >
                           <div className="flex items-center gap-2">
                              <PlusIcon className="size-4" />
                              <span>Create new label</span>
                           </div>
                        </CommandItem>
                     </CommandGroup>
                  </CommandList>
               </Command>
            </PopoverContent>
         </Popover>

         <Dialog open={newLabelDialog} onOpenChange={setNewLabelDialog}>
            <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                  <DialogTitle>Create New Label</DialogTitle>
               </DialogHeader>
               <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                     <Input
                        placeholder="Label name"
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        className="col-span-3"
                     />
                     <div className="flex gap-2 items-center">
                        <div
                           className="size-6 rounded-full border border-gray-300"
                           style={{ backgroundColor: newLabelColor }}
                        />
                        <Input
                           type="color"
                           value={newLabelColor}
                           onChange={(e) => setNewLabelColor(e.target.value)}
                           className="w-10 h-8 p-0 cursor-pointer"
                        />
                     </div>
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setNewLabelDialog(false)}>
                     Cancel
                  </Button>
                  <Button onClick={handleCreateLabel}>Create</Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
