'use client';

import { SettingsSidebar } from '@/components/layout/sidebar/settings-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CreateIssueModalProvider } from '@/components/common/issues/create-issue-modal-provider';

interface SettingsLayoutProps {
   children: React.ReactNode;
   header?: React.ReactNode;
}

export default function SettingsLayout({ children, header }: SettingsLayoutProps) {
   return (
      <SidebarProvider>
         <CreateIssueModalProvider />
         <SettingsSidebar />
         <div className="h-svh overflow-hidden lg:p-2 w-full">
            <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-start justify-start bg-container h-full w-full">
               {header && header}
               <div className="overflow-auto h-[calc(100svh-80px)] lg:h-[calc(100svh-96px)] w-full">
                  {children}
               </div>
            </div>
         </div>
      </SidebarProvider>
   );
}
