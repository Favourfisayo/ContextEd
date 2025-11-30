import * as fs from "fs";
import { ExternalAPIError } from "@/lib/errors";

/**
 * Download a file from a URL to a temporary location
 * Uses fetch API to handle redirects and various hosting services (UploadThing, etc.)
 * Returns the content type from the response headers
 */

export async function downloadFile(url: string, outputPath: string): Promise<string> {
  try {
    // Use fetch which handles redirects automatically
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new ExternalAPIError(`Failed to download file: ${response.status} ${response.statusText}`, 'FileStorage');
    }

    // Get the file data as a buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Write to file
    fs.writeFileSync(outputPath, buffer);
    
    const contentType = response.headers.get('content-type') || '';
    
    return contentType;
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    throw error;
  }
}
