import { useState, useMemo } from 'react';
import { useGetFoldersInFolder, useGetFilesInFolder } from '../../hooks/useQueries';
import { useDriveActor } from '../../hooks/useDriveActor';
import type { Folder, File, FolderId } from '../../backend';
import Breadcrumbs from './Breadcrumbs';
import FileUploader from './FileUploader';
import CreateFolderDialog from './CreateFolderDialog';
import ViewToggle from './ViewToggle';
import SearchBar from './SearchBar';
import SortControls from './SortControls';
import ItemList from './ItemList';
import ItemGrid from './ItemGrid';
import EmptyState from '../feedback/EmptyState';
import LoadingState from '../feedback/LoadingState';
import DriveBrowseErrorState from '../feedback/DriveBrowseErrorState';
import ActorInitWarningBanner from '../feedback/ActorInitWarningBanner';
import SelectionToolbar from './SelectionToolbar';
import ExportFolderButton from './ExportFolderButton';
import { Button } from '@/components/ui/button';
import { FolderPlus, Upload } from 'lucide-react';

export type ViewMode = 'list' | 'grid';
export type SortField = 'name' | 'updatedAt' | 'size';
export type SortDirection = 'asc' | 'desc';

export default function FileManager() {
  const [currentFolderId, setCurrentFolderId] = useState<FolderId | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('viewMode') as ViewMode) || 'list';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const { initWarning, retry: retryActor } = useDriveActor();

  const {
    data: folders = [],
    isLoading: foldersLoading,
    error: foldersError,
    refetch: refetchFolders,
  } = useGetFoldersInFolder(currentFolderId);

  const {
    data: files = [],
    isLoading: filesLoading,
    error: filesError,
    refetch: refetchFiles,
  } = useGetFilesInFolder(currentFolderId);

  const isLoading = foldersLoading || filesLoading;
  const error = foldersError || filesError;

  // Filter items by search query
  const filteredFolders = useMemo(() => {
    if (!searchQuery) return folders;
    return folders.filter((folder) =>
      folder.metadata.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [folders, searchQuery]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    return files.filter((file) => file.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [files, searchQuery]);

  // Sort items
  const sortedFolders = useMemo(() => {
    const sorted = [...filteredFolders];
    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.metadata.name.localeCompare(b.metadata.name);
      } else if (sortField === 'updatedAt') {
        comparison = Number(a.metadata.updatedAt - b.metadata.updatedAt);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredFolders, sortField, sortDirection]);

  const sortedFiles = useMemo(() => {
    const sorted = [...filteredFiles];
    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.metadata.name.localeCompare(b.metadata.name);
      } else if (sortField === 'updatedAt') {
        comparison = Number(a.metadata.updatedAt - b.metadata.updatedAt);
      } else if (sortField === 'size') {
        comparison = Number(a.size - b.size);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredFiles, sortField, sortDirection]);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };

  const handleFolderClick = (folderId: FolderId) => {
    setCurrentFolderId(folderId);
    setSelectedItems(new Set());
    setSearchQuery('');
  };

  const handleBreadcrumbClick = (folderId: FolderId | null) => {
    setCurrentFolderId(folderId);
    setSelectedItems(new Set());
    setSearchQuery('');
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const handleRetry = () => {
    refetchFolders();
    refetchFiles();
  };

  const isEmpty = sortedFolders.length === 0 && sortedFiles.length === 0;

  // Show error state only for definitive query failures (not actor initialization issues)
  if (error && !isLoading) {
    return <DriveBrowseErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <>
      {initWarning && <ActorInitWarningBanner message={initWarning} onRetry={retryActor} />}
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="space-y-4">
          <Breadcrumbs currentFolderId={currentFolderId} onNavigate={handleBreadcrumbClick} />

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateFolder(true)} variant="default">
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
              <Button onClick={() => setShowUploader(true)} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
              {currentFolderId && <ExportFolderButton folderId={currentFolderId} />}
            </div>

            <div className="flex gap-2 items-center w-full sm:w-auto">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              <SortControls
                sortField={sortField}
                sortDirection={sortDirection}
                onSortFieldChange={setSortField}
                onSortDirectionChange={setSortDirection}
              />
              <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
            </div>
          </div>
        </div>

        {selectedItems.size > 0 && (
          <SelectionToolbar
            selectedItems={selectedItems}
            folders={sortedFolders}
            files={sortedFiles}
            onClearSelection={clearSelection}
          />
        )}

        {isLoading ? (
          <LoadingState />
        ) : isEmpty ? (
          <EmptyState currentFolderId={currentFolderId} />
        ) : viewMode === 'list' ? (
          <ItemList
            folders={sortedFolders}
            files={sortedFiles}
            selectedItems={selectedItems}
            onFolderClick={handleFolderClick}
            onToggleSelection={toggleSelection}
          />
        ) : (
          <ItemGrid
            folders={sortedFolders}
            files={sortedFiles}
            selectedItems={selectedItems}
            onFolderClick={handleFolderClick}
            onToggleSelection={toggleSelection}
          />
        )}

        <CreateFolderDialog
          open={showCreateFolder}
          onOpenChange={setShowCreateFolder}
          parentId={currentFolderId}
        />

        <FileUploader
          open={showUploader}
          onOpenChange={setShowUploader}
          folderId={currentFolderId}
        />
      </div>
    </>
  );
}
