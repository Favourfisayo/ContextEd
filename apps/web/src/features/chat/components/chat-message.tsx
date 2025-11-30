"use client";

import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import RemarkGfm from "remark-gfm";
interface ChatMessageProps {
  role: "USER" | "ASSISTANT";
  message: string;
  isStreaming?: boolean;
  isPending?: boolean;
}

export default function ChatMessage({
  role,
  message,
  isPending = false,
}: ChatMessageProps) {
  const isUser = role === "USER";

  return (
    <div
      className={cn(
        "mb-6 flex gap-3 items-start",
        isUser ? "justify-end w-[60%] float-right" : "justify-start w-full",
        isPending && "opacity-70"
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-3 whitespace-pre-wrap leading-relaxed",
          "prose prose-sm max-w-none",
          "prose-p:my-1 prose-code:px-1 prose-code:py-0.5 prose-code:bg-muted/50 prose-code:rounded",
          isUser && "bg-gray-500 text-white prose-invert"
        )}
      >
        <Markdown
          remarkPlugins={[RemarkGfm]}
          components={{
            code({ children, ...props }) {
              const { inline } = props as { inline?: boolean };

              if (inline) {
                return (
                  <code className="px-1 py-0.5 rounded bg-zinc-800/20">
                    {children}
                  </code>
                );
              }
            },
          }}
        >
          {message}
        </Markdown>
      </div>
    </div>
  );
}
