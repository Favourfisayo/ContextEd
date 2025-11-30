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
    <div className="flex h-full flex-col">
      <ChatHeader courseId={courseId} courseTitle={courseData?.course_title} />
      <EmbeddingStatusBanner courseId={courseId} />
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        isAssistantTyping={isAssistantTyping}
      />
      <ChatInput
        onSend={handleSendMessage}
        isSending={isSending}
      />
    </div>
  );
}
