import express from "express";
import {
  getMessages,
  resetUnreadMessages,
  sendMessage,
} from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.post("/reset-unread/:id", protectRoute, resetUnreadMessages);

export default router;
