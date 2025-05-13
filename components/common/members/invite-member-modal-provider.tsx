'use client';

import { InviteMemberModal } from './invite-member-modal';

export function InviteMemberModalProvider() {
   return (
      <div className="hidden">
         <InviteMemberModal trigger={null} />
      </div>
   );
}
