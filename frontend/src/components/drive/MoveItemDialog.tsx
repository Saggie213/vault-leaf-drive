import { useState } from 'react';
import { useMoveFile, useGetUserFolders } from '../../hooks/useQueries';
import type { File, FolderId } from '../../backend';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder as FolderIcon, Home } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeError } from '../../utils/errors';

interface MoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: File;
  type: 'file';
}

export default function MoveItemDialog({ open, onOpenChange, item }: MoveItemDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<FolderId | null>(null);
  const { data: folders = [] } = useGetUserFolders();
  const moveFileMutation = useMoveFile();

  const availableFolders = folders.filter((f) => f.id !== item.parentId);

  const handleMove = async () => {
    try {
      await moveFileMutation.mutateAsync({ fileId: item.id, newParentId: selectedFolderId });
      toast.success('File moved successfully');
      onOpenChange(false);
      setSelectedFolderId(null);
    } catch (error: any) {
      const errorMessage = normalizeError(error);
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move File</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label>Select Destination Folder</Label>
          <ScrollArea className="h-64 border rounded-md">
            <div className="p-2 space-y-1">
              <button
                onClick={() => setSelectedFolderId(null)}
                className={`w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors ${
                  selectedFolderId === null ? 'bg-primary/10 border border-primary' : ''
                }`}
              >
                <Home className="w-5 h-5 text-primary" />
                <span className="text-sm">My Drive (Root)</span>
              </button>
              {availableFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors ${
                    selectedFolderId === folder.id ? 'bg-primary/10 border border-primary' : ''
                  }`}
                >
                  <FolderIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm">{folder.metadata.name}</span>
                </button>
              ))}
              {availableFolders.length === 0 && selectedFolderId !== null && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No other folders available
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={moveFileMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={moveFileMutation.isPending}>
            {moveFileMutation.isPending ? 'Moving...' : 'Move'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
