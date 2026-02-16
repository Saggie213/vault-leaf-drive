import { useState, useEffect } from 'react';
import { useRenameFile, useRenameFolder } from '../../hooks/useQueries';
import type { File, Folder } from '../../backend';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { normalizeError } from '../../utils/errors';

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: File | Folder;
  type: 'file' | 'folder';
}

export default function RenameDialog({ open, onOpenChange, item, type }: RenameDialogProps) {
  const [newName, setNewName] = useState('');
  const renameFileMutation = useRenameFile();
  const renameFolderMutation = useRenameFolder();

  useEffect(() => {
    if (open) {
      setNewName(item.metadata.name);
    }
  }, [open, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      if (type === 'file') {
        await renameFileMutation.mutateAsync({ fileId: item.id, newName: newName.trim() });
      } else {
        await renameFolderMutation.mutateAsync({ folderId: item.id, newName: newName.trim() });
      }
      toast.success(`${type === 'file' ? 'File' : 'Folder'} renamed successfully`);
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = normalizeError(error);
      toast.error(errorMessage);
    }
  };

  const isPending = renameFileMutation.isPending || renameFolderMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {type === 'file' ? 'File' : 'Folder'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newName">New Name</Label>
            <Input
              id="newName"
              placeholder="Enter new name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
