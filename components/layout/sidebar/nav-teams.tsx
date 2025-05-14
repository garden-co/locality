'use client';

import { ChevronRight, CopyMinus, MoreHorizontal, Settings, UserPlus } from 'lucide-react';
import Link from 'next/link';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
   SidebarGroup,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuAction,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarMenuSub,
   SidebarMenuSubButton,
   SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { TeamList } from '@/lib/jazz-schema';
import { useInviteMemberStore } from '@/store/invite-member-store';

export function NavTeams({ orgId, teams }: { orgId: string; teams: TeamList | undefined }) {
   const { openModal } = useInviteMemberStore();
   return (
      <SidebarGroup>
         <SidebarGroupLabel>Your teams</SidebarGroupLabel>
         <SidebarMenu>
            {teams
               ?.filter((item) => !item?.deleted)
               .map((item, index) => (
                  <Collapsible
                     key={item?.slug ?? index}
                     asChild
                     defaultOpen={index === 0}
                     className="group/collapsible"
                  >
                     <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                           <SidebarMenuButton tooltip={item?.name}>
                              <div className="inline-flex size-6 bg-muted/50 items-center justify-center rounded shrink-0">
                                 <span
                                    className="flex items-center justify-center size-6 rounded-md"
                                    style={{
                                       backgroundColor: item?.color
                                          ? `${item.color}`
                                          : 'var(--primary-10)',
                                    }}
                                 >
                                    {item?.icon}
                                 </span>
                              </div>
                              <span className="text-sm">{item?.name}</span>
                              <span className="w-3 shrink-0">
                                 <ChevronRight className="w-full transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                              </span>
                              <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                    <SidebarMenuAction showOnHover>
                                       <MoreHorizontal />
                                       <span className="sr-only">More</span>
                                    </SidebarMenuAction>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent
                                    className="w-48 rounded-lg"
                                    side="right"
                                    align="start"
                                 >
                                    <DropdownMenuItem asChild>
                                       <Link href={`/${orgId}/settings/teams/${item?.slug}`}>
                                          <Settings className="size-4" />
                                          <span>Team settings</span>
                                       </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => openModal('team', item?.id)}>
                                       <UserPlus className="mr-2 h-4 w-4" />
                                       <span>Invite Members</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                       <span>Leave team...</span>
                                    </DropdownMenuItem>
                                 </DropdownMenuContent>
                              </DropdownMenu>
                           </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                           <SidebarMenuSub>
                              <SidebarMenuSubItem>
                                 <SidebarMenuSubButton asChild>
                                    <Link href={`/${orgId}/team/${item?.slug}/issues`}>
                                       <CopyMinus size={14} />
                                       <span>Issues</span>
                                    </Link>
                                 </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                           </SidebarMenuSub>
                        </CollapsibleContent>
                     </SidebarMenuItem>
                  </Collapsible>
               ))}
         </SidebarMenu>
      </SidebarGroup>
   );
}
