'use client';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Assignee, Issue, UserProfile } from '@/lib/jazz-schema';
import { Group } from 'jazz-tools';
import { CheckIcon, CircleUserRound, Send, UserIcon } from 'lucide-react';
import { useState } from 'react';
import UserAvatar from '@/components/user-avatar';

interface AssigneeUserProps {
   issue: Issue;
}

export function AssigneeUser({ issue }: AssigneeUserProps) {
   const [open, setOpen] = useState(false);
   const [currentAssignee, setCurrentAssignee] = useState<typeof Assignee | null>(issue.assignee);

   const renderAvatar = () => {
      if (currentAssignee) {
         return (
            <UserAvatar
               user={currentAssignee as UserProfile}
               className="size-6 shrink-0"
               showStatus={true}
            />
         );
      } else {
         return (
            <div className="size-6 flex items-center justify-center">
               <CircleUserRound className="size-5 text-zinc-600" />
            </div>
         );
      }
   };

   return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
         <DropdownMenuTrigger asChild>
            <button className="relative w-fit focus:outline-none">{renderAvatar()}</button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="start" className="w-[206px]">
            <DropdownMenuLabel>Assign to...</DropdownMenuLabel>
            <DropdownMenuItem
               onClick={(e) => {
                  e.stopPropagation();
                  setCurrentAssignee(null);
                  setOpen(false);
               }}
            >
               <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  <span>No assignee</span>
               </div>
               {!currentAssignee && <CheckIcon className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {issue._owner.castAs(Group).members.map(({ account }) => (
               <DropdownMenuItem
                  key={account.id}
                  onClick={(e) => {
                     e.stopPropagation();
                     setCurrentAssignee(account.profile);
                     setOpen(false);
                  }}
               >
                  <div className="flex items-center gap-2">
                     {account.profile && (
                        <UserAvatar user={account.profile as UserProfile} className="h-5 w-5" />
                     )}
                     <span>{account.profile?.name}</span>
                  </div>
                  {currentAssignee?.id === account.profile?.id && (
                     <CheckIcon className="ml-auto h-4 w-4" />
                  )}
               </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>New user</DropdownMenuLabel>
            <DropdownMenuItem>
               <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  <span>Invite and assign...</span>
               </div>
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
