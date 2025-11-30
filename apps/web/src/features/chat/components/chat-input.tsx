"use client";

import { ArrowUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
	onSend: (message: string) => void;
	isSending?: boolean;
}

export function ChatInput({ onSend, isSending = false}: ChatInputProps) {
	const [message, setMessage] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const sendMessage = (e: FormEvent) => {
		e.preventDefault();
		if (!message.trim() || isSending) return;
		onSend(message);
		setMessage("");
		
		// Reset textarea height
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage(e);
		}
	};

	// Auto-resize textarea
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [message]);

	return (
		<div className="border-t bg-background p-4">
			<form onSubmit={sendMessage} className="mx-auto max-w-3xl">
				<div className="relative flex items-end gap-2">
					{/* Textarea */}
					<Textarea
						ref={textareaRef}
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Message your AI assistant..."
						className="min-h-[52px] max-h-[200px] resize-none rounded-2xl border-2 border-gray-300 bg-background px-4 py-3 pr-12 text-sm focus-visible:ring-1 focus-visible:ring-blue-600"
						rows={1}
					/>

					{/* Send Button - positioned inside textarea */}
					<Button
						type="submit"
						size="icon"
						className={cn("absolute bottom-2 right-2 h-8 w-8 shrink-0 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:opacity-50",
							isSending && "cursor-not-allowed"
						)}
						disabled={!message.trim() || isSending }
					>
						<ArrowUp className={cn(
							"h-4 w-4 text-white",
							isSending && "cursor-not-allowed opacity-50"
						)} />
					</Button>
				</div>
				<p className="mt-2 text-xs text-center text-muted-foreground">
					Press Enter to send, <code>Shift+Enter</code> for new line
				</p>
			</form>
		</div>
	);
}
