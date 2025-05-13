'use client';

import { IssuesHeader } from '@/components/layout/headers/issues/header';
import MainLayout from '@/components/layout/main-layout';
import { useAccount } from 'jazz-react';
import { useParams } from 'next/navigation';
import MyIssuesList from '@/components/common/issues/my-issues-list';

export default function MyIssuesPage() {
   const params = useParams();
   const orgId = params.orgId as string;

   // Use useAccount ONCE in the page to shallowly load organizations
   const { me } = useAccount({
      resolve: {
         profile: true,
         root: {
            organizations: true, // Shallowly load organizations
         },
      },
   });

   // Find the organization by slug
   const organization = me?.root?.organizations?.find((org) => org?.slug === orgId);

   console.log('organization', organization);

   return (
      <MainLayout header={<IssuesHeader />}>
         {organization && me?.profile ? (
            <MyIssuesList organization={organization} profile={me.profile} />
         ) : (
            <div>Loading...</div>
         )}
      </MainLayout>
   );
}
