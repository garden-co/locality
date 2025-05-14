'use client';

import { useSearchStore } from '@/store/search-store';
import { useEffect, useState } from 'react';
import { IssueLine } from './issue-line';
import { Issue, IssueList, searchIssues, filterIssues } from '@/lib/jazz-schema';

interface SearchIssuesProps {
   issues: Issue[] | IssueList;
   onIssueClick?: (issue: Issue) => void;
}

export function SearchIssues({ issues, onIssueClick }: SearchIssuesProps) {
   const [filteredResults, setFilteredResults] = useState<Issue[]>([]);
   const { searchQuery, filters } = useSearchStore();

   useEffect(() => {
      const cleanIssues: Issue[] = Array.from(issues).filter(
         (issue): issue is Issue => issue !== null && issue !== undefined
      );

      let results: Issue[] = [...cleanIssues];

      if (Object.keys(filters).length > 0) {
         const filteredResults = filterIssues(cleanIssues, filters);
         results = filteredResults.filter(
            (issue): issue is Issue => issue !== null && issue !== undefined
         );
      }

      if (searchQuery.trim() !== '') {
         const searchResults = searchIssues(results, searchQuery);
         results = searchResults.filter(
            (issue): issue is Issue => issue !== null && issue !== undefined
         );
      }

      setFilteredResults(results);
   }, [searchQuery, issues, filters]);

   console.log('filtered results', filteredResults);

   // if (!isSearchOpen) {
   //    return null;
   // }

   const hasFilters = Object.keys(filters).length > 0;
   const hasSearchQuery = searchQuery.trim() !== '';
   const showResults = hasFilters || hasSearchQuery;

   console.log('showResults', showResults);

   return (
      <div className="w-full">
         {showResults && (
            <div>
               {filteredResults.length > 0 ? (
                  <div className="border rounded-md mt-4">
                     <div className="py-2 px-4 border-b bg-muted/50">
                        <h3 className="text-sm font-medium">Results ({filteredResults.length})</h3>
                     </div>
                     <div className="divide-y">
                        {filteredResults.map((issue) => (
                           <IssueLine
                              key={issue.id}
                              issue={issue}
                              onClick={() => onIssueClick && onIssueClick(issue)}
                           />
                        ))}
                     </div>
                  </div>
               ) : (
                  <div className="text-center py-8 text-muted-foreground">
                     No results found {hasSearchQuery && <>for &quot;{searchQuery}&quot;</>}
                  </div>
               )}
            </div>
         )}
      </div>
   );
}
