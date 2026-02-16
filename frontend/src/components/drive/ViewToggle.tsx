import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import type { ViewMode } from './FileManager';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1 border rounded-md p-1">
      <Button
        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => onViewModeChange('list')}
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => onViewModeChange('grid')}
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
    </div>
  );
}
