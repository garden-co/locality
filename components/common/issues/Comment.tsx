'use client';

import { useState, useRef, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import { Comment as CommentType } from '@/lib/jazz-schema';
import { toast } from 'sonner';
import { getTimeAgo } from '@/lib/utils';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Smile, Trash2, MessageSquare, ArrowRight } from 'lucide-react';
import { ID, Profile } from 'jazz-tools';

// Define a string literal type for reaction keys
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

// Map of emoji characters to ReactionsList accepted values
const EMOJI_TO_REACTION_MAP: Record<string, ReactionKey> = {
   '👍': 'thumb-up',
   '👎': 'thumb-down',
   '😂': 'laugh',
   '❤️': 'heart',
   '😢': 'sad',
   '😠': 'angry',
   '😮': 'surprised',
   '🤔': 'thinking',
   '😉': 'wink',
   '👏': 'clap',
   '🔥': 'fire',
   '🎆': 'fireworks',
   '🎉': 'party',
};

// Reverse map for display purposes
const REACTION_TO_EMOJI_MAP: Record<ReactionKey, string> = {
   'thumb-up': '👍',
   'thumb-down': '👎',
   'laugh': '😂',
   'heart': '❤️',
   'sad': '😢',
   'angry': '😠',
   'surprised': '😮',
   'thinking': '🤔',
   'wink': '😉',
   'clap': '👏',
   'fire': '🔥',
   'fireworks': '🎆',
   'party': '🎉',
};

// Allow only these reactions in the picker
const ALLOWED_REACTIONS = [
   '👍',
   '👎',
   '😂',
   '❤️',
   '😢',
   '😠',
   '😮',
   '🤔',
   '😉',
   '👏',
   '🔥',
   '🎆',
   '🎉',
];

// Define a type for emoji reactions
interface EmojiReaction {
   reactionType: ReactionKey; // Using the allowed reaction values
   emoji: string; // The actual emoji character for display
   count: number;
   users: string[];
}

// We'll use a custom property instead of extending the CommentType
type CommentReactionsMap = Record<ReactionKey, EmojiReaction>;

interface CommentProps {
   comment: CommentType;
   onCommentUpdate: (commentId: string, content: string) => void;
   onReactionUpdate: (commentId: string, reaction: ReactionKey, add: boolean) => void;
   onCommentDelete: (commentId: string) => void;
   onReplyAdd?: (parentId: string, content: string) => void;
   currentUserId: ID<Profile> | undefined;
}

