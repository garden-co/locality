'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table';
import { UsersIcon, MoreVertical, Settings, LogOut, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CreateTeamModal } from './create-team-modal';
import { TeamList } from '@/lib/jazz-schema';
import { Group } from 'jazz-tools';
import { getThreeLettersFromString, getTwoLettersFromString } from '@/lib/utils';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInviteMemberStore } from '@/store/invite-member-store';

export default function Teams({ teams }: { teams: TeamList | undefined }) {
   const params = useParams();
   const orgId = params.orgId as string;

   const { openModal } = useInviteMemberStore();

   // Handle empty state
   if (!teams || teams.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center h-full w-full p-8">
            <div className="flex flex-col items-center justify-center max-w-md text-center">
               <div className="bg-secondary/30 p-4 rounded-full mb-4">
                  <UsersIcon className="h-8 w-8 text-muted-foreground" />
               </div>
               <h2 className="text-xl font-semibold mb-2">No teams</h2>
               <p className="text-muted-foreground mb-6">
                  Teams help you organize your work and collaborate with others. Create a team to
                  get started.
               </p>
               <CreateTeamModal />
            </div>
         </div>
      );
   }

   return (
      <div className="w-full h-full p-4">
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead className="w-[35%]">Name</TableHead>
                  <TableHead className="w-[15%]">Membership</TableHead>
                  <TableHead className="w-[15%]">Identifier</TableHead>
                  <TableHead className="w-[15%]">Members</TableHead>
                  <TableHead className="w-[5%]"></TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {teams.map((team) => {
                  const members = team?._owner.castAs(Group).members;

                  return (
                     <TableRow
                        key={team?.id || team?.slug}
                        className="cursor-pointer hover:bg-muted/50"
                     >
                        <TableCell className="py-3">
                           <Link
                              href={`/${orgId}/team/${team?.slug}`}
                              className="flex items-center gap-2"
                           >
                              <span
                                 className="flex items-center justify-center size-6 rounded-md"
                                 style={{
                                    backgroundColor: team?.color
                                       ? `${team.color}`
                                       : 'var(--primary-10)',
                                 }}
                              >
                                 {team?.icon}
                              </span>
                              <span className="font-medium">{team?.name}</span>
                           </Link>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground">
                                 {/* {team?.joined ? 'Joined' : 'Not joined'} */}
                                 Joined
                              </span>
                           </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-1.5 text-muted-foreground">
                              {getThreeLettersFromString(team?.slug || '')}
                           </div>
                        </TableCell>
                        <TableCell>
                           {/* Display member avatars (first one only for now) */}
                           <div className="flex -space-x-2">
                              {members?.map((member) => (
                                 <Avatar
                                    className="size-6 border-2 border-background"
                                    key={member.id}
                                 >
                                    <AvatarImage src={member.account.profile?.avatarUrl} />
                                    <AvatarFallback>
                                       {getTwoLettersFromString(member.account.profile?.name || '')}
                                    </AvatarFallback>
                                 </Avatar>
                              ))}
                           </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center justify-center">
                              <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                    <button className="p-1 rounded-sm hover:bg-muted flex items-center justify-center">
                                       <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                       <Link href={`/${orgId}/settings/teams/${team?.slug}`}>
                                          <Settings className="mr-2 h-4 w-4" />
                                          <span>Team Settings</span>
                                       </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => openModal('team', team?.id)}>
                                       <UserPlus className="mr-2 h-4 w-4" />
                                       <span>Invite Members</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem variant="destructive">
                                       <LogOut className="mr-2 h-4 w-4" />
                                       <span>Leave Team</span>
                                    </DropdownMenuItem>
                                 </DropdownMenuContent>
                              </DropdownMenu>
                           </div>
                        </TableCell>
                     </TableRow>
                  );
               })}
            </TableBody>
         </Table>
      </div>
   );
}
