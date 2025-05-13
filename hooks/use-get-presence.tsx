'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'jazz-react';
import { useParams } from 'next/navigation';
import { PresenceStatus } from '@/lib/jazz-schema';

export function useGetPresence(userId: string): PresenceStatus {
   const params = useParams();
   const orgId = params.orgId as string;
   const [status, setStatus] = useState<PresenceStatus>('offline');

   const { me } = useAccount({
      resolve: {
         profile: true,
         root: {
            organizations: {
               $each: {
                  liveUpdates: true,
               },
            },
         },
      },
   });

   const organization = me?.root.organizations.find((org) => org.slug === orgId);

   useEffect(() => {
      if (!organization) {
         return;
      }

      const unsubscribe = organization.liveUpdates.subscribe((feedValue) => {
         let latestStatus: PresenceStatus = 'offline';

         if (feedValue.perSession) {
            latestStatus =
               Object.entries(feedValue.perSession)
                  .filter(([, sessionData]) => sessionData.value.type === 'presence')
                  .sort((a, b) => a[1].madeAt.getTime() - b[1].madeAt.getTime())
                  .pop()?.[1].value.data.status || 'offline';
         }

         if (status !== latestStatus) {
            setStatus(latestStatus);
         }
      });

      return () => {
         unsubscribe();
      };
   }, [organization, userId, status]);

   return status;
}
