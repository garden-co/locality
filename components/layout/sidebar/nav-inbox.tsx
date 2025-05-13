'use client';

import { FolderKanban } from 'lucide-react';

import {
   SidebarGroup,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';

const getInboxItems = (orgId: string) => [
   {
      name: 'My issues',
      url: `/${orgId}/my-issues`,
      icon: FolderKanban,
   },
];

export function NavInbox({ orgId }: { orgId: string }) {
   return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
         <SidebarMenu>
            {getInboxItems(orgId).map((item) => (
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
