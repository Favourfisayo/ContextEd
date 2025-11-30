import * as path from "path";

/**
 * Detect file type from URL or file path
 */
export function getFileExtensionFromUrl(fileUrl: string): string {
  const urlWithoutQuery = fileUrl.split("?")[0];
  return path.extname(urlWithoutQuery!).toLowerCase();
}

/**
 * Get file extension from Content-Type header
 * Maps MIME types to file extensions
 */
export function getExtensionFromContentType(contentType: string): string {
  const type = contentType.toLowerCase();
  
  // Document types
  if (type.includes('pdf')) return '.pdf';
  if (type.includes('msword') || type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml')) return '.docx';
  if (type.includes('ms-excel') || type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml')) return '.csv';
  
  // Text types
  if (type.includes('text/plain')) return '.txt';
  if (type.includes('text/csv')) return '.csv';
  
  // Default for unknown binary
  if (type.includes('application/octet-stream')) return '.pdf';
  
  return '';
}
