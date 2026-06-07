import React, { useState, useEffect } from 'react';
import { useTree } from '../context/TreeContext';
import { TreeNode } from '../types';
import { ChevronRight, ChevronDown, Plus, Trash2, ArrowUp, ArrowDown, ArrowRight, ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const OutlineView: React.FC = () => {
  const { document: doc, addNode, deleteSelected, selectNode, updateNode, addEdge } = useTree();
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
    const newId = uuidv4();
    addNode(parentX, parentY + 80, newId, 'New Task');
    addEdge(parentId, newId);
    setExpanded(prev => new Set(prev).add(parentId)); // expand parent
  };

  const handleAddSibling = (nodeId: string) => {
    // Find parent
    const parentEdge = activeDoc.edges.find(e => e.to === nodeId);
    if (!parentEdge) {
      // It's a root, add another root
      const newId = uuidv4();
      const n = activeDoc.nodes.find(n => n.id === nodeId);
      addNode((n?.x || 100) + 160, (n?.y || 100), newId, 'New Section');
    } else {
      const parentId = parentEdge.from;
      const parent = activeDoc.nodes.find(n => n.id === parentId);
      const child = activeDoc.nodes.find(n => n.id === nodeId);
      handleAddChild(parentId, parent?.x || 100, (child?.y || 100));
    }
  };

  const handleDelete = (id: string) => {
    // Easy way is to select and delete
    selectNode(id, false);
    deleteSelected();
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
        <div className="flex items-center gap-1 py-1 hover:bg-slate-100 group rounded pe-2">
          {/* Indentation */}
          <div style={{ width: `${depth * 20}px` }} className="shrink-0" />
          
          {/* Expand Toggle */}
          <button 
            onClick={() => toggleExpand(node.id)}
            className={`p-0.5 rounded hover:bg-slate-200 transition ${hasChildren ? 'visible' : 'invisible'}`}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          
          <input
            value={node.label}
            onChange={(e) => handleUpdateText(node.id, e.target.value)}
            className="flex-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded px-1 text-sm py-0.5 outline-none min-w-[100px]"
          />

          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
            <button onClick={() => handleAddChild(node.id, node.x, node.y)} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Add Child">
              <Plus size={12} />
            </button>
            <button onClick={() => handleAddSibling(node.id)} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Add Sibling">
              <ArrowRight size={12} />
            </button>
            <button onClick={() => handleDelete(node.id)} className="p-1 hover:bg-red-100 rounded text-red-600" title="Delete">
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {isExpanded && children.map(child => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="p-4 bg-white/50 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-slate-800">Outline View</h3>
        <button 
          onClick={() => {
            const newId = uuidv4();
            addNode(100, 100, newId, 'New Root');
          }}
          className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 flex items-center gap-1"
        >
          <Plus size={12} /> Add Root
        </button>
      </div>

      <div className="flex flex-col">
        {roots.map(root => renderNode(root, 0))}
      </div>
    </div>
  );
};
