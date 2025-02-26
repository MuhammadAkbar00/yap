import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";
import Conversation from "../models/conversation.model.js"; // Import the conversation model

const app = express();

// Setup CORS middleware for Express
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  // Emit updated online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Listen for typing event
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", senderId);
    }
  });

  // Listen for stopTyping event
  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", senderId);
    }
  });

  // Handle new message and update unread count
  socket.on("newMessage", async ({ senderId, receiverId }) => {
    try {
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!conversation) return;

      // Find the unread entry for the receiver and increment the count
      let unreadEntry = conversation.unreadMessages.find(
        (entry) => entry.userId.toString() === receiverId
      );

      await conversation.save();

      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        // io.to(receiverSocketId).emit("newMessage", {
        //   conversationId: conversation._id,
        //   senderId,
        // });

        // Emit the updated unread count to the receiver (client)
        io.to(receiverSocketId).emit("updateUnreadCount", {
          conversationId: receiverId,
          unreadCount: unreadEntry ? unreadEntry.count : 1,
        });
      }
    } catch (error) {
      console.error("Error updating unread messages:", error.message);
    }
  });

  // Handle message read event (when user opens the message)
  socket.on("messageRead", async ({ senderId, receiverId }) => {
    try {
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!conversation) return;

      // Reset the unread count for the user who read the message
      let unreadEntry = conversation.unreadMessages.find(
        (entry) => entry.userId.toString() === senderId
      );

      if (unreadEntry) {
        unreadEntry.count = 0; // Reset unread count
      }

      await conversation.save();

      // Emit the updated unread count to the user who read the message (to sync UI) TODO MAYBE?
      const senderSocketId = getReceiverSocketId(senderId.toString());
      io.to(senderSocketId).emit("updateUnreadCount", {
        conversationId: senderId,
        unreadCount: 0,
      });
    } catch (error) {
      console.error("Error resetting unread messages:", error.message);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
