'use client';

import { useMemo } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import {
   Issue,
   Comment as CommentCoValue,
   CommentList,
   AttachmentList,
   ReactionsList,
} from '@/lib/jazz-schema';
import { toast } from 'sonner';
import { CoMapInit, ID, Profile } from 'jazz-tools';
import { getTimeAgo } from '@/lib/utils';
import { Comment } from '@/components/common/issues/Comment';

type ReactionKey =
   | 'thumb-up'
   | 'thumb-down'
   | 'laugh'
   | 'heart'
   | 'sad'
   | 'angry'
   | 'surprised'
   | 'thinking'
   | 'wink'
   | 'clap'
   | 'fire'
   | 'fireworks'
   | 'party';

interface CommentSectionProps {
   issueData: Issue;
   currentUserId: ID<Profile> | undefined;
}

// Helper function to recursively render comment with its replies
function CommentWithReplies({
   comment,
   allComments,
   onCommentUpdate,
   onReactionUpdate,
   onCommentDelete,
   onReplyAdd,
   level = 0,
   currentUserId,
}: {
   comment: CommentCoValue;
   allComments: CommentCoValue[];
   onCommentUpdate: (commentId: string, content: string) => void;
   onReactionUpdate: (commentId: string, reaction: ReactionKey, add: boolean) => void;
   onCommentDelete: (commentId: string) => void;
   onReplyAdd: (parentId: string, content: string) => void;
   level?: number;
   currentUserId: ID<Profile> | undefined;
}) {
   // Find all direct replies to this comment
   const replies = allComments.filter(
      (reply) => reply && reply.parentComment && reply.parentComment.id === comment.id
   );

   // Calculate indentation based on nesting level
   const getIndentClass = () => {
      switch (level) {
         case 0:
            return '';
         case 1:
            return 'ml-4';
         case 2:
            return 'ml-8';
         case 3:
            return 'ml-12';
         case 4:
            return 'ml-16';
         default:
            return 'ml-20'; // Max indent for deep nesting
      }
   };

   return (
      <div className={`space-y-3 ${getIndentClass()}`}>
         {/* Render the comment */}
         <Comment
            comment={comment}
            onCommentUpdate={onCommentUpdate}
            onReactionUpdate={onReactionUpdate}
            onCommentDelete={onCommentDelete}
            onReplyAdd={onReplyAdd}
            currentUserId={currentUserId}
         />

         {/* Recursively render replies */}
         {replies.length > 0 && (
            <div className="space-y-3">
               {replies.map((reply) => (
                  <CommentWithReplies
                     key={reply.id}
                     comment={reply}
                     allComments={allComments}
                     onCommentUpdate={onCommentUpdate}
                     onReactionUpdate={onReactionUpdate}
                     onCommentDelete={onCommentDelete}
                     onReplyAdd={onReplyAdd}
                     level={level + 1}
                     currentUserId={currentUserId}
                  />
               ))}
            </div>
         )}
      </div>
   );
}

