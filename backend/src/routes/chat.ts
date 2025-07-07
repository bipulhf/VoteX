import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  validateParams,
  validateQuery,
  validateBody,
} from "../middleware/validation";
import { ChatService } from "../services/chatService";
import { asyncHandler } from "../middleware/errorHandler";
import { z } from "zod";

const router = Router();
const chatService = new ChatService();

// Validation schemas
const electionIdSchema = z.object({
  electionId: z.string().min(1, "Election ID is required"),
});

const chatRoomIdSchema = z.object({
  chatRoomId: z.string().min(1, "Chat room ID is required"),
});

const messageIdSchema = z.object({
  messageId: z.string().min(1, "Message ID is required"),
});

const chatHistoryQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message content is required")
    .max(1000, "Message is too long"),
});

const editMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message content is required")
    .max(1000, "Message is too long"),
});

// Get all chat rooms for the authenticated user
router.get(
  "/rooms",
  authenticate,
  asyncHandler(async (req: any, res) => {
    const chatRooms = await chatService.getUserChatRooms(
      req.user.id,
      req.user.role
    );

    res.json({
      success: true,
      data: chatRooms,
    });
  })
);

// Get or create chat room for a specific election
router.get(
  "/room/election/:electionId",
  authenticate,
  validateParams(electionIdSchema),
  asyncHandler(async (req: any, res) => {
    const { electionId } = req.params;

    const chatRoom = await chatService.getChatRoomByElectionId(
      electionId,
      req.user.id,
      req.user.role
    );

    res.json({
      success: true,
      data: chatRoom,
    });
  })
);

// Get chat history for a specific chat room
router.get(
  "/room/:chatRoomId/messages",
  authenticate,
  validateParams(chatRoomIdSchema),
  validateQuery(chatHistoryQuerySchema),
  asyncHandler(async (req: any, res) => {
    const { chatRoomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const result = await chatService.getChatHistory(
      chatRoomId,
      req.user.id,
      req.user.role,
      page,
      limit
    );

    res.json({
      success: true,
      data: result,
    });
  })
);

// Send message to chat room (REST fallback)
router.post(
  "/room/:chatRoomId/messages",
  authenticate,
  validateParams(chatRoomIdSchema),
  validateBody(sendMessageSchema),
  asyncHandler(async (req: any, res) => {
    const { chatRoomId } = req.params;
    const { content } = req.body;

    const message = await chatService.sendMessage(
      chatRoomId,
      req.user.id,
      content,
      req.user.role
    );

    res.status(201).json({
      success: true,
      data: message,
      message: "Message sent successfully",
    });
  })
);

// Edit message
router.put(
  "/message/:messageId",
  authenticate,
  validateParams(messageIdSchema),
  validateBody(editMessageSchema),
  asyncHandler(async (req: any, res) => {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await chatService.editMessage(
      messageId,
      req.user.id,
      content,
      req.user.role
    );

    res.json({
      success: true,
      data: message,
      message: "Message updated successfully",
    });
  })
);

// Delete message
router.delete(
  "/message/:messageId",
  authenticate,
  validateParams(messageIdSchema),
  asyncHandler(async (req: any, res) => {
    const { messageId } = req.params;

    await chatService.deleteMessage(messageId, req.user.id, req.user.role);

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  })
);

export default router;
