import React from "react";
import useConversation from "../../zustand/useConversation";
import { useSocketContext } from "../../context/SocketContext";
import { useAuthContext } from "../../context/AuthContext"; // Import auth context

const Conversation = ({ conversation, lastIdx, emoji, unreadCount }) => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { socket } = useSocketContext();
  const { authUser } = useAuthContext();

  const isSelected = selectedConversation?._id === conversation._id;
  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(conversation._id);

  const handleConversationClick = () => {
    // Check if the selected conversation is the same as the clicked conversation
    if (selectedConversation?._id === conversation._id) {
      setSelectedConversation(null); // Deselect the conversation if it's the same
    } else {
      setSelectedConversation(conversation); // Select the new conversation

      // Emit "messageRead" event to notify backend
      socket?.emit("messageRead", {
        senderId: authUser._id, // Logged-in user's ID
        receiverId: conversation._id,
      });
    }
  };

  return (
    <>
      <div
        className={`flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer ${
          isSelected ? "bg-sky-500" : ""
        }`}
        onClick={handleConversationClick}
      >
        <div className={`avatar ${isOnline ? "avatar-online" : ""}`}>
          <div className="w-12 rounded-full">
            <img src={conversation.profilePic} alt="user avatar" />
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex gap-3 justify-between items-center">
            <p className="font-bold text-gray-200">{conversation.fullName}</p>

            <div className="flex items-center gap-2">
              <span className="text-xl">{emoji}</span>

              {unreadCount > 0 && (
                <div className="badge badge-error text-white">
                  {unreadCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!lastIdx && <div className="divider my-0 py-0 h-1" />}
    </>
  );
};

export default Conversation;
