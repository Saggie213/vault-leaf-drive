import { useState } from 'react';
import type { FolderId } from '../../backend';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { exportFolderAsZip } from '../../utils/folderExport';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ExportFolderButtonProps {
  folderId: FolderId;
  asMenuItem?: boolean;
}

export default function ExportFolderButton({ folderId, asMenuItem }: ExportFolderButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setShowProgress(true);
    setProgress(0);

    try {
      await exportFolderAsZip(folderId, (percent) => {
        setProgress(percent);
      });
      toast.success('Folder exported successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to export folder');
    } finally {
      setIsExporting(false);
      setTimeout(() => setShowProgress(false), 500);
    }
  };

  if (asMenuItem) {
    return (
      <>
        <div onClick={handleExport} className="flex items-center w-full cursor-pointer">
          <Download className="w-4 h-4 mr-2" />
          Download Folder
        </div>
        <Dialog open={showProgress} onOpenChange={setShowProgress}>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Exporting Folder</DialogTitle>
              <DialogDescription>
                Downloading all files from this folder...
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">{Math.round(progress)}%</p>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button onClick={handleExport} disabled={isExporting} variant="outline">
        {isExporting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        Download Folder
      </Button>

      <Dialog open={showProgress} onOpenChange={setShowProgress}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Exporting Folder</DialogTitle>
            <DialogDescription>
              Downloading all files from this folder...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">{Math.round(progress)}%</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
