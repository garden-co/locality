'use client';

import SettingsLayout from '@/components/layout/settings-layout';
import { useAccount } from 'jazz-react';
import { useParams } from 'next/navigation';
import TeamSettingsContent from '@/components/common/teams/team-settings-content';

export default function TeamSettingsPage() {
   const params = useParams();
   const orgId = params.orgId as string;
   const teamId = params.teamId as string;

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

   return (
      <SettingsLayout>
         {organization ? (
            <TeamSettingsContent organization={organization} teamId={teamId} />
         ) : (
            <div className="flex items-center justify-center h-screen">
               <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400"></div>
            </div>
         )}
      </SettingsLayout>
   );
}
