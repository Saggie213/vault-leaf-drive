import { useState } from 'react';
import type { Folder, File } from '../../backend';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';
import { useDeleteFile, useDeleteFolder } from '../../hooks/useQueries';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { toast } from 'sonner';
import { normalizeError } from '../../utils/errors';

interface SelectionToolbarProps {
  selectedItems: Set<string>;
  folders: Folder[];
  files: File[];
  onClearSelection: () => void;
}

export default function SelectionToolbar({
  selectedItems,
  folders,
  files,
  onClearSelection,
}: SelectionToolbarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteFileMutation = useDeleteFile();
  const deleteFolderMutation = useDeleteFolder();

  const selectedFolders = folders.filter((f) => selectedItems.has(f.id));
  const selectedFiles = files.filter((f) => selectedItems.has(f.id));

  const handleDeleteAll = async () => {
    try {
      const deletePromises = [
        ...selectedFiles.map((file) => deleteFileMutation.mutateAsync(file.id)),
        ...selectedFolders.map((folder) => deleteFolderMutation.mutateAsync(folder.id)),
      ];

      await Promise.all(deletePromises);
      toast.success(`Deleted ${selectedItems.size} item(s) successfully`);
      onClearSelection();
      setShowDeleteConfirm(false);
    } catch (error: any) {
      const errorMessage = normalizeError(error);
      toast.error(errorMessage);
    }
  };

  const isDeleting = deleteFileMutation.isPending || deleteFolderMutation.isPending;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-primary text-primary-foreground rounded-full shadow-lg px-6 py-3 flex items-center gap-4">
          <span className="font-medium">{selectedItems.size} selected</span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-full"
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearSelection}
              className="rounded-full hover:bg-primary-foreground/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        itemName={`${selectedItems.size} item(s)`}
        itemType="file"
        onConfirm={handleDeleteAll}
        isDeleting={isDeleting}
      />
    </>
  );
}
