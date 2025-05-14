'use client';

import { Group } from 'jazz-tools';
import MemberLine from './member-line';
import { Organization } from '@/lib/jazz-schema';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Members({
   organization,
   members,
}: {
   organization: Organization;
   members: Group['members'] | undefined;
}) {
   return (
      <div className="w-full h-full p-4">
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead className="w-[50%]">Name</TableHead>
                  <TableHead className="w-[20%]">Status</TableHead>
                  <TableHead className="w-[20%]">Teams</TableHead>
                  <TableHead className="w-[10%] text-right">Actions</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {members?.map((member) => (
                  <MemberLine key={member.id} organization={organization} member={member} />
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
