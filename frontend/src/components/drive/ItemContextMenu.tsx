import { useState } from 'react';
import type { File, Folder } from '../../backend';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Download, Edit, FolderInput, Trash2, ExternalLink } from 'lucide-react';
import RenameDialog from './RenameDialog';
import MoveItemDialog from './MoveItemDialog';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { useDeleteFile, useDeleteFolder } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { normalizeError } from '../../utils/errors';
import { openFile, downloadFile } from '../../utils/fileOpen';

interface ItemContextMenuProps {
  item: File | Folder;
  type: 'file' | 'folder';
  children: React.ReactNode;
}

export default function ItemContextMenu({ item, type, children }: ItemContextMenuProps) {
  const [showRename, setShowRename] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const deleteFileMutation = useDeleteFile();
  const deleteFolderMutation = useDeleteFolder();

  const handleOpen = async () => {
    if (type === 'file') {
      try {
        await openFile(item as File);
      } catch (error: any) {
        const errorMessage = normalizeError(error);
        toast.error(errorMessage);
      }
    }
  };

  const handleDownload = async () => {
    if (type === 'file') {
      try {
        await downloadFile(item as File);
        toast.success('File downloaded successfully');
      } catch (error: any) {
        const errorMessage = normalizeError(error);
        toast.error(errorMessage);
      }
    }
  };

  const handleDelete = async () => {
    try {
      if (type === 'file') {
        await deleteFileMutation.mutateAsync(item.id);
        toast.success('File deleted successfully');
      } else {
        await deleteFolderMutation.mutateAsync(item.id);
        toast.success('Folder deleted successfully');
      }
      setShowDelete(false);
    } catch (error: any) {
      const errorMessage = normalizeError(error);
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          {type === 'file' && (
            <>
              <ContextMenuItem onClick={handleOpen}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open
              </ContextMenuItem>
              <ContextMenuItem onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </ContextMenuItem>
              <ContextMenuItem onClick={() => setShowMove(true)}>
                <FolderInput className="w-4 h-4 mr-2" />
                Move
              </ContextMenuItem>
            </>
          )}
          <ContextMenuItem onClick={() => setShowRename(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Rename
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => setShowDelete(true)} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <RenameDialog open={showRename} onOpenChange={setShowRename} item={item} type={type} />
      {type === 'file' && (
        <MoveItemDialog open={showMove} onOpenChange={setShowMove} item={item as File} type="file" />
      )}
      <ConfirmDeleteDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        itemName={item.metadata.name}
        itemType={type}
        onConfirm={handleDelete}
        isDeleting={
          type === 'file' ? deleteFileMutation.isPending : deleteFolderMutation.isPending
        }
      />
    </>
  );
}
