import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { SortField, SortDirection } from './FileManager';

interface SortControlsProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionChange: (direction: SortDirection) => void;
}

export default function SortControls({
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
}: SortControlsProps) {
  const toggleDirection = () => {
    onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="flex gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onSortFieldChange('name')}>
            {sortField === 'name' && '✓ '}Name
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortFieldChange('updatedAt')}>
            {sortField === 'updatedAt' && '✓ '}Modified
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortFieldChange('size')}>
            {sortField === 'size' && '✓ '}Size
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="icon" onClick={toggleDirection}>
        {sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
      </Button>
    </div>
  );
}
