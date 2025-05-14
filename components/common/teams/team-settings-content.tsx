'use client';

import { useCoState } from 'jazz-react';
import { Organization } from '@/lib/jazz-schema';
import { TeamColorPicker } from '@/components/common/teams/team-color-picker';
import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TeamSettingsContentProps {
   organization: Organization;
   teamId: string;
}

export default function TeamSettingsContent({ organization, teamId }: TeamSettingsContentProps) {
   const [isEditingName, setIsEditingName] = useState(false);
   const [isEditingSlug, setIsEditingSlug] = useState(false);
   const [editedName, setEditedName] = useState('');
   const [editedSlug, setEditedSlug] = useState('');
   const [isSaving, setIsSaving] = useState(false);

   // Deeply load the organization with teams using useCoState
   const orgWithData = useCoState(Organization, organization.id, {
      resolve: {
         teams: {
            $each: true, // Deeply load all teams
         },
      },
   });

   // Find the team with the matching slug - Call useMemo before conditionals
   const team = useMemo(() => {
      if (orgWithData === undefined || orgWithData === null) return null;
      return orgWithData.teams?.find((team) => team?.slug === teamId);
   }, [orgWithData, teamId]);

   // Setup form values when team data changes - Call useEffect before conditionals
   useEffect(() => {
      if (team) {
         setEditedName(team.name);
         setEditedSlug(team.slug);
      }
   }, [team]);

   // Handle loading states
   if (orgWithData === undefined)
      return (
         <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400"></div>
         </div>
      );

   if (orgWithData === null)
      return (
         <div className="flex items-center justify-center h-screen">
            <div className="text-white/50">Organization not found or access denied</div>
         </div>
      );

   // If the team doesn't exist, show not found message
   if (!team)
      return (
         <div className="flex items-center justify-center h-screen">
            <div className="text-white/50">Team not found</div>
         </div>
      );

   const handleColorChange = async (newColor: string) => {
      team.color = newColor;
   };

   const handleIconChange = async (newIcon: string) => {
      team.icon = newIcon;
   };

   const handleSaveChanges = async () => {
      // Validate inputs
      if (isEditingName && !editedName.trim()) {
         toast.error('Team name cannot be empty');
         return;
      }

      if (isEditingSlug) {
         if (!editedSlug.trim()) {
            toast.error('Team identifier cannot be empty');
            return;
         }

         const slugRegex = /^[a-z0-9-]+$/;
         if (!slugRegex.test(editedSlug)) {
            toast.error('Identifier must contain only lowercase letters, numbers, and hyphens');
            return;
         }
      }

      setIsSaving(true);
      try {
         if (isEditingName) team.name = editedName;
         if (isEditingSlug) {
            team.slug = editedSlug;
         }

         toast.success('Team updated successfully');
         setIsEditingName(false);
         setIsEditingSlug(false);
      } catch (error) {
         toast.error('Failed to update team');
         console.error(error);
      } finally {
         setIsSaving(false);
      }
   };

   const cancelEditing = () => {
      setEditedName(team.name);
      setEditedSlug(team.slug);
      setIsEditingName(false);
      setIsEditingSlug(false);
   };

   const isEditing = isEditingName || isEditingSlug;

   const handleDeleteTeam = () => {
      team.deleted = true;
      toast.success('Team deleted successfully');
   };

   return (
      <div className="max-w-[900px] mx-auto py-10 px-6">
         <header className="mb-10">
            <h1 className="text-2xl font-bold">{team.name}</h1>
         </header>

         <div className="border rounded-md mb-8">
            <div className="flex items-center justify-between border-b p-4">
               <div className="flex-1">
                  <h2 className="text-sm font-medium">Icon & Name</h2>
               </div>
               <div className="flex-1">
                  <h2 className="text-sm font-medium">Identifier</h2>
               </div>
               {isEditing && <div className="w-24"></div>}
            </div>
            <div className="flex items-center justify-between p-4">
               <div className="flex-1 flex items-center">
                  <TeamColorPicker
                     initialColor={team.color || '#e91e63'}
                     initialIcon={team.icon || '👥'}
                     teamId={team.id}
                     teamName={team.name}
                     onColorChange={handleColorChange}
                     onIconChange={handleIconChange}
                  />
                  {isEditingName ? (
                     <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-sm ml-2 h-7 py-1 w-40"
                     />
                  ) : (
                     <span
                        className="text-sm ml-2 cursor-pointer hover:underline"
                        onClick={() => setIsEditingName(true)}
                        title="Click to edit team name"
                     >
                        {team.name}
                     </span>
                  )}
               </div>
               <div className="flex-1">
                  {isEditingSlug ? (
                     <Input
                        value={editedSlug}
                        onChange={(e) => setEditedSlug(e.target.value.toLowerCase())}
                        className="text-sm h-7 py-1 w-32"
                        autoFocus={!isEditingName}
                        placeholder="team-identifier"
                     />
                  ) : (
                     <span
                        className="text-sm text-muted-foreground cursor-pointer hover:underline"
                        onClick={() => setIsEditingSlug(true)}
                        title="Click to edit team identifier"
                     >
                        {team.slug}
                     </span>
                  )}
               </div>
               {isEditing && (
                  <div className="w-24 flex justify-end gap-1">
                     <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        className="h-7 text-xs"
                     >
                        {isSaving ? 'Saving...' : 'Save'}
                     </Button>
                     <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditing}
                        className="h-7 text-xs"
                     >
                        Cancel
                     </Button>
                  </div>
               )}
            </div>
         </div>

         <section className="mt-12">
            <h2 className="text-lg font-semibold text-destructive mb-4">Danger zone</h2>

            <div className="space-y-4">
               <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center">
                     <div className="text-sm font-medium">Delete team</div>
                     <Button variant="destructive" size="sm" onClick={handleDeleteTeam}>
                        Delete team...
                     </Button>
                  </div>
               </div>
            </div>
         </section>
      </div>
   );
}
