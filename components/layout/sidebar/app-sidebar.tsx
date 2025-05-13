'use client';

import * as React from 'react';

import { HelpButton } from '@/components/layout/sidebar/help-button';
import { NavInbox } from '@/components/layout/sidebar/nav-inbox';
import { NavTeams } from '@/components/layout/sidebar/nav-teams';
import { NavWorkspace } from '@/components/layout/sidebar/nav-workspace';
import { OrgSwitcher } from '@/components/layout/sidebar/org-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { useAccount } from 'jazz-react';
import { useParams } from 'next/navigation';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   const params = useParams();
   const orgId = params.orgId as string;

   const { me } = useAccount({
      resolve: {
         root: {
            organizations: {
               $each: {
                  teams: true,
               },
            },
         },
      },
   });

   const organizations = me?.root?.organizations;

   const organization = organizations && organizations.find((org) => org?.slug === orgId);

   const teams = organization?.teams;

   return (
      <Sidebar collapsible="offcanvas" {...props}>
         <SidebarHeader>
            <OrgSwitcher
               orgs={organizations}
               currentOrg={organization}
               currentUser={me?.profile?.name || ''}
            />
         </SidebarHeader>
         <SidebarContent>
            <NavInbox orgId={orgId} />
            <NavWorkspace orgId={orgId} />
            <NavTeams orgId={orgId} teams={teams} />
         </SidebarContent>
         <SidebarFooter>
            <div className="w-full flex flex-col gap-2">
               <div className="w-full flex items-center justify-between">
                  <HelpButton />
               </div>
            </div>
         </SidebarFooter>
      </Sidebar>
   );
}
