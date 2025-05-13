'use client';

import * as React from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';

import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuPortal,
   DropdownMenuSeparator,
   DropdownMenuShortcut,
   DropdownMenuSub,
   DropdownMenuSubContent,
   DropdownMenuSubTrigger,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { CreateNewIssue } from './create-new-issue';
import { ThemeToggle } from '../theme-toggle';
import { Organization, OrganizationList } from '@/lib/jazz-schema';
import Link from 'next/link';
import { getTwoLettersFromString } from '@/lib/utils';
import { useInviteMemberStore } from '@/store/invite-member-store';

export function OrgSwitcher({
   orgs,
   currentOrg,
   currentUser,
}: {
   orgs: OrganizationList | undefined;
   currentOrg: Organization | undefined;
   currentUser: string;
}) {
   const { openModal } = useInviteMemberStore();

   return (
      <SidebarMenu>
         <SidebarMenuItem>
            <DropdownMenu>
               <div className="w-full flex gap-1 items-center pt-2">
                  <DropdownMenuTrigger asChild>
                     <SidebarMenuButton
                        size="lg"
                        className="h-8 p-1 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                     >
                        <div className="flex aspect-square size-6 items-center justify-center rounded bg-orange-500 text-sidebar-primary-foreground">
                           {getTwoLettersFromString(currentOrg?.name ?? '')}
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                           <span className="truncate font-semibold">{currentOrg?.name}</span>
                        </div>
                        <ChevronsUpDown className="ml-auto" />
                     </SidebarMenuButton>
                  </DropdownMenuTrigger>

                  <ThemeToggle />

                  <CreateNewIssue />
               </div>
               <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-60 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
               >
                  <DropdownMenuGroup>
                     <DropdownMenuItem onSelect={() => openModal('organization')}>
                        Invite and manage members
                     </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                     <DropdownMenuSubTrigger>Switch Workspace</DropdownMenuSubTrigger>
                     <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                           <DropdownMenuLabel>{currentUser}</DropdownMenuLabel>
                           <DropdownMenuSeparator />
                           {orgs?.map((org) => (
                              <DropdownMenuItem key={org?.id} asChild>
                                 <Link
                                    href={`/${org?.slug}`}
                                    className="flex w-full items-center justify-between"
                                 >
                                    <div className="flex items-center gap-2">
                                       <div className="flex aspect-square size-6 items-center justify-center rounded bg-orange-500 text-sidebar-primary-foreground">
                                          {getTwoLettersFromString(org?.name ?? '')}
                                       </div>
                                       <span className="truncate font-semibold">{org?.name}</span>
                                    </div>
                                    {currentOrg?.id === org?.id && (
                                       <Check className="ml-2 h-4 w-4" />
                                    )}
                                 </Link>
                              </DropdownMenuItem>
                           ))}
                           <DropdownMenuSeparator />
                           <DropdownMenuItem>
                              <Link href="/new-org">Create new workspace</Link>
                           </DropdownMenuItem>
                        </DropdownMenuSubContent>
                     </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuItem>
                     Log out
                     <DropdownMenuShortcut>⌥⇧Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </SidebarMenuItem>
      </SidebarMenu>
   );
}
