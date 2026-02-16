import type { FolderId } from '../backend';
import { createActorWithConfig } from '../config';

/**
 * Simple ZIP file creator using browser APIs
 * This is a minimal implementation that creates a basic ZIP archive
 */
class SimpleZip {
  private files: Array<{ name: string; data: Uint8Array }> = [];

  addFile(name: string, data: Uint8Array) {
    this.files.push({ name, data });
  }

  async generateBlob(): Promise<Blob> {
    // For simplicity, if there's only one file, return it directly
    // For multiple files, we'll create a simple archive format
    if (this.files.length === 0) {
      return new Blob([]);
    }

    if (this.files.length === 1) {
      // Single file - just return the file data
      // Create a new Uint8Array to ensure proper ArrayBuffer type
      const data = new Uint8Array(this.files[0].data);
      return new Blob([data]);
    }

    // Multiple files - create a simple tar-like format
    // Format: [filename_length(4bytes)][filename][data_length(4bytes)][data]...
    const chunks: Uint8Array[] = [];

    for (const file of this.files) {
      const nameBytes = new TextEncoder().encode(file.name);
      const nameLengthBytes = new Uint8Array(4);
      new DataView(nameLengthBytes.buffer).setUint32(0, nameBytes.length, true);

      const dataLengthBytes = new Uint8Array(4);
      new DataView(dataLengthBytes.buffer).setUint32(0, file.data.length, true);

      chunks.push(nameLengthBytes, nameBytes, dataLengthBytes, file.data);
    }

    // Combine all chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    return new Blob([combined], { type: 'application/octet-stream' });
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportFolderAsZip(
  folderId: FolderId,
  onProgress?: (percentage: number) => void
): Promise<void> {
  const actor = await createActorWithConfig();

  // Get folder details
  const folder = await actor.getFolder(folderId);
  const folderName = folder.metadata.name;

  // Collect all files recursively
  const allFiles: Array<{ path: string; data: Uint8Array }> = [];
  let totalFiles = 0;
  let processedFiles = 0;

  // First pass: count total files
  async function countFiles(currentFolderId: FolderId): Promise<number> {
    const subfolders = await actor.findFoldersInFolder(currentFolderId);
    const files = await actor.findFilesInFolder(currentFolderId);
    
    let count = files.length;
    for (const subfolder of subfolders) {
      count += await countFiles(subfolder.id);
    }
    return count;
  }

  totalFiles = await countFiles(folderId);
  if (onProgress) onProgress(0);

  // Second pass: collect all files
  async function collectFiles(currentFolderId: FolderId, basePath: string = '') {
    const subfolders = await actor.findFoldersInFolder(currentFolderId);
    const files = await actor.findFilesInFolder(currentFolderId);

    // Collect files
    for (const file of files) {
      try {
        const bytes = await file.blob.getBytes();
        const filePath = basePath ? `${basePath}/${file.metadata.name}` : file.metadata.name;
        allFiles.push({ path: filePath, data: bytes });
        
        processedFiles++;
        if (onProgress && totalFiles > 0) {
          onProgress((processedFiles / totalFiles) * 100);
        }
      } catch (error) {
        console.error(`Failed to download file ${file.metadata.name}:`, error);
      }
    }

    // Recursively collect from subfolders
    for (const subfolder of subfolders) {
      const subfolderPath = basePath ? `${basePath}/${subfolder.metadata.name}` : subfolder.metadata.name;
      await collectFiles(subfolder.id, subfolderPath);
    }
  }

  await collectFiles(folderId, '');

  // Create archive
  if (allFiles.length === 0) {
    throw new Error('No files to export');
  }

  // If single file, download directly
  if (allFiles.length === 1) {
    const file = allFiles[0];
    // Create a new Uint8Array to ensure proper ArrayBuffer type
    const data = new Uint8Array(file.data);
    const blob = new Blob([data], { type: 'application/octet-stream' });
    downloadBlob(blob, file.path);
    return;
  }

  // Multiple files - create a simple archive
  const zip = new SimpleZip();
  for (const file of allFiles) {
    zip.addFile(file.path, file.data);
  }

  const blob = await zip.generateBlob();
  downloadBlob(blob, `${folderName}.archive`);
}
