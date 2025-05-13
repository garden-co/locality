'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import { IssueSidebar } from '@/components/common/issues/issue-sidebar';
import { SubIssues } from '@/components/common/issues/sub-issues';
import { CommentSection } from '@/components/common/issues/CommentSection';
import { IssueAttachments } from '@/components/common/issues/issue-attachments';
import { Issue as IssueType } from '@/lib/jazz-schema';
import { ID } from 'jazz-tools';
import { Profile } from 'jazz-tools';

interface IssueProps {
   issueData: IssueType;
   currentUserId: ID<Profile> | undefined;
}

export function Issue({ issueData, currentUserId }: IssueProps) {
   const editor = useEditor(
      {
         extensions: [
            StarterKit.configure({
               bulletList: false,
            }),
            BulletList.configure({
               keepMarks: true,
               HTMLAttributes: {
                  class: 'text-white/50',
               },
            }),
            ListItem,
         ],
         content: issueData.description,
         onUpdate: ({ editor }) => {
            const newContent = editor.getHTML();
            issueData.description = newContent;
         },
      },
      []
   );

   const changeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;

      issueData.title = newTitle;
   };

   return (
      <div className="flex h-full">
         <div className="flex-1 px-6">
            <div className="max-w-[800px] py-6 mx-auto flex flex-col gap-8">
               <div className="flex flex-col gap-4">
                  <input
                     type="text"
                     value={issueData.title || ''}
                     onChange={changeTitle}
                     className="text-2xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 p-0 w-full"
                  />
                  <div className="placeholder:text-white/50 text-white/80 font-medium">
                     <EditorContent editor={editor} />
                  </div>

                  <IssueAttachments issueData={issueData} />

                  <SubIssues parentIssue={issueData} />
               </div>

               <CommentSection issueData={issueData} currentUserId={currentUserId} />
            </div>
         </div>

         <div className="w-[300px] min-w-[300px] bg-foreground/3 border-l border-border">
            <div className="sticky top-0 p-6">
               <IssueSidebar issueData={issueData} />
            </div>
         </div>
      </div>
   );
}
