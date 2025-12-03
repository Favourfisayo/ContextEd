import { describe, it, expect, vi, afterEach } from "vitest";
import { DocumentProcessingError } from "@/lib/errors";

// Mock dependencies BEFORE importing the module under test
vi.mock("../documentLoader", () => ({
  loadAndSplitDocument: vi.fn(),
}));
vi.mock("@/lib/embeddings", () => ({
  embedDocuments: vi.fn(),
  embedText: vi.fn(),
}));
vi.mock("@/lib/chroma", () => ({
  getOrCreateCourseCollection: vi.fn(),
}));
vi.mock("@studyRAG/db", () => ({
  default: { courseDoc: { update: vi.fn() } },
}));

vi.mock("../embeddingEvents", () => ({
  emitEmbeddingUpdate: vi.fn(),
}));

// Import module under test and mock-typed references AFTER we declared mocks
import { buildEmbeddingsForDocument, querySimilarDocuments } from "../embeddingService";
import { loadAndSplitDocument } from "../documentLoader";
import { embedDocuments, embedText } from "@/lib/embeddings";
import { getOrCreateCourseCollection } from "@/lib/chroma";
import prisma from "@studyRAG/db";

afterEach(() => vi.clearAllMocks());

describe("buildEmbeddingsForDocument", () => {
  it("success path: adds embeddings and updates DB status", async () => {
    // Arrange
    const docs = [
      { pageContent: "Text A", metadata: { page: 1 } },
      { pageContent: "Text B", metadata: { page: 2, big: { nested: true } } }, // nested will be stringified
    ];
    (loadAndSplitDocument as any).mockResolvedValue(docs);
    (embedDocuments as any).mockResolvedValue([
      [0.1, 0.2],
      [0.3, 0.4],
    ]);

    const addMock = vi.fn().mockResolvedValue(undefined);
    (getOrCreateCourseCollection as any).mockResolvedValue({ add: addMock });

    (prisma as any).courseDoc.update.mockResolvedValue(undefined);

    // Act
    await buildEmbeddingsForDocument("courseA", "https://example/file.pdf", "doc-1");

    // Assert
    expect(loadAndSplitDocument).toHaveBeenCalledWith("https://example/file.pdf", expect.any(Function));
    expect(embedDocuments).toHaveBeenCalledWith(["Text A", "Text B"]);
    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ids: ["doc-1_chunk_0", "doc-1_chunk_1"],
        embeddings: [
          [0.1, 0.2],
          [0.3, 0.4],
        ],
        documents: ["Text A", "Text B"],
        metadatas: expect.any(Array),
      })
    );
    // Check sanitized metadata was stringified using String(value)
    const passedMetadatas = addMock.mock.calls[0]?.[0]?.metadatas;
    expect(typeof passedMetadatas?.[1]?.big).toBe("string");
    expect(passedMetadatas?.[1]?.big).toBe(String({ nested: true }));

    expect(prisma.courseDoc.update).toHaveBeenCalledWith({
      where: { id: "doc-1" },
      data: { embedding_status: "SUCCESS", embedding_error: null },
    });
  });

  it("throws DocumentProcessingError when no content extracted", async () => {
    (loadAndSplitDocument as any).mockResolvedValue([]);
    await expect(buildEmbeddingsForDocument("c", "f", "d")).rejects.toBeInstanceOf(DocumentProcessingError);
  });
});

describe("querySimilarDocuments", () => {
  it("generates query embedding and returns formatted results", async () => {
    const collection = {
      query: vi.fn().mockResolvedValue({
        documents: [["docA", "docB"]],
        metadatas: [[{ x: 1 }, { x: 2 }]],
        distances: [[0.1, 0.2]],
      }),
    };
    (getOrCreateCourseCollection as any).mockResolvedValue(collection);
    (embedText as any).mockResolvedValue([0.1, 0.01]);

    const results = await querySimilarDocuments("courseA", "some query", 2);

    expect(embedText).toHaveBeenCalledWith("some query");
    expect(collection.query).toHaveBeenCalledWith({
      queryEmbeddings: [[0.1, 0.01]],
      nResults: 2,
    });

    expect(results).toEqual([
      { text: "docA", metadata: { x: 1 }, distance: 0.1 },
      { text: "docB", metadata: { x: 2 }, distance: 0.2 },
    ]);
  });
});