import type { FolderId } from '../../backend';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  currentFolderId: FolderId | null;
}

export default function EmptyState({ currentFolderId }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-6">
        <FolderOpen className="w-16 h-16 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {currentFolderId ? 'This folder is empty' : 'Your drive is empty'}
      </h3>
      <p className="text-muted-foreground text-center max-w-md">
        {currentFolderId
          ? 'Upload files or create folders to get started organizing your content.'
          : 'Start by creating a folder or uploading your first files.'}
      </p>
    </div>
  );
}
