'use client';

import {
   Issue,
   StatusType,
   PriorityType,
   Assignee,
   UserProfile,
   Label,
   LabelList,
} from '@/lib/jazz-schema';
import { StatusSelector } from '@/components/layout/sidebar/create-new-issue/status-selector';
import { PrioritySelector } from '@/components/layout/sidebar/create-new-issue/priority-selector';
import { AssigneeSelector } from '@/components/layout/sidebar/create-new-issue/assignee-selector';
import { LabelSelector } from '@/components/layout/sidebar/create-new-issue/label-selector';
import { toast } from 'sonner';
import { Group } from 'jazz-tools';

interface IssueSidebarProps {
   issueData: Issue;
}

export function IssueSidebar({ issueData }: IssueSidebarProps) {
   const issueOrganization = issueData?.parentOrganization;

   const profiles = issueData._owner
      .castAs(Group)
      .members.map((member) => member.account.profile)
      .filter(Boolean);

   // Get organization labels
   const organizationLabels = issueOrganization?.labels || LabelList.create([], issueData._owner);

   const handleStatusChange = (newStatus: typeof StatusType) => {
      if (issueData && newStatus) {
         issueData.updateIssueStatus(newStatus);
      }
   };

   const handlePriorityChange = (newPriority: typeof PriorityType) => {
      if (issueData && newPriority) {
         issueData.updateIssuePriority(newPriority);
      }
   };

   const handleAssigneeChange = (newAssignee: typeof Assignee) => {
      if (issueData) {
         issueData.updateIssueAssignee(newAssignee);
      }
   };

   // Handler for label changes
   const handleLabelsChange = (newLabels: LabelList | null) => {
      if (issueData) {
         issueData.labels = newLabels;
      }
   };

   // Handler to add a new label to the organization
   const handleCreateLabel = (newLabel: typeof Label.prototype) => {
      if (issueOrganization?.labels) {
         issueOrganization.labels.push(newLabel);
         toast.success('Label added to organization');
      } else {
         toast.error('Could not add label to organization');
      }
   };

   return (
      <>
         <div className="space-y-4">
            <div>
               <h3 className="text-xs font-medium text-white/50 mb-2">Status</h3>
               <StatusSelector status={issueData?.statusType} onChange={handleStatusChange} />
            </div>
            <div>
               <h3 className="text-xs font-medium text-white/50 mb-2">Priority</h3>
               <PrioritySelector priority={issueData?.priority} onChange={handlePriorityChange} />
            </div>
            <div>
               <h3 className="text-xs font-medium text-white/50 mb-2">Assignee</h3>
               <AssigneeSelector
                  assignee={issueData?.assignee}
                  users={profiles as UserProfile[]}
                  onChange={handleAssigneeChange}
               />
            </div>
            <div>
               <h3 className="text-xs font-medium text-white/50 mb-2">Labels</h3>
               <LabelSelector
                  availableLabels={organizationLabels}
                  selectedLabels={issueData?.labels || null}
                  onChange={handleLabelsChange}
                  onCreateLabel={handleCreateLabel}
               />
            </div>
         </div>
      </>
   );
}
