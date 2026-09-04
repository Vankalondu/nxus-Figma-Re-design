import { ChevronRight } from 'lucide-react';

export function TableMenu() {
  return (
    <div className="bg-surface-card border rounded-lg p-4 w-48">
      <h3 className="text-text-body mb-4">Table menu</h3>
      <div className="space-y-2">
        <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-surface-accent rounded text-text-heading">
          <span>Columns</span>
          <ChevronRight className="w-4 h-4" />
        </button>
        <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-surface-accent rounded text-text-heading">
          <span>Filters</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}