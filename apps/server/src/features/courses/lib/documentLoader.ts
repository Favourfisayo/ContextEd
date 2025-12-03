import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import * as fs from "fs";
import * as temp from "temp";
import { downloadFile } from "./helpers/fileDownload";
import { 
  getFileExtensionFromUrl, 
  getExtensionFromContentType 
} from "./helpers/fileExtension";
import { cleanDocuments } from "./helpers/textCleaner";

import { DocumentProcessingError } from "@/lib/errors";
import { needsOCR } from "./helpers/ocrHelper";

// Automatically track and cleanup temp files
temp.track();

/**
 * Simple text file loader
 */
class TextLoader {
  constructor(private filePath: string) {}
  
  async load(): Promise<Document[]> {
    const textContent = fs.readFileSync(this.filePath, "utf-8");
    return [
      new Document({
        pageContent: textContent,
        metadata: { source: this.filePath },
      }),
    ];
  }
}

// Supported file types and their loaders
const SUPPORTED_FORMATS = {
  '.pdf': PDFLoader,
  '.txt': TextLoader,
  '.docx': DocxLoader,
  '.doc': DocxLoader,
  '.csv': CSVLoader,
} as const;

type SupportedExtension = keyof typeof SUPPORTED_FORMATS;

/**
 * Load and parse document from a file URL
 */
export async function loadDocument(
  fileUrl: string,
  onProgress?: (progress: number) => void
): Promise<Document[]> {

  // First try to get extension from URL
  let extension = getFileExtensionFromUrl(fileUrl);
  
  // Create temp file (temp package handles cleanup automatically)
  const tempFilePath = temp.path();
  
  const contentType = await downloadFile(fileUrl, tempFilePath);
  
  // If no extension from URL, detect from Content-Type
  if (!extension || extension === '.') {
    extension = getExtensionFromContentType(contentType);
  }
  
  // Rename file with proper extension
  const finalFilePath = `${tempFilePath}${extension}`;
  if (tempFilePath !== finalFilePath) {
    fs.renameSync(tempFilePath, finalFilePath);
  }
  
  // Check if file type is supported
  if (!(extension in SUPPORTED_FORMATS)) {
    const supportedTypes = Object.keys(SUPPORTED_FORMATS).join(', ');
    throw new DocumentProcessingError(
      `Unsupported file type: ${extension}. ` +
      `Supported types: ${supportedTypes}`
    );
  }
  
  let documents: Document[];
  
  // PDF requires special configuration and OCR check
  if (extension === '.pdf') {
    const pdfLoader = new PDFLoader(finalFilePath, {
      splitPages: true, // Split PDF into pages
    });
    documents = await pdfLoader.load();
    
    // Check if PDF is scanned/image-based (no extractable text)
    if (needsOCR(documents)) {
      console.log("PDF needs OCR, attempting extraction...");
      try {
        const { extractTextFromScannedPDF } = await import("./helpers/ocrHelper");
        documents = await extractTextFromScannedPDF(finalFilePath, fileUrl, onProgress);
        
        if (documents.length === 0) {
             throw new DocumentProcessingError("OCR failed to extract any text from the document.");
        }
      } catch (error) {
         if (error instanceof DocumentProcessingError) throw error;
         throw new DocumentProcessingError(
            "Failed to perform OCR on scanned document: " + (error instanceof Error ? error.message : String(error))
         );
      }
    }
  } else {
    // Get the appropriate loader for other file types
    const LoaderClass = SUPPORTED_FORMATS[extension as SupportedExtension];
    const loader = new LoaderClass(finalFilePath);
    documents = await loader.load();
    
    // Ensure all documents have the source metadata
    documents = documents.map(doc => ({
      ...doc,
      metadata: { ...doc.metadata, source: fileUrl },
    }));
  }
  return documents;
}

/**
 * Text splitter configuration for chunking documents
 * Splits text into manageable chunks for better retrieval
 */
export const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000, // Each chunk ~1000 characters
  chunkOverlap: 200, // 200 character overlap between chunks for context
  separators: ["\n\n", "\n", " ", ""], // Try to split on paragraphs first
});

/**
 * Load, parse, and split a document into chunks
 */
export async function loadAndSplitDocument(
  fileUrl: string,
  onProgress?: (progress: number) => void
): Promise<Document[]> {
  const documents = await loadDocument(fileUrl, onProgress);
  
  // Clean documents before splitting
  const cleanedDocs = cleanDocuments(documents);
  
  const splitDocs = await textSplitter.splitDocuments(cleanedDocs);
  
  return splitDocs;
}
