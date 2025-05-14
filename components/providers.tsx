'use client';

import { Toaster } from '@/components/ui/sonner';
import { JazzProvider, PasskeyAuthBasicUI } from 'jazz-react';

import { ThemeProvider } from '@/components/layout/theme-provider';
import { JazzAccount } from '@/lib/jazz-schema';

declare module 'jazz-react' {
   interface Register {
      Account: JazzAccount;
   }
}

export function AppProviders({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
         <JazzProvider
            sync={{
               peer: 'wss://cloud.jazz.tools/?key=react-passkey-auth@garden.co',
               when: 'always',
            }}
            AccountSchema={JazzAccount}
         >
            <PasskeyAuthBasicUI appName="Locality">{children}</PasskeyAuthBasicUI>
         </JazzProvider>
         <Toaster />
      </ThemeProvider>
   );
}
