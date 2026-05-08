import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TreeProvider, useTree } from './context/TreeContext';
import { getPageSizePx, formatDimensions } from './utils/pageUtils';
import { NodeElement, EdgeElement } from './components/TreeElements';
import { exportToSVG, exportToPNG, downloadFile } from './utils/exportUtils';
import { TreeNode, TreeEdge, EdgeType, NodeStyle, PageSize, Orientation, ImageFit } from './types';
import {
  Undo,
  Redo,
  Plus,
  Trash2,
  Download,
  Upload,
  Printer,
  Grid,
  Type,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  FolderOpen,
  Maximize2,
  Compass,
  FileText,
  MousePointer,
  HelpCircle,
  Sparkles,
  Link,
  Layers,
  MousePointerClick,
  Menu,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

const TRANSLATIONS = {
  fa: {
    appName: 'طراحی درخت',
    appSub: 'نیمه شجره‌نامه و نمودارهای چاپی',
    familyTree: 'شجره‌نامه خانوادگی',
    orgChart: 'نمودار سازمانی',
    blankTree: 'بوم تازه خالی',
    zoom: 'بزرگنمایی',
    undo: 'واگرد پیشین (Ctrl+Z)',
    redo: 'ازسرگیری بعدی (Ctrl+Y)',
    svg: 'خروجی تصاویری SVG',
    png: 'خروجی تصاویری PNG',
    json: 'برون‌بری فایل JSON',
    loadJson: 'بارگذاری الگو از فایل',
    print: 'چاپ برگه‌ / PDF',
    help: 'راهنمای کاربری',
    canvasTools: 'ابزار طراحی بوم گره‌ها',
    addNode: 'افزودن گره کارت جدید',
    deleteSelection: 'حذف گره/خطوط انتخابی',
    paperSize: 'ابعاد استاندارد کاغذ به میلی‌متر',
    orientation: 'جهت‌گیری چاپ برگه',
    portrait: 'عمودی',
    landscape: 'افقی',
    margins: 'فاصله حاشیه صفحه',
    gridAlign: 'تراز‌بندی با شبکه توری شطرنجی',
    snapGrid: 'چسبیدن گره‌ها به بخش‌های توری',
    gridSize: 'ابعاد خانه‌های توری شطرنجی',
    connecting: 'ترسیم اتصال: روی کارت مقصد کلیک کنید تا ارتباط برقرار شود',
    cancel: 'انصراف و لغو ارتباط',
    properties: 'تنظیمات و جزئیات گره انتخابی',
    nodeText: 'متن عنوان گره اصلی',
    nodeSubText: 'متن جزئیات / توضیحات تکمیلی گره',
    fontSize: 'سایز متون گره',
    alignMode: 'تراز‌بندی چپ و راست نوشته',
    cardStyle: 'ظاهر و سبک حاشیه کارت',
    linePathType: 'مدل هندسی خطوط رابط',
    straight: 'مستقیم ساده',
    elbow: 'شکسته‌ پله‌ای (قائم)',
    lineWidth: 'ضخامت مرزهای خط رابط',
    sheetHeader: 'تیتر بالای صفحه (هدر)',
    headerText: 'متن عنوان هدر چاپی',
    uploadHeader: 'تصویر هدر',
    sheetFooter: 'پاورقی برگه (فوتر)',
    footerText: 'متن پاورقی انتهای صفحه',
    uploadFooter: 'تصویر فوتر',
    removeImage: 'حذف تصویر',
    styleRectangle: 'مستطیل دور خط‌دار',
    stylePill: 'بیضی کپسولی',
    styleDouble: 'کادر با خط مرز دوبل',
    styleTextOnly: 'بدون کادر (فقط متن)',
    toggleSidebar: 'ابزارهای بوم',
    toggleInspector: 'تنظیمات کارت',
    howToTitle: 'چطور نمودار درختی خود را طراحی کنید؟',
    howToAdd: 'افزودن گره: از دکمه "افزودن گره کارت جدید" استفاده کنید تا گره جدید ایجاد شود.',
    howToDrag: 'جابجایی گره‌ها: کارت‌ها را با لمس یا درگ ماوس روی صفحه جابجا کنید. شبکه شطرنجی موقعیت را تنظیم می‌کند.',
    howToConnect: 'اتصال دستی گره‌ها: نشانگر ماوس را روی کارت ببرید، روی پلاس سبز سمت راست کلیک کرده و بعد روی کارت مقصد کلیک کنید تا متصل شوند.',
    howToMulti: 'انتخاب گروهی: برای جابجایی هماهنگ گره‌ها، دکمه Shift را نگه‌دارید و گره‌ها را انتخاب کنید.',
    howToShortcut: 'میانبرها: دکمه Delete برای حذف، Ctrl+Z برای بازگشت به عقب، و Ctrl+P برای ارسال فوری به چاپگر.',
    startDesignButton: 'شروع فرآیند طراحی',
    emptyNodePlaceholder: 'گره خالی',
    emptySubLabel: 'توضیحات تکمیلی کارتی'
  },
  en: {
    appName: 'TreeSketch Pro',
    appSub: 'Professional Printable Charts',
    familyTree: 'Family Tree',
    orgChart: 'Org Chart',
    blankTree: 'Clear Base',
    zoom: 'Zoom',
    undo: 'Undo (Ctrl+Z)',
    redo: 'Redo (Ctrl+Y)',
    svg: 'SVG',
    png: 'PNG',
    json: 'JSON',
    loadJson: 'Load Custom schema.json',
    print: 'Print PDF',
    help: 'Help',
    canvasTools: 'Canvas Tools',
    addNode: 'Add Node Card',
    deleteSelection: 'Delete Selection',
    paperSize: 'Paper Size',
    orientation: 'Orientation',
    portrait: 'Portrait',
    landscape: 'Landscape',
    margins: 'Margins',
    gridAlign: 'Grid Alignment',
    snapGrid: 'Snap to Grid',
    gridSize: 'Grid Cell Size',
    connecting: 'Connecting Relation: Click another Node to finalize link',
    cancel: 'Cancel',
    properties: 'Card properties',
    nodeText: 'Primary Text Label',
    nodeSubText: 'Genealogy / Details Subtitle',
    fontSize: 'Font Size',
    alignMode: 'Align Mode',
    cardStyle: 'Node Card Style',
    linePathType: 'Line Path Type',
    straight: 'Straight',
    elbow: 'Elbow Line',
    lineWidth: 'Line Stroke Width',
    sheetHeader: 'Sheet Header',
    headerText: 'Standard Text Title',
    uploadHeader: 'Upload Custom Header Image',
    sheetFooter: 'Sheet Footer',
    footerText: 'Standard Text Note',
    uploadFooter: 'Upload Custom Footer Image',
    removeImage: 'Remove Image',
    styleRectangle: 'Minimal Rectangle',
    stylePill: 'Pill-shaped Box',
    styleDouble: 'Double Border Card',
    styleTextOnly: 'Clean Text-Only',
    toggleSidebar: 'Sidebar',
    toggleInspector: 'Inspector',
    howToTitle: 'How to build your chart',
    howToAdd: 'Add Nodes: Click "Add Node Card" to deploy a rectangle on your sheet.',
    howToDrag: 'Reposition: Simply drag node bodies to any location on the canvas.',
    howToConnect: 'Manual Links: Hover over a card, click the green plus handle on the right and click another card!',
    howToMulti: 'Multi-select: Hold Shift while clicking card bodies to move groups synchronously.',
    howToShortcut: 'Shortcuts: Press Delete to remove selected items, Ctrl+Z to undo, and Ctrl+P to print.',
    startDesignButton: 'Start Designing',
    emptyNodePlaceholder: 'Empty Node',
    emptySubLabel: 'Sub description'
  }
};

function TreeDesignerApp() {
  const {
    document: doc,
    selectedNodeIds,
    selectedEdgeIds,
    connectingFromId,
    gridSnap,
    gridSize,
    zoom,
    pan,
    canUndo,
    canRedo,
    selectNode,
    selectEdge,
    clearSelection,
    addNode,
    updateNode,
    deleteSelected,
    cancelConnection,
    updateEdgeType,
    updateEdgeWidth,
    updatePageConfig,
    undo,
    redo,
    loadTemplate,
    loadCustomJSON,
    exportJSON,
    resetAll,
    setZoom,
    setPan,
    setGridSnap,
    setGridSize,
    lang,
    setLang,
    projects,
    currentProjectId,
    createProject,
    deleteProject,
    renameProject,
    setCurrentProjectId
  } = useTree();

  const canvasRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive mobile states
  const [showSidebar, setShowSidebar] = useState(() => window.innerWidth > 768);
  const [showInspector, setShowInspector] = useState(() => window.innerWidth > 1024);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [newProjName, setNewProjName] = useState('');

  const t = TRANSLATIONS[lang];

  // Drag and edit states
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [resizingNodeId, setResizingNodeId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodeOffset, setNodeOffset] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Right pane editing states
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Get physical pixel dimensions for the current page setting (96 DPI standard)
  const pageSize = getPageSizePx(doc.page.size, doc.page.orientation);

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering hotkeys when typing in form inputs
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'SELECT') {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, undo, redo]);

  // Translate client mouse coordinates to scaled SVG coordinates
  const getSVGCoords = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const svg = canvasRef.current;
    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    };
  }, [zoom]);

  const getSVGTouchCoords = useCallback((touch: React.Touch) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const svg = canvasRef.current;
    const rect = svg.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left) / zoom,
      y: (touch.clientY - rect.top) / zoom
    };
  }, [zoom]);

  // Touch handlers for mobile
  const handleNodeTouchStart = (e: React.TouchEvent, id: string) => {
    e.stopPropagation();
    selectNode(id, e.shiftKey);
    setEditingNodeId(id);

    const touch = e.touches[0];
    const coords = getSVGTouchCoords(touch);
    const node = doc.nodes.find((n) => n.id === id);
    if (node) {
      setDraggingNodeId(id);
      setNodeOffset({
        x: coords.x - node.x,
        y: coords.y - node.y
      });
    }
  };

  const handleResizeTouchStart = (e: React.TouchEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();

    selectNode(id);
    const node = doc.nodes.find((n) => n.id === id);
    if (node) {
      setResizingNodeId(id);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setInitialSize({ width: node.width, height: node.height });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggingNodeId) {
      const touch = e.touches[0];
      const coords = getSVGTouchCoords(touch);
      let targetX = coords.x - nodeOffset.x;
      let targetY = coords.y - nodeOffset.y;

      if (selectedNodeIds.length > 1) {
        const leadNode = doc.nodes.find(n => n.id === draggingNodeId);
        if (leadNode) {
          const deltaX = targetX - leadNode.x;
          const deltaY = targetY - leadNode.y;
          selectedNodeIds.forEach(id => {
            const node = doc.nodes.find(n => n.id === id);
            if (node) {
              const currentX = node.x + deltaX;
              const currentY = node.y + deltaY;
              updateNode(id, {
                x: gridSnap ? Math.round(currentX / gridSize) * gridSize : currentX,
                y: gridSnap ? Math.round(currentY / gridSize) * gridSize : currentY
              });
            }
          });
          return;
        }
      }

      if (gridSnap) {
        targetX = Math.round(targetX / gridSize) * gridSize;
        targetY = Math.round(targetY / gridSize) * gridSize;
      }

      updateNode(draggingNodeId, { x: targetX, y: targetY });
    } else if (resizingNodeId) {
      const touch = e.touches[0];
      const deltaX = (touch.clientX - dragStart.x) / zoom;
      const deltaY = (touch.clientY - dragStart.y) / zoom;

      const newWidth = Math.max(50, initialSize.width + deltaX);
      const newHeight = Math.max(25, initialSize.height + deltaY);

      updateNode(resizingNodeId, {
        width: gridSnap ? Math.round(newWidth / gridSize) * gridSize : newWidth,
        height: gridSnap ? Math.round(newHeight / gridSize) * gridSize : newHeight
      });
    }
  };

  // Handle Dragging / Resizing / Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    // Left click only
    if (e.button !== 0) return;

    const target = e.target as SVGElement;
    // Check if clicked directly on canvas background to pan or clear selection
    if (target.id === 'canvas-background' || target === canvasRef.current) {
      if (e.shiftKey) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      } else {
        clearSelection();
        setEditingNodeId(null);
      }
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    
    selectNode(id, e.shiftKey);
    setEditingNodeId(id);

    const coords = getSVGCoords(e);
    const node = doc.nodes.find((n) => n.id === id);
    if (node) {
      setDraggingNodeId(id);
      setNodeOffset({
        x: coords.x - node.x,
        y: coords.y - node.y
      });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.button !== 0) return;

    selectNode(id);
    const node = doc.nodes.find((n) => n.id === id);
    if (node) {
      setResizingNodeId(id);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialSize({ width: node.width, height: node.height });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      const coords = getSVGCoords(e);
      let targetX = coords.x - nodeOffset.x;
      let targetY = coords.y - nodeOffset.y;

      // Group drag capability if multiple nodes are selected
      if (selectedNodeIds.length > 1) {
        const leadNode = doc.nodes.find(n => n.id === draggingNodeId);
        if (leadNode) {
          const deltaX = targetX - leadNode.x;
          const deltaY = targetY - leadNode.y;
          selectedNodeIds.forEach(id => {
            const node = doc.nodes.find(n => n.id === id);
            if (node) {
              const currentX = node.x + deltaX;
              const currentY = node.y + deltaY;
              updateNode(id, {
                x: gridSnap ? Math.round(currentX / gridSize) * gridSize : currentX,
                y: gridSnap ? Math.round(currentY / gridSize) * gridSize : currentY
              });
            }
          });
          return;
        }
      }

      if (gridSnap) {
        targetX = Math.round(targetX / gridSize) * gridSize;
        targetY = Math.round(targetY / gridSize) * gridSize;
      }

      updateNode(draggingNodeId, { x: targetX, y: targetY });
    } else if (resizingNodeId) {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;

      const newWidth = Math.max(50, initialSize.width + deltaX);
      const newHeight = Math.max(25, initialSize.height + deltaY);

      updateNode(resizingNodeId, {
        width: gridSnap ? Math.round(newWidth / gridSize) * gridSize : newWidth,
        height: gridSnap ? Math.round(newHeight / gridSize) * gridSize : newHeight
      });
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setResizingNodeId(null);
    setIsPanning(false);
  };

  // Node text updates in Inspector Form
  const selectedNode = doc.nodes.find((n) => n.id === selectedNodeIds[0]);
  const selectedEdge = doc.edges.find((e) => e.id === selectedEdgeIds[0]);

  // File loading triggers
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleJSONUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = loadCustomJSON(content);
      if (success) {
        alert('Tree diagram parsed successfully!');
      } else {
        alert('Invalid JSON structure. Please verify schema.');
      }
    };
    reader.readAsText(file);
  };

  // Converts header/footer images to standard editable Base64 strings
  const handleImageUpload = (type: 'header' | 'footer', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updatePageConfig({
        [type === 'header' ? 'headerImage' : 'footerImage']: dataUrl
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div 
      dir={lang === 'fa' ? 'rtl' : 'ltr'} 
      className="min-h-screen bg-slate-950 flex flex-col font-sans select-none overflow-hidden text-slate-200"
    >
      
      {/* 1. GLASSMORPHISM TOP TOOLBAR (no-print) */}
      <header className="no-print h-16 shrink-0 bg-slate-900/40 backdrop-blur-md border-b border-white/5 flex items-center px-4 md:px-6 justify-between z-40 relative gap-2">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Collapse Toggles */}
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden p-1.5 hover:bg-white/10 rounded-lg text-indigo-400 border border-white/5 bg-slate-900/40"
            title={t.toggleSidebar}
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-xs md:text-sm tracking-widest text-indigo-400 block uppercase leading-none">{t.appName}</span>
              <span className="text-[10px] font-light tracking-wider opacity-60 hidden md:block">{t.appSub}</span>
            </div>
          </div>

          {/* Project Switcher */}
          <div className="relative z-50" id="project-switcher">
            <button
              onClick={() => setShowProjectsDropdown(!showProjectsDropdown)}
              className="flex items-center gap-1.5 bg-slate-950/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium max-w-[120px] truncate">
                {projects.find((p) => p.id === currentProjectId)?.name || 'Default Project'}
              </span>
              <ChevronRight className={`w-3 h-3 text-slate-400 transform transition-transform ${showProjectsDropdown ? 'rotate-90' : ''}`} />
            </button>
            
            {showProjectsDropdown && (
              <div className="absolute left-0 mt-1.5 w-64 bg-slate-900 border border-white/10 rounded-lg shadow-xl p-2.5 z-50 text-xs">
                <div className="text-[10px] text-slate-450 uppercase tracking-wider font-bold mb-2 px-1.5 text-indigo-400">
                  {lang === 'fa' ? 'پروژه‌های من' : 'My Projects'}
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-1 mb-2 custom-scrollbar">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className={`group/proj flex items-center justify-between rounded px-2 py-1.5 transition ${
                        proj.id === currentProjectId
                          ? 'bg-indigo-600/20 border border-indigo-500/30 text-white font-semibold'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      {editingProjId === proj.id ? (
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => {
                            if (renameValue.trim()) {
                              renameProject(proj.id, renameValue.trim());
                            }
                            setEditingProjId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (renameValue.trim()) {
                                renameProject(proj.id, renameValue.trim());
                              }
                              setEditingProjId(null);
                            } else if (e.key === 'Escape') {
                              setEditingProjId(null);
                            }
                          }}
                          className="bg-slate-950 border border-indigo-500 rounded p-1 text-[11px] text-white w-full"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => {
                            setCurrentProjectId(proj.id);
                            setShowProjectsDropdown(false);
                          }}
                          className={`text-right ${lang === 'fa' ? 'text-right' : 'text-left'} font-medium truncate flex-1 min-w-0`}
                        >
                          {proj.name}
                        </button>
                      )}

                      {editingProjId !== proj.id && (
                        <div className="flex items-center gap-1 opacity-0 group-hover/proj:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingProjId(proj.id);
                              setRenameValue(proj.name);
                            }}
                            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                            title="Rename"
                          >
                            <Type className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(lang === 'fa' ? 'آیا از حذف این پروژه مطمئن هستید؟' : 'Are you sure you want to delete this project?')) {
                                deleteProject(proj.id);
                              }
                            }}
                            disabled={projects.length <= 1}
                            className={`p-1 hover:bg-white/10 rounded text-slate-400 hover:text-red-400 ${
                              projects.length <= 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                            }`}
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="h-px bg-white/5 my-2"></div>

                <div className="flex gap-1" dir="ltr">
                  <input
                    type="text"
                    placeholder={lang === 'fa' ? 'پروژه جدید...' : 'New project...'}
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    className="bg-slate-950 border border-white/10 rounded px-2 py-1.5 text-[11px] text-white placeholder-slate-500 flex-1 min-w-0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newProjName.trim()) {
                        createProject(newProjName.trim(), 'family');
                        setNewProjName('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newProjName.trim()) {
                        createProject(newProjName.trim(), 'family');
                        setNewProjName('');
                      } else {
                        createProject(`Project ${projects.length + 1}`, 'family');
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 rounded px-2.5 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Templates & Reset Actions */}
        <div className="flex bg-slate-950/40 rounded-lg p-0.5 border border-white/5 items-center overflow-x-auto max-w-[150px] sm:max-w-none">
          <button
            onClick={() => loadTemplate('family')}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all hover:bg-white/5 bg-transparent whitespace-nowrap text-slate-200"
            title="Load standard genealogy chart template"
          >
            {t.familyTree}
          </button>
          <button
            onClick={() => loadTemplate('org')}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all hover:bg-white/5 bg-transparent whitespace-nowrap text-slate-200"
            title="Load organizational relation board template"
          >
            {t.orgChart}
          </button>
          <button
            onClick={() => loadTemplate('blank')}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all hover:bg-white/5 bg-transparent text-slate-400 whitespace-nowrap"
            title="Clear canvas to fresh setup"
          >
            {t.blankTree}
          </button>
        </div>

        {/* Global Toolbar actions */}
        <div className="flex items-center gap-1.5 md:gap-2">
          
          {/* Dual Language Selector */}
          <div className="flex bg-indigo-950/50 rounded-lg p-0.5 border border-indigo-505/20 text-[10px] font-semibold">
            <button
              onClick={() => setLang('fa')}
              className={`px-2 py-1 rounded transition-all ${lang === 'fa' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              فارسی
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded transition-all ${lang === 'en' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              EN
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-slate-950/50 p-1 rounded-md border border-white/5">
            <button
              onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
              className="p-1 hover:bg-white/10 rounded transition text-slate-400"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] px-1 font-mono w-10 text-center text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
              className="p-1 hover:bg-white/10 rounded transition text-slate-400"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 md:p-2 rounded-lg border transition ${
              canUndo
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-white/10'
                : 'text-slate-600 border-white/5 bg-slate-900/20 cursor-not-allowed'
            }`}
            title={t.undo}
          >
            <Undo className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 md:p-2 rounded-lg border transition ${
              canRedo
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-white/10'
                : 'text-slate-600 border-white/5 bg-slate-900/20 cursor-not-allowed'
            }`}
            title={t.redo}
          >
            <Redo className="w-3.5 h-3.5" />
          </button>

          {/* Grouped Print & Export Dropdown */}
          <div className="relative">
            <div className="flex items-center bg-indigo-600 hover:bg-indigo-500 rounded-lg overflow-hidden shadow-md transition">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-[11px] text-white transition-colors cursor-pointer"
                title="Print sheet directly (Ctrl+P)"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.print}</span>
              </button>
              <button
                onClick={() => setShowExportDropdown((prev) => !prev)}
                className="border-l border-indigo-500/50 px-2 py-1.5 hover:bg-indigo-700 h-full flex items-center justify-center text-white cursor-pointer"
                title="Export Options"
              >
                <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${showExportDropdown ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {/* Dropdown menu */}
            {showExportDropdown && (
              <div className="absolute right-0 mt-1.5 w-48 bg-slate-900 border border-white/10 rounded-lg shadow-xl py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    window.print();
                    setShowExportDropdown(false);
                  }}
                  className={`w-full ${lang === 'fa' ? 'text-right' : 'text-left'} px-3 py-2 text-slate-200 hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer`}
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t.print}</span>
                </button>
                <button
                  onClick={() => {
                    exportToSVG(doc, canvasRef.current);
                    setShowExportDropdown(false);
                  }}
                  className={`w-full ${lang === 'fa' ? 'text-right' : 'text-left'} px-3 py-2 text-slate-200 hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer`}
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'fa' ? 'خروجی به صورت SVG' : 'Export as SVG'}</span>
                </button>
                <button
                  onClick={() => {
                    exportToPNG(doc, canvasRef.current);
                    setShowExportDropdown(false);
                  }}
                  className={`w-full ${lang === 'fa' ? 'text-right' : 'text-left'} px-3 py-2 text-slate-200 hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer`}
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'fa' ? 'خروجی به صورت PNG' : 'Export as PNG'}</span>
                </button>
                <button
                  onClick={() => {
                    const jsonStr = exportJSON();
                    downloadFile(jsonStr, `${doc.page.headerText || 'treesketch_chart'}.json`, 'application/json');
                    setShowExportDropdown(false);
                  }}
                  className={`w-full ${lang === 'fa' ? 'text-right' : 'text-left'} px-3 py-2 text-slate-200 hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer`}
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'fa' ? 'برون‌بری فایل JSON' : 'Export JSON schema'}</span>
                </button>
                <div className="h-px bg-white/5 my-1"></div>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowExportDropdown(false);
                  }}
                  className={`w-full ${lang === 'fa' ? 'text-right' : 'text-left'} px-3 py-2 text-indigo-400 hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer`}
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'fa' ? 'بارگذاری از فایل JSON' : 'Import JSON file'}</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowHelp((prev) => !prev)}
            className="p-1.5 text-slate-400 hover:text-slate-200"
            title={t.help}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Mobile Right Inspector Collapse Toggle */}
          <button 
            onClick={() => setShowInspector(!showInspector)}
            className="md:hidden p-1.5 hover:bg-white/10 rounded-lg text-indigo-400 border border-white/5 bg-slate-900/40"
            title={t.toggleInspector}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main app workspace split */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 2. LEFT WORK Chrome toolbar (no-print) */}
        {showSidebar && (
          <aside className="no-print w-64 bg-slate-900/90 md:bg-slate-900/60 backdrop-blur-md border-r border-white/5 flex flex-col p-4 shrink-0 gap-5 max-h-screen overflow-y-auto absolute md:static z-30 h-full">
            {/* Quick interactive commands */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                <MousePointer className="w-3 h-3 text-indigo-400" />
                <span>{t.canvasTools}</span>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => addNode(150, 150)}
                  className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 border border-white/10 px-3 py-2 rounded-md transition text-xs font-medium text-right w-full"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>{t.addNode}</span>
                </button>

                <button
                  onClick={deleteSelected}
                  disabled={selectedNodeIds.length === 0 && selectedEdgeIds.length === 0}
                  className={`flex items-center gap-2 border px-3 py-2 rounded-md transition text-xs font-medium text-right w-full ${
                    selectedNodeIds.length > 0 || selectedEdgeIds.length > 0
                      ? 'bg-red-950/50 hover:bg-red-900/50 text-red-300 border-red-500/20'
                      : 'text-slate-500 border-white/5 bg-slate-900/20 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t.deleteSelection}</span>
                </button>
              </div>
            </div>

            <div className="h-px bg-white/5"></div>

            {/* Page boundary configuration */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                <Compass className="w-3 h-3 text-indigo-400" />
                <span>{t.paperSize}</span>
              </h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">{t.paperSize}</label>
                  <select
                    value={doc.page.size}
                    onChange={(e) => updatePageConfig({ size: e.target.value as PageSize })}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-md p-2 text-xs text-white"
                  >
                    <option value="A4">A4 Standard</option>
                    <option value="A3">A3 Oversized</option>
                    <option value="Letter">US Letter</option>
                    <option value="Legal">US Legal</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">{t.orientation}</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-950/60 p-0.5 rounded-md border border-white/10">
                    <button
                      onClick={() => updatePageConfig({ orientation: 'portrait' })}
                      className={`py-1 rounded text-xs transition-all ${
                        doc.page.orientation === 'portrait' ? 'bg-indigo-600 font-bold' : 'hover:bg-slate-800'
                      }`}
                    >
                      {t.portrait}
                    </button>
                    <button
                      onClick={() => updatePageConfig({ orientation: 'landscape' })}
                      className={`py-1 rounded text-xs transition-all ${
                        doc.page.orientation === 'landscape' ? 'bg-indigo-600 font-bold' : 'hover:bg-slate-800'
                      }`}
                    >
                      {t.landscape}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block flex justify-between">
                    <span>{t.margins}</span>
                    <span className="font-mono text-[10px]">{doc.page.margin}px</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={doc.page.margin}
                    onChange={(e) => updatePageConfig({ margin: parseInt(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-white/5"></div>

            {/* Grid Snap & alignment */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                <Grid className="w-3 h-3 text-indigo-400" />
                <span>{t.gridAlign}</span>
              </h3>
              <div className="flex flex-col gap-2 bg-slate-950/40 p-3 rounded-lg border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs">{t.snapGrid}</span>
                  <input
                    type="checkbox"
                    checked={gridSnap}
                    onChange={(e) => setGridSnap(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                {gridSnap && (
                  <div className="mt-2">
                    <label className="text-[11px] text-slate-400 mb-1 block flex justify-between">
                      <span>{t.gridSize}</span>
                      <span className="font-mono">{gridSize}px</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="5"
                      value={gridSize}
                      onChange={(e) => setGridSize(parseInt(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Interactive footer details */}
            <div className="mt-auto">
              <span className="text-[10px] opacity-40 text-center block">TreeSketch Pro v1.4</span>
              <span className="text-[9px] opacity-30 text-center block">Ctrl+P to export high quality SVG/PDF</span>
            </div>
          </aside>
        )}

        {/* 3. CANVAS MIDDLE VIEWPORT */}
        <main
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseDown={handleMouseDown}
          className="flex-1 overflow-auto bg-slate-950 relative flex justify-center items-start p-10 custom-scrollbar"
        >
          {/* Helper feedback indicator */}
          {connectingFromId && (
            <div className="no-print absolute top-3 left-1/2 -translate-x-1/2 bg-emerald-600/90 text-white backdrop-blur-md text-xs px-4 py-2 rounded-full border border-emerald-400/20 shadow-lg flex items-center gap-2 z-20">
              <MousePointerClick className="w-4 h-4 animate-bounce" />
              <span>Connecting Relation: Click another Node to finalize link</span>
              <button
                onClick={cancelConnection}
                className="bg-white/10 hover:bg-white/20 p-1 rounded ml-2 font-bold"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Canvas sheet boundaries representation */}
          <div
            className="print-container bg-white shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative transition-shadow duration-300 border border-slate-700/50"
            style={{
              width: pageSize.width,
              height: pageSize.height,
              minWidth: pageSize.width,
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: 'top center',
              padding: `${doc.page.margin}px`
            }}
          >
            {/* Sheet contents wrapper to clip nodes perfectly */}
            <div className="w-full h-full relative flex flex-col justify-between overflow-hidden bg-white">
              
              {/* Customizable Top Header Image/Text */}
              <div
                style={{ height: `${doc.page.headerHeight}px` }}
                className="w-full flex flex-col justify-center items-center shrink-0 border-b border-black md:border-dashed relative group"
              >
                {doc.page.headerImage ? (
                  <img
                    src={doc.page.headerImage}
                    alt="Header Banner"
                    className="absolute inset-0 w-full h-full"
                    style={{
                      objectFit: doc.page.headerFit === 'stretch' ? 'fill' : doc.page.headerFit
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <h2 className="text-md font-sans tracking-widest uppercase font-semibold text-black">
                      {doc.page.headerText || 'FAMILY TREE CHART'}
                    </h2>
                    <p className="text-[10px] text-slate-500 tracking-wider">
                      Genealogy & Org Relations Line-only Sheet
                    </p>
                  </div>
                )}
                {/* Easy reset for image overlay in editor */}
                {doc.page.headerImage && (
                  <button
                    onClick={() => updatePageConfig({ headerImage: undefined })}
                    className="no-print absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white rounded p-1 text-[9px] transition"
                  >
                    Remove Image
                  </button>
                )}
              </div>

              {/* Central Drawing canvas area for Nodes & Connections */}
              <div className="flex-1 relative overflow-hidden bg-white">
                <svg
                  ref={canvasRef}
                  width="100%"
                  height="100%"
                  className="absolute inset-0 select-none"
                >
                  {/* Fine Alignment Dot Grid (Invisible in physical print) */}
                  <defs>
                    <pattern id="dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1.2" fill="rgba(0,0,0,0.06)" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#dot-grid)" className="no-print" />

                  {/* SVG background target to enable panning */}
                  <rect
                    id="canvas-background"
                    width="100%"
                    height="100%"
                    fill="transparent"
                  />

                  {/* Edges layer */}
                  {doc.edges.map((edge) => {
                    const fromNode = doc.nodes.find((n) => n.id === edge.from);
                    const toNode = doc.nodes.find((n) => n.id === edge.to);
                    if (!fromNode || !toNode) return null;

                    return (
                      <EdgeElement
                        key={edge.id}
                        edge={edge}
                        from={fromNode}
                        to={toNode}
                        isSelected={selectedEdgeIds.includes(edge.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectEdge(edge.id, e.shiftKey);
                        }}
                      />
                    );
                  })}

                  {/* Nodes layer */}
                  {doc.nodes.map((node) => (
                    <NodeElement
                      key={node.id}
                      node={node}
                      isSelected={selectedNodeIds.includes(node.id)}
                      onMouseDown={handleNodeMouseDown}
                      onTouchStart={(e) => handleNodeTouchStart(e, node.id)}
                      onResizeMouseDown={handleResizeMouseDown}
                      onResizeTouchStart={(e) => handleResizeTouchStart(e, node.id)}
                      isConnectingActive={connectingFromId !== null && connectingFromId !== node.id}
                    />
                  ))}
                </svg>
              </div>

              {/* Customizable Footer Banner Image/Text */}
              <div
                style={{ height: `${doc.page.footerHeight}px` }}
                className="w-full flex justify-between items-center px-4 shrink-0 border-t border-black md:border-dashed relative group"
              >
                {doc.page.footerImage ? (
                  <img
                    src={doc.page.footerImage}
                    alt="Footer Banner"
                    className="absolute inset-0 w-full h-full"
                    style={{
                      objectFit: doc.page.footerFit === 'stretch' ? 'fill' : doc.page.footerFit
                    }}
                  />
                ) : (
                  <div className="flex w-full justify-between items-center text-[10px] text-slate-500 font-sans">
                    <span>{doc.page.footerText || 'Generated with TreeSketch'}</span>
                    <span>© 2026</span>
                  </div>
                )}
                {doc.page.footerImage && (
                  <button
                    onClick={() => updatePageConfig({ footerImage: undefined })}
                    className="no-print absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white rounded p-1 text-[9px] transition"
                  >
                    {t.removeImage}
                  </button>
                )}
              </div>

            </div>
          </div>
        </main>

        {/* 4. DETAILS PROPERTY INSPECTOR (no-print) */}
        {showInspector && (
          <aside className="no-print w-80 bg-slate-900/90 md:bg-slate-900/60 backdrop-blur-md border-l border-white/5 flex flex-col p-4 shrink-0 gap-5 max-h-screen overflow-y-auto absolute md:static right-0 md:right-auto z-30 h-full">
            {/* Node edits */}
            {selectedNode ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Type className="w-3 h-3 text-indigo-400" />
                    <span>{t.properties}</span>
                  </h3>
                  <span className="text-[9px] font-mono bg-slate-950 px-2 py-0.5 rounded text-indigo-300">
                    {selectedNode.id}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">{t.nodeText}</label>
                    <input
                      type="text"
                      value={selectedNode.label}
                      onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-md p-2 text-xs text-white placeholder-slate-500"
                      placeholder="Enter node title"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">{t.nodeSubText}</label>
                    <input
                      type="text"
                      value={selectedNode.subLabel || ''}
                      onChange={(e) => updateNode(selectedNode.id, { subLabel: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-md p-2 text-xs text-white placeholder-slate-500"
                      placeholder="e.g. b. 1956 - d.2023"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">{t.fontSize}</label>
                      <input
                        type="number"
                        min="8"
                        max="24"
                        value={selectedNode.fontSize}
                        onChange={(e) => updateNode(selectedNode.id, { fontSize: parseInt(e.target.value) || 12 })}
                        className="w-full bg-slate-950 border border-white/10 rounded-md p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">{t.alignMode}</label>
                      <div className="grid grid-cols-3 gap-0.5 bg-slate-950 p-1 rounded border border-white/10 h-9">
                        <button
                          onClick={() => updateNode(selectedNode.id, { textAlign: 'left' })}
                          className={`p-1 rounded text-xs flex justify-center items-center ${
                            selectedNode.textAlign === 'left' ? 'bg-indigo-600' : 'hover:bg-slate-800'
                          }`}
                          title="Align Left"
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateNode(selectedNode.id, { textAlign: 'center' })}
                          className={`p-1 rounded text-xs flex justify-center items-center ${
                            selectedNode.textAlign === 'center' ? 'bg-indigo-600' : 'hover:bg-slate-800'
                          }`}
                          title="Align Center"
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateNode(selectedNode.id, { textAlign: 'right' })}
                          className={`p-1 rounded text-xs flex justify-center items-center ${
                            selectedNode.textAlign === 'right' ? 'bg-indigo-600' : 'hover:bg-slate-800'
                          }`}
                          title="Align Right"
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">{t.cardStyle}</label>
                    <select
                      value={selectedNode.style || 'rectangle'}
                      onChange={(e) => updateNode(selectedNode.id, { style: e.target.value as NodeStyle })}
                      className="w-full bg-slate-950 border border-white/10 rounded-md p-2 text-xs text-white"
                    >
                      <option value="rectangle">{t.styleRectangle}</option>
                      <option value="pill">{t.stylePill}</option>
                      <option value="card">{t.styleDouble}</option>
                      <option value="text-only">{t.styleTextOnly}</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : selectedEdge ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Link className="w-3 h-3 text-indigo-400" />
                    <span>Connection details</span>
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">{t.linePathType}</label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-950 p-0.5 rounded border border-white/10">
                      <button
                        onClick={() => updateEdgeType(selectedEdge.id, 'straight')}
                        className={`py-1.5 rounded text-xs transition-all ${
                          selectedEdge.type === 'straight' ? 'bg-indigo-600' : 'hover:bg-slate-800'
                        }`}
                      >
                        {t.straight}
                      </button>
                      <button
                        onClick={() => updateEdgeType(selectedEdge.id, 'elbow')}
                        className={`py-1.5 rounded text-xs transition-all ${
                          selectedEdge.type === 'elbow' ? 'bg-indigo-600' : 'hover:bg-slate-800'
                        }`}
                      >
                        {t.elbow}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block flex justify-between">
                      <span>{t.lineWidth}</span>
                      <span className="font-mono">{selectedEdge.strokeWidth}px</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.5"
                      value={selectedEdge.strokeWidth}
                      onChange={(e) => updateEdgeWidth(selectedEdge.id, parseFloat(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Header & footer custom image builders */}
                <div className="mb-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-slate-400" />
                    <span>{t.properties}</span>
                  </h3>
                </div>

                <div className="flex flex-col gap-5">
                  {/* Header configuration */}
                  <div className="bg-slate-950/45 p-3 rounded-lg border border-white/5">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase block mb-2">{t.sheetHeader}</span>
                    
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">{t.headerText}</label>
                        <input
                          type="text"
                          value={doc.page.headerText || ''}
                          onChange={(e) => updatePageConfig({ headerText: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 rounded p-1.5 text-xs text-white"
                          placeholder="e.g. OUR FAMILY TREE"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">{t.uploadHeader}</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('header', e)}
                          className="w-full text-[10px] text-slate-400 cursor-pointer text-indigo-300"
                        />
                      </div>

                      {doc.page.headerImage && (
                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <label className="text-[9px] text-slate-400 block mb-0.5">Height (px)</label>
                            <input
                              type="number"
                              min="20"
                              max="200"
                              value={doc.page.headerHeight}
                              onChange={(e) => updatePageConfig({ headerHeight: parseInt(e.target.value) || 40 })}
                              className="w-full bg-slate-950 border border-white/10 rounded text-xs p-1"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-400 block mb-0.5">Fit Mode</label>
                            <select
                              value={doc.page.headerFit}
                              onChange={(e) => updatePageConfig({ headerFit: e.target.value as ImageFit })}
                              className="w-full bg-slate-950 border border-white/10 rounded text-xs p-1 text-white"
                            >
                              <option value="contain">Contain</option>
                              <option value="cover">Cover</option>
                              <option value="stretch">Stretch</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer configuration */}
                  <div className="bg-slate-950/45 p-3 rounded-lg border border-white/5">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase block mb-2">{t.sheetFooter}</span>
                    
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">{t.footerText}</label>
                        <input
                          type="text"
                          value={doc.page.footerText || ''}
                          onChange={(e) => updatePageConfig({ footerText: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 rounded p-1.5 text-xs text-white"
                          placeholder="e.g. Confidential Chart"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">{t.uploadFooter}</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('footer', e)}
                          className="w-full text-[10px] text-slate-400 cursor-pointer text-indigo-300"
                        />
                      </div>

                      {doc.page.footerImage && (
                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <label className="text-[9px] text-slate-400 block mb-0.5">Height (px)</label>
                            <input
                              type="number"
                              min="20"
                              max="200"
                              value={doc.page.footerHeight}
                              onChange={(e) => updatePageConfig({ footerHeight: parseInt(e.target.value) || 40 })}
                              className="w-full bg-slate-950 border border-white/10 rounded text-xs p-1"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-400 block mb-0.5">Fit Mode</label>
                            <select
                              value={doc.page.footerFit}
                              onChange={(e) => updatePageConfig({ footerFit: e.target.value as ImageFit })}
                              className="w-full bg-slate-950 border border-white/10 rounded text-xs p-1 text-white"
                            >
                              <option value="contain">Contain</option>
                              <option value="cover">Cover</option>
                              <option value="stretch">Stretch</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

      </div>

      {/* Floating help modal/sheet overlay */}
      {showHelp && (
        <div className="no-print fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span>{t.howToTitle}</span>
            </h2>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside mb-6">
              <li>{t.howToAdd}</li>
              <li>{t.howToDrag}</li>
              <li>{t.howToConnect}</li>
              <li>{t.howToMulti}</li>
              <li>{t.howToShortcut}</li>
            </ul>
            <button
              onClick={() => setShowHelp(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-2.5 rounded-xl text-xs font-bold text-white transition"
            >
              {t.startDesignButton}
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input for JSON schemas */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleJSONUpload}
        accept=".json,application/json"
        className="hidden pointer-events-none"
      />

      {/* Global CSS Styling specifically targeting both physical Printer pages and editor custom scrollbars */}
      <style>{`
        @media print {
          @page {
            size: ${doc.page.size} ${doc.page.orientation};
            margin: 0;
          }
          
          /* Force physical printing parameters on body */
          body, html {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: visible !important;
          }
          
          .no-print {
            display: none !important;
            height: 0 !important;
            width: 0 !important;
            visibility: hidden !important;
          }
          
          .print-container {
            width: 100vw !important;
            height: 100vh !important;
            min-width: 100vw !important;
            max-width: 100vw !important;
            min-height: 100vh !important;
            max-height: 100vh !important;
            transform: none !important;
            box-shadow: none !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            padding: 20px !important;
            margin: 0 !important;
            background: white !important;
            border: none !important;
            z-index: 9999 !important;
          }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <TreeProvider>
      <TreeDesignerApp />
    </TreeProvider>
  );
}
