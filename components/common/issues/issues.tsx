'use client';

import { GroupIssues } from '@/components/common/issues/group-issues';
import { cn } from '@/lib/utils';
import { status } from '@/lib/status';
import { useSearchStore } from '@/store/search-store';
import { useViewStore } from '@/store/view-store';
import { SearchIssues } from './search-issues';
import { Issue, groupIssuesByStatus, Organization } from '@/lib/jazz-schema';
import { useRouter, useParams } from 'next/navigation';

export default function Issues({
   issues,
   type,
}: {
   issues: Issue[] | undefined;
   type: 'my-issues' | 'all-issues';
   organization?: Organization;
}) {
   const { searchQuery, filters } = useSearchStore();
   const { viewType } = useViewStore();
   const router = useRouter();
   const params = useParams();
   const orgId = params.orgId as string;

   const issuesByStatus = groupIssuesByStatus(issues ?? []);
   const hasNoIssues = !issues || issues.length === 0;

   const navigateToIssue = (issue: Issue) => {
      if (issue && issue.identifier) {
         router.push(`/${orgId}/issue/${issue.identifier}`);
      }
   };

   const hasActiveFiltering = searchQuery.trim() !== '' || Object.keys(filters).length > 0;

   if (type === 'my-issues' && hasNoIssues) {
      return (
         <div className="flex items-center justify-center h-full">
            <p className="text-lg text-muted-foreground">There are no issues assigned to you</p>
         </div>
      );
   }

   const safeIssues = issues?.filter((issue): issue is Issue => issue !== null) || [];

   return (
      <div className={cn('w-full h-full', viewType === 'grid' ? 'overflow-x-auto' : '')}>
         {hasActiveFiltering ? (
            <div className="px-6 mb-6">
               {safeIssues.length > 0 && (
                  <SearchIssues issues={safeIssues} onIssueClick={navigateToIssue} />
               )}
            </div>
         ) : viewType === 'list' ? (
            <div>
               {status.map((statusItem) => {
                  const statusIssues = issuesByStatus[statusItem?.type || ''] || [];
                  if (statusIssues.length === 0) return null;

                  return (
                     <GroupIssues
                        key={statusItem?.type}
                        status={statusItem}
                        issues={statusIssues}
                        count={statusIssues.length}
                        onIssueClick={navigateToIssue}
                     />
                  );
               })}
            </div>
         ) : (
            <div className="flex h-full gap-3 px-2 py-2 min-w-max">
               {status.map((statusItem) => (
                  <GroupIssues
                     key={statusItem?.type}
                     status={statusItem}
                     issues={issuesByStatus[statusItem?.type || ''] || []}
                     count={issuesByStatus[statusItem?.type || '']?.length || 0}
                     onIssueClick={navigateToIssue}
                  />
               ))}
            </div>
         )}
      </div>
   );
}
