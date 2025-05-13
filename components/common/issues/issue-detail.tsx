'use client';

import { useCoState } from 'jazz-react';
import { Organization, Issue as IssueType } from '@/lib/jazz-schema';
import { Issue } from '@/components/common/issues/Issue';
import { useMemo } from 'react';
import { ID, Profile } from 'jazz-tools';

interface IssueDetailProps {
   organization: Organization;
   issueId: string;
   currentUserId: ID<Profile> | undefined;
}

export default function IssueDetail({ organization, issueId, currentUserId }: IssueDetailProps) {
   // Deeply load the organization with teams using useCoState
   const orgWithData = useCoState(Organization, organization.id, {
      resolve: {
         teams: {
            $each: {
               issues: {
                  $each: {
                     childIssues: { $each: true }, // Deeply load child issues
                     attachments: { $each: { file: true, image: true } },
                     comments: { $each: { attachments: { $each: true } } },
                  },
               },
            },
         },
      },
   });

   // Find the specific issue across all teams (move useMemo before conditional returns)
   const issueData = useMemo(() => {
      if (orgWithData === undefined || orgWithData === null || !orgWithData.teams) return null;

      let foundIssue: IssueType | null = null;

      // Search for the issue in all teams
      for (const team of orgWithData.teams) {
         if (!team || !team.issues) continue;

         // Look for the issue in this team's issues
         for (const issue of team.issues) {
            if (!issue) continue;
            if (issue.identifier === issueId) {
               foundIssue = issue;
               break;
            }
         }

         if (foundIssue) break;
      }

      return foundIssue;
   }, [orgWithData, issueId]);

   // Handle loading states properly
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

   // Return issue not found if the issue doesn't exist
   if (!issueData) {
      return (
         <div className="flex items-center justify-center h-screen">
            <div className="text-white/50">Issue not found</div>
         </div>
      );
   }

   // Render the issue with all the deeply loaded data
   return <Issue issueData={issueData} currentUserId={currentUserId} />;
}
