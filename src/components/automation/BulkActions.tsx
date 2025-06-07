
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Trash2, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BulkActionsProps {
  selectedCount: number;
  onActivateSelected: () => void;
  onDeactivateSelected: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onClearSelection: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onActivateSelected,
  onDeactivateSelected,
  onDeleteSelected,
  onDuplicateSelected,
  onClearSelection
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
      <Badge variant="secondary" className="mr-2">
        {selectedCount} selected
      </Badge>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Bulk Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={onActivateSelected}>
            <Play className="mr-2 h-4 w-4" />
            Activate Selected
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDeactivateSelected}>
            <Pause className="mr-2 h-4 w-4" />
            Deactivate Selected
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDuplicateSelected}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate Selected
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDeleteSelected} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        Clear Selection
      </Button>
    </div>
  );
};

export default BulkActions;
