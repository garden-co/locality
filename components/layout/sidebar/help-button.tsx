'use client';

import * as React from 'react';
import { ExternalLink, HelpCircle } from 'lucide-react';

import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RiGithubFill, RiThreadsFill, RiTwitterXFill } from '@remixicon/react';

export function HelpButton() {
   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline">
               <HelpCircle className="size-4" />
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>Join Us</DropdownMenuLabel>
            <DropdownMenuItem asChild>
               <Link href="https://x.com/jazz_tools" target="_blank">
                  <RiTwitterXFill className="mr-2 h-4 w-4" />
                  <span>X</span>
                  <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
               </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
               <Link href="https://discord.gg/6bFccYDf" target="_blank">
                  <RiThreadsFill className="mr-2 h-4 w-4" />
                  <span>Discord</span>
                  <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
               </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
               <Link href="https://github.com/garden-co/slim-issue-tracker" target="_blank">
                  <RiGithubFill className="mr-2 h-4 w-4" />
                  <span>GitHub</span>
                  <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
               </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
