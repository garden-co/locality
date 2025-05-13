'use client';

import { Group } from 'jazz-tools';
import MemberLine from './member-line';
import { Organization } from '@/lib/jazz-schema';

export default function Members({
   organization,
   members,
}: {
   organization: Organization;
   members: Group['members'] | undefined;
}) {
   return (
      <div className="w-full">
         <div className="bg-container px-6 py-1.5 text-sm flex items-center text-muted-foreground border-b sticky top-0 z-10">
            <div className="w-[70%] md:w-[55%] lg:w-[50%]">Name</div>
            <div className="w-[30%] md:w-[20%] lg:w-[15%]">Status</div>
            <div className="hidden lg:block w-[15%]">Joined</div>
            <div className="w-[25%] hidden md:flex md:w-[15%] lg:w-[15%]">Teams</div>
            <div className="w-[5%]">Actions</div>
         </div>

         <div className="w-full">
            {members?.map((member) => (
               <MemberLine key={member.id} organization={organization} member={member} />
            ))}
         </div>
      </div>
   );
}
