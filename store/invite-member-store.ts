import { create } from 'zustand';

type InviteContext = 'organization' | 'team';

interface InviteMemberState {
   isOpen: boolean;
   context: InviteContext;
   teamId?: string;
   openModal: (context: InviteContext, teamId?: string) => void;
   closeModal: () => void;
}

export const useInviteMemberStore = create<InviteMemberState>((set) => ({
   isOpen: false,
   context: 'organization',
   teamId: undefined,
   openModal: (context, teamId) => set({ isOpen: true, context, teamId }),
   closeModal: () => set({ isOpen: false }),
}));
