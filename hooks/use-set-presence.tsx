'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'jazz-react';
import { useParams } from 'next/navigation';
import { PresenceStatus } from '@/lib/jazz-schema';

export function useSetPresence(): void {
   const params = useParams();
   const orgId = params?.orgId as string;
   const currentStatusRef = useRef<PresenceStatus>('offline');
   const listenersMountedRef = useRef(false);

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

   const organizationId = me?.root?.organizations.find((org) => org?.slug === orgId)?.id;

   const getOrganization = () => me?.root?.organizations.find((org) => org?.slug === orgId);

   const updatePresence = (newStatus: PresenceStatus) => {
      const organization = getOrganization();
      if (!organization?.liveUpdates) return;

      if (currentStatusRef.current === newStatus) return;

      organization.liveUpdates.push({
         type: 'presence',
         data: { status: newStatus },
      });

      currentStatusRef.current = newStatus;
   };

   useEffect(() => {
      const organization = getOrganization();
      if (!organization?.liveUpdates) return;

      updatePresence('online');

      if (!listenersMountedRef.current) {
         const handleOffline = () => updatePresence('offline');

         const handleVisibilityChange = () => {
            updatePresence(document.visibilityState === 'visible' ? 'online' : 'away');
         };

         window.addEventListener('beforeunload', handleOffline);
         document.addEventListener('visibilitychange', handleVisibilityChange);

         listenersMountedRef.current = true;

         return () => {
            if (listenersMountedRef.current) {
               updatePresence('offline');
               window.removeEventListener('beforeunload', handleOffline);
               document.removeEventListener('visibilitychange', handleVisibilityChange);
               listenersMountedRef.current = false;
            }
         };
      }
   }, [organizationId]);
}