export function Comment({
   comment,
   onCommentUpdate,
   onReactionUpdate,
   onCommentDelete,
   onReplyAdd,
   currentUserId,
}: CommentProps) {
   const [isEditing, setIsEditing] = useState<boolean>(false);
   const [editContent, setEditContent] = useState<string>('');
   const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
   const [isReplying, setIsReplying] = useState<boolean>(false);
   const [replyText, setReplyText] = useState<string>('');
   const emojiPickerRef = useRef<HTMLDivElement>(null);

   // Initialize reactions from the comment
   const [reactions, setReactions] = useState<CommentReactionsMap>({} as CommentReactionsMap);

   const editCommentEditor = useEditor({
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
      ],
      content: editContent,
      editorProps: {
         attributes: {
            class: 'min-h-[60px] bg-[#1f1e1e9a] rounded-lg p-2 px-4 text-white/90 placeholder:text-white/30 focus:outline-none prose-sm prose-invert',
         },
      },
      onUpdate: ({ editor }) => {
         setEditContent(editor.getHTML());
      },
   });

   // Close emoji picker when clicking outside
   useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
         if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
            setShowEmojiPicker(false);
         }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, []);

   const startEditing = () => {
      setIsEditing(true);
      setEditContent(comment.content || '');

      // Update the editor content after state is set
      setTimeout(() => {
         if (editCommentEditor) {
            editCommentEditor.commands.setContent(comment.content || '');
         }
      }, 0);
   };

   const saveEditedComment = () => {
      onCommentUpdate(comment.id, editContent);
      setIsEditing(false);
      toast.success('Comment updated');
   };

   const cancelEditing = () => {
      setIsEditing(false);
   };

   const toggleEmojiPicker = () => {
      setShowEmojiPicker(!showEmojiPicker);
   };

   const addReaction = (emoji: string) => {
      // Check if the emoji is in our allowed map
      const reactionType = EMOJI_TO_REACTION_MAP[emoji];
      if (!reactionType) {
         console.warn(`Emoji ${emoji} is not in the allowed reactions list.`);
         toast.error('This emoji reaction is not supported');
         return;
      }

      // Check if this reaction already exists in our local state
      const hasReaction = reactions[reactionType]?.users.includes(currentUserId || '');

      // Update parent component through callback
      onReactionUpdate(comment.id, reactionType, !hasReaction);

      // Update local state
      setReactions((prevReactions) => {
         if (!currentUserId) return prevReactions;

         const newReactions = { ...prevReactions };

         if (newReactions[reactionType]) {
            if (hasReaction) {
               // Remove user's reaction
               newReactions[reactionType].count -= 1;
               newReactions[reactionType].users = newReactions[reactionType].users.filter(
                  (user) => user !== currentUserId
               );

               // Remove reaction if count is 0
               if (newReactions[reactionType].count === 0) {
                  delete newReactions[reactionType];
               }
            } else {
               // Add user's reaction
               newReactions[reactionType].count += 1;
               newReactions[reactionType].users.push(currentUserId);
            }
         } else {
            // Create new reaction
            newReactions[reactionType] = {
               reactionType,
               emoji,
               count: 1,
               users: [currentUserId],
            };
         }

         return newReactions;
      });

      // Close emoji picker
      setShowEmojiPicker(false);
   };

   // Initialize the reaction state from the comment data when the component mounts
   useEffect(() => {
      if (!comment || !comment.reactions || !currentUserId) return;

      const commentReactionsMap = {} as CommentReactionsMap;

      // Convert each reaction in the list to our format
      comment.reactions.forEach((reactionType) => {
         // Get the emoji for this reaction type - we need to cast the reactionType
         const typedReaction = reactionType as unknown as ReactionKey;
         const emoji = REACTION_TO_EMOJI_MAP[typedReaction];

         if (emoji) {
            commentReactionsMap[typedReaction] = {
               reactionType: typedReaction,
               emoji,
               count: 1, // Just a placeholder count
               users: [currentUserId], // Assume current user for simplicity
            };
         }
      });

      setReactions(commentReactionsMap);
   }, [comment, currentUserId]);

   // Get author name from the comment
   const authorName = comment._edits.content.all?.[0]?.by?.profile?.name || 'Unknown';

   // Check if this is a reply comment
   const isReply = !!comment.parentComment;

   // Get the parent comment author if this is a reply
   const parentAuthor =
      isReply && comment.parentComment?._edits?.content?.all?.[0]?.by?.profile?.name;

   // Add a handler for deleting the comment
   const handleDelete = () => {
      onCommentDelete(comment.id);
      toast.success('Comment deleted');
   };

   // Add handler for reply
   const handleReply = () => {
      setIsReplying(!isReplying);
   };

   const submitReply = () => {
      if (!replyText.trim()) {
         toast.error('Reply cannot be empty');
         return;
      }

      if (onReplyAdd) {
         onReplyAdd(comment.id, replyText);
         setReplyText('');
         setIsReplying(false);
         toast.success('Reply added');
      }
   };

   return (
      <div
         className={`rounded-lg p-3 group relative ${isReply ? 'ml-6 border-l-2 border-neutral-700/30 bg-foreground/3' : 'bg-foreground/5'}`}
      >
         {isReply && (
            <div className="absolute -left-5 top-4 h-3 w-3 border-b border-l border-neutral-700/30"></div>
         )}
         <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
               <span className="font-medium">{authorName}</span>
               <span className="text-white/50 text-xs">
                  {getTimeAgo(new Date(comment._edits.content.all[0].madeAt))}
               </span>
               {isReply && parentAuthor && (
                  <span className="text-white/40 text-xs ml-1">
                     replying to <span className="text-white/60 font-medium">{parentAuthor}</span>
                  </span>
               )}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
               <button
                  onClick={toggleEmojiPicker}
                  className="p-1 rounded hover:bg-neutral-800 text-white/50 hover:text-white/90"
               >
                  <Smile className="h-4 w-4" />
               </button>
               <DropdownMenu>
                  <DropdownMenuTrigger>
                     <MoreHorizontal className="h-4 w-4 text-white/50 hover:text-white/90" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800">
                     <DropdownMenuItem
                        onClick={startEditing}
                        className="text-white/70 hover:text-white focus:text-white cursor-pointer"
                     >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                     </DropdownMenuItem>
                     <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-red-500 hover:text-red-400 focus:text-red-400 cursor-pointer"
                     >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
         </div>

         {isEditing ? (
            <div className="space-y-2">
               <EditorContent editor={editCommentEditor} className="text-white/90" />
               <div className="flex justify-end gap-2 mt-2">
                  <button
                     onClick={cancelEditing}
                     className="px-3 py-1 text-xs text-white/50 hover:text-white/90 hover:bg-neutral-800 rounded-md"
                  >
                     Cancel
                  </button>
                  <button
                     onClick={saveEditedComment}
                     className="px-3 py-1 text-xs text-white bg-neutral-800 hover:bg-neutral-700 rounded-md"
                  >
                     Save
                  </button>
               </div>
            </div>
         ) : (
            <>
               <div
                  className="text-white/90 prose-sm prose-invert"
                  dangerouslySetInnerHTML={{ __html: comment.content || '' }}
               />

               {/* Emoji reactions */}
               {Object.keys(reactions).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                     {Object.values(reactions).map((reaction) => (
                        <button
                           key={reaction.reactionType}
                           onClick={() => addReaction(reaction.emoji)}
                           className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              reaction.users.includes(currentUserId || '')
                                 ? 'bg-primary/20 text-primary'
                                 : 'bg-neutral-800 text-white/70 hover:bg-neutral-700'
                           }`}
                        >
                           <span className="mr-1">{reaction.emoji}</span>
                           <span>{reaction.count}</span>
                        </button>
                     ))}
                  </div>
               )}

               {/* Simple emoji picker */}
               {showEmojiPicker && (
                  <div className="absolute z-10 right-0 mt-2" ref={emojiPickerRef}>
                     <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg p-2">
                        <div className="grid grid-cols-5 gap-2">
                           {ALLOWED_REACTIONS.map((emoji) => (
                              <button
                                 key={emoji}
                                 onClick={() => addReaction(emoji)}
                                 className="hover:bg-neutral-800 p-2 rounded text-lg"
                              >
                                 {emoji}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {/* Reply button */}
               <div className="mt-2 flex">
                  <button
                     onClick={handleReply}
                     className="flex items-center text-xs text-white/50 hover:text-white/70 transition-colors"
                  >
                     <MessageSquare className="h-3 w-3 mr-1" />
                     Reply
                  </button>
               </div>

               {/* Reply input */}
               {isReplying && (
                  <div className="mt-3 border-t border-neutral-700/30 pt-3">
                     <div className="relative">
                        <input
                           type="text"
                           value={replyText}
                           onChange={(e) => setReplyText(e.target.value)}
                           placeholder="Leave a reply..."
                           className="w-full bg-[#1f1e1e9a] rounded-lg p-2 px-3 text-white/90 placeholder:text-white/30 focus:outline-none text-sm pr-10"
                        />
                        <button
                           onClick={submitReply}
                           className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white/60 hover:text-white/90"
                        >
                           <ArrowRight className="h-4 w-4" />
                        </button>
                     </div>
                  </div>
               )}
            </>
         )}
      </div>
   );
}
