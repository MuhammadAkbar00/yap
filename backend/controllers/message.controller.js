import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        unreadMessages: [{ userId: receiverId, count: 1 }],
      });
    } else {
      // Find unread messages entry for the receiver
      let unreadEntry = conversation.unreadMessages.find(
        (entry) => entry.userId.toString() === receiverId
      );

      if (unreadEntry) {
        unreadEntry.count += 1;
      } else {
        conversation.unreadMessages.push({ userId: receiverId, count: 1 });
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    conversation.messages.push(newMessage._id);

    // Save everything in parallel
    await Promise.all([conversation.save(), newMessage.save()]);

    // Emit new message via Socket.IO
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json([]);
    }

    const messages = conversation.messages;
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// I dont think we need this
export const resetUnreadMessages = async (req, res) => {
  try {
    const { id: otherUserId } = req.params; // The other participant's ID
    const userId = req.user._id; // Logged-in user

    // Find the conversation between the two participants
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Find the unread entry for the logged-in user
    const unreadEntry = conversation.unreadMessages.find(
      (entry) => entry.userId.toString() === userId.toString()
    );

    if (unreadEntry) {
      unreadEntry.count = 0;
    }

    await conversation.save();

    res.status(200).json({ message: "Unread messages reset successfully" });
  } catch (error) {
    console.error("Error resetting unread messages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
