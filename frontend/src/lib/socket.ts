import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.token = token;
    const socketUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
      "http://localhost:5000";
    console.log("Socket Debug - Connecting to:", socketUrl);
    console.log("Socket Debug - Token provided:", !!token);

    this.socket = io(socketUrl, {
      auth: {
        token: token,
      },
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("Socket Debug - Connected to chat server");
    });

    this.socket.on("disconnect", () => {
      console.log("Socket Debug - Disconnected from chat server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket Debug - Connection error:", error);
    });

    this.socket.on("chat:error", (data) => {
      console.error("Socket Debug - Chat error:", data.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log("Socket Debug - Disconnecting from chat server");
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  // Join chat room for an election
  joinChatRoom(electionId: string) {
    this.socket?.emit("chat:join-room", { electionId });
  }

  // Leave chat room
  leaveChatRoom(electionId: string) {
    this.socket?.emit("chat:leave-room", { electionId });
  }

  // Send message
  sendMessage(chatRoomId: string, content: string) {
    this.socket?.emit("chat:send-message", { chatRoomId, content });
  }

  // Edit message
  editMessage(messageId: string, content: string) {
    this.socket?.emit("chat:edit-message", { messageId, content });
  }

  // Delete message
  deleteMessage(messageId: string) {
    this.socket?.emit("chat:delete-message", { messageId });
  }

  // Typing indicators
  startTyping(chatRoomId: string) {
    this.socket?.emit("chat:typing-start", { chatRoomId });
  }

  stopTyping(chatRoomId: string) {
    this.socket?.emit("chat:typing-stop", { chatRoomId });
  }

  // Event listeners
  onMessageReceived(callback: (message: any) => void) {
    this.socket?.on("chat:message-received", callback);
  }

  onMessageEdited(callback: (message: any) => void) {
    this.socket?.on("chat:message-edited", callback);
  }

  onMessageDeleted(
    callback: (data: { messageId: string; chatRoomId: string }) => void
  ) {
    this.socket?.on("chat:message-deleted", callback);
  }

  onUserJoined(callback: (data: any) => void) {
    this.socket?.on("chat:user-joined", callback);
  }

  onUserLeft(callback: (data: any) => void) {
    this.socket?.on("chat:user-left", callback);
  }

  onTyping(callback: (data: any) => void) {
    this.socket?.on("chat:typing", callback);
  }

  onError(callback: (data: { message: string }) => void) {
    this.socket?.on("chat:error", callback);
  }

  // Remove event listeners
  off(event: string, callback?: any) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.removeAllListeners(event);
      }
    }
  }

  // Remove all listeners for cleanup
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketService = new SocketService();
