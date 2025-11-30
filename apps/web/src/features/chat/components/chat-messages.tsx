"use client";

import * as React from "react";
import ChatMessage from "./chat-message";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import Loader from "@/components/loader";
import type { EnhancedMessage } from "../hooks/use-chat";

interface ChatMessagesProps {
	messages?: EnhancedMessage[];
	isLoading?: boolean;
	isAssistantTyping?: boolean;
}

export function ChatMessages({ 
	messages = [], 
	isLoading = false,
	isAssistantTyping = false,
}: ChatMessagesProps) {
	const messagesEndRef = React.useRef<HTMLDivElement>(null);
	const hasStreamingMessage = messages.some(m => m.isStreaming);

	// Auto-scroll to bottom when new messages arrive or streaming updates
	useEffect(() => {
		// Use instant scroll for streaming updates to prevent jitter
		// Use smooth scroll for new messages
		const behavior = hasStreamingMessage ? "auto" : "smooth";
		messagesEndRef.current?.scrollIntoView({ behavior });
	}, [messages.length, hasStreamingMessage]);

	if (isLoading) {
		return (
			<div className="flex-1 overflow-y-auto px-4 py-4">
				<div className="space-y-4">
					<Skeleton className="h-16 w-3/4" />
					<Skeleton className="h-16 w-2/3 ml-auto" />
					<Skeleton className="h-16 w-3/4" />
				</div>
			</div>
		);
	}

	const hasContent = messages.length > 0 || isAssistantTyping;

	return (
		<div className="flex-1 w-full overflow-y-auto px-4 py-4">
			{!hasContent ? (
				<div className="flex h-full items-center justify-center">
					<div className="text-center space-y-2">
						<p className="text-sm text-muted-foreground">
							No messages yet. Start a conversation!
						</p>
						<p className="text-xs text-muted-foreground/60">
							Ask questions about your course materials
						</p>
					</div>
				</div>
			) : (
				<div className="space-y-0  max-w-3xl mx-auto">
					{messages.map((msg) => (
						<ChatMessage
							key={msg.id}
							role={msg.role}
							message={msg.message}
							isPending={msg.isPending}
							isStreaming={msg.isStreaming}
						/>
					))}
					
					{/* Show typing indicator when assistant is thinking and no streaming yet */}
					{isAssistantTyping && (
						<Loader className="pt-20" text="Thinking..."/>
					)}
					
					<div ref={messagesEndRef} />
				</div>
			)}
		</div>
	);
}
