import { useState, useRef } from 'react';
import { useUploadFile } from '../../hooks/useQueries';
import type { FolderId } from '../../backend';
import { ExternalBlob } from '../../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeError } from '../../utils/errors';

interface FileUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: FolderId | null;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function FileUploader({ open, onOpenChange, folderId }: FileUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFileMutation = useUploadFile();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles: UploadingFile[] = files.map((file) => ({
      file,
      progress: 0,
      status: 'pending',
    }));

    setUploadingFiles((prev) => [...prev, ...newFiles]);
    uploadFiles(newFiles);
  };

  const uploadFiles = async (filesToUpload: UploadingFile[]) => {
    for (const uploadingFile of filesToUpload) {
      try {
        setUploadingFiles((prev) =>
          prev.map((f) => (f.file === uploadingFile.file ? { ...f, status: 'uploading' } : f))
        );

        const arrayBuffer = await uploadingFile.file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadingFiles((prev) =>
            prev.map((f) => (f.file === uploadingFile.file ? { ...f, progress: percentage } : f))
          );
        });

        const extension = uploadingFile.file.name.split('.').pop() || '';

        await uploadFileMutation.mutateAsync({
          name: uploadingFile.file.name,
          parentId: folderId,
          blob,
          extension,
          size: BigInt(uploadingFile.file.size),
        });

        setUploadingFiles((prev) =>
          prev.map((f) => (f.file === uploadingFile.file ? { ...f, status: 'success', progress: 100 } : f))
        );
      } catch (error: any) {
        const errorMessage = normalizeError(error);
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === uploadingFile.file ? { ...f, status: 'error', error: errorMessage } : f
          )
        );
        toast.error(`Failed to upload ${uploadingFile.file.name}: ${errorMessage}`);
      }
    }

    // Check if all files in this batch succeeded
    setUploadingFiles((currentFiles) => {
      const allSuccess = currentFiles.every((f) => f.status === 'success');
      const anyError = currentFiles.some((f) => f.status === 'error');

      if (allSuccess && currentFiles.length > 0) {
        toast.success(`All ${currentFiles.length} file(s) uploaded successfully`);
        setTimeout(() => {
          setUploadingFiles([]);
          onOpenChange(false);
        }, 1000);
      } else if (anyError) {
        const successCount = currentFiles.filter((f) => f.status === 'success').length;
        const errorCount = currentFiles.filter((f) => f.status === 'error').length;
        if (successCount > 0) {
          toast.info(`${successCount} file(s) uploaded, ${errorCount} failed`);
        }
      }

      return currentFiles;
    });
  };

  const removeFile = (file: File) => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // User is trying to close the dialog
      const hasUploading = uploadingFiles.some((f) => f.status === 'uploading');
      if (hasUploading) {
        toast.error('Please wait for uploads to complete before closing');
        return;
      }
      setUploadingFiles([]);
    }
    onOpenChange(newOpen);
  };

  const isUploading = uploadingFiles.some((f) => f.status === 'uploading');

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium">Click to select files</p>
            <p className="text-xs text-muted-foreground mt-1">or drag and drop files here</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          {uploadingFiles.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {uploadingFiles.map((uploadingFile, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                      <span className="text-sm truncate">{uploadingFile.file.name}</span>
                    </div>
                    {uploadingFile.status !== 'uploading' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => removeFile(uploadingFile.file)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {uploadingFile.status === 'uploading' && (
                    <div className="space-y-1">
                      <Progress value={uploadingFile.progress} className="h-1" />
                      <p className="text-xs text-muted-foreground">{uploadingFile.progress}%</p>
                    </div>
                  )}

                  {uploadingFile.status === 'success' && (
                    <p className="text-xs text-green-600">Upload complete</p>
                  )}

                  {uploadingFile.status === 'error' && (
                    <p className="text-xs text-destructive">{uploadingFile.error || 'Upload failed'}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
