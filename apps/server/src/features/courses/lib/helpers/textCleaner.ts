/**
 * Text cleaning utilities for RAG pre-processing
 */

/**
 * Cleans and normalizes text content from documents
 * 
 * Operations performed:
 * 1. Removes null bytes and control characters
 * 2. Normalizes unicode spaces to standard ASCII space
 * 3. Merges hyphenated words split across lines (e.g. "process-\ning" -> "processing")
 * 4. Collapses multiple spaces into single spaces
 * 5. Normalizes line breaks (3+ newlines -> 2 newlines) to preserve paragraph structure while removing excessive gaps
 * 6. Trims whitespace
 */
export function cleanText(text: string): string {
  if (!text) return "";

  return text
    // 1. Remove null bytes
    .replace(/\0/g, "")
    
    // 2. Normalize unicode spaces (non-breaking space, etc) to regular space
    .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, " ")
    
    // 3. Fix hyphenated words at line endings (e.g. "embed-\nding" -> "embedding")
    // We look for: word char, hyphen, optional spaces, newline, optional spaces, word char
    .replace(/(\w)-\s*\n\s*(\w)/g, "$1$2")
    
    // 4. Replace multiple spaces/tabs with single space (but keep newlines for now)
    .replace(/[ \t]+/g, " ")
    
    // 5. Fix broken lines within paragraphs? 
    // This is risky without NLP, but we can normalize excessive newlines.
    // Replace 3 or more newlines with 2 (paragraph break)
    .replace(/\n{3,}/g, "\n\n")
    
    // 6. Trim result
    .trim();
}

/**
 * Clean a list of documents in place
 */
import { Document } from "@langchain/core/documents";

export function cleanDocuments(documents: Document[]): Document[] {
  return documents.map(doc => ({
    ...doc,
    pageContent: cleanText(doc.pageContent)
  })).filter(doc => doc.pageContent.length > 0); // Remove empty documents after cleaning
}
