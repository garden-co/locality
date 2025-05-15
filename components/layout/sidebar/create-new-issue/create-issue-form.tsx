'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label as UILabel } from '@/components/ui/label';
import { StatusSelector } from './status-selector';
import { PrioritySelector } from './priority-selector';
import { AssigneeSelector } from './assignee-selector';
import { LabelSelector } from './label-selector';
import { TeamSelector } from './team-selector';
import { toast } from 'sonner';
import { useCoState } from 'jazz-react';
import { Organization, Issue, Label, LabelList, Team } from '@/lib/jazz-schema';
import { CoMapInit, Group } from 'jazz-tools';
import { getThreeLettersFromString } from '@/lib/utils';

interface CreateIssueFormProps {
   organization: Organization;
   teamId: string;
   closeModal: () => void;
}

export function CreateIssueForm({ organization, teamId, closeModal }: CreateIssueFormProps) {
   const [createMore, setCreateMore] = useState<boolean>(false);

   // Deeply load the organization with teams, and labels using useCoState
   const orgWithData = useCoState(Organization, organization.id, {
      resolve: {
         teams: {
            $each: {
               issues: { $each: true }, // Load issues for each team
            },
         },
         labels: {
            $each: true, // Deeply load all labels
         },
      },
   });

   // Define createDefaultData before any conditional returns
   const createDefaultData = useCallback((): CoMapInit<Issue> => {
      // Find the team that matches teamId, or use the first team as fallback
      const teams = orgWithData?.teams || [];
      const targetTeam = teams.find((t) => t?.slug === teamId) || teams[0];

      const identifier = getThreeLettersFromString(orgWithData?.name || '');

      // Calculate next issue number by counting all issues across all teams
      let totalIssueCount = 0;
      if (orgWithData?.teams) {
         for (const team of orgWithData.teams) {
            if (team?.issues) {
               totalIssueCount += team.issues.length;
            }
         }
      }

      return {
         identifier: `${identifier}-${totalIssueCount + 1}`,
         title: '',
         description: '',
         statusType: 'to-do',
         assignee: null,
         priority: 'no-priority',
         labels: null,
         parentOrganization: orgWithData,
         parentIssue: null,
         attachments: null,
         comments: null,
         reactions: null,
         deleted: false,
         team: targetTeam,
      };
   }, [orgWithData, teamId]);

   // Initialize state before any conditional returns
   const [addIssueForm, setAddIssueForm] = useState<CoMapInit<Issue>>(createDefaultData());

   // Update form data when org data changes
   useEffect(() => {
      setAddIssueForm(createDefaultData());
   }, [createDefaultData]);

   // Handle loading states
   if (orgWithData === undefined) {
      return (
         <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400"></div>
         </div>
      );
   }

   if (orgWithData === null) {
      return (
         <div className="p-8 flex items-center justify-center">
            <div className="text-white/50">Organization not found or access denied</div>
         </div>
      );
   }

   // Get data from deeply loaded organization
   const teams = orgWithData.teams;

   // Get the selected team
   const selectedTeam = addIssueForm.team as Team;

   const organizationLabels = orgWithData.labels || LabelList.create([], selectedTeam._owner);

   // Get users from the team's issues owner (if available)
   const users =
      selectedTeam?.issues?._owner
         ?.castAs(Group)
         ?.members?.map((member) => member.account.profile)
         ?.filter((user) => user !== null) || [];

   // Handler to add a new label to the organization
   const handleCreateLabel = (newLabel: typeof Label.prototype) => {
      if (orgWithData.labels) {
         orgWithData.labels.push(newLabel);
         toast.success('Label added to organization');
      } else {
         toast.error('Could not add label to organization');
      }
   };

   const createIssue = () => {
      if (!addIssueForm.title) {
         toast.error('Title is required');
         return;
      }

      // Get the team to add the issue to
      const team = addIssueForm.team as Team;
      if (!team || !team.issues) {
         toast.error('No team selected or team issues not available');
         return;
      }

      toast.success('Issue created');

      // Create the issue and add it to the team's issues
      const newIssue = Issue.create(addIssueForm, team._owner);
      team.issues.push(newIssue);

      if (!createMore) {
         closeModal();
      }
      setAddIssueForm(createDefaultData());
   };

   return (
      <>
         <div className="flex items-center px-4 pt-4 gap-2">
            <TeamSelector
               teams={teams || []}
               team={addIssueForm.team}
               onChange={(newTeam) => setAddIssueForm({ ...addIssueForm, team: newTeam })}
            />
         </div>

         <div className="px-4 pb-0 space-y-3 w-full">
            <Input
               className="border-none w-full shadow-none outline-none text-2xl font-medium px-0 h-auto focus-visible:ring-0 overflow-hidden text-ellipsis whitespace-normal break-words"
               placeholder="Issue title"
               value={addIssueForm.title}
               onChange={(e) => setAddIssueForm({ ...addIssueForm, title: e.target.value })}
            />

            <Textarea
               className="border-none w-full shadow-none outline-none resize-none px-0 min-h-16 focus-visible:ring-0 break-words whitespace-normal overflow-wrap"
               placeholder="Add description..."
               value={addIssueForm.description}
               onChange={(e) => setAddIssueForm({ ...addIssueForm, description: e.target.value })}
            />

            <div className="w-full flex items-center justify-start gap-1.5 flex-wrap">
               <StatusSelector
                  status={addIssueForm.statusType}
                  onChange={(newStatus) =>
                     setAddIssueForm({ ...addIssueForm, statusType: newStatus })
                  }
               />
               <PrioritySelector
                  priority={addIssueForm.priority}
                  onChange={(newPriority) =>
                     setAddIssueForm({ ...addIssueForm, priority: newPriority })
                  }
               />
               <AssigneeSelector
                  assignee={addIssueForm.assignee}
                  users={users}
                  onChange={(newAssignee) =>
                     setAddIssueForm({ ...addIssueForm, assignee: newAssignee })
                  }
               />
               <LabelSelector
                  availableLabels={organizationLabels}
                  selectedLabels={addIssueForm.labels ? addIssueForm.labels : null}
                  onChange={(newLabels) => setAddIssueForm({ ...addIssueForm, labels: newLabels })}
                  onCreateLabel={handleCreateLabel}
               />
            </div>
         </div>

         <div className="flex items-center justify-between py-2.5 px-4 w-full border-t">
            <div className="flex items-center gap-2">
               <div className="flex items-center space-x-2">
                  <Switch id="create-more" checked={createMore} onCheckedChange={setCreateMore} />
                  <UILabel htmlFor="create-more">Create more</UILabel>
               </div>
            </div>
            <Button
               size="sm"
               onClick={() => {
                  createIssue();
               }}
            >
               Create issue
            </Button>
         </div>
      </>
   );
}
