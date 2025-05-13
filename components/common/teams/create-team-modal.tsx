'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PlusCircle, Heart } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useParams } from 'next/navigation';
import { createNewTeam, JazzAccount } from '@/lib/jazz-schema';
import { generateSlug } from '@/lib/utils';
import { useAccount } from 'jazz-react';
import { Group } from 'jazz-tools';

interface CreateTeamModalProps {
   trigger?: React.ReactNode;
}

export function CreateTeamModal({ trigger }: CreateTeamModalProps) {
   const params = useParams();
   const orgId = params.orgId as string;

   const [open, setOpen] = useState(false);
   const [createMore, setCreateMore] = useState(false);
   const [name, setName] = useState('');
   const [description, setDescription] = useState('');
   const [icon, setIcon] = useState('👥');
   const [color, setColor] = useState('#0ea5e9');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const { me } = useAccount({
      resolve: {
         root: {
            organizations: {
               $each: {
                  teams: {
                     $each: true,
                  },
               },
            },
         },
      },
   });

   const organizations = me?.root?.organizations;
   const organization = organizations?.find((org) => org?.slug === orgId);
   const teams = organization?.teams;

   const resetForm = () => {
      setName('');
      setDescription('');
      setIcon('👥');
      setColor('#0ea5e9');
   };

   const createTeam = async () => {
      setIsSubmitting(true);
      setError(null);

      if (!organization) {
         throw new Error('Organization not found');
      }

      try {
         if (!teams) {
            throw new Error('Could not access teams list');
         }

         // Validate team name
         if (!name.trim()) {
            throw new Error('Team name is required');
         }

         // Generate a slug from the name
         const teamSlug = generateSlug(name.trim());

         // Check if team with this slug already exists
         const existingTeam = teams.find((team) => team?.slug === teamSlug);
         if (existingTeam) {
            throw new Error('A team with this name already exists');
         }

         const { team: newTeam } = createNewTeam(JazzAccount.getMe(), {
            teamName: name.trim(),
            organizationGroup: organization._owner.castAs(Group),
            icon: icon,
            color: color,
         });

         // Add to teams list
         teams.push(newTeam);

         // Reset form if createMore is true, otherwise close modal
         if (createMore) {
            resetForm();
         } else {
            setOpen(false);
         }
      } catch (error) {
         console.error('Error creating team:', error);
         setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <Dialog open={open} onOpenChange={(value) => (value ? setOpen(true) : setOpen(false))}>
         <DialogTrigger asChild>
            {trigger || (
               <Button className="flex items-center gap-2">
                  <PlusCircle className="size-4" />
                  Create new team
               </Button>
            )}
         </DialogTrigger>
         <DialogContent
            title="Create New Team"
            className="w-full sm:max-w-[650px] p-0 shadow-xl top-[30%]"
         >
            <div className="flex items-center px-4 pt-4 gap-2">
               <Button size="sm" variant="outline" className="gap-1.5">
                  <Heart className="size-4 text-orange-500 fill-orange-500" />
                  <span className="font-medium">{orgId?.toUpperCase() || 'ORG'}</span>
               </Button>
            </div>

            {error && (
               <div className="mt-2 px-4">
                  <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-destructive text-sm">
                     {error}
                  </div>
               </div>
            )}

            <div className="px-4 pb-0 space-y-3 w-full">
               <Input
                  className="border-none w-full shadow-none outline-none text-2xl font-medium px-0 h-auto focus-visible:ring-0 overflow-hidden text-ellipsis whitespace-normal break-words"
                  placeholder="Team name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
               />

               <Textarea
                  className="border-none w-full shadow-none outline-none resize-none px-0 min-h-16 focus-visible:ring-0 break-words whitespace-normal overflow-wrap"
                  placeholder="Add description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
               />

               <div className="w-full flex flex-wrap gap-4">
                  <div className="space-y-2">
                     <Label htmlFor="icon">Team Icon</Label>
                     <Input
                        id="icon"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        placeholder="👥"
                        className="w-24"
                     />
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="color">Team Color</Label>
                     <div className="flex items-center gap-2">
                        <Input
                           type="color"
                           id="color"
                           value={color}
                           onChange={(e) => setColor(e.target.value)}
                           className="w-12 h-8 p-1"
                        />
                        <Input
                           id="colorHex"
                           value={color}
                           onChange={(e) => setColor(e.target.value)}
                           placeholder="#0ea5e9"
                           className="w-28"
                        />
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-between py-2.5 px-4 w-full border-t mt-4">
               <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2">
                     <Switch
                        id="create-more"
                        checked={createMore}
                        onCheckedChange={setCreateMore}
                     />
                     <Label htmlFor="create-more">Create more</Label>
                  </div>
               </div>
               <Button size="sm" onClick={createTeam} disabled={!name.trim() || isSubmitting}>
                  {isSubmitting ? 'Creating team...' : 'Create team'}
               </Button>
            </div>
         </DialogContent>
      </Dialog>
   );
}
