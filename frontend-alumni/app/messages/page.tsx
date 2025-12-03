"use client";

import * as React from "react";
import { Suspense } from "react";
import { format } from "date-fns";
import {
  MessageCircle,
  Search,
  Send,
  Loader2,
  MoreVertical,
  Phone,
  Video,
  Info,
  ArrowLeft,
  Check,
  CheckCheck,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChatsStore, useAuthStore } from "@/lib/stores";
import { useToast } from "@/hooks/use-toast";
import type { Chat, Message as MessageType } from "@/lib/types";

function ChatListItem({
  chat,
  isActive,
  onClick,
}: {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}) {
  const { user } = useAuthStore();
  
  // Get the other participant
  const otherParticipant = chat.participants?.find(
    (p) => (typeof p === "object" ? p._id : p) !== user?._id
  );
  const participantName = typeof otherParticipant === "object" 
    ? otherParticipant?.name 
    : "User";

  const lastMessage = chat.messages?.[chat.messages.length - 1];

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
        isActive
          ? "bg-primary/10 border-l-2 border-primary"
          : "hover:bg-muted/50"
      }`}
    >
      <Avatar>
        <AvatarFallback>
          {participantName?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium truncate">{participantName}</span>
          {lastMessage && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(lastMessage.timestamp || new Date()), "h:mm a")}
            </span>
          )}
        </div>
        {lastMessage && (
          <p className="text-sm text-muted-foreground truncate">
            {lastMessage.senderId === user?._id ? "You: " : ""}
            {lastMessage.content}
          </p>
        )}
      </div>
    </button>
  );
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: MessageType;
  isOwn: boolean;
}) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <div className={`flex items-center justify-end gap-1 mt-1`}>
          <span className={`text-xs ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            {format(new Date(message.timestamp || new Date()), "h:mm a")}
          </span>
          {isOwn && (
            <CheckCheck className={`h-3 w-3 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`} />
          )}
        </div>
      </div>
    </div>
  );
}

function ChatView({
  chat,
  onBack,
}: {
  chat: Chat;
  onBack: () => void;
}) {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { sendMessage, activeChat, isLoading } = useChatsStore();
  const [message, setMessage] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const otherParticipant = chat.participants?.find(
    (p) => (typeof p === "object" ? p._id : p) !== user?._id
  );
  const participantName = typeof otherParticipant === "object"
    ? otherParticipant?.name
    : "User";

  const messages = activeChat?.messages || chat.messages || [];

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage(chat._id, message);
      setMessage("");
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar>
          <AvatarFallback>
            {participantName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{participantName}</h3>
          <p className="text-xs text-muted-foreground">
            {typeof otherParticipant === "object"
              ? otherParticipant?.userType
              : "User"}
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <MessageBubble
                key={msg._id || index}
                message={msg}
                isOwn={msg.senderId === user?._id}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessagesPage() {
  const searchParams = useSearchParams();
  const { chats, fetchChats, getChat, isLoading } = useChatsStore();
  const [selectedChatId, setSelectedChatId] = React.useState<string | null>(
    searchParams.get("chat")
  );
  const [search, setSearch] = React.useState("");
  const [showList, setShowList] = React.useState(true);

  React.useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  React.useEffect(() => {
    const chatId = searchParams.get("chat");
    if (chatId) {
      setSelectedChatId(chatId);
      getChat(chatId);
      setShowList(false);
    }
  }, [searchParams, getChat]);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    getChat(chatId);
    setShowList(false);
  };

  const selectedChat = chats.find((c) => c._id === selectedChatId);

  const filteredChats = chats.filter((chat) => {
    const participant = chat.participants?.find(
      (p) => typeof p === "object" && p.name
    );
    const name = typeof participant === "object" ? participant?.name || "" : "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <AppLayout>
      <div className="h-[calc(100vh-10rem)]">
        <Card className="h-full">
          <div className="flex h-full">
            {/* Chat List */}
            <div
              className={`w-full md:w-80 border-r flex flex-col ${
                showList ? "block" : "hidden md:flex"
              }`}
            >
              <CardHeader className="border-b py-4">
                <CardTitle className="text-lg">Messages</CardTitle>
              </CardHeader>
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <MessageCircle className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {search
                        ? "No conversations found"
                        : "No conversations yet. Connect with someone to start chatting!"}
                    </p>
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredChats.map((chat) => (
                      <ChatListItem
                        key={chat._id}
                        chat={chat}
                        isActive={chat._id === selectedChatId}
                        onClick={() => handleSelectChat(chat._id)}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Chat View */}
            <div
              className={`flex-1 ${
                !showList ? "block" : "hidden md:block"
              }`}
            >
              {selectedChat ? (
                <ChatView
                  chat={selectedChat}
                  onBack={() => setShowList(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-1">
                    Select a conversation
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

export default function MessagesPageWrapper() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    }>
      <MessagesPage />
    </Suspense>
  );
}
