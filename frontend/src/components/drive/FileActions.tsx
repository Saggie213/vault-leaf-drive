import { useState } from 'react';
import type { File } from '../../backend';
import { useDeleteFile } from '../../hooks/useQueries';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Download, Edit, FolderInput, Trash2, ExternalLink } from 'lucide-react';
import RenameDialog from './RenameDialog';
import MoveItemDialog from './MoveItemDialog';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { toast } from 'sonner';
import { normalizeError } from '../../utils/errors';
import { openFile, downloadFile } from '../../utils/fileOpen';

interface FileActionsProps {
  file: File;
}

export default function FileActions({ file }: FileActionsProps) {
  const [showRename, setShowRename] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const deleteFileMutation = useDeleteFile();

  const handleOpen = async () => {
    try {
      await openFile(file);
    } catch (error: any) {
      const errorMessage = normalizeError(error);
      toast.error(errorMessage);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadFile(file);
      toast.success('File downloaded successfully');
    } catch (error: any) {
      const errorMessage = normalizeError(error);
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFileMutation.mutateAsync(file.id);
      toast.success('File deleted successfully');
      setShowDelete(false);
    } catch (error: any) {
      const errorMessage = normalizeError(error);
      toast.error(errorMessage);
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
          <DropdownMenuItem onClick={handleOpen}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowRename(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowMove(true)}>
            <FolderInput className="w-4 h-4 mr-2" />
            Move
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDelete(true)} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameDialog open={showRename} onOpenChange={setShowRename} item={file} type="file" />
      <MoveItemDialog open={showMove} onOpenChange={setShowMove} item={file} type="file" />
      <ConfirmDeleteDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        itemName={file.metadata.name}
        itemType="file"
        onConfirm={handleDelete}
        isDeleting={deleteFileMutation.isPending}
      />
    </>
  );
}
