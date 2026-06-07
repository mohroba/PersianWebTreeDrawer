import React, { useState, useEffect } from 'react';
import { useTree } from '../context/TreeContext';
import { TreeNode } from '../types';
import { ChevronRight, ChevronDown, Plus, Trash2, ArrowUp, ArrowDown, ArrowRight, ArrowLeft } from 'lucide-react';

export interface OutlineViewProps {
  isDark?: boolean;
}

export const OutlineView: React.FC<OutlineViewProps> = ({ isDark = false }) => {
  const { document: doc, addNode, addChildNode, deleteNodeById, updateNode } = useTree();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const activeDoc = doc || { nodes: [], edges: [], page: {} };

  // We need to build a hierarchy from the edges.
  // Assuming a node is a root if it has no incoming edges.
  // Assuming edge direction is from parent to child.

  useEffect(() => {
    // initialize expanded set with all nodes
    if (expanded.size === 0 && activeDoc.nodes.length > 0) {
      setExpanded(new Set(activeDoc.nodes.map(n => n.id)));
    }
  }, [activeDoc.nodes]);

  const getChildren = (parentId: string) => {
    const childIds = activeDoc.edges.filter(e => e.from === parentId).map(e => e.to);
    return activeDoc.nodes.filter(n => childIds.includes(n.id));
  };

  const roots = activeDoc.nodes.filter(n => !activeDoc.edges.some(e => e.to === n.id));

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddChild = (parentId: string, parentX: number, parentY: number) => {
    addChildNode(parentId, parentX, parentY + 80, 'New Node');
    setExpanded(prev => new Set(prev).add(parentId));
  };

  const handleAddSibling = (nodeId: string) => {
    const parentEdge = activeDoc.edges.find(e => e.to === nodeId);
    if (!parentEdge) {
      const n = activeDoc.nodes.find(n => n.id === nodeId);
      addNode((n?.x || 100) + 160, n?.y || 100);
    } else {
      const parentId = parentEdge.from;
      const parent = activeDoc.nodes.find(n => n.id === parentId);
      const sibling = activeDoc.nodes.find(n => n.id === nodeId);
      addChildNode(parentId, parent?.x || 100, sibling?.y || 100, 'New Node');
    }
  };

  const handleDelete = (id: string) => {
    deleteNodeById(id);
  };

  const handleUpdateText = (id: string, text: string) => {
    updateNode(id, { label: text });
  };

  const renderNode = (node: TreeNode, depth: number) => {
    const children = getChildren(node.id);
    const hasChildren = children.length > 0;
    const isExpanded = expanded.has(node.id);

    return (
      <div key={node.id} className="flex flex-col">
        <div className={`flex items-center gap-1 py-1 group rounded pe-2 transition-colors ${
          isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
        }`}>
          {/* Indentation */}
          <div style={{ width: `${depth * 20}px` }} className="shrink-0" />
          
          {/* Expand Toggle */}
          <button 
            onClick={() => toggleExpand(node.id)}
            className={`p-0.5 rounded transition ${
              hasChildren ? 'visible' : 'invisible'
            } ${
              isDark ? 'hover:bg-white/10 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          
          <input
            value={node.label}
            onChange={(e) => handleUpdateText(node.id, e.target.value)}
            className={`flex-1 bg-transparent border border-transparent rounded px-1 text-sm py-0.5 outline-none min-w-[100px] transition-colors focus:border-indigo-500 ${
              isDark 
                ? 'hover:border-white/10 focus:bg-black/40 text-slate-100 placeholder-slate-500' 
                : 'hover:border-slate-300 focus:bg-white text-slate-800 placeholder-slate-400'
            }`}
          />

          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
            <button 
              onClick={() => handleAddChild(node.id, node.x, node.y)} 
              className={`p-1 rounded transition-colors ${
                isDark ? 'hover:bg-white/10 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
              }`} 
              title="Add Child"
            >
              <Plus size={12} />
            </button>
            <button 
              onClick={() => handleAddSibling(node.id)} 
              className={`p-1 rounded transition-colors ${
                isDark ? 'hover:bg-white/10 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
              }`} 
              title="Add Sibling"
            >
              <ArrowRight size={12} />
            </button>
            <button 
              onClick={() => handleDelete(node.id)} 
              className={`p-1 rounded transition-colors ${
                isDark ? 'hover:bg-red-950/40 text-red-400 hover:bg-red-900/60' : 'hover:bg-red-100 text-red-600 hover:bg-red-200'
              }`} 
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {isExpanded && children.map(child => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className={`p-4 h-full overflow-y-auto transition-colors duration-300 bg-transparent`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          {doc?.page?.lang === 'fa' ? 'نمای درختی (ساختار درختی)' : 'Outline View'}
        </h3>
        <button 
          onClick={() => addNode(100, 100, undefined, 'New Root')}
          className={`text-xs px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors cursor-pointer ${
            isDark 
              ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' 
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
        >
          <Plus size={12} /> {doc?.page?.lang === 'fa' ? 'افزودن گره ریشه اصلی' : 'Add Root'}
        </button>
      </div>

      <div className="flex flex-col">
        {roots.map(root => renderNode(root, 0))}
      </div>
    </div>
  );
};
