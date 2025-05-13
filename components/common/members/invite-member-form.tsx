'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import { Organization, Team } from '@/lib/jazz-schema';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';
import { createInviteLink } from 'jazz-react';

type InviteContext = 'organization' | 'team';

interface InviteMemberFormProps {
   inviteContext: InviteContext;
   organization: Organization;
   team?: Team;
   closeModal: () => void;
}

type Role = 'reader' | 'writer' | 'admin' | 'writeOnly';

export function InviteMemberForm({
   inviteContext,
   organization,
   team,
   closeModal,
}: InviteMemberFormProps) {
   const [role, setRole] = useState<Role>('writer');
   const [inviteLink, setInviteLink] = useState<string>('');

   const organizationId = organization?.id;
   const teamId = team?.id;

   // Generate invite link function
   const generateInviteLink = () => {
      if (!organization) return;

      let link = '';
      if (inviteContext === 'organization') {
         link = createInviteLink(organization, role, {
            baseURL: window.location.origin,
            valueHint: 'organization',
         });
      } else if (inviteContext === 'team' && team) {
         link = createInviteLink(team, role, {
            baseURL: window.location.origin,
            valueHint: 'team',
         });
      }

      // Remove the # character from the URL
      const formattedLink = link.replace('#', '');
      setInviteLink(formattedLink);
   };

   // Generate invite link on initial render and when role changes
   useEffect(() => {
      generateInviteLink();
      // Only depend on role and stable primitive values
   }, [role, organizationId, teamId, inviteContext]);

   const copyToClipboard = () => {
      if (inviteLink) {
         navigator.clipboard.writeText(inviteLink);
         toast.success('Invite link copied to clipboard');
      }
   };

   return (
      <>
         <div className="px-4 py-4 space-y-4 w-full">
            <div className="space-y-2">
               <Label htmlFor="role">Member Role</Label>
               <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                  <SelectTrigger id="role" className="w-full">
                     <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[200]">
                     <SelectItem value="reader">Reader</SelectItem>
                     <SelectItem value="writer">Writer</SelectItem>
                     <SelectItem value="admin">Admin</SelectItem>
                     <SelectItem value="writeOnly">Write Only</SelectItem>
                  </SelectContent>
               </Select>
               <p className="text-xs text-muted-foreground">
                  {role === 'reader' && 'Can only view content, cannot make changes.'}
                  {role === 'writer' && 'Can view and edit content.'}
                  {role === 'admin' && 'Full access to view, edit, and manage settings.'}
                  {role === 'writeOnly' && 'Can only make changes, cannot view existing content.'}
               </p>
            </div>

            <div className="space-y-2">
               <Label htmlFor="invite-link">Invite Link</Label>
               <div className="flex gap-2">
                  <Input id="invite-link" value={inviteLink} readOnly className="flex-1" />
                  <Button
                     variant="outline"
                     size="icon"
                     onClick={copyToClipboard}
                     className="shrink-0"
                  >
                     <Copy className="h-4 w-4" />
                  </Button>
               </div>
            </div>
         </div>

         <div className="flex items-center justify-end py-2.5 px-4 w-full border-t mt-4">
            <Button size="sm" onClick={closeModal}>
               Done
            </Button>
         </div>
      </>
   );
}
