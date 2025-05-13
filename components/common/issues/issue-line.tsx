'use client';

import { format } from 'date-fns';
import { AssigneeUser } from './assignee-user';
import { LabelBadge } from './label-badge';
import { PrioritySelector } from './priority-selector';
import { StatusSelector } from './status-selector';
import { Issue } from '@/lib/jazz-schema';

interface IssueLineProps {
   issue: Issue;
   onClick?: () => void;
}

export function IssueLine({ issue, onClick }: IssueLineProps) {
   return (
      <div
         onClick={onClick}
         className="w-full flex items-center justify-start h-11 px-6 hover:bg-sidebar/50 cursor-pointer"
      >
         <div className="flex items-center gap-0.5">
            <PrioritySelector issue={issue} />
            <span className="text-sm hidden sm:inline-block text-muted-foreground font-medium w-[66px] truncate shrink-0 mr-0.5">
               {issue.identifier}
            </span>
            <StatusSelector issue={issue} />
         </div>
         <span className="min-w-0 flex items-center justify-start mr-1 ml-0.5">
            <span className="text-xs sm:text-sm font-medium sm:font-semibold truncate">
               {issue.title}
            </span>
         </span>
         <div className="flex items-center justify-end gap-2 ml-auto sm:w-fit">
            <div className="w-3 shrink-0"></div>
            <div className="-space-x-5 hover:space-x-1 lg:space-x-1 items-center justify-end hidden sm:flex duration-200 transition-all">
               {issue.labels && <LabelBadge labels={issue.labels} />}
            </div>
            <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline-block">
               {format(new Date(issue._edits.title.all[0].madeAt), 'MMM dd')}
            </span>
            <AssigneeUser issue={issue} />
         </div>
      </div>
   );
}
