import { Server, Socket } from "socket.io";
import { ChatService } from "../services/chatService";
import { AuthenticatedSocket } from "../middleware/socketAuth";
import { UserRole } from "@prisma/client";
import prisma from "../config/database";

export interface ChatEvents {
  // Client to server events
  "chat:join-room": (data: { electionId: string }) => void;
  "chat:leave-room": (data: { electionId: string }) => void;
  "chat:send-message": (data: { chatRoomId: string; content: string }) => void;
  "chat:edit-message": (data: { messageId: string; content: string }) => void;
  "chat:delete-message": (data: { messageId: string }) => void;
  "chat:typing-start": (data: { chatRoomId: string }) => void;
  "chat:typing-stop": (data: { chatRoomId: string }) => void;

  // Server to client events
  "chat:message-received": (data: any) => void;
  "chat:message-edited": (data: any) => void;
  "chat:message-deleted": (data: {
    messageId: string;
    chatRoomId: string;
  }) => void;
  "chat:user-joined": (data: { user: any; chatRoomId: string }) => void;
  "chat:user-left": (data: { user: any; chatRoomId: string }) => void;
  "chat:typing": (data: {
    user: any;
    chatRoomId: string;
    isTyping: boolean;
  }) => void;
  "chat:error": (data: { message: string }) => void;
}

export class ChatSocketHandler {
  private chatService: ChatService;
  private typingUsers: Map<string, Set<string>> = new Map(); // chatRoomId -> Set of userIds

  constructor() {
    this.chatService = new ChatService();
  }

