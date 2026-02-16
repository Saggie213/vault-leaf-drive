import { useMemo } from 'react';
import { useGetUserFolders } from '../../hooks/useQueries';
import type { FolderId, Folder } from '../../backend';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

interface BreadcrumbsProps {
  currentFolderId: FolderId | null;
  onNavigate: (folderId: FolderId | null) => void;
}

export default function Breadcrumbs({ currentFolderId, onNavigate }: BreadcrumbsProps) {
  const { data: allFolders = [], isLoading } = useGetUserFolders();

  const breadcrumbPath = useMemo(() => {
    if (!currentFolderId || isLoading) return [];

    const path: Folder[] = [];
    let currentId: FolderId | null | undefined = currentFolderId;
    const maxDepth = 50; // Prevent infinite loops
    let depth = 0;

    while (currentId && depth < maxDepth) {
      const folder = allFolders.find((f) => f.id === currentId);
      if (!folder) break;
      path.unshift(folder);
      currentId = folder.parentId;
      depth++;
    }

    return path;
  }, [currentFolderId, allFolders, isLoading]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {currentFolderId === null ? (
            <BreadcrumbPage className="flex items-center gap-1.5">
              <Home className="w-4 h-4" />
              My Drive
            </BreadcrumbPage>
          ) : (
            <>
              <BreadcrumbLink
                onClick={() => onNavigate(null)}
                className="flex items-center gap-1.5 cursor-pointer hover:text-foreground"
              >
                <Home className="w-4 h-4" />
                My Drive
              </BreadcrumbLink>
              <BreadcrumbSeparator />
            </>
          )}
        </BreadcrumbItem>

        {breadcrumbPath.map((folder, index) => (
          <BreadcrumbItem key={folder.id}>
            {index === breadcrumbPath.length - 1 ? (
              <BreadcrumbPage>{folder.metadata.name}</BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink
                  onClick={() => onNavigate(folder.id)}
                  className="cursor-pointer hover:text-foreground"
                >
                  {folder.metadata.name}
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
