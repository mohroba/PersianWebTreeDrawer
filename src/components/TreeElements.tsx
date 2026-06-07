import React, { useState } from 'react';
import { TreeNode, TreeEdge, EdgeType, NodeStyle } from '../types';
import { useTree } from '../context/TreeContext';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

interface NodeElementProps {
  node: TreeNode;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onResizeMouseDown: (e: React.MouseEvent, id: string) => void;
  isConnectingActive: boolean;
  onTouchStart?: (e: React.TouchEvent, id: string) => void;
  onResizeTouchStart?: (e: React.TouchEvent, id: string) => void;
}

export const NodeElement: React.FC<NodeElementProps> = ({
  node,
  isSelected,
  onMouseDown,
  onResizeMouseDown,
  isConnectingActive,
  onTouchStart,
  onResizeTouchStart
}) => {
  const { 
    document,
    connectingFromId, 
    startConnection, 
    completeConnection, 
    updateNode,
    deleteSelected
  } = useTree();
  const { nodes } = document;
  
  const [isHovered, setIsHovered] = useState(false);

  // Compute footnote index
  const hasFootnote = !!node.footnote && node.footnote.trim().length > 0;
  let footnoteIndex = -1;
  if (hasFootnote) {
    const nodesWithFootnotes = nodes.filter(n => n.footnote && n.footnote.trim().length > 0)
      .sort((a, b) => {
        // Sort geographically top-to-bottom, left-to-right
        if (Math.abs(a.y - b.y) > 20) return a.y - b.y;
        return a.x - b.x;
      });
    footnoteIndex = nodesWithFootnotes.findIndex(n => n.id === node.id) + 1;
  }

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (connectingFromId) {
      if (connectingFromId !== node.id) {
        completeConnection(node.id);
      }
    }
  };

  const pageDefaults = document.page;
  const nodeStyle = node.style || pageDefaults.defaultNodeStyle || 'rectangle';
  const nodeBorderColor = node.borderColor || pageDefaults.defaultNodeColor || '#000000';
  const nodeBgColor = node.bgColor || pageDefaults.defaultNodeBgColor || '#ffffff';
  const nodeTextColor = node.fontColor || pageDefaults.defaultNodeTextColor || '#000000';
  const fontFam = node.fontFamily || pageDefaults.defaultFontFamily || 'inherit';

  const drawNodeShape = () => {
    const strokeWidth = isSelected ? 2 : 1.5;
    const strokeColor = isSelected ? '#3b82f6' : nodeBorderColor;

    switch (nodeStyle) {
      case 'pill':
        return (
          <rect
            width={node.width}
            height={node.height}
            rx={node.height / 2}
            ry={node.height / 2}
            fill={nodeBgColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            className="transition-colors"
          />
        );
      case 'card':
        return (
          <g>
            <rect
              width={node.width}
              height={node.height}
              rx={6}
              ry={6}
              fill={nodeBgColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Double inline decorative border for editorial lookup card */}
            <rect
              x={3}
              y={3}
              width={node.width - 6}
              height={node.height - 6}
              rx={4}
              ry={4}
              fill="none"
              stroke={strokeColor}
              strokeWidth={0.5}
              strokeDasharray="2 2"
            />
          </g>
        );
      case 'text-only':
        return (
          <rect
            width={node.width}
            height={node.height}
            fill={nodeBgColor}
            stroke="none"
          />
        );
      case 'rectangle':
      default:
        return (
          <rect
            width={node.width}
            height={node.height}
            fill={nodeBgColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
    }
  };

  // Text anchor and positioning
  let textAnchor = 'middle';
  let textX = node.width / 2;
  if (node.textAlign === 'left') {
    textAnchor = 'start';
    textX = 12;
  } else if (node.textAlign === 'right') {
    textAnchor = 'end';
    textX = node.width - 12;
  }

  const hasSubLabel = !!node.subLabel;
  const mainLabelY = hasSubLabel ? (node.height / 2 - 6) : (node.height / 2);
  const subLabelY = node.height / 2 + 12;

  const color = nodeTextColor;
  const weight = node.fontBold ? 'bold' : '500';
  const style = node.fontItalic ? 'italic' : 'normal';
  const underline = node.fontUnderline ? 'underline' : 'none';

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onTouchStart={(e) => onTouchStart && onTouchStart(e, node.id)}
      onClick={handleNodeClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-move group"
    >
      {/* Target area padding for easier mouse interaction */}
      <rect
        x={-24}
        y={-12}
        width={node.width + 48}
        height={node.height + 24}
        fill="transparent"
        className="no-print pointer-events-auto"
      />

      {/* Main Node Shape */}
      {drawNodeShape()}

      {/* Node Labels */}
      <text
        x={textX}
        y={mainLabelY}
        dy={hasSubLabel ? '0.35em' : '0.3em'}
        textAnchor={textAnchor}
        fontSize={node.fontSize}
        fontWeight={weight}
        fontStyle={style}
        textDecoration={underline}
        fill={color}
        style={{ fontFamily: fontFam }}
        className="select-none pointer-events-none"
      >
        {node.label || 'Empty Node'}
        {hasFootnote && (
          <tspan dy="-0.5em" fontSize={Math.max(8, node.fontSize - 4)} fill="#4f46e5" fontWeight="bold">
            {' [' + footnoteIndex + ']'}
          </tspan>
        )}
      </text>

      {hasSubLabel && (
        <text
          x={textX}
          y={subLabelY}
          dy="0.3em"
          textAnchor={textAnchor}
          fontSize={node.fontSize - 2}
          fontWeight={node.fontBold ? 'bold' : 'normal'}
          fontStyle={node.fontItalic ? 'italic' : 'normal'}
          textDecoration={node.fontUnderline ? 'underline' : 'none'}
          fill={color === 'black' ? '#555555' : color}
          style={{ fontFamily: fontFam }}
          className="select-none pointer-events-none italic opacity-90"
        >
          {node.subLabel}
        </text>
      )}

      {/* Editor-only Multi-selection Outline indicator */}
      {isSelected && (
        <rect
          x={-4}
          y={-4}
          width={node.width + 8}
          height={node.height + 8}
          rx={node.style === 'pill' ? (node.height + 8) / 2 : 4}
          fill="none"
          stroke="#4f46e5"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          className="no-print pointer-events-none opacity-80"
        />
      )}

      {/* Connecting highlight target */}
      {isConnectingActive && (
        <rect
          x={-6}
          y={-6}
          width={node.width + 12}
          height={node.height + 12}
          rx={node.style === 'pill' ? (node.height + 12) / 2 : 4}
          fill="none"
          stroke="#10b981"
          strokeWidth={2}
          strokeDasharray="5 2"
          className="no-print animate-pulse pointer-events-none"
        />
      )}

      {/* Editor Controls: Manual connection connector & delete shortcut handle, visible on hover or selection */}
      {!isConnectingActive && (isHovered || isSelected) && (
        <g className="no-print">
          {/* Connector handle on Right side - the "plus" icon */}
          <g
            transform={`translate(${node.width + 12}, ${node.height / 2})`}
            className="cursor-crosshair pointer-events-auto transition-transform hover:scale-110"
            onMouseDown={(e) => {
              e.stopPropagation();
              startConnection(node.id);
            }}
            onClick={(e) => {
              e.stopPropagation();
              startConnection(node.id);
            }}
            title="Drag line from here to connect"
          >
            {/* Background invisible circle for larger hit area */}
            <circle r={18} fill="transparent" />
            <circle r={9} fill="#4f46e5" stroke="white" strokeWidth={1} className="shadow-sm" />
            <path d="M-4 0 H4 M0 -4 V4" stroke="white" strokeWidth={2} />
          </g>

          {/* Connected target port on Left side */}
          <g
            transform={`translate(${-12}, ${node.height / 2})`}
            className="cursor-crosshair pointer-events-auto"
            onMouseDown={(e) => {
              e.stopPropagation();
              if (connectingFromId) {
                completeConnection(node.id);
              } else {
                startConnection(node.id);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (connectingFromId) {
                completeConnection(node.id);
              } else {
                startConnection(node.id);
              }
            }}
          >
            {/* Background invisible circle for larger hit area */}
            <circle r={18} fill="transparent" />
            <circle r={6} fill="#10b981" stroke="white" strokeWidth={1} />
          </g>
        </g>
      )}

      {/* Resize Handle - bottom right corner */}
      {isSelected && (
        <g
          transform={`translate(${node.width}, ${node.height})`}
          onMouseDown={(e) => onResizeMouseDown(e, node.id)}
          onTouchStart={(e) => onResizeTouchStart && onResizeTouchStart(e, node.id)}
          className="no-print cursor-se-resize pointer-events-auto"
        >
          {/* Invisible padding anchor */}
          <circle r={8} fill="transparent" />
          {/* Clean lines for resize handle */}
          <line x1={-8} y1={0} x2={0} y2={-8} stroke="#4f46e5" strokeWidth={1.5} />
          <line x1={-4} y1={0} x2={0} y2={-4} stroke="#4f46e5" strokeWidth={1.5} />
        </g>
      )}
    </g>
  );
};

interface EdgeElementProps {
  edge: TreeEdge;
  from: TreeNode;
  to: TreeNode;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const EdgeElement: React.FC<EdgeElementProps> = ({
  edge,
  from,
  to,
  isSelected,
  onClick
}) => {
  const { deleteSelected } = useTree();
  // Let's compute attachment centers.
  // We can attach to bottom center of 'from' and top center of 'to' 
  // or dynamically pick the closest sides! Let's do bottom-to-top attachment which makes perfect sense for trees.
  const startX = from.x + from.width / 2;
  const startY = from.y + from.height;
  const endX = to.x + to.width / 2;
  const endY = to.y;

  let pathString = '';
  if (edge.type === 'straight') {
    pathString = `M ${startX} ${startY} L ${endX} ${endY}`;
  } else {
    // Elbow line
    // Find half-way down the vertical gap
    const midY = startY + (endY - startY) * 0.5;
    pathString = `M ${startX} ${startY} V ${midY} H ${endX} V ${endY}`;
  }

  return (
    <g onClick={onClick} className="cursor-pointer group">
      {/* Actual drawn relation line - pointer-events-none so it doesn't cause hit-test flickering */}
      <path
        d={pathString}
        fill="none"
        stroke={isSelected ? '#3b82f6' : 'black'}
        strokeWidth={isSelected ? edge.strokeWidth + 1 : edge.strokeWidth}
        className="transition-all pointer-events-none"
      />

      {/* Relation marker overlay in editing mode on hover */}
      <path
        d={pathString}
        fill="none"
        stroke="#4f46e5"
        strokeWidth={edge.strokeWidth + 3}
        className="no-print opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity"
      />

      {/* Thicker transparent interactive path area to capture hover and clicks consistently (placed on top for robust capture) */}
      <path
        d={pathString}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        className="no-print pointer-events-auto"
      />

      {/* Delete connection prompt indicator on selection */}
      {isSelected && (
        <foreignObject
          x={(startX + endX) / 2 - 12}
          y={(startY + endY) / 2 - 12}
          width={24}
          height={24}
          className="no-print"
        >
          <div 
            onClick={(e) => {
              e.stopPropagation();
              deleteSelected();
            }}
            className="bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg w-5 h-5 cursor-pointer hover:bg-red-600 transition-colors"
          >
            <Trash2 size={11} />
          </div>
        </foreignObject>
      )}
    </g>
  );
};
