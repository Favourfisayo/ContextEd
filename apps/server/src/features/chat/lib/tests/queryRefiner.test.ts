import { describe, it, expect, vi, afterEach } from "vitest";
import { refineQuery } from "../queryRefiner";

// Mock the Google Generative AI
const mockInvoke = vi.fn();
vi.mock("@langchain/google-genai", () => {
  return {
    ChatGoogleGenerativeAI: class {
      invoke = mockInvoke;
    },
  };
});

describe("refineQuery", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns original query if history is empty", async () => {
    const result = await refineQuery("", "What is photosynthesis?");
    expect(result).toBe("What is photosynthesis?");
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it("calls LLM to refine query when history exists", async () => {
    mockInvoke.mockResolvedValue({
      content: "photosynthesis process mechanism",
    });

    const history = "User: Tell me about plants.\nAI: Plants use photosynthesis.";
    const result = await refineQuery(history, "How does it work?");

    expect(mockInvoke).toHaveBeenCalled();
    expect(result).toBe("photosynthesis process mechanism");
  });

  it("handles LLM failure by returning original query", async () => {
    mockInvoke.mockRejectedValue(new Error("API Error"));

    const history = "some history";
    const result = await refineQuery(history, "query");

    expect(result).toBe("query");
  });

  it("handles empty LLM response by returning original query", async () => {
    mockInvoke.mockResolvedValue({ content: "" });

    const history = "some history";
    const result = await refineQuery(history, "query");

    expect(result).toBe("query");
  });
});
