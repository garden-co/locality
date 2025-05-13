import { create } from 'zustand';
import { StatusType, PriorityType, Assignee, Label, IssueFilters } from '@/lib/jazz-schema';

interface SearchState {
   isSearchOpen: boolean;
   searchQuery: string;
   isFilterOpen: boolean;
   filters: IssueFilters;

   openSearch: () => void;
   closeSearch: () => void;
   toggleSearch: () => void;
   setSearchQuery: (query: string) => void;
   resetSearch: () => void;

   openFilter: () => void;
   closeFilter: () => void;
   toggleFilter: () => void;
   setStatusFilter: (status: typeof StatusType | undefined) => void;
   setPriorityFilter: (priority: typeof PriorityType | undefined) => void;
   setAssigneeFilter: (assignee: typeof Assignee | undefined) => void;
   setLabelsFilter: (labels: Label[] | undefined) => void;
   resetFilters: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
   isSearchOpen: false,
   searchQuery: '',
   isFilterOpen: false,
   filters: {},

   openSearch: () => set({ isSearchOpen: true }),
   closeSearch: () => set({ isSearchOpen: false }),
   toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
   setSearchQuery: (query: string) => set({ searchQuery: query }),
   resetSearch: () => set({ isSearchOpen: false, searchQuery: '' }),

   openFilter: () => set({ isFilterOpen: true }),
   closeFilter: () => set({ isFilterOpen: false }),
   toggleFilter: () => set((state) => ({ isFilterOpen: !state.isFilterOpen })),
   setStatusFilter: (status) =>
      set((state) => ({
         filters: { ...state.filters, status },
      })),
   setPriorityFilter: (priority) =>
      set((state) => ({
         filters: { ...state.filters, priority },
      })),
   setAssigneeFilter: (assignee) =>
      set((state) => ({
         filters: { ...state.filters, assignee },
      })),
   setLabelsFilter: (labels) =>
      set((state) => ({
         filters: { ...state.filters, labels },
      })),
   resetFilters: () => set({ filters: {} }),
}));
