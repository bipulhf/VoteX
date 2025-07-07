import { API_URL } from "./data";

export interface ChatRoom {
  id: string;
  name: string;
  electionId: string;
  election: {
    id: string;
    title: string;
    status: string;
  };
  isActive: boolean;
  createdAt: string;
  lastMessage?: {
    id: string;
    content: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  };
  participantCount: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get token from cookies (adjust based on your auth implementation)
  const getCookie = (name: string): string | undefined => {
    if (typeof document === "undefined") return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return undefined;
  };

  const token = getCookie("token");

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export const chatApi = {
  // Get all chat rooms for user
  async getChatRooms(): Promise<ChatRoom[]> {
    const response = await fetchWithAuth(`${API_URL}/chat/rooms`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get chat rooms");
    }
    return data.data;
  },

  // Get chat room for specific election
  async getChatRoomByElection(electionId: string): Promise<ChatRoom> {
    const response = await fetchWithAuth(
      `${API_URL}/chat/room/election/${electionId}`
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get chat room");
    }
    return data.data;
  },

  // Get chat history
  async getChatHistory(chatRoomId: string, page = 1, limit = 50) {
    const response = await fetchWithAuth(
      `${API_URL}/chat/room/${chatRoomId}/messages?page=${page}&limit=${limit}`
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get chat history");
    }
    return data.data;
  },

  // Send message (REST fallback)
  async sendMessage(chatRoomId: string, content: string): Promise<ChatMessage> {
    const response = await fetchWithAuth(
      `${API_URL}/chat/room/${chatRoomId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ content }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send message");
    }
    return data.data;
  },

  // Edit message
  async editMessage(messageId: string, content: string): Promise<ChatMessage> {
    const response = await fetchWithAuth(
      `${API_URL}/chat/message/${messageId}`,
      {
        method: "PUT",
        body: JSON.stringify({ content }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to edit message");
    }
    return data.data;
  },

  // Delete message
  async deleteMessage(messageId: string): Promise<void> {
    const response = await fetchWithAuth(
      `${API_URL}/chat/message/${messageId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to delete message");
    }
  },
};
