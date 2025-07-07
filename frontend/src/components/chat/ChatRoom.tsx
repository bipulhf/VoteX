"use client";

import { useState, useEffect, useRef } from "react";
import { socketService } from "@/lib/socket";
import { chatApi, ChatMessage, ChatRoom } from "@/lib/chatApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, Users, Crown, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatRoomProps {
  electionId: string;
  currentUserId: string;
  currentUserRole: string;
}

export default function ChatRoomComponent({
  electionId,
  currentUserId,
  currentUserRole,
}: ChatRoomProps) {
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeChat();
    return () => {
      if (chatRoom) {
        socketService.leaveChatRoom(electionId);
      }
      socketService.off("chat:message-received");
      socketService.off("chat:message-edited");
      socketService.off("chat:message-deleted");
      socketService.off("chat:typing");
      socketService.off("chat:user-joined");
      socketService.off("chat:user-left");
    };
  }, [electionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      // Get token from cookies
      const getCookie = (name: string): string | undefined => {
        if (typeof document === "undefined") return undefined;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift();
        return undefined;
      };

      const token = getCookie("token");
      console.log("Chat Debug - Token found:", !!token);

      if (!token) {
        toast.error("Authentication required");
        console.error("Chat Debug - No token found");
        return;
      }

      console.log("Chat Debug - Connecting to socket...");
      // Connect to socket
      socketService.connect(token);

      console.log("Chat Debug - Getting chat room for election:", electionId);
      // Get chat room
      const room = await chatApi.getChatRoomByElection(electionId);
      console.log("Chat Debug - Chat room received:", room);
      setChatRoom(room);

      console.log("Chat Debug - Getting chat history for room:", room.id);
      // Get chat history
      const history = await chatApi.getChatHistory(room.id);
      console.log("Chat Debug - Chat history received:", history);
      setMessages(history.messages);

      // Join socket room
      socketService.joinChatRoom(electionId);

      // Set up socket listeners
      socketService.onMessageReceived((message) => {
        setMessages((prev) => [...prev, message]);
      });

      socketService.onMessageEdited((message) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? message : m))
        );
      });

      socketService.onMessageDeleted((data) => {
        setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
      });

      socketService.onTyping((data) => {
        if (data.user.id !== currentUserId) {
          setTypingUsers((prev) => {
            if (data.isTyping) {
              return prev.find((u) => u.id === data.user.id)
                ? prev
                : [...prev, data.user];
            } else {
              return prev.filter((u) => u.id !== data.user.id);
            }
          });
        }
      });

      socketService.onUserJoined((data) => {
        if (data.user.id !== currentUserId) {
          toast.success(
            `${data.user.firstName} ${data.user.lastName} joined the chat`
          );
        }
      });

      socketService.onUserLeft((data) => {
        if (data.user.id !== currentUserId) {
          toast.info(
            `${data.user.firstName} ${data.user.lastName} left the chat`
          );
        }
      });

      socketService.onError((data) => {
        toast.error(data.message);
      });

      setLoading(false);
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      toast.error("Failed to load chat");
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !chatRoom) return;

    socketService.sendMessage(chatRoom.id, newMessage);
    setNewMessage("");
    handleStopTyping();
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!isTyping && chatRoom) {
      setIsTyping(true);
      socketService.startTyping(chatRoom.id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (isTyping && chatRoom) {
      setIsTyping(false);
      socketService.stopTyping(chatRoom.id);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessage(messageId);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingMessage) return;

    socketService.editMessage(editingMessage, editContent);
    setEditingMessage(null);
    setEditContent("");
  };

  const handleDeleteMessage = (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      socketService.deleteMessage(messageId);
    }
  };

  if (loading) {
    return (
      <Card className="h-[640px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading chat...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[640px] flex flex-col">
      {/* Chat Header */}
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">{chatRoom?.name}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {chatRoom?.participantCount} participant
            {chatRoom?.participantCount !== 1 ? "s" : ""}
          </Badge>
        </CardTitle>
        <Separator />
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-4 pt-0">
        <ScrollArea className="h-[460px] pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.user.id === currentUserId
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div className="flex items-start space-x-2 min-w-0 max-w-[80%]">
                  {message.user.id !== currentUserId && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {message.user.firstName[0]}
                        {message.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className="space-y-1">
                    {message.user.id !== currentUserId && (
                      <div className="flex items-center space-x-1">
                        <p className="text-xs font-semibold">
                          {message.user.firstName} {message.user.lastName}
                        </p>
                        {message.user.role === "ADMIN" && (
                          <Crown className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                    )}

                    <div className="group relative">
                      <div
                        className={`px-3 py-2 rounded-lg text-sm ${
                          message.user.id === currentUserId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {editingMessage === message.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleSaveEdit()
                              }
                              className="text-sm"
                            />
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={handleSaveEdit}>
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingMessage(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>

                      {/* Message Actions */}
                      {message.user.id === currentUserId &&
                        editingMessage !== message.id && (
                          <div className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleEditMessage(
                                      message.id,
                                      message.content
                                    )
                                  }
                                >
                                  <Edit2 className="h-3 w-3 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteMessage(message.id)
                                  }
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                      {message.isEdited && " (edited)"}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {typingUsers[0].firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted px-3 py-2 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      {typingUsers
                        .map((user) => `${user.firstName}`)
                        .join(", ")}
                      {typingUsers.length === 1 ? " is" : " are"} typing...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="mt-4">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1"
              maxLength={1000}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {newMessage.length}/1000 characters
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
