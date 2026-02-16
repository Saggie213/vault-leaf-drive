import { useState } from 'react';
import type { Folder } from '../../backend';
import { useDeleteFolder } from '../../hooks/useQueries';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, Download } from 'lucide-react';
import RenameDialog from './RenameDialog';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { toast } from 'sonner';
import { normalizeError } from '../../utils/errors';
import { exportFolderAsZip } from '../../utils/folderExport';

interface FolderActionsProps {
  folder: Folder;
}

export default function FolderActions({ folder }: FolderActionsProps) {
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const deleteFolder = useDeleteFolder();

  const handleDelete = async () => {
    try {
      await deleteFolder.mutateAsync(folder.id);
      toast.success('Folder deleted successfully');
      setShowDelete(false);
    } catch (error: any) {
      const errorMessage = normalizeError(error);
      toast.error(errorMessage);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportFolderAsZip(folder.id, (progress) => {
        // Progress updates can be shown via toast if needed
      });
      toast.success('Folder exported successfully');
    } catch (error: any) {
      const errorMessage = normalizeError(error);
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExport} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowRename(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDelete(true)} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameDialog open={showRename} onOpenChange={setShowRename} item={folder} type="folder" />
      <ConfirmDeleteDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        itemName={folder.metadata.name}
        itemType="folder"
        onConfirm={handleDelete}
        isDeleting={deleteFolder.isPending}
      />
    </>
  );
}
