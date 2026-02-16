import type { File } from '../backend';
import { toast } from 'sonner';

/**
 * Result of attempting to open a file
 */
type OpenFileResult = 
  | { success: true; method: 'opened' | 'downloaded'; reason?: string }
  | { success: false; error: string };

/**
 * Infer MIME type from file extension
 */
function inferMimeType(filename: string, extension: string): string {
  const ext = extension.toLowerCase().replace(/^\./, '');
  
  const mimeTypes: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon',
    
    // Documents
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'html': 'text/html',
    'htm': 'text/html',
    'css': 'text/css',
    'js': 'text/javascript',
    'json': 'application/json',
    'xml': 'text/xml',
    
    // Video
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'ogv': 'video/ogg',
    'mov': 'video/quicktime',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'oga': 'audio/ogg',
    'm4a': 'audio/mp4',
    'flac': 'audio/flac',
    
    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    
    // Office
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Check if a MIME type is browser-viewable
 */
function isBrowserViewable(mimeType: string): boolean {
  return (
    mimeType.startsWith('image/') ||
    mimeType.startsWith('video/') ||
    mimeType.startsWith('audio/') ||
    mimeType === 'application/pdf' ||
    mimeType === 'text/plain' ||
    mimeType === 'text/html'
  );
}

/**
 * Opens a file in a new tab when possible (for browser-viewable types),
 * otherwise triggers a download. Shows appropriate toasts for user feedback.
 */
export async function openFile(file: File): Promise<void> {
  try {
    const mimeType = inferMimeType(file.metadata.name, file.extension);
    const isViewable = isBrowserViewable(mimeType);
    
    if (isViewable) {
      // Try to open viewable files in a new tab using direct URL
      const directUrl = file.blob.getDirectURL();
      const newWindow = window.open(directUrl, '_blank', 'noopener,noreferrer');
      
      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup blocked - fall back to download
        toast.info('Popup blocked. Downloading file instead.');
        await downloadFile(file);
        return;
      }
      
      // Successfully opened in new tab
      return;
    } else {
      // Non-viewable files should be downloaded
      await downloadFile(file);
    }
  } catch (error: any) {
    // If anything fails, try to download
    console.error('Error opening file:', error);
    try {
      await downloadFile(file);
    } catch (downloadError: any) {
      throw new Error(`Failed to open or download file: ${downloadError.message || 'Unknown error'}`);
    }
  }
}

/**
 * Downloads a file by fetching its bytes and creating a download link.
 */
export async function downloadFile(file: File): Promise<void> {
  try {
    const bytes = await file.blob.getBytes();
    const mimeType = inferMimeType(file.metadata.name, file.extension);
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = file.metadata.name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error: any) {
    throw new Error(`Failed to download file: ${error.message || 'Unknown error'}`);
  }
}
