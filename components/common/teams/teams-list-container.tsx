'use client';

import { useCoState } from 'jazz-react';
import { Organization, TeamList } from '@/lib/jazz-schema';
import { ViewMode } from '@/components/layout/headers/teams/header-options';
import Teams from '@/components/common/teams/teams';
import { useMemo } from 'react';
import { Group } from 'jazz-tools';
import { getThreeLettersFromString } from '@/lib/utils';

interface TeamsListContainerProps {
   organization: Organization;
   viewMode: ViewMode;
   searchQuery: string;
   currentUserId?: string;
}

export default function TeamsListContainer({
   organization,
   viewMode,
   searchQuery,
   currentUserId,
}: TeamsListContainerProps) {
   // Deeply load the organization with teams using useCoState
   const orgWithData = useCoState(Organization, organization.id, {
      resolve: {
         teams: {
            $each: true, // Deeply load all teams
         },
      },
   });

   // Filter teams based on viewMode and searchQuery
   const filteredTeams = useMemo(() => {
      if (orgWithData === undefined || orgWithData === null || !orgWithData.teams) {
         return undefined;
      }

      return orgWithData.teams.filter((team) => {
         if (!team) return false;

         const members = team._owner.castAs(Group).members;
         const isUserMember = members?.some((member) => member.id === currentUserId) || false;

         // Search filter - case insensitive search on name, slug, and identifier
         const teamName = team.name?.toLowerCase() || '';
         const teamSlug = team.slug?.toLowerCase() || '';
         const teamIdentifier = getThreeLettersFromString(teamSlug).toLowerCase();
         const searchLower = searchQuery.toLowerCase();

         const matchesSearch =
            !searchQuery ||
            teamName.includes(searchLower) ||
            teamSlug.includes(searchLower) ||
            teamIdentifier.includes(searchLower);

         // View mode filter
         let matchesViewMode = false;
         switch (viewMode) {
            case 'joined':
               matchesViewMode = !!isUserMember;
               break;
            case 'not-joined':
               matchesViewMode = !isUserMember;
               break;
            case 'all':
            default:
               matchesViewMode = true;
         }

         // Both filters must pass
         return matchesSearch && matchesViewMode;
      }) as TeamList;
   }, [orgWithData, viewMode, searchQuery, currentUserId]);

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

   // Show an empty state if no teams are found
   if (!filteredTeams || filteredTeams.length === 0) {
      return (
         <div className="flex items-center justify-center h-screen">
            <div className="text-white/50">No teams found</div>
         </div>
      );
   }

   // Render the Teams component with the deeply loaded and filtered teams
   return <Teams teams={filteredTeams} />;
}
