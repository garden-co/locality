'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useAccount } from 'jazz-react';
import { ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { Users } from 'lucide-react';

export function SettingsSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   const params = useParams();
   const pathname = usePathname();
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

   const isSettingsTeamsPage = pathname.includes('/settings/teams');

   const administrationItems = [
      { label: 'Teams', icon: <Users className="h-4 w-4" />, href: `/${orgId}/settings/teams` },
   ];

   // Your teams section based on screenshot
   const teamItems =
      teams
         ?.map((team) => {
            if (!team) return null;
            return {
               label: team.name,
               icon: (
                  <span className="flex items-center justify-center size-4 bg-primary/10 text-primary rounded-sm">
                     {team.icon}
                  </span>
               ),
               color: team.color,
               deleted: team.deleted,
               href: `/${orgId}/settings/teams/${team.slug}`,
            };
         })
         .filter(Boolean) || [];

   return (
      <Sidebar collapsible="offcanvas" {...props}>
         <SidebarHeader className="border-b p-3">
            <Link
               href={`/${orgId}`}
               className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
               <ChevronLeft className="mr-1 h-4 w-4" />
               Back to app
            </Link>
         </SidebarHeader>

         <SidebarContent className="p-2">
            {/* Administration Section */}
            <div className="mb-4">
               <h3 className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                  Administration
               </h3>
               <div className="space-y-1">
                  {administrationItems.map((item) => (
                     <Button
                        key={item.label}
                        variant={
                           pathname === item.href ||
                           (item.href.includes('/settings/teams') && isSettingsTeamsPage)
                              ? 'secondary'
                              : 'ghost'
                        }
                        size="sm"
                        className="w-full justify-start"
                        asChild
                     >
                        <Link href={item.href}>
                           {item.icon}
                           <span className="ml-2">{item.label}</span>
                        </Link>
                     </Button>
                  ))}
               </div>
            </div>

            {/* Your Teams Section */}
            {teamItems.length > 0 && (
               <div className="mb-4">
                  <h3 className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                     Your teams
                  </h3>
                  <div className="space-y-1">
                     {teamItems
                        .filter((item) => !item?.deleted)
                        .map((item) => (
                           <Button
                              key={item?.label}
                              variant={pathname.includes(item?.href || '') ? 'secondary' : 'ghost'}
                              size="sm"
                              className="w-full justify-start"
                              asChild
                           >
                              <Link href={item?.href || ''}>
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
                                 <span className="ml-2">{item?.label}</span>
                              </Link>
                           </Button>
                        ))}
                  </div>
               </div>
            )}
         </SidebarContent>
      </Sidebar>
   );
}
