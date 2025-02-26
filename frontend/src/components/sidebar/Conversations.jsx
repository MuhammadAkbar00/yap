import React, { useEffect, useMemo } from "react";
import Conversation from "./Conversation";
import useGetConversations from "../../hooks/useGetConversation";
import { getRandomEmoji } from "../../utils/emojis";
import { useSocketContext } from "../../context/SocketContext";
import useUnreadMessagesStore from "../../zustand/useUnreadMessagesStore"; // Zustand store
import { useAuthContext } from "../../context/AuthContext";

const Conversations = () => {
  const { socket } = useSocketContext();

  const { loading, conversations } = useGetConversations();
  const { unreadMessages, setUnreadCount } = useUnreadMessagesStore();
  const { authUser } = useAuthContext();

  const randomEmoji = useMemo(() => getRandomEmoji(), []);

  // Listen for updated unread count via socket
  useEffect(() => {
    socket?.on("updateUnreadCount", ({ conversationId, unreadCount }) => {
      setUnreadCount(conversationId, unreadCount);
    });

    return () => {
      socket?.off("updateUnreadCount"); // Clean up the listener
    };
  }, [setUnreadCount, socket]);

  return (
    <div className="py-2 flex flex-col overflow-auto">
      {conversations.map((conversation, idx) => (
        <>
          <Conversation
            key={conversation._id + idx}
            conversation={conversation}
            emoji={randomEmoji}
            lastIdx={idx === conversations.length - 1}
            unreadCount={unreadMessages[authUser._id] || 0} // Get unread count from store
          />
        </>
      ))}
    </div>
  );
};

export default Conversations;
