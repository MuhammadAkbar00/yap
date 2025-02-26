import { create } from "zustand";

// Create a store for managing unread message counts
const useUnreadMessagesStore = create((set) => ({
  unreadMessages: {}, // { conversationId: unreadCount }

  setUnreadCount: (conversationId, unreadCount) =>
    set((state) => ({
      unreadMessages: {
        ...state.unreadMessages,
        [conversationId]: unreadCount,
      },
    })),
}));

export default useUnreadMessagesStore;
