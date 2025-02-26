import React, { useState, useCallback } from "react";
import { BsSend } from "react-icons/bs";
import useSendMessage from "../../hooks/useSendMessage";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";
import { useAuthContext } from "../../context/AuthContext";
import { debounce } from "lodash";

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const { loading, sendMessage } = useSendMessage();
  const { socket } = useSocketContext();
  const { selectedConversation } = useConversation();
  const { authUser } = useAuthContext();

  // Debounced function to emit "stopTyping" event (fires only after user stops typing for 2s)
  const debouncedStopTyping = useCallback(
    debounce(() => {
      socket?.emit("stopTyping", {
        senderId: authUser._id,
        receiverId: selectedConversation._id,
      });
    }, 2000), // Wait 2s before sending "stopTyping"
    [socket, authUser._id, selectedConversation._id]
  );

  const handleTyping = () => {
    // Emit "typing" immediately
    socket?.emit("typing", {
      senderId: authUser._id,
      receiverId: selectedConversation._id,
    });

    // Reset the "stopTyping" debounce timer
    debouncedStopTyping();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return;

    // Cancel pending stopTyping event
    debouncedStopTyping.cancel();
    socket?.emit("stopTyping", {
      senderId: authUser._id,
      receiverId: selectedConversation._id,
    });

    // Send message to backend
    await sendMessage(message);

    // Emit "newMessage" to update unread messages
    socket?.emit("newMessage", {
      senderId: authUser._id,
      receiverId: selectedConversation._id, // The receiver’s ID
    });

    // Clear input field
    setMessage("");
  };

  return (
    <form className="px-4 my-3" onSubmit={handleSubmit}>
      <div className="w-full relative">
        <input
          type="text"
          className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 text-white"
          placeholder="Send a message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
        />
        <button
          type="submit"
          className="absolute inset-y-0 end-0 flex items-center pe-3"
        >
          {loading ? (
            <div className="loading loading-spinner"></div>
          ) : (
            <BsSend />
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
