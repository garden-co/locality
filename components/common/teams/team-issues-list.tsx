'use client';

import { useCoState } from 'jazz-react';
import { Organization, Issue, Team } from '@/lib/jazz-schema';
import Issues from '@/components/common/issues/issues';
import { useMemo, useEffect } from 'react';

interface TeamIssuesListProps {
   organization: Organization;
   teamId: string;
}

export default function TeamIssuesList({ organization, teamId }: TeamIssuesListProps) {
   // Log the team context for future filtering implementation
   useEffect(() => {
      console.log(`Viewing issues in team context: ${teamId}`);
   }, [teamId]);

   // Deeply load the organization with teams and their issues using useCoState
   const orgWithData = useCoState(Organization, organization.id, {
      resolve: {
         teams: {
            $each: {
               issues: { $each: true }, // Deeply load issues for each team
            },
         },
      },
   });

   // Get the team's issues
   const teamIssues = useMemo(() => {
      if (orgWithData === undefined || orgWithData === null) return undefined;

      // Get the team from the organization that matches the teamId
      const team = orgWithData.teams?.find((team) => team?.slug === teamId) as Team | undefined;

      // If no matching team is found, return no issues
      if (!team || !team.issues) return [];

      // Return issues from the team
      return team.issues.filter((issue): issue is Issue => {
         // Make sure issue exists
         return issue !== null;
      });
   }, [orgWithData, teamId]);

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

   // Show an empty state if no issues are found
   if (!teamIssues || teamIssues.length === 0) {
      return (
         <div className="flex items-center justify-center h-screen">
            <div className="text-white/50">No issues found for this team</div>
         </div>
      );
   }

   // Render the Issues component with the team's issues
   return <Issues issues={teamIssues} type="all-issues" />;
}
