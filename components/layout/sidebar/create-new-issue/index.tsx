import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { RiEditLine } from '@remixicon/react';
import { useCreateIssueStore } from '@/store/create-issue-store';
import { useAccount } from 'jazz-react';
import { useParams } from 'next/navigation';
import { CreateIssueForm } from './create-issue-form';

export function CreateNewIssue() {
   const params = useParams();
   const orgId = params.orgId as string;
   const teamId = params.teamId as string;

   const { isOpen, openModal, closeModal } = useCreateIssueStore();

   // Use useAccount with shallow loading of organizations
   const { me } = useAccount({
      resolve: {
         root: {
            organizations: true, // Shallow loading
         },
      },
   });

   // Find the organization by slug
   const organization = me?.root?.organizations?.find((org) => org?.slug === orgId) || undefined;

   return (
      <Dialog open={isOpen} onOpenChange={(value) => (value ? openModal() : closeModal())}>
         <DialogTrigger asChild>
            <Button className="size-8 shrink-0" variant="secondary" size="icon">
               <RiEditLine />
            </Button>
         </DialogTrigger>
         <DialogContent
            title="Create New Issue"
            className="w-full sm:max-w-[750px] p-0 shadow-xl top-[30%]"
         >
            {organization ? (
               <CreateIssueForm
                  organization={organization}
                  teamId={teamId}
                  closeModal={closeModal}
               />
            ) : (
               <div className="p-8 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400"></div>
               </div>
            )}
         </DialogContent>
      </Dialog>
   );
}
