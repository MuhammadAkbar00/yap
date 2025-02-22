import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";

// Auth Routes
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import connectToMongoDB from "./db/connectToMongoDB.js";
import { app, server } from "./socket/socket.js";

dotenv.config();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json()); // to parse incoming JSON payloads
app.use(cookieParser()); // middleware to access cookies

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

if (process.env.NODE_ENV === "production") {
  // Serve built frontend files in production
  app.use(express.static(path.join(__dirname, "frontend", "dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  });
} else {
  console.log("Development mode: Frontend is not served by backend");
}

server.listen(PORT, () => {
  connectToMongoDB();
  console.log(
    `Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
});
