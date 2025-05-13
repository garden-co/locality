'use client';

import { useAccount } from 'jazz-react';
import { redirect } from 'next/navigation';

export default function Home() {
   const { me } = useAccount({
      resolve: {
         root: {
            organizations: {
               $each: true,
            },
         },
      },
   });
   const organizations = me?.root?.organizations;
   if (organizations?.length) {
      redirect(`/${organizations[0].slug}/my-issues`);
   }
   return <div>Loading...</div>;
}
