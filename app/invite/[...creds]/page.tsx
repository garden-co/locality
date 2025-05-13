'use client';

import { JazzAccount, Organization, Team } from '@/lib/jazz-schema';
// import { useAccount } from 'jazz-react';
import { ID, InviteSecret } from 'jazz-tools';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function InvitePage() {
   const params = useParams<{ creds: string[] }>();
   const router = useRouter();
   const [error, setError] = useState<string[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   const coValueType = params?.creds?.[0] as 'organization' | 'team';
   const coValueId = params?.creds?.[1] as ID<Organization | Team>;
   const secret = params?.creds?.[2] as InviteSecret;

   useEffect(() => {
      if (!coValueType || !coValueId || !secret) {
         setIsLoading(false);
         return;
      }

      async function acceptInvite() {
         try {
            const me = JazzAccount.getMe();
            await me.ensureLoaded({
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

            if (!me) return;

            await me.acceptInvite(
               coValueId,
               secret,
               coValueType === 'organization' ? Organization : Team
            );
            const coValue =
               coValueType === 'organization'
                  ? await Organization.load(coValueId)
                  : await Team.load(coValueId);

            if (!coValue) {
               setError([`${coValueType} not found`]);
               setIsLoading(false);
               return;
            }

            if (
               me.root &&
               me.root.organizations &&
               !me.root.organizations.some((o) => o?.id === coValue.id) &&
               coValueType === 'organization'
            ) {
               me.root.organizations.push(coValue as Organization);
               router.replace(`/${coValue.slug}`);
            }

            if (
               me.root &&
               me.root.organizations &&
               me.root.organizations[0]?.teams &&
               !me.root.organizations[0]?.teams.some((o) => o?.id === coValue.id) &&
               coValueType === 'team'
            ) {
               me.root.organizations[0]?.teams.push(coValue as Team);
               router.replace(`/${me.root.organizations[0].slug}`);
            }

            toast.success('Invite accepted');
         } catch (err) {
            setError([err instanceof Error ? err.message : 'Failed to accept invite']);
            toast.error(err instanceof Error ? err.message : 'Failed to accept invite');
            setIsLoading(false);
         }
      }

      acceptInvite();
   }, [coValueType, coValueId, secret, router]);

   if (!coValueType || !coValueId || !secret) {
      return (
         <div className="text-red-600 dark:text-red-500">
            Invalid invite link. Please check the URL and try again.
         </div>
      );
   }

   if (error.length > 0) {
      return <div className="text-red-600 dark:text-red-500">{error.join(', ')}</div>;
   }

   return isLoading ? <div>Loading....</div> : null;
}
