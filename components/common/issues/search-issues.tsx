'use client';

// import { useIssuesStore } from '@/store/issues-store';
import { useSearchStore } from '@/store/search-store';
import { useEffect, useState } from 'react';
import { IssueLine } from './issue-line';
import { Issue, searchIssues, filterIssues } from '@/lib/jazz-schema';

interface SearchIssuesProps {
   issues: Issue[];
   onIssueClick?: (issue: Issue) => void;
}

export function SearchIssues({ issues, onIssueClick }: SearchIssuesProps) {
   const [filteredResults, setFilteredResults] = useState<Issue[]>([]);
   // const { searchIssues } = useIssuesStore();
   const { searchQuery, isSearchOpen, filters } = useSearchStore();

   useEffect(() => {
      // Create a clean array of issues without nulls
      const cleanIssues = issues.filter((issue): issue is Issue => issue !== null);

      let results = cleanIssues;

      // Apply filters first if any are active
      if (Object.keys(filters).length > 0) {
         results = filterIssues(results, filters);
         console.log('filtered results', results);
      }

      // Then apply search query if present
      if (searchQuery.trim() !== '') {
         console.log('before search', results);
         results = searchIssues(results, searchQuery);
         console.log('search results', results, searchQuery);
      }

      console.log('last results', results);

      setFilteredResults(results.filter((issue): issue is Issue => issue !== null));
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
