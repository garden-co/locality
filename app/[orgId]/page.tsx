'use client';
import { useAccount } from 'jazz-react';
import { redirect, useParams } from 'next/navigation';

export default function OrgIdPage() {
   const params = useParams();
   const orgId = params.orgId as string;
   const { me } = useAccount({
      resolve: {
         root: {
            organizations: {
               $each: true,
            },
         },
      },
   });
   const organization = me?.root?.organizations?.find((org) => org?.slug === orgId);
   if (organization) {
      redirect(`/${organization.slug}/my-issues`);
   }
   return <div>Loading...</div>;
}
