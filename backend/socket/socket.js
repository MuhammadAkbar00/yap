import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors"; // Importing cors package

const app = express();

// Setup CORS middleware for Express
app.use(
  cors({
    origin: ["http://localhost:3000"], // specify the allowed origin(s)
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"], // optional, specify the allowed headers if necessary
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"], // Allowing connections from this domain
    methods: ["GET", "POST"],
  },
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId != "undefined") userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Listen for typing event
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", senderId); // Emit senderId (user ID)
    }
  });

  // Listen for stopTyping event
  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", senderId); // Emit senderId (user ID)
    }
  });

  // socket.on() is used to listen to the events. can be used both on client and server side
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
