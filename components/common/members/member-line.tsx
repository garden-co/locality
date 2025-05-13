import UserAvatar from '@/components/user-avatar';
import { UserProfile, Organization } from '@/lib/jazz-schema';
import { format, isValid } from 'date-fns';
import { Group } from 'jazz-tools';
import { MoreVertical, UserMinus } from 'lucide-react';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MemberLineProps {
   organization: Organization;
   member: Group['members'][0];
}

export default function MemberLine({ organization, member }: MemberLineProps) {
   console.log('member', member);
   // Create date safely with validation
   const formatJoinDate = () => {
      console.log(
         'member.account.root?._edits.organizations',
         member.account.root?._edits.organizations
      );
      const dateString = member.account.root?._edits.organizations?.all[0]?.madeAt;
      if (!dateString) return 'N/A';

      const date = new Date(dateString);
      return isValid(date) ? format(date, 'MMM yyyy') : 'N/A';
   };

   const memberProfile = member.account.profile as UserProfile;

   const handleRemoveMember = async () => {
      const group = organization._owner.castAs(Group);
      console.log('removing member', member.account);
      await member.account.waitForAllCoValuesSync();
      await group.removeMember(member.account);
      console.log('member removed');
      console.log('role:', group.getRoleOf(member.account.id));
   };

   return (
      <div className="w-full flex items-center py-3 px-6 border-b hover:bg-sidebar/50 border-muted-foreground/5 text-sm last:border-b-0">
         <div className="w-[70%] md:w-[55%] lg:w-[50%] flex items-center gap-2">
            <div className="relative">
               <div className="flex items-center gap-2">
                  <UserAvatar user={memberProfile} showStatus={true} />
               </div>
            </div>
            <div className="flex flex-col items-start overflow-hidden">
               <span className="font-medium truncate w-full">{member.account.profile?.name}</span>
               <span className="text-xs text-muted-foreground truncate w-full">
                  {member.account.profile?.email}
               </span>
            </div>
         </div>
         <div className="w-[30%] md:w-[20%] lg:w-[15%] text-xs text-muted-foreground">
            {member.role}
         </div>
         <div className="hidden lg:block w-[15%] text-xs text-muted-foreground">
            {formatJoinDate()}
         </div>
         <div className="w-[25%] hidden md:flex md:w-[15%] lg:w-[15%] text-xs text-muted-foreground">
            {/* <TeamsTooltip teamIds={user.teamIds} /> */}
            USER TEAMS
         </div>
         <div className="w-[5%] flex items-center justify-center">
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded-sm hover:bg-muted flex items-center justify-center">
                     <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                  <DropdownMenuItem variant="destructive" onClick={handleRemoveMember}>
                     <UserMinus className="mr-2 h-4 w-4" />
                     <span>Remove Member</span>
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </div>
      </div>
   );
}
