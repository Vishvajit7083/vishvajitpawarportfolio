/**
 * Utility functions for handling PDF and document data URLs safely in browsers.
 * Browsers block data:application/pdf in iframes/embeds for security;
 * converting base64 data URLs to same-origin Blob URLs allows reliable iframe/object rendering.
 */

const blobUrlCache = new Map<string, string>();

/**
 * Converts a base64 data URL to an Object URL (blob: URL)
 */
export function dataUrlToBlobUrl(dataUrl: string): string {
  if (!dataUrl) return '';

  // If it's already a blob URL or remote http/https URL, return it directly
  if (dataUrl.startsWith('blob:') || dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
    return dataUrl;
  }

  // Check cache first to avoid recreating redundant blob URLs
  if (blobUrlCache.has(dataUrl)) {
    return blobUrlCache.get(dataUrl)!;
  }

  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return dataUrl;

    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const base64Data = parts[1];

    const binaryStr = atob(base64Data);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);

    blobUrlCache.set(dataUrl, blobUrl);
    return blobUrl;
  } catch (error) {
    console.error('Failed to convert data URL to Blob URL:', error);
    return dataUrl;
  }
}

/**
 * Clean up blob URLs when they are no longer needed
 */
export function revokeBlobUrl(dataUrl: string) {
  if (blobUrlCache.has(dataUrl)) {
    const blobUrl = blobUrlCache.get(dataUrl)!;
    URL.revokeObjectURL(blobUrl);
    blobUrlCache.delete(dataUrl);
  }
}
