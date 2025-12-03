"use client"

import { useSearchParams } from "next/navigation";
import { ChatHeader } from "@/features/chat/components/chat-header";
import { ChatMessages } from "@/features/chat/components/chat-messages";
import { ChatInput } from "@/features/chat/components/chat-input";
import { EmbeddingStatusBanner } from "@/features/courses/components/embedding-status-banner";
import { useCourse } from "@/features/courses/lib/queries";
import type { ChatMode } from "@studyrag/shared-schemas";
import { use } from "react";
import { useChat } from "@/features/chat/hooks/use-chat";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") || "academic") as ChatMode;

  // Use the custom hook for all chat logic
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    isAssistantTyping, 
    isSending 
  } = useChat(courseId);

  // Fetch course details for the header
  const { data: courseData } = useCourse(courseId);

  const handleSendMessage = (message: string) => {
    sendMessage(message, mode);
  };

  return (
    <div className="flex h-dvh  flex-col overflow-hidden bg-background">
      <ChatHeader courseId={courseId} courseTitle={courseData?.course_title} />
      
      <div className="flex-none">
        <EmbeddingStatusBanner courseId={courseId} />
      </div>
      
      <div className="flex-1 min-h-0 relative flex flex-col">
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          isAssistantTyping={isAssistantTyping}
        />
      </div>
      
      <div className="flex-none p-4 pt-2">
        <ChatInput
          onSend={handleSendMessage}
          isSending={isSending}
        />
      </div>
    </div>
  );
}
