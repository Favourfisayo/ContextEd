import { describe, it, expect, vi, afterEach } from "vitest";

// Mocks: declare before importing module-under-test
vi.mock("@langchain/google-genai", () => ({
	ChatGoogleGenerativeAI: vi.fn(),
}));
vi.mock("@/features/courses/lib/embeddingService", () => ({
	querySimilarDocuments: vi.fn(),
}));
vi.mock("@studyRAG/db", () => ({
	Prisma: {
		PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {},
	},
	default: {},
}));
vi.mock("../../db/queries", () => ({
	getChatMessages: vi.fn(),
}));
vi.mock("../../helpers/formatters", () => ({
	formatMessages: vi.fn(),
}));

// Import after mocks
import {
	retrieveChatHistory,
	retrieveContext,
	summarizeOldMessages,
	buildPrompt,
	generateStreamingResponse,
	generateResponse,
} from "../chatService";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { querySimilarDocuments } from "@/features/courses/lib/embeddingService";
import { getChatMessages } from "../../db/queries";
import { formatMessages } from "../../helpers/formatters";
import { ExternalAPIError } from "@/lib/errors";

afterEach(() => vi.clearAllMocks());

describe("chatService helpers", () => {
	it("retrieveChatHistory returns data from getChatMessages", async () => {
		(getChatMessages as any).mockResolvedValue([{ id: 1, message: "hi" }]);
		const res = await retrieveChatHistory("courseA");
		expect(getChatMessages).toHaveBeenCalledWith("courseA");
		expect(res).toEqual([{ id: 1, message: "hi" }]);
	});

	it("retrieveContext returns message when no results", async () => {
		(querySimilarDocuments as any).mockResolvedValue([]);
		const res = await retrieveContext("c", "q");
		expect(res).toBe("No relevant course materials found.");
	});

	it("retrieveContext formats results", async () => {
		(querySimilarDocuments as any).mockResolvedValue([
			{ text: "Hello from doc", metadata: {}, distance: 0.1 },
			{ text: "Another doc", metadata: {}, distance: 0.2 },
		]);
		const res = await retrieveContext("c", "q") as string;
		expect(res).toContain("[Source 1]");
		expect(res).toContain("Hello from doc");
		expect(res).toContain("[Source 2]");
		expect(res).toContain("Another doc");
	});

	it("summarizeOldMessages returns formatMessages when not exceeding limit", async () => {
		(formatMessages as any).mockReturnValue("formatted");
		const messages: any[] = [{ role: "USER", message: "short" }];
		const res = await summarizeOldMessages(messages, 10);
		expect(formatMessages).toHaveBeenCalledWith(messages);
		expect(res).toBe("formatted");
	});

	it("summarizeOldMessages summarizes older messages and appends formatted recent messages", async () => {
		(formatMessages as any).mockReturnValue("recent formatted");
		// old messages: two USER messages with different topics
		const messages: any[] = [
			{ role: "USER", message: "What is topic A about? More text" },
			{ role: "USER", message: "Next topic B? More text here" },
			{ role: "ASSISTANT", message: "Bot reply" },
			{ role: "USER", message: "Recent message 1" },
			{ role: "USER", message: "Recent message 2" },
		];
		const res = await summarizeOldMessages(messages, 2);
		expect(res).toContain("Previous conversation summary:");
		expect(res).toContain("User asked about:");
		expect(res).toContain("Recent conversation:");
		expect(res).toContain("recent formatted");
	});

	it("buildPrompt includes course info and prompts", () => {
		const prompt = buildPrompt(
			"academic" as any,
			"context text",
			"chat history",
			"How do I do X?",
			{ course_code: "ABC101", course_title: "Course Name", course_description: "Desc" }
		);
		expect(prompt).toContain("COURSE CODE: ABC101");
		expect(prompt).toContain("COURSE TITLE: Course Name");
		expect(prompt).toContain("COURSE DESCRIPTION: Desc");
		expect(prompt).toContain("CHAT HISTORY:");
		expect(prompt).toContain("How do I do X?");
	});

	it("generateStreamingResponse yields content from stream", async () => {
		const streamMock = vi.fn(async function* () {
			yield { content: "hello" } as any;
			yield { content: " world" } as any;
		}) as any;

		// ChatGoogleGenerativeAI constructor returns an object with stream method
		(ChatGoogleGenerativeAI as any).mockImplementation(function (this: any) { this.stream = streamMock; });

		const chunks: string[] = [];
		for await (const token of generateStreamingResponse("prompt")) {
			chunks.push(token);
		}
		expect(chunks.join("")).toBe("hello world");
	});

	it("generateStreamingResponse throws ExternalAPIError on model error", async () => {
		const streamMock = vi.fn(() => { throw new Error("boom"); });
		(ChatGoogleGenerativeAI as any).mockImplementation(function (this: any) { this.stream = streamMock; });
		await expect(async () => {
			for await (const _ of generateStreamingResponse("p")) {
				// no-op
			}
		}).rejects.toThrow(ExternalAPIError);
	});

	it("generateResponse returns text from model.invoke", async () => {
		(ChatGoogleGenerativeAI as any).mockImplementation(function (this: any) { this.invoke = vi.fn().mockResolvedValue({ content: "OK" }) });
		const res = await generateResponse("p");
		expect(res).toBe("OK");
	});

	it("generateResponse throws ExternalAPIError when invoke fails", async () => {
		(ChatGoogleGenerativeAI as any).mockImplementation(function (this: any) { this.invoke = vi.fn().mockRejectedValue(new Error("err")) });
		await expect(generateResponse("p")).rejects.toThrow(ExternalAPIError);
	});
});

