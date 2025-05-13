'use client';

import { useCoState } from 'jazz-react';
import { Issue, Organization, UserProfile } from '@/lib/jazz-schema';
import Issues from './issues';
import { useMemo } from 'react';

interface MyIssuesListProps {
   organization: Organization;
   profile: UserProfile;
}

export default function MyIssuesList({ organization, profile }: MyIssuesListProps) {
   // Deeply load teams and their issues for this organization using useCoState
   const orgWithTeams = useCoState(Organization, organization.id, {
      resolve: {
         teams: {
            $each: {
               issues: { $each: true }, // Deeply load all issues for each team
            },
         },
      },
   });

   // Collect and filter issues assigned to the current user from all teams
   const myIssues = useMemo(() => {
      if (orgWithTeams === undefined || orgWithTeams === null) return [];
      if (!orgWithTeams.teams || !profile?.id) return [];

      // Collect issues from all teams
      const allIssues: Issue[] = [];
      orgWithTeams.teams.forEach((team) => {
         if (team?.issues) {
            team.issues.forEach((issue) => {
               if (issue) allIssues.push(issue);
            });
         }
      });

      // Filter issues assigned to the current user
      return allIssues.filter((issue) => issue.assignee?.id === profile.id);
   }, [orgWithTeams, profile?.id]);

   // Handle loading states
   if (orgWithTeams === undefined) return <div>Loading...</div>;
   if (orgWithTeams === null) return <div>Organization not found or access denied</div>;

   return <Issues issues={myIssues} type="my-issues" />;
}
