'use client';

import { useState, useEffect } from 'react';
import { EditorContent, useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BulletList from '@tiptap/extension-bullet-list';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import {
   Issue,
   StatusType,
   PriorityType,
   Assignee,
   UserProfile,
   IssueList,
   Team,
} from '@/lib/jazz-schema';
import { StatusSelector } from '@/components/layout/sidebar/create-new-issue/status-selector';
import { PrioritySelector } from '@/components/layout/sidebar/create-new-issue/priority-selector';
import { AssigneeSelector } from '@/components/layout/sidebar/create-new-issue/assignee-selector';
import { status } from '@/lib/status';
import { CoMapInit } from 'jazz-tools';
import { useRouter, useParams } from 'next/navigation';

const isEditorEmpty = (editor: Editor | null) => {
   if (!editor) return true;
   const text = editor.getText().trim();
   return text.length === 0;
};

interface SubIssuesProps {
   parentIssue: Issue;
}

export function SubIssues({ parentIssue }: SubIssuesProps) {
   const subIssues = parentIssue?.childIssues;
   const [showSubIssueEditor, setShowSubIssueEditor] = useState(false);
   const [isSubIssuesExpanded, setIsSubIssuesExpanded] = useState(true);
   const router = useRouter();
   const params = useParams();
   const orgId = params.orgId as string;

   // New sub-issue form state
   const [newSubIssueStatus, setNewSubIssueStatus] = useState<typeof StatusType>('to-do');
   const [newSubIssuePriority, setNewSubIssuePriority] =
      useState<typeof PriorityType>('no-priority');
   const [newSubIssueAssignee, setNewSubIssueAssignee] = useState<typeof Assignee | null>(null);

   // Get parent issue's team
   const issueTeam = parentIssue?.team as Team;

   // Use a simplified approach for profiles
   let profiles: UserProfile[] = [];
   if (parentIssue?.assignee) {
      // At minimum, include the current assignee in the profiles list
      profiles = [parentIssue.assignee];
   }

   const subIssueTitleEditor = useEditor({
      extensions: [
         StarterKit.configure({
            bulletList: false,
         }),
         BulletList.configure({
            keepMarks: true,
            HTMLAttributes: {
               class: 'text-white/90',
            },
         }),
         Placeholder.configure({
            placeholder: 'Issue title',
            emptyEditorClass: 'is-editor-empty',
         }),
      ],
   });

   const subIssueDescriptionEditor = useEditor({
      extensions: [
         StarterKit.configure({
            bulletList: false,
         }),
         BulletList.configure({
            keepMarks: true,
            HTMLAttributes: {
               class: 'text-white/90',
            },
         }),
         Placeholder.configure({
            placeholder: 'Add description...',
            emptyEditorClass: 'is-editor-empty',
         }),
      ],
   });

   useEffect(() => {
      if (subIssueTitleEditor && showSubIssueEditor) {
         subIssueTitleEditor.commands.focus('start');
      }
   }, [subIssueTitleEditor, showSubIssueEditor]);

   // Helper function to get status icon
   const getStatusIcon = (statusType: typeof StatusType) => {
      const statusObj = status.find((s) => s.type === statusType);
      if (statusObj) {
         const Icon = statusObj.icon;
         return <Icon />;
      }
      return null;
   };

   // Function to navigate to issue detail page
   const navigateToIssue = (issue: Issue | null) => {
      if (issue && issue.identifier) {
         router.push(`/${orgId}/issue/${issue.identifier}`);
      }
   };

   return (
      <>
         {/* {subIssues?.length && subIssues.length > 0 && ( */}
         <div className="flex flex-col gap-2 mt-2 w-[98%] mx-auto">
            <div className="flex items-center justify-between text-white/50 font-semibold text-xs gap-2">
               <div className="flex items-center gap-2">
                  <button
                     onClick={() => setIsSubIssuesExpanded(!isSubIssuesExpanded)}
                     className="hover:text-white/90 transition-colors"
                  >
                     <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        className={`transform transition-transform ${isSubIssuesExpanded ? 'rotate-90' : ''}`}
                     >
                        <path
                           d="M6 12l4-4-4-4"
                           strokeWidth="1.5"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                        />
                     </svg>
                  </button>
                  <span>Sub-issues</span>
                  <p className="text-xs">
                     <span className="text-white/80">
                        {subIssues?.filter((issue) => issue?.statusType === 'completed').length}
                     </span>
                     /<span className="text-white/50">{subIssues?.length}</span>
                  </p>
               </div>
               <button
                  onClick={() => setShowSubIssueEditor(true)}
                  className="text-white/50 text-xs font-medium hover:text-white hover:bg-foreground/10 px-2 py-1 rounded-md hover:cursor-pointer"
               >
                  + Add sub-issues
               </button>
            </div>
            {isSubIssuesExpanded && (
               <div className="flex flex-col gap-2">
                  {subIssues?.map((subIssue) => (
                     <div
                        key={subIssue?.id}
                        className="flex items-center gap-2 p-2 rounded-md hover:cursor-pointer hover:bg-foreground/4"
                        onClick={() => navigateToIssue(subIssue)}
                     >
                        <div className="text-white/50 hover:text-white/90">
                           {getStatusIcon(subIssue?.statusType as typeof StatusType)}
                        </div>

                        <div className="flex-1">
                           <p className="text-sm font-medium text-white/90">{subIssue?.title}</p>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
         {/* )} */}

         {subIssues?.length === 0 && (
            <button
               onClick={() => setShowSubIssueEditor(true)}
               className="text-white/50 mr-auto text-xs font-medium hover:text-white hover:bg-foreground/10 px-2 py-1 rounded-md hover:cursor-pointer"
            >
               + Add sub-issues
            </button>
         )}

         {showSubIssueEditor && (
            <div className="relative mt-4">
               <div className="flex flex-col gap-3 w-full border border-neutral-800 bg-foreground/3 rounded-md p-4">
                  <div className="flex items-center gap-3">
                     <div className="text-white/50 hover:text-white/90">
                        {getStatusIcon(newSubIssueStatus)}
                     </div>
                     <div className="flex-1">
                        <EditorContent
                           className="text-white/90 placeholder:text-white/40 text-sm font-medium focus:outline-none prose-sm prose-invert"
                           editor={subIssueTitleEditor}
                        />
                     </div>
                  </div>

                  <EditorContent
                     className="text-white/90 placeholder:text-white/40 text-sm font-medium focus:outline-none prose-sm prose-invert"
                     editor={subIssueDescriptionEditor}
                  />

                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                     <StatusSelector
                        status={newSubIssueStatus}
                        onChange={(newStatus) => setNewSubIssueStatus(newStatus)}
                     />
                     <PrioritySelector
                        priority={newSubIssuePriority}
                        onChange={(newPriority) => setNewSubIssuePriority(newPriority)}
                     />
                     <AssigneeSelector
                        assignee={newSubIssueAssignee}
                        users={profiles}
                        onChange={(newAssignee) => setNewSubIssueAssignee(newAssignee)}
                     />
                  </div>

                  <div className="flex flex-row border-t pt-3 mt-3">
                     <div className="flex items-center gap-2">
                        <Button
                           size="sm"
                           variant="secondary"
                           className="text-xs px-2 py-1 h-6 bg-neutral-800 hover:bg-neutral-700 text-white/90"
                        >
                           NEW
                        </Button>
                     </div>

                     <div className="flex ml-auto gap-2">
                        <Button
                           onClick={() => {
                              setShowSubIssueEditor(false);
                              subIssueTitleEditor?.commands.clearContent();
                              subIssueDescriptionEditor?.commands.clearContent();
                           }}
                           size="sm"
                           variant="ghost"
                           className="text-white/50 text-xs font-medium hover:text-white hover:bg-foreground/10 px-3 py-1 h-7"
                        >
                           Cancel
                        </Button>
                        <Button
                           onClick={() => {
                              if (isEditorEmpty(subIssueTitleEditor)) {
                                 subIssueTitleEditor?.commands.focus();
                                 return;
                              }

                              const title = subIssueTitleEditor?.getHTML() || '';
                              const description = subIssueDescriptionEditor?.getHTML() || '';

                              // First ensure we have a valid team from the parent issue
                              if (!parentIssue.team) {
                                 console.error(
                                    "Cannot create sub-issue: parent issue doesn't have a team"
                                 );
                                 return;
                              }

                              const newSubIssue: CoMapInit<Issue> = {
                                 identifier: `${parentIssue.identifier}-${(subIssues?.length || 0) + 1}`,
                                 title: title.replace(/<[^>]*>/g, ''),
                                 description: description.replace(/<[^>]*>/g, ''),
                                 statusType: newSubIssueStatus,
                                 priority: newSubIssuePriority,
                                 assignee: newSubIssueAssignee,
                                 parentIssue: parentIssue,
                                 parentOrganization: parentIssue.parentOrganization,
                                 team: parentIssue.team, // Include the team from parent issue
                              };

                              // Create the new sub-issue
                              const createdSubIssue = Issue.create(newSubIssue, parentIssue._owner);

                              // Initialize childIssues if it doesn't exist
                              if (!parentIssue.childIssues) {
                                 parentIssue.childIssues = IssueList.create([], parentIssue._owner);
                              }

                              // Add to parent's sub-issues list
                              parentIssue.childIssues.push(createdSubIssue);

                              // Add to team's issues if the issue has a team reference
                              if (issueTeam?.issues) {
                                 // Check if the sub-issue is already in the team's issues
                                 const isAlreadyInTeam = issueTeam.issues.some(
                                    (issue) => issue && issue.id === createdSubIssue.id
                                 );
                                 if (!isAlreadyInTeam) {
                                    issueTeam.issues.push(createdSubIssue);
                                 }
                              }

                              // Reset form
                              setShowSubIssueEditor(false);
                              setNewSubIssueStatus('to-do');
                              setNewSubIssuePriority('no-priority');
                              setNewSubIssueAssignee(null);
                              subIssueTitleEditor?.commands.clearContent();
                              subIssueDescriptionEditor?.commands.clearContent();
                           }}
                           size="sm"
                           className={`${
                              isEditorEmpty(subIssueTitleEditor)
                                 ? 'bg-neutral-800/50 cursor-not-allowed'
                                 : 'bg-neutral-800 hover:bg-neutral-700'
                           } text-white/90 text-xs font-medium px-3 py-1 h-7`}
                        >
                           Create
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </>
   );
}
