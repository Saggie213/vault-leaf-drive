import { useState } from 'react';
import { useCreateFolder } from '../../hooks/useQueries';
import type { FolderId } from '../../backend';
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

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: FolderId | null;
}

export default function CreateFolderDialog({ open, onOpenChange, parentId }: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState('');
  const createFolderMutation = useCreateFolder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      await createFolderMutation.mutateAsync({ name: folderName.trim(), parentId });
      toast.success('Folder created successfully');
      setFolderName('');
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = normalizeError(error);
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folderName">Folder Name</Label>
            <Input
              id="folderName"
              placeholder="Enter folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createFolderMutation.isPending}>
              {createFolderMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
