import prisma from "../config/database";
import { createError } from "../middleware/errorHandler";
import { UserRole } from "@prisma/client";

export interface ChatRoomResponse {
  id: string;
  name: string;
  electionId: string;
  election: {
    id: string;
    title: string;
    status: string;
  };
  isActive: boolean;
  createdAt: Date;
  lastMessage?: {
    id: string;
    content: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
    createdAt: Date;
  };
  participantCount: number;
}

export interface ChatMessageResponse {
  id: string;
  content: string;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}

export class ChatService {
  async createOrGetChatRoom(electionId: string): Promise<ChatRoomResponse> {
    // Check if election exists
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    if (!election) {
      throw createError("Election not found", 404);
    }

    // Check if chat room already exists
    let chatRoom = await prisma.chatRoom.findUnique({
      where: { electionId },
      include: {
        election: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Create chat room if it doesn't exist
    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: {
          name: `${election.title} - Commission Chat`,
          electionId,
        },
        include: {
          election: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });
    }

    // Get participant count (commissioners + election creator if admin)
    const commissioners = await prisma.electionCommissioner.count({
      where: { electionId },
    });

    const participantCount = commissioners;

    return {
      id: chatRoom.id,
      name: chatRoom.name,
      electionId: chatRoom.electionId,
      election: chatRoom.election,
      isActive: chatRoom.isActive,
      createdAt: chatRoom.createdAt,
      lastMessage: chatRoom.messages[0]
        ? {
            id: chatRoom.messages[0].id,
            content: chatRoom.messages[0].content,
            user: chatRoom.messages[0].user,
            createdAt: chatRoom.messages[0].createdAt,
          }
        : undefined,
      participantCount,
    };
  }

  async getUserChatRooms(
    userId: string,
    userRole: UserRole
  ): Promise<ChatRoomResponse[]> {
    let electionIds: string[] = [];

    if (userRole === UserRole.ADMIN) {
      // Admin can see all chat rooms
      const elections = await prisma.election.findMany({
        select: { id: true },
      });
      electionIds = elections.map((e) => e.id);
    } else {
      // Regular users can only see chat rooms for elections they are commissioners of
      const commissionerElections = await prisma.electionCommissioner.findMany({
        where: { userId },
        select: { electionId: true },
      });
      electionIds = commissionerElections.map((ce) => ce.electionId);
    }

    if (electionIds.length === 0) {
      return [];
    }

    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        electionId: { in: electionIds },
        isActive: true,
      },
      include: {
        election: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const chatRoomResponses: ChatRoomResponse[] = [];

    for (const chatRoom of chatRooms) {
      const participantCount = await prisma.electionCommissioner.count({
        where: { electionId: chatRoom.electionId },
      });

      chatRoomResponses.push({
        id: chatRoom.id,
        name: chatRoom.name,
        electionId: chatRoom.electionId,
        election: chatRoom.election,
        isActive: chatRoom.isActive,
        createdAt: chatRoom.createdAt,
        lastMessage: chatRoom.messages[0]
          ? {
              id: chatRoom.messages[0].id,
              content: chatRoom.messages[0].content,
              user: chatRoom.messages[0].user,
              createdAt: chatRoom.messages[0].createdAt,
            }
          : undefined,
        participantCount,
      });
    }

    return chatRoomResponses;
  }

  async sendMessage(
    chatRoomId: string,
    userId: string,
    content: string,
    userRole: UserRole
  ): Promise<ChatMessageResponse> {
    // Get chat room with election info
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        election: true,
      },
    });

    if (!chatRoom) {
      throw createError("Chat room not found", 404);
    }

    if (!chatRoom.isActive) {
      throw createError("Chat room is not active", 400);
    }

    // Check permissions
    await this.checkChatPermissions(chatRoom.electionId, userId, userRole);

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        userId,
        chatRoomId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Update chat room's updated timestamp
    await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { updatedAt: new Date() },
    });

    return {
      id: message.id,
      content: message.content,
      isEdited: message.isEdited,
      editedAt: message.editedAt || undefined,
      createdAt: message.createdAt,
      user: message.user,
    };
  }

  async getChatHistory(
    chatRoomId: string,
    userId: string,
    userRole: UserRole,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    messages: ChatMessageResponse[];
    hasMore: boolean;
    totalMessages: number;
  }> {
    // Get chat room with election info
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        election: true,
      },
    });

    if (!chatRoom) {
      throw createError("Chat room not found", 404);
    }

    // Check permissions
    await this.checkChatPermissions(chatRoom.electionId, userId, userRole);

    const skip = (page - 1) * limit;

    const [messages, totalMessages] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { chatRoomId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.chatMessage.count({
        where: { chatRoomId },
      }),
    ]);

    const messageResponses: ChatMessageResponse[] = messages.map((message) => ({
      id: message.id,
      content: message.content,
      isEdited: message.isEdited,
      editedAt: message.editedAt || undefined,
      createdAt: message.createdAt,
      user: message.user,
    }));

    return {
      messages: messageResponses.reverse(), // Reverse to show oldest first
      hasMore: skip + limit < totalMessages,
      totalMessages,
    };
  }

  async editMessage(
    messageId: string,
    userId: string,
    content: string,
    userRole: UserRole
  ): Promise<ChatMessageResponse> {
    // Get message with chat room and election info
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        chatRoom: {
          include: {
            election: true,
          },
        },
      },
    });

    if (!message) {
      throw createError("Message not found", 404);
    }

    // Check if user is the message author or admin
    if (message.userId !== userId && userRole !== UserRole.ADMIN) {
      throw createError("You can only edit your own messages", 403);
    }

    // Check permissions for chat room
    await this.checkChatPermissions(
      message.chatRoom.electionId,
      userId,
      userRole
    );

    // Update message
    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content: content.trim(),
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return {
      id: updatedMessage.id,
      content: updatedMessage.content,
      isEdited: updatedMessage.isEdited,
      editedAt: updatedMessage.editedAt || undefined,
      createdAt: updatedMessage.createdAt,
      user: updatedMessage.user,
    };
  }

  async deleteMessage(
    messageId: string,
    userId: string,
    userRole: UserRole
  ): Promise<void> {
    // Get message with chat room and election info
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        chatRoom: {
          include: {
            election: true,
          },
        },
      },
    });

    if (!message) {
      throw createError("Message not found", 404);
    }

    // Check if user is the message author or admin
    if (message.userId !== userId && userRole !== UserRole.ADMIN) {
      throw createError("You can only delete your own messages", 403);
    }

    // Check permissions for chat room
    await this.checkChatPermissions(
      message.chatRoom.electionId,
      userId,
      userRole
    );

    // Delete message
    await prisma.chatMessage.delete({
      where: { id: messageId },
    });
  }

  private async checkChatPermissions(
    electionId: string,
    userId: string,
    userRole: UserRole
  ): Promise<void> {
    // Admin can access all chats
    if (userRole === UserRole.ADMIN) {
      return;
    }

    // Check if user is a commissioner for this election
    const commissioner = await prisma.electionCommissioner.findUnique({
      where: {
        userId_electionId: {
          userId,
          electionId,
        },
      },
    });

    if (!commissioner) {
      throw createError("You don't have permission to access this chat", 403);
    }
  }

  async getChatRoomByElectionId(
    electionId: string,
    userId: string,
    userRole: UserRole
  ): Promise<ChatRoomResponse> {
    // Check permissions first
    await this.checkChatPermissions(electionId, userId, userRole);

    // Get or create chat room
    return this.createOrGetChatRoom(electionId);
  }
}
