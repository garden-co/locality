'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TeamColorPickerProps {
   initialColor: string;
   initialIcon: string;
   teamId: string;
   teamName: string;
   onColorChange: (color: string) => Promise<void>;
   onIconChange?: (icon: string) => Promise<void>;
}

export function TeamColorPicker({
   initialColor = '#0ea5e9',
   initialIcon = '👥',
   teamId,
   teamName,
   onColorChange,
   onIconChange,
}: TeamColorPickerProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [selectedColor, setSelectedColor] = useState(initialColor);
   const [selectedIcon, setSelectedIcon] = useState(initialIcon);
   const [isUpdating, setIsUpdating] = useState(false);

   useEffect(() => {
      setSelectedColor(initialColor);
      setSelectedIcon(initialIcon);
   }, [initialColor, initialIcon]);

   const handleUpdate = async () => {
      if (!teamId) return;

      setIsUpdating(true);
      try {
         // Update color
         await onColorChange(selectedColor);

         // Update icon if handler is provided
         if (onIconChange && selectedIcon !== initialIcon) {
            await onIconChange(selectedIcon);
         }

         toast.success('Team appearance updated successfully');
         setIsOpen(false);
      } catch (error) {
         toast.error('Failed to update team appearance');
         console.error('Error updating team appearance:', error);
      } finally {
         setIsUpdating(false);
      }
   };

   return (
      <>
         <div
            className="h-6 w-6 rounded-md flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-primary/50 transition-all"
            style={{ backgroundColor: initialColor }}
            onClick={() => setIsOpen(true)}
            title="Click to change team appearance"
         >
            <span className="text-sm">{initialIcon}</span>
         </div>

         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                  <DialogTitle>Change Team Appearance for {teamName}</DialogTitle>
               </DialogHeader>
               <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                     <Label htmlFor="teamColor">Team Color</Label>
                     <div className="flex items-center gap-2">
                        <Input
                           type="color"
                           id="teamColor"
                           value={selectedColor}
                           onChange={(e) => setSelectedColor(e.target.value)}
                           className="w-12 h-8 p-1"
                        />
                        <Input
                           id="colorHex"
                           value={selectedColor}
                           onChange={(e) => setSelectedColor(e.target.value)}
                           placeholder="#0ea5e9"
                           className="w-28"
                        />
                        <div
                           className="h-8 w-8 rounded-md flex items-center justify-center flex-shrink-0"
                           style={{ backgroundColor: selectedColor }}
                        >
                           <span className="text-base">{selectedIcon}</span>
                        </div>
                     </div>
                  </div>

                  {onIconChange && (
                     <div className="space-y-2">
                        <Label htmlFor="teamIcon">Team Icon</Label>
                        <Input
                           id="teamIcon"
                           value={selectedIcon}
                           onChange={(e) => setSelectedIcon(e.target.value)}
                           placeholder="👥"
                           className="w-full"
                        />
                     </div>
                  )}
               </div>
               <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                     Cancel
                  </Button>
                  <Button onClick={handleUpdate} disabled={isUpdating}>
                     {isUpdating ? 'Updating...' : 'Update Appearance'}
                  </Button>
               </div>
            </DialogContent>
         </Dialog>
      </>
   );
}
