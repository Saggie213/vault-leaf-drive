import type { Folder, File, FolderId } from '../../backend';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Folder as FolderIcon, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import FileActions from './FileActions';
import FolderActions from './FolderActions';
import ItemContextMenu from './ItemContextMenu';
import { openFile } from '../../utils/fileOpen';
import { toast } from 'sonner';
import { normalizeError } from '../../utils/errors';

interface ItemListProps {
  folders: Folder[];
  files: File[];
  selectedItems: Set<string>;
  onFolderClick: (folderId: FolderId) => void;
  onToggleSelection: (id: string) => void;
}

export default function ItemList({
  folders,
  files,
  selectedItems,
  onFolderClick,
  onToggleSelection,
}: ItemListProps) {
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
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Modified</TableHead>
            <TableHead className="hidden sm:table-cell">Size</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {folders.map((folder) => (
            <ItemContextMenu key={folder.id} item={folder} type="folder">
              <TableRow className="cursor-pointer hover:bg-muted/50">
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedItems.has(folder.id)}
                    onCheckedChange={() => onToggleSelection(folder.id)}
                  />
                </TableCell>
                <TableCell onClick={() => onFolderClick(folder.id)}>
                  <div className="flex items-center gap-3">
                    <FolderIcon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{folder.metadata.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground" onClick={() => onFolderClick(folder.id)}>
                  {formatDate(folder.metadata.updatedAt)}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground" onClick={() => onFolderClick(folder.id)}>—</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <FolderActions folder={folder} />
                </TableCell>
              </TableRow>
            </ItemContextMenu>
          ))}

          {files.map((file) => (
            <ItemContextMenu key={file.id} item={file} type="file">
              <TableRow className="cursor-pointer hover:bg-muted/50">
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedItems.has(file.id)}
                    onCheckedChange={() => onToggleSelection(file.id)}
                  />
                </TableCell>
                <TableCell onClick={() => handleFileClick(file)}>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <span>{file.metadata.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground" onClick={() => handleFileClick(file)}>
                  {formatDate(file.metadata.updatedAt)}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground" onClick={() => handleFileClick(file)}>
                  {formatSize(file.size)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <FileActions file={file} />
                </TableCell>
              </TableRow>
            </ItemContextMenu>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
