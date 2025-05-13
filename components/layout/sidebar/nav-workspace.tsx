'use client';

import { ContactRound, UserRound } from 'lucide-react';

import {
   SidebarGroup,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';

const getWorkspaceItems = (orgId: string) => [
   {
      name: 'Teams',
      url: `/${orgId}/teams`,
      icon: ContactRound,
   },
   {
      name: 'Members',
      url: `/${orgId}/members`,
      icon: UserRound,
   },
];

export function NavWorkspace({ orgId }: { orgId: string }) {
   return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
         <SidebarGroupLabel>Workspace</SidebarGroupLabel>
         <SidebarMenu>
            {getWorkspaceItems(orgId).map((item) => (
               <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                     <Link href={item.url}>
                        <item.icon />
                        <span>{item.name}</span>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>
            ))}
         </SidebarMenu>
      </SidebarGroup>
   );
}
