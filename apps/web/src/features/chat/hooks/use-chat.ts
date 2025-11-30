import { useState, useRef, useEffect } from "react";
import { useChatMessages } from "../lib/queries";
import { useSendMessage } from "../lib/mutations";
import type { ChatMode } from "@studyrag/shared-schemas";

export interface EnhancedMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  message: string;
  isPending?: boolean;
  isStreaming?: boolean;
}

export function useChat(courseId: string) {
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  // Fetch chat messages
  const { data: chatData, isLoading } = useChatMessages(courseId);
  
  // Send message mutation
  const sendMessageMutation = useSendMessage();

  // Track previous message count to detect when new message arrives
  const previousMessageCountRef = useRef(0);

  // Clear streaming message when it appears in the database
  useEffect(() => {
    if (streamingMessage && chatData?.messages) {
      if (chatData.messages.length > previousMessageCountRef.current) {
        const lastMessage = chatData.messages[chatData.messages.length - 1];
        if (lastMessage?.role === "ASSISTANT") {
          setStreamingMessage("");
        }
      }
    }
  }, [chatData?.messages, streamingMessage]);

  // Clear pending user message when it appears in the database
  useEffect(() => {
    if (pendingUserMessage && chatData?.messages) {
      if (chatData.messages.length > previousMessageCountRef.current) {
        setPendingUserMessage(null);
      }
    }
  }, [chatData?.messages, pendingUserMessage]);

  const sendMessage = (message: string, mode: ChatMode) => {
    // Store current message count before sending
    previousMessageCountRef.current = chatData?.messages?.length || 0;
    
    setPendingUserMessage(message);
    setStreamingMessage("");
    setIsAssistantTyping(true);

    sendMessageMutation.mutate({
      courseId,
      message,
      mode,
      onToken: (token) => {
        setIsAssistantTyping(false);
        setStreamingMessage((prev) => prev + token);
      },
      onComplete: () => {
        setIsAssistantTyping(false);
      },
      onError: () => {
        setPendingUserMessage(null);
        setStreamingMessage("");
        setIsAssistantTyping(false);
      },
    });
  };

  // Merge everything into a single list for the UI
  const messages: EnhancedMessage[] = [
    ...(chatData?.messages || []),
  ];

  if (pendingUserMessage) {
    messages.push({
      id: "pending-user",
      role: "USER",
      message: pendingUserMessage,
      isPending: true,
    });
  }

  if (streamingMessage) {
    messages.push({
      id: "streaming-assistant",
      role: "ASSISTANT",
      message: streamingMessage,
      isStreaming: true,
    });
  }

  return {
    messages,
    sendMessage,
    isLoading,
    isAssistantTyping: isAssistantTyping && !streamingMessage, // Only show typing if not yet streaming
    isSending: sendMessageMutation.isPending,
  };
}
