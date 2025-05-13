'use client';

import { useSetPresence } from '@/hooks/use-set-presence';

export default function OrgLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   useSetPresence();
   return <>{children}</>;
}