export function CommentSection({ issueData, currentUserId }: CommentSectionProps) {
   // Comment form editor
   const commentEditor = useEditor({
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
         ListItem,
         Placeholder.configure({
            placeholder: 'Leave a comment...',
            emptyEditorClass: 'is-editor-empty',
         }),
      ],
      editorProps: {
         attributes: {
            class: 'min-h-[80px] bg-[#1f1e1e9a] rounded-lg p-2 px-4 text-white/90 placeholder:text-white/30 focus:outline-none prose-sm prose-invert',
         },
      },
   });

   const submitComment = () => {
      if (!commentEditor || !issueData) return;

      const content = commentEditor.getHTML();
      if (!content || content === '<p></p>') {
         toast.error('Comment cannot be empty');
         return;
      }

      // Initialize comments if needed
      if (!issueData.comments) {
         issueData.comments = CommentList.create([]);
      }

      const commentData: CoMapInit<CommentCoValue> = {
         content,
         parentIssue: issueData,
         reactions: ReactionsList.create([]),
         attachments: AttachmentList.create([]),
         deleted: false,
      };

      issueData.comments.push(CommentCoValue.create(commentData));

      toast.success('Comment added');
      commentEditor.commands.clearContent();
   };

   // Handle comment updates
   const handleCommentUpdate = (commentId: string, content: string) => {
      if (issueData.comments) {
         const comment = issueData.comments.find((c) => c?.id === commentId);
         if (comment) {
            comment.content = content;
         }
      }
   };

   // Handle comment deletion
   const handleCommentDelete = (commentId: string) => {
      if (issueData.comments) {
         const commentIndex = issueData.comments.findIndex((c) => c?.id === commentId);
         if (commentIndex !== -1) {
            // Use splice to remove the comment
            issueData.comments.splice(commentIndex, 1);
         }
      }
   };

   // Handle reaction updates
   const handleReactionUpdate = (commentId: string, reaction: ReactionKey, add: boolean) => {
      if (!issueData.comments) return;

      const comment = issueData.comments.find((c) => c?.id === commentId);
      if (!comment) return;

      // Initialize reactions if needed
      if (!comment.reactions) {
         comment.reactions = ReactionsList.create([]);
      }

      if (add) {
         // Add reaction if not already present
         if (!comment.reactions.includes(reaction)) {
            comment.reactions.push(reaction);
         }
      } else {
         // Remove reaction
         const index = comment.reactions.indexOf(reaction);
         if (index !== -1) {
            comment.reactions.splice(index, 1);
         }
      }
   };

   // Handle reply to a comment
   const handleReplyAdd = (parentId: string, content: string) => {
      if (!issueData.comments) return;

      const parentComment = issueData.comments.find((c) => c?.id === parentId);
      if (!parentComment) return;

      // Create a new comment with the parent reference
      const commentData: CoMapInit<CommentCoValue> = {
         content,
         parentIssue: issueData,
         parentComment: parentComment,
         reactions: ReactionsList.create([]),
         attachments: AttachmentList.create([]),
         deleted: false,
      };

      // Add the reply to the comments list
      issueData.comments.push(CommentCoValue.create(commentData));
   };

   // Filter out any null comments to avoid TypeScript issues
   const validComments = useMemo(() => {
      return (
         issueData.comments?.filter(
            (comment): comment is NonNullable<typeof comment> =>
               comment !== null && comment !== undefined
         ) || []
      );
   }, [issueData.comments]);

   // Find top-level comments (those without a parent)
   const topLevelComments = useMemo(() => {
      return validComments.filter((comment) => !comment.parentComment);
   }, [validComments]);

   return (
      <div className="flex flex-col w-[98%] mx-auto gap-2 border-t border-border pt-4">
         <div className="flex items-center justify-between">
            <h2 className="text-md font-semibold">Activity</h2>
            <button className="text-white/50 text-xs font-medium hover:text-white hover:bg-foreground/10 px-3 py-1 rounded-md hover:cursor-pointer">
               Unsubscribe
            </button>
         </div>
         <p className="text-white/50 text-xs">
            {issueData.assignee ? `${issueData.assignee?.name} created this issue` : 'Unassigned'}
            <span className="mx-1">·</span>
            <span className="hover:text-white/70 hover:cursor-pointer font-medium">
               {getTimeAgo(issueData._edits.title.all[0].madeAt)}
            </span>
         </p>

         {validComments.length > 0 && (
            <div className="mt-4 space-y-4">
               {/* Render top-level comments and their nested replies */}
               {topLevelComments.map((comment) => (
                  <CommentWithReplies
                     key={comment.id}
                     comment={comment}
                     allComments={validComments}
                     onCommentUpdate={handleCommentUpdate}
                     onReactionUpdate={handleReactionUpdate}
                     onCommentDelete={handleCommentDelete}
                     onReplyAdd={handleReplyAdd}
                     currentUserId={currentUserId}
                  />
               ))}
            </div>
         )}

         <div className="relative mt-4">
            <EditorContent
               className="text-white/90 placeholder:text-white/30"
               editor={commentEditor}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
               <button className="p-2 cursor-pointer text-white/50 hover:text-white/90 transition-all duration-200">
                  <svg
                     width="12"
                     height="14"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2"
                  >
                     <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                  </svg>
               </button>
               <button
                  className="p-2 cursor-pointer rounded-full bg-neutral-800 text-white/60 hover:text-white/90 transition-all duration-200"
                  onClick={submitComment}
               >
                  <svg
                     width="12"
                     height="14"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2"
                  >
                     <path d="M12 20V4M12 4L5 11M12 4L19 11" />
                  </svg>
               </button>
            </div>
         </div>
      </div>
   );
}
