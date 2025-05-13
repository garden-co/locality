'use client';

import { useState, useEffect } from 'react';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/components/ui/dialog';
import { useParams } from 'next/navigation';
import { Organization, Team } from '@/lib/jazz-schema';
import { useAccount } from 'jazz-react';
import { InviteMemberForm } from './invite-member-form';
import { useInviteMemberStore } from '@/store/invite-member-store';

interface InviteMemberModalProps {
   trigger?: React.ReactNode;
}

export function InviteMemberModal({ trigger }: InviteMemberModalProps) {
   const params = useParams();
   const orgId = params.orgId as string;
   const { isOpen, context, teamId, openModal, closeModal } = useInviteMemberStore();
   const [organization, setOrganization] = useState<Organization | null>(null);
   const [team, setTeam] = useState<Team | null>(null);

   // Load the organization using useAccount which is shown in other components
   const { me } = useAccount({
      resolve: {
         root: {
            organizations: {
               $each: {
                  teams: {
                     $each: true,
                  },
               },
            },
         },
      },
   });

   // Find the organization by slug
   useEffect(() => {
      if (me?.root?.organizations) {
         const org = me.root.organizations.find((org) => org?.slug === orgId);
         if (org) {
            setOrganization(org);

            // If team context, find the team
            if (context === 'team' && teamId && org.teams) {
               const foundTeam = org.teams.find((team) => team?.id === teamId);
               if (foundTeam) {
                  setTeam(foundTeam);
               }
            }
         }
      }
   }, [me, orgId, context, teamId]);

   if (!organization) {
      return null; // Don't render if organization data isn't available
   }

   // If team context but team not found, don't render
   if (context === 'team' && !team) {
      return null;
   }

   const modalTitle =
      context === 'organization'
         ? 'Invite Member to Organization'
         : `Invite Member to Team: ${team?.name}`;

   return (
      <Dialog
         open={isOpen}
         onOpenChange={(value) => (value ? openModal(context, teamId) : closeModal())}
      >
         {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
         <DialogContent className="w-full sm:max-w-[550px] p-0 shadow-xl fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[100]">
            <DialogHeader className="px-4 pt-5 pb-0">
               <DialogTitle>{modalTitle}</DialogTitle>
            </DialogHeader>

            {organization ? (
               <InviteMemberForm
                  inviteContext={context}
                  organization={organization}
                  team={team || undefined}
                  closeModal={closeModal}
               />
            ) : (
               <div className="p-8 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400"></div>
               </div>
            )}
         </DialogContent>
      </Dialog>
   );
}
