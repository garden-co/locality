'use client';

import { useState, useRef } from 'react';
import { Issue as IssueType, Attachment, AttachmentList } from '@/lib/jazz-schema';
import { FileStream } from 'jazz-tools';
import { ProgressiveImg, createImage } from 'jazz-react';

interface IssueAttachmentsProps {
   issueData: IssueType;
}

type FileType = 'image' | 'video' | 'audio' | 'document' | 'other';

export function IssueAttachments({ issueData }: IssueAttachmentsProps) {
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [isUploading, setIsUploading] = useState(false);
   const [progress, setProgress] = useState(0);
   const [error, setError] = useState<string | null>(null);

   // Use a local variable for attachments to avoid mutating props
   const attachments: AttachmentList =
      issueData.attachments ?? AttachmentList.create([], issueData._owner);

   const handleFileClick = () => {
      fileInputRef.current?.click();
   };

   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file size (5MB limit for images)
      if (file.type.startsWith('image/') && file.size > 5000000) {
         setError('Please upload an image less than 5MB.');
         return;
      }

      try {
         setError(null);
         setIsUploading(true);
         setProgress(0);

         // Determine file type
         let fileType: FileType = 'other';
         if (file.type.startsWith('image/')) fileType = 'image';
         else if (file.type.startsWith('video/')) fileType = 'video';
         else if (file.type.startsWith('audio/')) fileType = 'audio';
         else if (file.type.includes('pdf') || file.type.includes('document'))
            fileType = 'document';

         // Create attachment with appropriate properties
         let attachment: Attachment;

         if (fileType === 'image' && attachments) {
            // For images, use createImage and save to attachment.image
            console.log('createImage', createImage);
            const image = await createImage(file, {
               owner: attachments._owner,
               maxSize: 2048,
            });

            console.log('image', image);

            // Update progress manually since createImage doesn't support onProgress
            setProgress(100);

            // Create filestream for compatibility with the Attachment model
            // const fileStream = await FileStream.createFromBlob(file, {});

            // Create attachment with both file (required) and image properties
            attachment = Attachment.create(
               {
                  name: file.name,
                  //    file: fileStream, // File is required by the model
                  image: image, // Store the image for display
                  type: fileType,
               },
               issueData._owner
            );
         } else {
            // For non-images, use FileStream and save to attachment.file
            const fileStream = await FileStream.createFromBlob(file, {
               onProgress: (p: number) => setProgress(Math.round(p * 100)),
            });

            attachment = Attachment.create(
               {
                  name: file.name,
                  file: fileStream, // Use file property for non-images
                  type: fileType,
               },
               issueData._owner
            );
         }

         // Add to the issue
         if (attachments) {
            attachments.push(attachment);
         }
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to upload file');
         console.error('Error uploading file:', err);
      } finally {
         setIsUploading(false);
         // Reset the file input
         if (fileInputRef.current) {
            fileInputRef.current.value = '';
         }
      }
   };

   const handleDeleteAttachment = (attachment: Attachment) => {
      if (!attachments) return;

      const index = attachments.indexOf(attachment);
      if (index !== -1) {
         attachments.splice(index, 1);
      }
   };

   const handleDownloadAttachment = (attachment: Attachment) => {
      // Always use file for download as it's guaranteed to exist
      if (!attachment.file) return;

      try {
         const blob = attachment.file.toBlob();
         const url = URL.createObjectURL(blob || new Blob());
         const a = document.createElement('a');
         a.href = url;
         a.download = attachment.name || 'download';
         a.click();
         URL.revokeObjectURL(url);
      } catch (err) {
         console.error('Error downloading file:', err);
      }
   };

   // Format file size for display
   const formatFileSize = (bytes?: number): string => {
      if (!bytes) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
   };

   return (
      <div className="flex flex-col gap-4">
         <div className="flex items-center justify-between">
            <h3 className="text-md font-medium">Attachments</h3>
            <button
               onClick={handleFileClick}
               className="flex items-center gap-2 text-sm text-white/70 hover:text-white/100 bg-foreground/10 px-3 py-1.5 rounded-md"
               disabled={isUploading}
            >
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               >
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                  <path d="M18 5V3M18 11V9M12 5h2m4 4h2" />
                  <circle cx="18" cy="7" r="2" />
               </svg>
               {isUploading ? `Uploading... ${progress}%` : 'Add file'}
            </button>
            <input
               type="file"
               ref={fileInputRef}
               className="hidden"
               onChange={handleFileChange}
               accept="image/*, audio/*, video/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
               disabled={isUploading}
            />
         </div>

         {error && (
            <div className="text-red-500 text-sm" role="alert">
               {error}
            </div>
         )}

         {attachments && attachments.length > 0 && (
            <div className="flex flex-col gap-4 mt-2">
               {attachments.map((attachment, index) => {
                  if (!attachment || attachment.deleted) return null;

                  console.log('attachment', attachment);

                  // For image type attachments, display the image using attachment.image
                  if (attachment.type === 'image' && attachment.image) {
                     console.log('attachment.image', attachment.image);
                     return (
                        <div
                           key={index}
                           className="flex flex-col bg-foreground/5 rounded-md overflow-hidden"
                        >
                           <div className="flex justify-center p-2">
                              <ProgressiveImg image={attachment.image}>
                                 {({ src }) => (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                       className="h-auto max-h-[20rem] max-w-full rounded-md"
                                       src={src || ''}
                                       alt={attachment.name}
                                    />
                                 )}
                              </ProgressiveImg>
                           </div>
                           <div className="flex items-center justify-between p-3 border-t border-foreground/10">
                              <div className="flex items-center gap-3">
                                 <span>🖼️</span>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-medium">{attachment.name}</span>
                                    <span className="text-xs text-white/50">
                                       {formatFileSize(
                                          attachment.file?.getChunks()?.totalSizeBytes
                                       )}
                                    </span>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button
                                    onClick={() => handleDownloadAttachment(attachment)}
                                    className="text-white/70 hover:text-white/100"
                                    title="Download"
                                 >
                                    <svg
                                       xmlns="http://www.w3.org/2000/svg"
                                       width="16"
                                       height="16"
                                       viewBox="0 0 24 24"
                                       fill="none"
                                       stroke="currentColor"
                                       strokeWidth="2"
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                    >
                                       <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                       <polyline points="7 10 12 15 17 10" />
                                       <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                 </button>
                                 <button
                                    onClick={() => handleDeleteAttachment(attachment)}
                                    className="text-white/70 hover:text-red-500"
                                    title="Delete"
                                 >
                                    <svg
                                       xmlns="http://www.w3.org/2000/svg"
                                       width="16"
                                       height="16"
                                       viewBox="0 0 24 24"
                                       fill="none"
                                       stroke="currentColor"
                                       strokeWidth="2"
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                    >
                                       <polyline points="3 6 5 6 21 6" />
                                       <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                 </button>
                              </div>
                           </div>
                        </div>
                     );
                  }

                  // For non-image attachments, use the existing display with attachment.file
                  const fileData = attachment.file?.getChunks();
                  return (
                     <div
                        key={index}
                        className="flex items-center justify-between bg-foreground/5 p-3 rounded-md"
                     >
                        <div className="flex items-center gap-3">
                           {attachment.type === 'video' && <span>🎬</span>}
                           {attachment.type === 'audio' && <span>🎵</span>}
                           {attachment.type === 'document' && <span>📄</span>}
                           {attachment.type === 'other' && <span>📎</span>}
                           <div className="flex flex-col">
                              <span className="text-sm font-medium">{attachment.name}</span>
                              <span className="text-xs text-white/50">
                                 {formatFileSize(fileData?.totalSizeBytes)}
                              </span>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button
                              onClick={() => handleDownloadAttachment(attachment)}
                              className="text-white/70 hover:text-white/100"
                              title="Download"
                           >
                              <svg
                                 xmlns="http://www.w3.org/2000/svg"
                                 width="16"
                                 height="16"
                                 viewBox="0 0 24 24"
                                 fill="none"
                                 stroke="currentColor"
                                 strokeWidth="2"
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                              >
                                 <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                 <polyline points="7 10 12 15 17 10" />
                                 <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                           </button>
                           <button
                              onClick={() => handleDeleteAttachment(attachment)}
                              className="text-white/70 hover:text-red-500"
                              title="Delete"
                           >
                              <svg
                                 xmlns="http://www.w3.org/2000/svg"
                                 width="16"
                                 height="16"
                                 viewBox="0 0 24 24"
                                 fill="none"
                                 stroke="currentColor"
                                 strokeWidth="2"
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                              >
                                 <polyline points="3 6 5 6 21 6" />
                                 <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                           </button>
                        </div>
                     </div>
                  );
               })}
            </div>
         )}
      </div>
   );
}
