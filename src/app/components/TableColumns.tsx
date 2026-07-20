import React, { useState, useEffect, useRef } from 'react';
import { FileText, Video, MoreVertical, Plus, Trash2, X, Undo } from 'lucide-react';

export type ColumnGroup = 'PLAYER IDENTIFICATION' | 'BIO DATA' | 'GAME STATS' | 'VIDEOS' | 'SCOUTING';

export interface ColumnDef {
  id: string;
  group: ColumnGroup;
  label: React.ReactNode;
  width?: string;
  minWidth?: string;
  isSticky?: string;
  borderRight?: boolean;
  bgHeader?: string;
  bgCell?: string;
  fontMono?: boolean;
  align?: 'center' | 'left';
  renderCell?: (player: any, rowIndex: number, cellData: string, onCellChange: (val: string) => void) => React.ReactNode;
}

export const useDynamicColumns = (initialColumns: ColumnDef[]) => {
  const [columns, setColumns] = useState<ColumnDef[]>(initialColumns);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, colIndex: number, group: ColumnGroup } | null>(null);
  const [editingColumn, setEditingColumn] = useState<{ index: number, label: string } | null>(null);
  
  // Custom cell data mapping: { [playerId]: { [colId]: string } }
  const [customData, setCustomData] = useState<Record<string, Record<string, string>>>({});
  
  // Undo state
  const [deletedColumnCache, setDeletedColumnCache] = useState<{ index: number, col: ColumnDef } | null>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, colIndex: number, group: ColumnGroup) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, colIndex, group });
  };

  const handleCellChange = (playerId: string, colId: string, val: string) => {
    setCustomData(prev => ({
      ...prev,
      [playerId]: {
        ...(prev[playerId] || {}),
        [colId]: val
      }
    }));
  };

  const insertColumn = (direction: 'left' | 'right') => {
    if (!contextMenu) return;
    const { colIndex, group } = contextMenu;
    const insertIndex = direction === 'left' ? colIndex : colIndex + 1;
    
    const newColId = `custom_${Date.now()}`;
    const newCol: ColumnDef = {
      id: newColId,
      group,
      label: 'New Column',
      align: 'center',
      renderCell: (player, rowIndex, cellData, onCellChange) => (
        <input 
          type="text" 
          value={cellData} 
          onChange={(e) => onCellChange(e.target.value)}
          placeholder="Empty"
          className="w-full bg-transparent border-none text-center focus:outline-none focus:ring-1 focus:ring-[#1a1c1d] rounded px-1 py-0.5"
        />
      )
    };

    const newColumns = [...columns];
    newColumns.splice(insertIndex, 0, newCol);
    setColumns(newColumns);
  };

  const deleteColumn = () => {
    if (!contextMenu) return;
    const { colIndex } = contextMenu;
    const colToDelete = columns[colIndex];
    setDeletedColumnCache({ index: colIndex, col: colToDelete });
    const newColumns = columns.filter((_, i) => i !== colIndex);
    setColumns(newColumns);
    
    // Auto-hide undo button after 5 seconds
    setTimeout(() => {
      setDeletedColumnCache(prev => {
        if (prev?.col.id === colToDelete.id) return null;
        return prev;
      });
    }, 5000);
  };

  const undoDelete = () => {
    if (!deletedColumnCache) return;
    const { index, col } = deletedColumnCache;
    const newColumns = [...columns];
    newColumns.splice(index, 0, col);
    setColumns(newColumns);
    setDeletedColumnCache(null);
  };

  const clearColumn = () => {
    if (!contextMenu) return;
    const { colIndex } = contextMenu;
    const colId = columns[colIndex].id;
    
    // Clear custom data for this column
    setCustomData(prev => {
      const newData = { ...prev };
      for (const playerId in newData) {
        if (newData[playerId][colId]) {
          newData[playerId] = { ...newData[playerId] };
          delete newData[playerId][colId];
        }
      }
      return newData;
    });
  };

  const startEditColumn = () => {
    if (!contextMenu) return;
    const { colIndex } = contextMenu;
    const currentLabel = columns[colIndex].label as string;
    setEditingColumn({ index: colIndex, label: currentLabel });
    setContextMenu(null);
  };

  const finishEditColumn = (newLabel: string) => {
    if (editingColumn) {
      const newColumns = [...columns];
      newColumns[editingColumn.index].label = newLabel || 'Untitled';
      setColumns(newColumns);
      setEditingColumn(null);
    }
  };

  const renderContextMenu = () => {
    return (
      <>
        {contextMenu && (
          <div 
            className="fixed z-50 bg-card border border-border shadow-lg rounded-xl overflow-hidden min-w-[200px] text-sm py-1"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="w-full text-left px-4 py-2 hover:bg-accent flex items-center text-[#1a1c1d] font-semibold transition-colors" onClick={() => insertColumn('left')}>
              <Plus size={14} className="mr-2" /> Insert column left
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-accent flex items-center text-[#1a1c1d] font-semibold transition-colors" onClick={() => insertColumn('right')}>
              <Plus size={14} className="mr-2" /> Insert column right
            </button>
            <div className="h-px bg-accent my-1"></div>
            <button className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center text-rose-500 font-semibold transition-colors" onClick={deleteColumn}>
              <Trash2 size={14} className="mr-2" /> Delete column
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-accent flex items-center text-primary font-semibold transition-colors" onClick={clearColumn}>
              <X size={14} className="mr-2" /> Clear column
            </button>
            <div className="h-px bg-accent my-1"></div>
            <button className="w-full text-left px-4 py-2 hover:bg-[#CCFF00]/10 flex items-center text-[#1a1c1d] font-semibold transition-colors" onClick={startEditColumn}>
              <FileText size={14} className="mr-2" /> Edit/Rename
            </button>
          </div>
        )}
        
        {deletedColumnCache && (
          <div className="fixed bottom-6 right-6 z-50 bg-card border border-border shadow-lg rounded-xl p-4 flex items-center space-x-4 animate-in slide-in-from-bottom-5">
            <div>
              <p className="text-sm font-semibold text-[#1a1c1d]">Column deleted</p>
              <p className="text-xs text-[#8a8c8d]">You can restore it for a short time</p>
            </div>
            <button 
              onClick={undoDelete}
              className="px-3 py-2 bg-[#CCFF00] text-[#1a1c1d] rounded-lg text-sm font-bold shadow hover:bg-[#b3e600] transition-colors flex items-center"
            >
              <Undo size={14} className="mr-1" /> Undo
            </button>
          </div>
        )}
      </>
    );
  };

  return { columns, customData, handleCellChange, handleContextMenu, renderContextMenu, editingColumn, finishEditColumn };
};