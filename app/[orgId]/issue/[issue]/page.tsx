'use client';

import MainLayout from '@/components/layout/main-layout';
import { useAccount } from 'jazz-react';
import { useParams } from 'next/navigation';
import IssueDetail from '@/components/common/issues/issue-detail';

export default function IssuePage() {
   const params = useParams();
   const orgId = params.orgId as string;
   const issueId = params.issue as string;

   // Use useAccount ONCE in the page to shallowly load organizations
   const { me } = useAccount({
      resolve: {
         profile: true,
         root: {
            organizations: true, // Shallow loading
         },
      },
   });

   // Find the organization by slug
   const organization = me?.root?.organizations?.find((org) => org?.slug === orgId) ?? undefined;

   return (
      <MainLayout header={<></>}>
         {organization ? (
            <IssueDetail
               organization={organization}
               issueId={issueId}
               currentUserId={me?.profile.id}
            />
         ) : (
            <div className="flex items-center justify-center h-screen">
               <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400"></div>
            </div>
         )}
      </MainLayout>
   );
}
