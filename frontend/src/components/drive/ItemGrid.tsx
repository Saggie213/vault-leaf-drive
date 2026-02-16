import type { Folder, File, FolderId } from '../../backend';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Folder as FolderIcon, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import FileActions from './FileActions';
import FolderActions from './FolderActions';
import ItemContextMenu from './ItemContextMenu';
import { openFile } from '../../utils/fileOpen';
import { toast } from 'sonner';
import { normalizeError } from '../../utils/errors';

interface ItemGridProps {
  folders: Folder[];
  files: File[];
  selectedItems: Set<string>;
  onFolderClick: (folderId: FolderId) => void;
  onToggleSelection: (id: string) => void;
}

export default function ItemGrid({
  folders,
  files,
  selectedItems,
  onFolderClick,
  onToggleSelection,
}: ItemGridProps) {
  const formatSize = (bytes: bigint) => {
    const size = Number(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (timestamp: bigint) => {
    try {
      const date = new Date(Number(timestamp) / 1000000);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const handleFileClick = async (file: File) => {
    try {
      await openFile(file);
    } catch (error: any) {
      const errorMessage = normalizeError(error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {folders.map((folder) => (
        <ItemContextMenu key={folder.id} item={folder} type="folder">
          <Card
            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
              selectedItems.has(folder.id) ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div
                  className="flex-1"
                  onClick={() => onFolderClick(folder.id)}
                >
                  <FolderIcon className="w-10 h-10 text-primary" />
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedItems.has(folder.id)}
                    onCheckedChange={() => onToggleSelection(folder.id)}
                  />
                </div>
              </div>
              <div onClick={() => onFolderClick(folder.id)}>
                <p className="font-medium text-sm truncate">{folder.metadata.name}</p>
                <p className="text-xs text-muted-foreground">{formatDate(folder.metadata.updatedAt)}</p>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <FolderActions folder={folder} />
              </div>
            </div>
          </Card>
        </ItemContextMenu>
      ))}

      {files.map((file) => (
        <ItemContextMenu key={file.id} item={file} type="file">
          <Card
            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
              selectedItems.has(file.id) ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between" onClick={() => handleFileClick(file)}>
                <FileText className="w-10 h-10 text-muted-foreground" />
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedItems.has(file.id)}
                    onCheckedChange={() => onToggleSelection(file.id)}
                  />
                </div>
              </div>
              <div onClick={() => handleFileClick(file)}>
                <p className="font-medium text-sm truncate">{file.metadata.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(file.size)} • {formatDate(file.metadata.updatedAt)}
                </p>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <FileActions file={file} />
              </div>
            </div>
          </Card>
        </ItemContextMenu>
      ))}
    </div>
  );
}
