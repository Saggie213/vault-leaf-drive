import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType: 'file' | 'folder';
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  itemName,
  itemType,
  onConfirm,
  isDeleting,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {itemType === 'file' ? 'File' : 'Folder'}?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{itemName}"?
            {itemType === 'folder' && ' This will also delete all files and subfolders inside it.'}
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
