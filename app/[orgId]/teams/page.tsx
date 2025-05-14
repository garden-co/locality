'use client';

import { TeamsHeader } from '@/components/layout/headers/teams/header';
import MainLayout from '@/components/layout/main-layout';
import { useAccount } from 'jazz-react';
import { useParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import TeamsListContainer from '@/components/common/teams/teams-list-container';

export default function TeamsPage() {
   const params = useParams();
   const orgId = params.orgId as string;
   const [searchQuery, setSearchQuery] = useState('');

   // Use useAccount ONCE to shallowly load organizations at the page level
   const { me } = useAccount({
      resolve: {
         root: {
            organizations: true, // Shallow loading
         },
      },
   });

   // Find the organization by slug
   const organization = me?.root?.organizations?.find((org) => org?.slug === orgId) || undefined;

   // Handle search queries from the HeaderNav component
   const handleSearch = useCallback((query: string) => {
      setSearchQuery(query);
   }, []);

   return (
      <MainLayout header={<TeamsHeader onSearch={handleSearch} />}>
         {organization ? (
            <TeamsListContainer
               organization={organization}
               searchQuery={searchQuery}
               currentUserId={me?.id}
            />
         ) : (
            <div className="flex items-center justify-center h-screen">
               <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400"></div>
            </div>
         )}
      </MainLayout>
   );
}
