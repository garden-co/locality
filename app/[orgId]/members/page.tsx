'use client';

import Header from '@/components/layout/headers/members/header';
import MainLayout from '@/components/layout/main-layout';
import { useAccount } from 'jazz-react';
import { useParams } from 'next/navigation';
import { useMembers } from '@/components/common/members/use-members';
import Members from '@/components/common/members/members';

export default function MembersPage() {
   const params = useParams();
   const orgId = params.orgId as string;

   // Use useAccount ONCE to shallowly load organizations at the page level
   const { me } = useAccount({
      resolve: {
         profile: true,
         root: {
            organizations: true, // Shallow loading
         },
      },
   });

   // Find the organization by slug
   const organization = me?.root?.organizations?.find((org) => org?.slug === orgId) || undefined;

   // Use our custom hook to get members data for the Header
   const { members, isLoading, isError } = useMembers(organization);

   // Show loading state if waiting for organization or members
   if (!organization || isLoading) {
      return (
         <MainLayout header={<Header members={undefined} />}>
            <div className="flex items-center justify-center h-screen">
               <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400"></div>
            </div>
         </MainLayout>
      );
   }

   // Show error state if there was an error loading members
   if (isError) {
      return (
         <MainLayout header={<Header members={undefined} />}>
            <div className="flex items-center justify-center h-screen">
               <div className="text-white/50">Organization not found or access denied</div>
            </div>
         </MainLayout>
      );
   }

   // Render the page with members data
   return (
      <MainLayout header={<Header members={members} />}>
         <Members organization={organization} members={members} />
      </MainLayout>
   );
}
