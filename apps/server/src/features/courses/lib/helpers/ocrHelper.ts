import { createWorker } from 'tesseract.js';
import { PDFDocument, PDFName, PDFRawStream, PDFDict, PDFArray, PDFNumber } from 'pdf-lib';
import * as fs from 'fs';
import { Document } from '@langchain/core/documents';

/**
 * Extract text from a scanned/image-based PDF using OCR
 * This extracts images from the PDF and runs Tesseract on them.
 */
export async function extractTextFromScannedPDF(
  pdfPath: string,
  fileUrl: string,
  onProgress?: (progress: number) => void
): Promise<Document[]> {
  console.log('Detected scanned PDF - starting OCR process...');
  
  try {
    // Read PDF file
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();
    
    console.log(`   Processing ${pageCount} page(s) with OCR...`);
    
    // Create Tesseract worker
    const worker = await createWorker('eng', 1, {
      // logger: (m) => console.log(m), // Disable noisy progress logging
      errorHandler: (err) => {
        console.warn("Tesseract worker error:", err);
      }
    });
    
    const documents: Document[] = [];
    
    // Process each page
    for (let i = 0; i < pageCount; i++) {
      console.log(`   Processing page ${i + 1}/${pageCount}...`);
      
      // Emit progress
      if (onProgress) {
        const progress = Math.round(((i) / pageCount) * 100);
        onProgress(progress);
      }
      
      try {
        const page = pdfDoc.getPage(i);
        
        // Extract images from the page
        const Resources = page.node.Resources();
        if (!Resources) continue;
        
        const XObject = Resources.get(PDFName.of('XObject'));
        if (!XObject) continue;
        
        let pageText = '';
        
        // Iterate through XObjects to find images
        const xObjectDict = pdfDoc.context.lookup(XObject);
        
        if (xObjectDict instanceof PDFDict) {
             const keys = xObjectDict.keys();
             for (const key of keys) {
                const ref = xObjectDict.get(key);
                const obj = pdfDoc.context.lookup(ref);
                
                if (obj instanceof PDFRawStream) {
                    const subtype = obj.dict.get(PDFName.of('Subtype'));
                    if (subtype === PDFName.of('Image')) {
                        // Check image format support
                        const filter = obj.dict.get(PDFName.of('Filter'));
                        let isSupported = false;
                        
                        // We only support JPEG (DCTDecode) and JPEG2000 (JPXDecode) directly
                        // Raw pixel data (FlateDecode, CCITTFaxDecode) requires headers we can't easily generate here
                        if (filter === PDFName.of('DCTDecode') || filter === PDFName.of('JPXDecode')) {
                          isSupported = true;
                        } else if (filter instanceof PDFArray) {
                          // Check if any of the filters is a supported image format
                          // This is a simplification; usually the image filter is the last one or the only one
                          for (let idx = 0; idx < filter.size(); idx++) {
                            const f = filter.get(idx);
                            if (f === PDFName.of('DCTDecode') || f === PDFName.of('JPXDecode')) {
                              isSupported = true;
                              break;
                            }
                          }
                        }

                        if (!isSupported) {
                          // console.warn(`Skipping unsupported image format on page ${i+1} (Filter: ${filter?.toString()})`);
                          continue;
                        }

                        // Found a supported image!
                        const imageBytes = obj.contents;

                        // Check image dimensions if available to avoid "Image too small" errors
                        const widthRef = obj.dict.get(PDFName.of('Width'));
                        const heightRef = obj.dict.get(PDFName.of('Height'));
                        
                        const width = pdfDoc.context.lookup(widthRef);
                        const height = pdfDoc.context.lookup(heightRef);
                        
                        if (width instanceof PDFNumber && height instanceof PDFNumber) {
                          const w = width.value();
                          const h = height.value();

                          // Skip very small images (likely artifacts, lines, or decorative elements)
                          // Tesseract requires min width of 3, but < 50 is usually not text anyway
                          if (w < 50 || h < 50) {
                             continue;
                          }
                        }
                        
                        try {
                            const { data: { text } } = await worker.recognize(Buffer.from(imageBytes));
                            pageText += text + '\n';
                        } catch (ocrErr) {
                            // Ignore "Image too small" errors which are non-critical
                            const errMsg = String(ocrErr);
                            if (!errMsg.includes("Image too small") && !errMsg.includes("width of 3")) {
                                console.warn(`Failed to OCR image on page ${i+1}`, ocrErr);
                            }
                        }
                    }
                }
             }
        }
        
        if (pageText.trim()) {
          documents.push(
            new Document({
              pageContent: pageText,
              metadata: {
                source: fileUrl,
                page: i + 1,
                total_pages: pageCount,
                extracted_by: 'ocr',
              },
            })
          );
        }
      } catch (pageError) {
        console.warn(`   Warning: Failed to OCR page ${i + 1}:`, pageError);
        // Continue with next page
      }
    }
    
    await worker.terminate();
    
    console.log(`OCR completed: Extracted text from ${documents.length} page(s)`);
    
    return documents;
  } catch (error) {
    console.error('OCR failed:', error);
    return [];
  }
}

/**
 * Check if a PDF has extractable text or needs OCR
 */
export function needsOCR(documents: Document[]): boolean {
  return documents.length === 0 || documents.every(doc => !doc.pageContent.trim());
}
