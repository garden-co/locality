'use client';

import { format } from 'date-fns';
import { motion } from 'motion/react';
import { AssigneeUser } from './assignee-user';
import { LabelBadge } from './label-badge';
import { PrioritySelector } from './priority-selector';
import { StatusSelector } from './status-selector';
import { Issue } from '@/lib/jazz-schema';

interface IssueGridProps {
   issue: Issue;
   onClick?: () => void;
}

export function IssueGrid({ issue, onClick }: IssueGridProps) {
   return (
      <motion.div
         layoutId={`issue-grid-${issue.identifier}`}
         className="w-full p-3 bg-background rounded-md shadow-xs border border-border/50 cursor-pointer"
         onClick={onClick}
      >
         <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
               <PrioritySelector issue={issue} />
               <span className="text-xs text-muted-foreground font-medium">{issue.identifier}</span>
            </div>
            <StatusSelector issue={issue} />
         </div>

         <h3 className="text-sm font-semibold mb-3 line-clamp-2">{issue.title}</h3>

         <div className="flex flex-wrap gap-1.5 mb-3 min-h-[1.5rem]">
            {issue.labels && <LabelBadge labels={issue.labels} />}
         </div>

         <div className="flex items-center justify-between mt-auto pt-2">
            <span className="text-xs text-muted-foreground">
               {format(new Date(issue._edits.title.all[0].madeAt), 'MMM dd')}
            </span>
            <AssigneeUser issue={issue} />
         </div>
      </motion.div>
   );
}
