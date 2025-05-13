'use client';

import { useCoState } from 'jazz-react';
import { Organization } from '@/lib/jazz-schema';
import { Group } from 'jazz-tools';
import { useMemo } from 'react';

/**
 * Custom hook to get members data from an organization
 * Follows the optimal data loading pattern by using useCoState
 */
export function useMembers(organization: Organization | undefined) {
   // Always call useCoState, but with conditional id
   const orgWithData = useCoState(
      Organization,
      organization?.id, // Will be undefined if organization is undefined
      {
         resolve: {
            // No specific properties to deeply resolve here,
            // we just need access to the organization's owner
         },
      }
   );

   // Always call useMemo, handling undefined cases inside
   const members = useMemo(() => {
      if (!organization || orgWithData === undefined || orgWithData === null) return undefined;
      return orgWithData._owner.castAs(Group).members;
   }, [organization, orgWithData]);

   return {
      members,
      isLoading: organization ? orgWithData === undefined : false,
      isError: organization ? orgWithData === null : false,
   };
}
