'use client';

import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useInviteMemberStore } from '@/store/invite-member-store';
import { Group } from 'jazz-tools';
import { Plus } from 'lucide-react';

export default function HeaderNav({ members }: { members: Group['members'] | undefined }) {
   const { openModal } = useInviteMemberStore();
   return (
      <div className="w-full flex justify-between items-center border-b py-1.5 px-6 h-10">
         <div className="flex items-center gap-2">
            <SidebarTrigger className="" />
            <div className="flex items-center gap-1">
               <span className="text-sm font-medium">Members</span>
               <span className="text-xs bg-accent rounded-md px-1.5 py-1">{members?.length}</span>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <Button
               className="relative"
               size="xs"
               variant="secondary"
               onClick={() => openModal('organization')}
            >
               <Plus className="size-4" />
               Invite
            </Button>
         </div>
      </div>
   );
}