  async getUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
    return user;
  }

  handleConnection(io: Server, socket: AuthenticatedSocket) {
    console.log(`User ${socket.user.userId} connected to chat`);

    // Join room handler
    socket.on("chat:join-room", async (data: { electionId: string }) => {
      try {
        const { electionId } = data;

        // Get or create chat room and check permissions
        const chatRoom = await this.chatService.getChatRoomByElectionId(
          electionId,
          socket.user.userId,
          socket.user.role as UserRole
        );

        // Join the socket room
        await socket.join(`chat:${chatRoom.id}`);

        // Get user details for notification
        const userDetails = await this.getUserDetails(socket.user.userId);
        if (!userDetails) {
          socket.emit("chat:error", { message: "User not found" });
          return;
        }

        // Notify others in the room
        socket.to(`chat:${chatRoom.id}`).emit("chat:user-joined", {
          user: {
            id: userDetails.id,
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
            role: userDetails.role,
          },
          chatRoomId: chatRoom.id,
        });

        console.log(
          `User ${socket.user.userId} joined chat room ${chatRoom.id} for election ${electionId}`
        );
      } catch (error) {
        socket.emit("chat:error", {
          message:
            error instanceof Error ? error.message : "Failed to join chat room",
        });
      }
    });

    // Leave room handler
    socket.on("chat:leave-room", async (data: { electionId: string }) => {
      try {
        const { electionId } = data;

        // Get chat room
        const chatRoom = await this.chatService.getChatRoomByElectionId(
          electionId,
          socket.user.userId,
          socket.user.role as UserRole
        );

        // Leave the socket room
        await socket.leave(`chat:${chatRoom.id}`);

        // Remove from typing users
        this.removeUserFromTyping(chatRoom.id, socket.user.userId);

        // Get user details for notification
        const userDetails = await this.getUserDetails(socket.user.userId);
        if (userDetails) {
          // Notify others in the room
          socket.to(`chat:${chatRoom.id}`).emit("chat:user-left", {
            user: {
              id: userDetails.id,
              firstName: userDetails.firstName,
              lastName: userDetails.lastName,
              role: userDetails.role,
            },
            chatRoomId: chatRoom.id,
          });
        }

        console.log(`User ${socket.user.userId} left chat room ${chatRoom.id}`);
      } catch (error) {
        socket.emit("chat:error", {
          message:
            error instanceof Error
              ? error.message
              : "Failed to leave chat room",
        });
      }
    });

    // Send message handler
    socket.on(
      "chat:send-message",
      async (data: { chatRoomId: string; content: string }) => {
        try {
          const { chatRoomId, content } = data;

          if (!content || content.trim().length === 0) {
            socket.emit("chat:error", {
              message: "Message content cannot be empty",
            });
            return;
          }

          if (content.length > 1000) {
            socket.emit("chat:error", {
              message: "Message is too long (max 1000 characters)",
            });
            return;
          }

          // Send message using chat service
          const message = await this.chatService.sendMessage(
            chatRoomId,
            socket.user.userId,
            content,
            socket.user.role as UserRole
          );

          // Remove user from typing
          this.removeUserFromTyping(chatRoomId, socket.user.userId);

          // Emit to all users in the room (including sender)
          io.to(`chat:${chatRoomId}`).emit("chat:message-received", message);

          console.log(
            `Message sent in room ${chatRoomId} by user ${socket.user.userId}`
          );
        } catch (error) {
          socket.emit("chat:error", {
            message:
              error instanceof Error ? error.message : "Failed to send message",
          });
        }
      }
    );

    // Edit message handler
    socket.on(
      "chat:edit-message",
      async (data: { messageId: string; content: string }) => {
        try {
          const { messageId, content } = data;

          if (!content || content.trim().length === 0) {
            socket.emit("chat:error", {
              message: "Message content cannot be empty",
            });
            return;
          }

          if (content.length > 1000) {
            socket.emit("chat:error", {
              message: "Message is too long (max 1000 characters)",
            });
            return;
          }

          // Edit message using chat service
          const message = await this.chatService.editMessage(
            messageId,
            socket.user.userId,
            content,
            socket.user.role as UserRole
          );

          // Get the chat room ID from the message (you might need to fetch this)
          // For now, we'll emit to all rooms the user is in
          const userRooms = Array.from(socket.rooms).filter((room) =>
            room.startsWith("chat:")
          );
          userRooms.forEach((room) => {
            io.to(room).emit("chat:message-edited", message);
          });

          console.log(
            `Message ${messageId} edited by user ${socket.user.userId}`
          );
        } catch (error) {
          socket.emit("chat:error", {
            message:
              error instanceof Error ? error.message : "Failed to edit message",
          });
        }
      }
    );

    // Delete message handler
    socket.on("chat:delete-message", async (data: { messageId: string }) => {
      try {
        const { messageId } = data;

        // Delete message using chat service
        await this.chatService.deleteMessage(
          messageId,
          socket.user.userId,
          socket.user.role as UserRole
        );

        // Emit to all rooms the user is in
        const userRooms = Array.from(socket.rooms).filter((room) =>
          room.startsWith("chat:")
        );
        userRooms.forEach((room) => {
          const chatRoomId = room.replace("chat:", "");
          io.to(room).emit("chat:message-deleted", { messageId, chatRoomId });
        });

        console.log(
          `Message ${messageId} deleted by user ${socket.user.userId}`
        );
      } catch (error) {
        socket.emit("chat:error", {
          message:
            error instanceof Error ? error.message : "Failed to delete message",
        });
      }
    });

    // Typing start handler
    socket.on("chat:typing-start", async (data: { chatRoomId: string }) => {
      try {
        const { chatRoomId } = data;

        this.addUserToTyping(chatRoomId, socket.user.userId);

        // Get user details for notification
        const userDetails = await this.getUserDetails(socket.user.userId);
        if (userDetails) {
          // Notify others in the room
          socket.to(`chat:${chatRoomId}`).emit("chat:typing", {
            user: {
              id: userDetails.id,
              firstName: userDetails.firstName,
              lastName: userDetails.lastName,
            },
            chatRoomId,
            isTyping: true,
          });
        }
      } catch (error) {
        console.error("Error handling typing start:", error);
      }
    });

    // Typing stop handler
    socket.on("chat:typing-stop", async (data: { chatRoomId: string }) => {
      try {
        const { chatRoomId } = data;

        this.removeUserFromTyping(chatRoomId, socket.user.userId);

        // Get user details for notification
        const userDetails = await this.getUserDetails(socket.user.userId);
        if (userDetails) {
          // Notify others in the room
          socket.to(`chat:${chatRoomId}`).emit("chat:typing", {
            user: {
              id: userDetails.id,
              firstName: userDetails.firstName,
              lastName: userDetails.lastName,
            },
            chatRoomId,
            isTyping: false,
          });
        }
      } catch (error) {
        console.error("Error handling typing stop:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log(`User ${socket.user.userId} disconnected from chat`);

      // Get user details for notifications
      const userDetails = await this.getUserDetails(socket.user.userId);

      // Remove from all typing indicators
      for (const [chatRoomId, userIds] of this.typingUsers.entries()) {
        if (userIds.has(socket.user.userId)) {
          this.removeUserFromTyping(chatRoomId, socket.user.userId);

          if (userDetails) {
            // Notify others in the room
            socket.to(`chat:${chatRoomId}`).emit("chat:typing", {
              user: {
                id: userDetails.id,
                firstName: userDetails.firstName,
                lastName: userDetails.lastName,
              },
              chatRoomId,
              isTyping: false,
            });
          }
        }
      }
    });
  }

  private addUserToTyping(chatRoomId: string, userId: string) {
    if (!this.typingUsers.has(chatRoomId)) {
      this.typingUsers.set(chatRoomId, new Set());
    }
    this.typingUsers.get(chatRoomId)!.add(userId);
  }

  private removeUserFromTyping(chatRoomId: string, userId: string) {
    const typingSet = this.typingUsers.get(chatRoomId);
    if (typingSet) {
      typingSet.delete(userId);
      if (typingSet.size === 0) {
        this.typingUsers.delete(chatRoomId);
      }
    }
  }
}
