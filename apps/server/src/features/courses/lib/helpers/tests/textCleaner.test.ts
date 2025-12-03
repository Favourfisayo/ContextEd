import { describe, it, expect } from "vitest";
import { cleanText, cleanDocuments } from "../textCleaner";
import { Document } from "@langchain/core/documents";

describe("textCleaner", () => {
  describe("cleanText", () => {
    it("removes null bytes", () => {
      expect(cleanText("hello\0world")).toBe("helloworld");
    });

    it("normalizes unicode spaces", () => {
      expect(cleanText("hello\u00A0world")).toBe("hello world");
    });

    it("fixes hyphenated words at line endings", () => {
      expect(cleanText("embed-\nding")).toBe("embedding");
      expect(cleanText("process- \n ing")).toBe("processing");
    });

    it("collapses multiple spaces", () => {
      expect(cleanText("hello   world")).toBe("hello world");
    });

    it("normalizes excessive newlines", () => {
      expect(cleanText("para1\n\n\npara2")).toBe("para1\n\npara2");
    });

    it("trims whitespace", () => {
      expect(cleanText("  hello world  ")).toBe("hello world");
    });

    it("handles empty input", () => {
      expect(cleanText("")).toBe("");
    });
  });

  describe("cleanDocuments", () => {
    it("cleans document content and removes empty docs", () => {
      const docs = [
        new Document({ pageContent: "  doc1  " }),
        new Document({ pageContent: "   " }), // Should be removed
        new Document({ pageContent: "doc-\n2" }),
      ];

      const cleaned = cleanDocuments(docs);

      expect(cleaned).toHaveLength(2);
      expect(cleaned[0]?.pageContent).toBe("doc1");
      expect(cleaned[1]?.pageContent).toBe("doc2");
    });
  });
});
