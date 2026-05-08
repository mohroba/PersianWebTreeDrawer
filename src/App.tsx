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
  X,
  Sun,
  Moon,
  Move
} from 'lucide-react';

const BUILTIN_LETTERHEADS = [
  {
    id: 'corporate',
    name: 'Modern Geometric Accent (Indigo/Teal)',
    svg: 'data:image/svg+xml;utf8,<svg viewBox="0 0 800 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%234f46e5" stop-opacity="0.8"/><stop offset="100%" stop-color="%2306b6d4" stop-opacity="0.8"/></linearGradient></defs><rect x="0" y="0" width="800" height="8" fill="url(%23g1)"/><polygon points="0,8 140,8 100,55 0,55" fill="url(%23g1)" opacity="0.35"/><polygon points="800,8 660,8 700,55 800,55" fill="url(%23g1)" opacity="0.35"/><circle cx="400" cy="70" r="12" fill="%234f46e5" opacity="0.15"/></svg>'
  },
  {
    id: 'editorial',
    name: 'Classic Luxury Border (Gold/Slate)',
    svg: 'data:image/svg+xml;utf8,<svg viewBox="0 0 800 120" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="15" width="770" height="90" fill="none" stroke="%23d97706" stroke-width="1.2" opacity="0.7"/><rect x="19" y="19" width="762" height="82" fill="none" stroke="%231e293b" stroke-width="1.8"/><circle cx="26" cy="26" r="3.5" fill="%23d97706"/><circle cx="774" cy="26" r="3.5" fill="%23d97706"/><circle cx="26" cy="94" r="3.5" fill="%23d97706"/><circle cx="774" cy="94" r="3.5" fill="%23d97706"/></svg>'
  },
  {
    id: 'tech',
    name: 'Precision Engineering Grid (Blueprints)',
    svg: 'data:image/svg+xml;utf8,<svg viewBox="0 0 800 120" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="20" x2="790" y2="20" stroke="%234f46e5" stroke-width="1" opacity="0.25" stroke-dasharray="4 4"/><line x1="40" y1="10" x2="40" y2="110" stroke="%234f46e5" stroke-width="1" opacity="0.2"/><line x1="760" y1="10" x2="760" y2="110" stroke="%234f46e5" stroke-width="1" opacity="0.2"/><rect x="35" y="15" width="10" height="10" fill="none" stroke="%234f46e5" stroke-width="0.8" opacity="0.4"/><rect x="755" y="15" width="10" height="10" fill="none" stroke="%234f46e5" stroke-width="0.8" opacity="0.4"/><circle cx="400" cy="60" r="45" fill="none" stroke="%234f46e5" stroke-width="0.5" stroke-dasharray="3 3"/><circle cx="400" cy="60" r="1.5" fill="%234f46e5"/></svg>'
  },
  {
    id: 'watercolor',
    name: 'Minimal Artistic Wave (Design/Art)',
    svg: 'data:image/svg+xml;utf8,<svg viewBox="0 0 800 120" xmlns="http://www.w3.org/2000/svg"><path d="M0,0 Q260,88 500,22 T800,44 L800,0 Z" fill="%236366f1" opacity="0.12"/><path d="M0,0 Q180,118 400,44 T800,22 L800,0 Z" fill="%23a855f7" opacity="0.1"/><line x1="0" y1="114" x2="800" y2="114" stroke="%23a855f7" stroke-width="1.5" opacity="0.4"/></svg>'
  },
  {
    id: 'brutalist',
    name: 'Bold Accent bars (Modernist/Vibrant)',
    svg: 'data:image/svg+xml;utf8,<svg viewBox="0 0 800 120" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="800" height="12" fill="%23f97316"/><rect x="0" y="18" width="280" height="4" fill="%233b82f6"/><rect x="520" y="18" width="280" height="4" fill="%233b82f6"/><circle cx="400" cy="50" r="12" fill="%23f97316" opacity="0.25"/><line x1="388" y1="50" x2="412" y2="50" stroke="%23f97316" stroke-width="1.2"/><line x1="400" y1="38" x2="400" y2="62" stroke="%23f97316" stroke-width="1.2"/></svg>'
  }
];

const TRANSLATIONS = {
  fa: {
    appName: 'رابوک',
    appSub: 'طراحی درختواره هوشمند',
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
    appName: 'Rabook',
    appSub: 'Intelligent Tree Designer',
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

  // Theme support
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('treesketch_theme_v1');
      return (saved as 'dark' | 'light') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('treesketch_theme_v1', theme);
    } catch (e) {}
  }, [theme]);

  const isDark = theme === 'dark';

  // Sizing states for sidebars
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [inspectorWidth, setInspectorWidth] = useState(320);

  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingInspector, setIsResizingInspector] = useState(false);

  // Responsive window tracking
  const [windowWidth, setWindowWidth] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  const handleSidebarResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
  }, []);

  const handleInspectorResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingInspector(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar) {
        let rawWidth = e.clientX;
        if (lang === 'fa') {
          // In RTL, left sidebar is on the right of the screen or vice-versa? 
          // Usually, left is left side of the viewport, right is right side of the viewport. Let's make it standard:
          // sidebar starts at left, rawWidth is e.clientX.
          rawWidth = e.clientX;
        }
        const limitedWidth = Math.min(500, Math.max(180, rawWidth));
        setSidebarWidth(limitedWidth);
      } else if (isResizingInspector) {
        const rawWidth = window.innerWidth - e.clientX;
        const limitedWidth = Math.min(500, Math.max(200, rawWidth));
        setInspectorWidth(limitedWidth);
      }
    };

    const handleMouseUpGlobal = () => {
      setIsResizingSidebar(false);
      setIsResizingInspector(false);
    };

    if (isResizingSidebar || isResizingInspector) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUpGlobal);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isResizingSidebar, isResizingInspector, lang]);

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

  // Header and footer dragging state
  const [activeDragElement, setActiveDragElement] = useState<{
    target: 'header-image' | 'header-text' | 'footer-image' | 'footer-text' | 'header-resize' | 'footer-resize';
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  // Context menu state for header & footer text customization
  const [hdrFtrContextMenu, setHdrFtrContextMenu] = useState<{
    x: number;
    y: number;
    target: 'header' | 'footer';
  } | null>(null);

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
        window.focus();
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
    if (activeDragElement) {
      const deltaX = (e.clientX - activeDragElement.startX) / zoom;
      const deltaY = (e.clientY - activeDragElement.startY) / zoom;
      
      const targetX = activeDragElement.initialX + deltaX;
      const targetY = activeDragElement.initialY + deltaY;
      
      if (activeDragElement.target === 'header-image') {
        updatePageConfig({
          headerOffsetX: targetX,
          headerOffsetY: targetY
        });
      } else if (activeDragElement.target === 'header-text') {
        updatePageConfig({
          headerTextOffsetX: targetX,
          headerTextOffsetY: targetY
        });
      } else if (activeDragElement.target === 'footer-image') {
        updatePageConfig({
          footerOffsetX: targetX,
          footerOffsetY: targetY
        });
      } else if (activeDragElement.target === 'footer-text') {
        updatePageConfig({
          footerTextOffsetX: targetX,
          footerTextOffsetY: targetY
        });
      } else if (activeDragElement.target === 'header-resize') {
        updatePageConfig({
          headerTextWidth: Math.max(100, activeDragElement.initialX + deltaX),
          headerTextHeight: Math.max(40, activeDragElement.initialY + deltaY)
        });
      } else if (activeDragElement.target === 'footer-resize') {
        updatePageConfig({
          footerTextWidth: Math.max(100, activeDragElement.initialX + deltaX),
          footerTextHeight: Math.max(40, activeDragElement.initialY + deltaY)
        });
      }
      return;
    }

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
    setActiveDragElement(null);
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
      className={`min-h-screen flex flex-col font-sans select-none overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-200' : 'bg-slate-100 text-slate-800'}`}
    >
      
      {/* 1. GLASSMORPHISM TOP TOOLBAR (no-print) */}
      <header className={`no-print h-16 shrink-0 border-b flex items-center px-4 md:px-6 justify-between z-40 relative gap-2 transition-colors duration-300 ${isDark ? 'bg-slate-900/40 backdrop-blur-md border-white/5 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'}`}>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Collapse Toggles (visible on all breakpoints) */}
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isDark
                ? 'hover:bg-white/10 text-indigo-400 border-white/5 bg-slate-900/40'
                : 'hover:bg-slate-200 text-indigo-600 border-slate-200 bg-slate-100 shadow-sm'
            }`}
            title={t.toggleSidebar}
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="hidden lg:flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${isDark ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`}>
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className={`font-extrabold text-xs md:text-sm tracking-widest block uppercase leading-none ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{t.appName}</span>
              <span className={`text-[10px] font-light tracking-wider hidden md:block opacity-60 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{t.appSub}</span>
            </div>
          </div>

          {/* Project Switcher */}
          <div className="relative z-50" id="project-switcher">
            <button
              onClick={() => setShowProjectsDropdown(!showProjectsDropdown)}
              className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer ${
                isDark 
                  ? 'bg-slate-950/60 border-white/10 text-white hover:bg-slate-900' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-medium max-w-[120px] truncate">
                {projects.find((p) => p.id === currentProjectId)?.name || 'Default Project'}
              </span>
              <ChevronRight className={`w-3 h-3 text-slate-400 transform transition-transform ${showProjectsDropdown ? 'rotate-90' : ''}`} />
            </button>
            
            {showProjectsDropdown && (
              <div className={`absolute left-0 mt-1.5 w-64 border rounded-lg shadow-xl p-2.5 z-50 text-xs ${
                isDark ? 'bg-slate-900 border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="text-[10px] uppercase tracking-wider font-bold mb-2 px-1.5 text-indigo-500">
                  {lang === 'fa' ? 'پروژه‌های من' : 'My Projects'}
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-1 mb-2 custom-scrollbar">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className={`group/proj flex items-center justify-between rounded px-2 py-1.5 transition ${
                        proj.id === currentProjectId
                          ? isDark
                            ? 'bg-indigo-600/20 border border-indigo-500/30 text-white font-semibold'
                            : 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-semibold shadow-sm'
                          : isDark
                            ? 'hover:bg-white/5 text-slate-300'
                            : 'hover:bg-slate-100 text-slate-700'
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
                          className={`border rounded p-1 text-[11px] w-full ${
                            isDark ? 'bg-slate-950 border-indigo-500 text-white' : 'bg-white border-indigo-600 text-slate-900 font-medium'
                          }`}
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
                            className={`p-1 rounded transition ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}
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
                            className={`p-1 rounded transition ${
                              projects.length <= 1 
                                ? 'opacity-30 cursor-not-allowed' 
                                : isDark ? 'hover:bg-white/10 text-slate-400 hover:text-red-400' : 'hover:bg-slate-200 text-slate-500 hover:text-red-650'
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

                <div className={`h-px my-2 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}></div>

                <div className="flex gap-1" dir="ltr">
                  <input
                    type="text"
                    placeholder={lang === 'fa' ? 'پروژه جدید...' : 'New project...'}
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    className={`border rounded px-2 py-1.5 text-[11px] flex-1 min-w-0 ${
                      isDark ? 'bg-slate-950 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
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
        <div className={`flex rounded-lg p-0.5 border items-center overflow-x-auto max-w-[140px] md:max-w-[220px] lg:max-w-none ${
          isDark ? 'bg-slate-950/40 border-white/5' : 'bg-slate-200/50 border-slate-300'
        }`}>
          <button
            onClick={() => loadTemplate('family')}
            className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[10px] md:text-[11px] font-medium transition-all bg-transparent whitespace-nowrap ${
              isDark ? 'text-slate-200 hover:bg-white/5' : 'text-slate-800 hover:bg-white/70'
            }`}
            title="Load standard genealogy chart template"
          >
            {t.familyTree}
          </button>
          <button
            onClick={() => loadTemplate('org')}
            className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[10px] md:text-[11px] font-medium transition-all bg-transparent whitespace-nowrap ${
              isDark ? 'text-slate-200 hover:bg-white/5' : 'text-slate-800 hover:bg-white/70'
            }`}
            title="Load organizational relation board template"
          >
            {t.orgChart}
          </button>
          <button
            onClick={() => loadTemplate('blank')}
            className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[10px] md:text-[11px] font-medium transition-all bg-transparent whitespace-nowrap ${
              isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-white/70'
            }`}
            title="Clear canvas to fresh setup"
          >
            {t.blankTree}
          </button>
        </div>

        {/* Global Toolbar actions */}
        <div className="flex items-center gap-1 md:gap-2">
          
          {/* Dual Language Selector */}
          <div className={`flex rounded-lg p-0.5 border text-[10px] font-semibold ${
            isDark ? 'bg-indigo-950/50 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'
          }`}>
            <button
              onClick={() => setLang('fa')}
              className={`px-2 py-1 rounded transition-all cursor-pointer ${lang === 'fa' ? 'bg-indigo-600 text-white font-bold' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-indigo-400 hover:text-indigo-700'}`}
            >
              فارسی
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded transition-all cursor-pointer ${lang === 'en' ? 'bg-indigo-600 text-white font-bold' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-indigo-400 hover:text-indigo-700'}`}
            >
              EN
            </button>
          </div>

          {/* Zoom controls */}
          <div className={`hidden sm:flex items-center p-1 rounded-md border ${
            isDark ? 'bg-slate-950/50 border-white/5' : 'bg-slate-200/50 border-slate-300'
          }`}>
            <button
              onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
              className={`p-1 rounded transition ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-300 text-slate-600'}`}
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className={`text-[10px] px-1 font-mono w-10 text-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
              className={`p-1 rounded transition ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-300 text-slate-600'}`}
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
                ? isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-white/10 cursor-pointer'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm cursor-pointer'
                : isDark
                  ? 'text-slate-600 border-white/5 bg-slate-900/20 cursor-not-allowed'
                  : 'text-slate-300 border-slate-200/50 bg-slate-100/50 cursor-not-allowed'
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
                ? isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-white/10 cursor-pointer'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm cursor-pointer'
                : isDark
                  ? 'text-slate-600 border-white/5 bg-slate-900/20 cursor-not-allowed'
                  : 'text-slate-300 border-slate-200/50 bg-slate-100/50 cursor-not-allowed'
            }`}
            title={t.redo}
          >
            <Redo className="w-3.5 h-3.5" />
          </button>

          {/* Theme Support Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-1.5 md:p-2 rounded-lg border transition cursor-pointer shadow-sm ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-400 border-white/10'
                : 'bg-white hover:bg-slate-100 text-amber-600 border-slate-200'
            }`}
            title={lang === 'fa' ? 'تغییر پوسته تم' : 'Toggle Theme'}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Grouped Print & Export Dropdown */}
          <div className="relative">
            <div className="flex items-center bg-indigo-600 hover:bg-indigo-500 rounded-lg overflow-hidden shadow-md transition">
              <button
                onClick={() => {
                  window.focus();
                  window.print();
                }}
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
              <div className={`absolute right-0 mt-1.5 w-48 border rounded-lg shadow-xl py-1 z-50 text-xs ${
                isDark ? 'bg-slate-900 border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <button
                  onClick={() => {
                    window.focus();
                    window.print();
                    setShowExportDropdown(false);
                  }}
                  className={`w-full ${lang === 'fa' ? 'text-right' : 'text-left'} px-3 py-2 transition flex items-center gap-2 cursor-pointer ${
                    isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{t.print}</span>
                </button>
                <button
                  onClick={() => {
                    exportToSVG(doc, canvasRef.current);
                    setShowExportDropdown(false);
                  }}
                  className={`w-full ${lang === 'fa' ? 'text-right' : 'text-left'} px-3 py-2 transition flex items-center gap-2 cursor-pointer ${
                    isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-indigo-550" />
                  <span>{lang === 'fa' ? 'خروجی به صورت SVG' : 'Export as SVG'}</span>
                </button>
                <button
                  onClick={() => {
                    exportToPNG(doc, canvasRef.current);
                    setShowExportDropdown(false);
                  }}
                  className={`w-full ${lang === 'fa' ? 'text-right' : 'text-left'} px-3 py-2 transition flex items-center gap-2 cursor-pointer ${
                    isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-indigo-550" />
                  <span>{lang === 'fa' ? 'خروجی به صورت PNG' : 'Export as PNG'}</span>
                </button>
                <button
                  onClick={() => {
                    const jsonStr = exportJSON();
                    downloadFile(jsonStr, `${doc.page.headerText || 'treesketch_chart'}.json`, 'application/json');
                    setShowExportDropdown(false);
                  }}
                  className={`w-full ${lang === 'fa' ? 'text-right' : 'text-left'} px-3 py-2 transition flex items-center gap-2 cursor-pointer ${
                    isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-indigo-550" />
                  <span>{lang === 'fa' ? 'برون‌بری فایل JSON' : 'Export JSON schema'}</span>
                </button>
                <div className={`h-px my-1 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}></div>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowExportDropdown(false);
                  }}
                  className={`w-full ${lang === 'fa' ? 'text-right' : 'text-left'} px-3 py-2 transition flex items-center gap-2 cursor-pointer ${
                    isDark ? 'text-indigo-400 hover:bg-slate-800' : 'text-indigo-600 hover:bg-slate-100'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{lang === 'fa' ? 'بارگذاری از فایل JSON' : 'Import JSON file'}</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowHelp((prev) => !prev)}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-100'
            }`}
            title={t.help}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Toggle Inspector (visible on all breakpoints) */}
          <button 
            onClick={() => setShowInspector(!showInspector)}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isDark
                ? 'hover:bg-white/10 text-indigo-400 border-white/5 bg-slate-900/40'
                : 'hover:bg-slate-200 text-indigo-600 border-slate-200 bg-slate-100 shadow-sm'
            }`}
            title={t.toggleInspector}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main app workspace split */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Backdrop for mobile left sidebar */}
        {showSidebar && isMobile && (
          <div 
            onClick={() => setShowSidebar(false)} 
            className="fixed inset-0 bg-black/60 z-25 no-print cursor-pointer"
          />
        )}

        {/* Backdrop for mobile right inspector */}
        {showInspector && (isMobile || isTablet) && (
          <div 
            onClick={() => setShowInspector(false)} 
            className="fixed inset-0 bg-black/60 z-25 no-print cursor-pointer"
          />
        )}
        
        {/* 2. LEFT WORK Chrome toolbar (no-print) */}
        {showSidebar && (
          <aside 
            className={`no-print select-none border-r flex flex-col p-4 shrink-0 gap-5 max-h-screen overflow-y-auto transition-all duration-300 ${
              isMobile ? 'fixed left-0 top-0 bottom-0 z-30 h-full' : 'relative z-10 h-full'
            } ${
              isDark
                ? 'bg-slate-900/95 border-white/5 text-slate-100'
                : 'bg-white border-slate-200 text-slate-800 shadow-xl'
            }`}
            style={{ 
              width: showSidebar ? `${isMobile ? 280 : sidebarWidth}px` : '0px', 
              display: showSidebar ? 'flex' : 'none' 
            }}
          >
            {/* Mobile close button */}
            {isMobile && (
              <button 
                onClick={() => setShowSidebar(false)}
                className={`absolute top-2 right-2 p-1.5 rounded-full transition cursor-pointer ${
                  isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Quick interactive commands */}
            <div>
              <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <MousePointer className="w-3 h-3 text-indigo-500" />
                <span>{t.canvasTools}</span>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => addNode(150, 150)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition text-xs font-medium text-right w-full border cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800/80 hover:bg-slate-700 border-white/10 text-slate-200' 
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm'
                  }`}
                >
                  <Plus className="w-4 h-4 text-emerald-500" />
                  <span>{t.addNode}</span>
                </button>

                <button
                  onClick={deleteSelected}
                  disabled={selectedNodeIds.length === 0 && selectedEdgeIds.length === 0}
                  className={`flex items-center gap-2 border px-3 py-2 rounded-md transition text-xs font-medium text-right w-full ${
                    selectedNodeIds.length > 0 || selectedEdgeIds.length > 0
                      ? isDark
                        ? 'bg-red-950/50 hover:bg-red-900/50 text-red-300 border-red-500/20 cursor-pointer'
                        : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 shadow-sm cursor-pointer'
                      : isDark
                        ? 'text-slate-500 border-white/5 bg-slate-900/20 cursor-not-allowed'
                        : 'text-slate-300 border-slate-200 bg-slate-50 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t.deleteSelection}</span>
                </button>
              </div>
            </div>

            <div className={`h-px ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}></div>

            {/* Page boundary configuration */}
            <div>
              <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <Compass className="w-3 h-3 text-indigo-500" />
                <span>{t.paperSize}</span>
              </h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className={`text-[11px] mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.paperSize}</label>
                  <select
                    value={doc.page.size}
                    onChange={(e) => updatePageConfig({ size: e.target.value as PageSize })}
                    className={`w-full border rounded-md p-2 text-xs transition ${
                      isDark ? 'bg-slate-950/60 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800 shadow-sm font-medium'
                    }`}
                  >
                    <option value="A4">A4 Standard</option>
                    <option value="A3">A3 Oversized</option>
                    <option value="Letter">US Letter</option>
                    <option value="Legal">US Legal</option>
                  </select>
                </div>

                <div>
                  <label className={`text-[11px] mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.orientation}</label>
                  <div className={`grid grid-cols-2 gap-1 p-0.5 rounded-md border transition ${isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-200 border-slate-300'}`}>
                    <button
                      onClick={() => updatePageConfig({ orientation: 'portrait' })}
                      className={`py-1 rounded text-xs transition-all cursor-pointer ${
                        doc.page.orientation === 'portrait' ? 'bg-indigo-600 font-bold text-white shadow-sm' : isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white text-slate-600'
                      }`}
                    >
                      {t.portrait}
                    </button>
                    <button
                      onClick={() => updatePageConfig({ orientation: 'landscape' })}
                      className={`py-1 rounded text-xs transition-all cursor-pointer ${
                        doc.page.orientation === 'landscape' ? 'bg-indigo-600 font-bold text-white shadow-sm' : isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white text-slate-600'
                      }`}
                    >
                      {t.landscape}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`text-[11px] mb-1 block flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span>{t.margins}</span>
                    <span className="font-mono text-[10px]">{doc.page.margin}px</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={doc.page.margin}
                    onChange={(e) => updatePageConfig({ margin: parseInt(e.target.value) })}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className={`h-px ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}></div>

            {/* Grid Snap & alignment */}
            <div>
              <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <Grid className="w-3 h-3 text-indigo-500" />
                <span>{t.gridAlign}</span>
              </h3>
              <div className={`flex flex-col gap-2 p-3 rounded-lg border transition ${
                isDark ? 'bg-slate-950/40 border-white/5' : 'bg-slate-150 border-slate-200/80 bg-slate-50'
              }`}>
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
                    <label className={`text-[11px] mb-1 block flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
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
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Interactive footer details */}
            <div className="mt-auto pt-4 border-t border-transparent">
              <span className={`text-[10px] text-center block ${isDark ? 'opacity-40' : 'text-slate-400'}`}>Rabook Pro v1.4</span>
              <span className={`text-[9px] text-center block ${isDark ? 'opacity-30' : 'text-slate-300'}`}>Ctrl+P to export high quality SVG/PDF</span>
            </div>
          </aside>
        )}

        {/* Resize Handle for left sidebar */}
        {showSidebar && !isMobile && (
          <div
            onMouseDown={handleSidebarResizeMouseDown}
            className={`no-print w-1 hover:w-1.5 transition-all cursor-col-resize h-full relative z-20 shrink-0 ${
              isResizingSidebar 
                ? 'bg-indigo-500 w-1.5' 
                : isDark ? 'bg-white/5 hover:bg-indigo-500/50' : 'bg-slate-200 hover:bg-indigo-500/50'
            }`}
          />
        )}

        {/* 3. CANVAS MIDDLE VIEWPORT */}
        <main
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseDown={handleMouseDown}
          className={`flex-1 overflow-auto relative flex justify-center items-start p-6 md:p-10 custom-scrollbar transition-colors duration-300 ${
            isDark ? 'bg-slate-950' : 'bg-slate-300'
          }`}
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
                className="w-full flex flex-col justify-center items-center shrink-0 border-b border-black md:border-dashed relative group overflow-hidden bg-white"
              >
                {doc.page.headerImage && (
                  <img
                    src={doc.page.headerImage}
                    alt="Header Banner"
                    className="absolute inset-0 w-full h-full transition-transform duration-100 cursor-move select-none"
                    style={{
                      objectFit: doc.page.headerFit === 'stretch' ? 'fill' : doc.page.headerFit,
                      transform: `translate(${doc.page.headerOffsetX || 0}px, ${doc.page.headerOffsetY || 0}px) scale(${doc.page.headerScale || 1})`,
                      transformOrigin: 'center center'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setActiveDragElement({
                        target: 'header-image',
                        startX: e.clientX,
                        startY: e.clientY,
                        initialX: doc.page.headerOffsetX || 0,
                        initialY: doc.page.headerOffsetY || 0
                      });
                    }}
                    referrerPolicy="no-referrer"
                  />
                )}

                {/* Draggable & Editable Header Text Box */}
                <div
                  className="absolute text-center group/hdr cursor-move p-2 select-none border border-transparent hover:border-dashed hover:border-indigo-500/50 rounded z-10 flex flex-col items-center justify-center print:border-none print:p-0"
                  style={{
                    transform: `translate(${doc.page.headerTextOffsetX || 0}px, ${doc.page.headerTextOffsetY || 0}px)`,
                    width: doc.page.headerTextWidth ? `${doc.page.headerTextWidth}px` : '320px',
                    height: doc.page.headerTextHeight ? `${doc.page.headerTextHeight}px` : '80px',
                  }}
                  onMouseDown={(e) => {
                    const isInput = (e.target as HTMLElement).tagName === 'INPUT';
                    if (isInput) return;
                    e.stopPropagation();
                    setActiveDragElement({
                      target: 'header-text',
                      startX: e.clientX,
                      startY: e.clientY,
                      initialX: doc.page.headerTextOffsetX || 0,
                      initialY: doc.page.headerTextOffsetY || 0
                    });
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setHdrFtrContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      target: 'header'
                    });
                  }}
                >
                  {/* Subtle drag prompt on hover */}
                  <div className="no-print absolute -top-3.5 left-1/2 -translate-x-1/2 opacity-0 group-hover/hdr:opacity-100 bg-indigo-600/90 text-[8px] text-white font-sans uppercase font-bold py-0.5 px-2 rounded-full shadow transition-all flex items-center gap-1 z-20 whitespace-nowrap">
                    <Move className="w-2.5 h-2.5" />
                    <span>Drag to reposition title (Right-click to style)</span>
                  </div>

                  <input
                    type="text"
                    value={doc.page.headerText ?? 'FAMILY TREE CHART'}
                    onChange={(e) => updatePageConfig({ headerText: e.target.value })}
                    placeholder="FAMILY TREE CHART"
                    className="bg-transparent text-center font-sans tracking-widest uppercase font-semibold block w-full shadow-none text-ellipsis outline-none border border-transparent hover:border-slate-300 focus:bg-white/95 focus:border-indigo-500 px-1 py-0.5 rounded"
                    style={{
                      fontSize: doc.page.headerTextSize ? `${doc.page.headerTextSize}px` : '16px',
                      color: doc.page.headerTextColor || '#000000',
                      fontFamily: doc.page.headerTextFont || 'inherit',
                    }}
                  />
                  <input
                    type="text"
                    value={doc.page.headerSubText ?? 'Genealogy & Org Relations Line-only Sheet'}
                    onChange={(e) => updatePageConfig({ headerSubText: e.target.value })}
                    placeholder="Genealogy & Org Relations Line-only Sheet"
                    className="bg-transparent text-center text-[10px] tracking-wider block w-full shadow-none mt-0.5 text-ellipsis outline-none border border-transparent hover:border-slate-300 focus:bg-white/95 focus:border-indigo-500 px-1 py-0.5 rounded"
                    style={{
                      fontSize: doc.page.headerTextSize ? `${Math.max(9, doc.page.headerTextSize * 0.6)}px` : '10px',
                      color: doc.page.headerTextColor || '#64748b',
                      fontFamily: doc.page.headerTextFont || 'inherit',
                      opacity: 0.75,
                    }}
                  />

                  {/* Resize handle */}
                  <div
                    className="no-print absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-indigo-500 cursor-se-resize opacity-0 group-hover/hdr:opacity-100 transition-opacity"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setActiveDragElement({
                        target: 'header-resize',
                        startX: e.clientX,
                        startY: e.clientY,
                        initialX: doc.page.headerTextWidth || 320,
                        initialY: doc.page.headerTextHeight || 80
                      });
                    }}
                  />
                </div>

                {/* Easy reset for image overlay in editor */}
                {doc.page.headerImage && (
                  <button
                    onClick={() => updatePageConfig({ headerImage: undefined, headerScale: 1, headerOffsetX: 0, headerOffsetY: 0 })}
                    className="no-print absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white rounded p-1 text-[9px] transition cursor-pointer z-10 shadow-md"
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
                className="w-full flex justify-center items-center shrink-0 border-t border-black md:border-dashed relative group overflow-hidden bg-white"
              >
                {doc.page.footerImage && (
                  <img
                    src={doc.page.footerImage}
                    alt="Footer Banner"
                    className="absolute inset-0 w-full h-full transition-transform duration-100 cursor-move select-none"
                    style={{
                      objectFit: doc.page.footerFit === 'stretch' ? 'fill' : doc.page.footerFit,
                      transform: `translate(${doc.page.footerOffsetX || 0}px, ${doc.page.footerOffsetY || 0}px) scale(${doc.page.footerScale || 1})`,
                      transformOrigin: 'center center'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setActiveDragElement({
                        target: 'footer-image',
                        startX: e.clientX,
                        startY: e.clientY,
                        initialX: doc.page.footerOffsetX || 0,
                        initialY: doc.page.footerOffsetY || 0
                      });
                    }}
                    referrerPolicy="no-referrer"
                  />
                )}

                {/* Draggable & Editable Footer Text Box */}
                <div
                  className="absolute text-center group/ftr cursor-move p-2 select-none border border-transparent hover:border-dashed hover:border-indigo-500/50 rounded z-10 flex flex-col items-center justify-center print:border-none print:p-0"
                  style={{
                    transform: `translate(${doc.page.footerTextOffsetX || 0}px, ${doc.page.footerTextOffsetY || 0}px)`,
                    width: doc.page.footerTextWidth ? `${doc.page.footerTextWidth}px` : '320px',
                    height: doc.page.footerTextHeight ? `${doc.page.footerTextHeight}px` : '80px',
                  }}
                  onMouseDown={(e) => {
                    const isInput = (e.target as HTMLElement).tagName === 'INPUT';
                    if (isInput) return;
                    e.stopPropagation();
                    setActiveDragElement({
                      target: 'footer-text',
                      startX: e.clientX,
                      startY: e.clientY,
                      initialX: doc.page.footerTextOffsetX || 0,
                      initialY: doc.page.footerTextOffsetY || 0
                    });
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setHdrFtrContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      target: 'footer'
                    });
                  }}
                >
                  <div className="no-print absolute -top-3.5 left-1/2 -translate-x-1/2 opacity-0 group-hover/ftr:opacity-100 bg-indigo-600/90 text-[8px] text-white font-sans uppercase font-bold py-0.5 px-2 rounded-full shadow transition-all flex items-center gap-1 z-20 whitespace-nowrap">
                    <Move className="w-2.5 h-2.5" />
                    <span>Drag to move footer text (Right-click to style)</span>
                  </div>

                  <input
                    type="text"
                    value={doc.page.footerText ?? 'طراحی شده با رابوک'}
                    onChange={(e) => updatePageConfig({ footerText: e.target.value })}
                    placeholder="طراحی شده با رابوک"
                    className="bg-transparent text-center font-sans tracking-widest uppercase font-semibold block w-full shadow-none text-ellipsis outline-none border border-transparent hover:border-slate-300 focus:bg-white/95 focus:border-indigo-500 px-1 py-0.5 rounded"
                    style={{
                      fontSize: doc.page.footerTextSize ? `${doc.page.footerTextSize}px` : '14px',
                      color: doc.page.footerTextColor || '#000000',
                      fontFamily: doc.page.footerTextFont || 'inherit',
                    }}
                  />
                  <input
                    type="text"
                    value={doc.page.footerSubText ?? '© 2026'}
                    onChange={(e) => updatePageConfig({ footerSubText: e.target.value })}
                    placeholder="© 2026"
                    className="bg-transparent text-center text-[10px] tracking-wider block w-full shadow-none mt-0.5 text-ellipsis outline-none border border-transparent hover:border-slate-300 focus:bg-white/95 focus:border-indigo-500 px-1 py-0.5 rounded"
                    style={{
                      fontSize: doc.page.footerTextSize ? `${Math.max(9, doc.page.footerTextSize * 0.7)}px` : '10px',
                      color: doc.page.footerTextColor || '#64748b',
                      fontFamily: doc.page.footerTextFont || 'inherit',
                      opacity: 0.75,
                    }}
                  />

                  {/* Resize handle */}
                  <div
                    className="no-print absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-indigo-500 cursor-se-resize opacity-0 group-hover/ftr:opacity-100 transition-opacity"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setActiveDragElement({
                        target: 'footer-resize',
                        startX: e.clientX,
                        startY: e.clientY,
                        initialX: doc.page.footerTextWidth || 320,
                        initialY: doc.page.footerTextHeight || 80
                      });
                    }}
                  />
                </div>

                {doc.page.footerImage && (
                  <button
                    onClick={() => updatePageConfig({ footerImage: undefined, footerScale: 1, footerOffsetX: 0, footerOffsetY: 0 })}
                    className="no-print absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white rounded p-1 text-[9px] transition cursor-pointer z-10 shadow-md"
                  >
                    {t.removeImage}
                  </button>
                )}
              </div>

            </div>
          </div>
        </main>

        {/* Resize Handle for right inspector sidebar */}
        {showInspector && !isMobile && !isTablet && (
          <div
            onMouseDown={handleInspectorResizeMouseDown}
            className={`no-print w-1 hover:w-1.5 transition-all cursor-col-resize h-full relative z-20 shrink-0 ${
              isResizingInspector 
                ? 'bg-indigo-500 w-1.5' 
                : isDark ? 'bg-white/5 hover:bg-indigo-500/50' : 'bg-slate-200 hover:bg-indigo-500/50'
            }`}
          />
        )}

        {/* 4. DETAILS PROPERTY INSPECTOR (no-print) */}
        {showInspector && (
          <aside 
            className={`no-print select-none border-l flex flex-col p-4 shrink-0 gap-5 max-h-screen overflow-y-auto transition-all duration-300 ${
              (isMobile || isTablet) ? 'fixed right-0 top-0 bottom-0 z-30 h-full shadow-2xl' : 'relative z-10 h-full'
            } ${
              isDark
                ? 'bg-slate-900/95 border-white/5 text-slate-100'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
            style={{ 
              width: showInspector ? `${(isMobile || isTablet) ? 290 : inspectorWidth}px` : '0px', 
              display: showInspector ? 'flex' : 'none' 
            }}
          >
            {/* Mobile/Tablet close button */}
            {(isMobile || isTablet) && (
              <button 
                onClick={() => setShowInspector(false)}
                className={`absolute top-2 left-2 p-1.5 rounded-full transition cursor-pointer ${
                  isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Node edits */}
            {selectedNode ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Type className="w-3 h-3 text-indigo-500" />
                    <span>{t.properties}</span>
                  </h3>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                    isDark ? 'bg-slate-950 text-indigo-300' : 'bg-slate-100 text-indigo-700 font-bold border border-slate-200'
                  }`}>
                    {selectedNode.id}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.nodeText}</label>
                    <input
                      type="text"
                      value={selectedNode.label}
                      onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                      className={`w-full border rounded-md p-2 text-xs transition ${
                        isDark ? 'bg-slate-950 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                      }`}
                      placeholder="Enter node title"
                    />
                  </div>

                  <div>
                    <label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.nodeSubText}</label>
                    <input
                      type="text"
                      value={selectedNode.subLabel || ''}
                      onChange={(e) => updateNode(selectedNode.id, { subLabel: e.target.value })}
                      className={`w-full border rounded-md p-2 text-xs transition ${
                        isDark ? 'bg-slate-950 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                      }`}
                      placeholder="e.g. b. 1956 - d.2023"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.fontSize}</label>
                      <input
                        type="number"
                        min="8"
                        max="24"
                        value={selectedNode.fontSize}
                        onChange={(e) => updateNode(selectedNode.id, { fontSize: parseInt(e.target.value) || 12 })}
                        className={`w-full border rounded-md p-2 text-xs transition ${
                          isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.alignMode}</label>
                      <div className={`grid grid-cols-3 gap-0.5 p-1 rounded border h-9 transition ${
                        isDark ? 'bg-slate-950 border-white/10' : 'bg-slate-100 border-slate-200'
                      }`}>
                        <button
                          onClick={() => updateNode(selectedNode.id, { textAlign: 'left' })}
                          className={`p-1 rounded text-xs flex justify-center items-center cursor-pointer ${
                            selectedNode.textAlign === 'left' ? 'bg-indigo-600 text-white font-bold' : isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white text-slate-600'
                          }`}
                          title="Align Left"
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateNode(selectedNode.id, { textAlign: 'center' })}
                          className={`p-1 rounded text-xs flex justify-center items-center cursor-pointer ${
                            selectedNode.textAlign === 'center' ? 'bg-indigo-600 text-white font-bold' : isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white text-slate-600'
                          }`}
                          title="Align Center"
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateNode(selectedNode.id, { textAlign: 'right' })}
                          className={`p-1 rounded text-xs flex justify-center items-center cursor-pointer ${
                            selectedNode.textAlign === 'right' ? 'bg-indigo-600 text-white font-bold' : isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white text-slate-600'
                          }`}
                          title="Align Right"
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.cardStyle}</label>
                    <select
                      value={selectedNode.style || 'rectangle'}
                      onChange={(e) => updateNode(selectedNode.id, { style: e.target.value as NodeStyle })}
                      className={`w-full border rounded-md p-2 text-xs transition ${
                        isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800 font-medium'
                      }`}
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
                  <h3 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Link className="w-3 h-3 text-indigo-505" />
                    <span>Connection details</span>
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className={`text-[11px] mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.linePathType}</label>
                    <div className={`grid grid-cols-2 gap-1 p-0.5 rounded border transition ${
                      isDark ? 'bg-slate-950 border-white/10' : 'bg-slate-100 border-slate-200'
                    }`}>
                      <button
                        onClick={() => updateEdgeType(selectedEdge.id, 'straight')}
                        className={`py-1.5 rounded text-xs transition-all cursor-pointer ${
                          selectedEdge.type === 'straight' ? 'bg-indigo-600 text-white font-bold' : isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white text-slate-600'
                        }`}
                      >
                        {t.straight}
                      </button>
                      <button
                        onClick={() => updateEdgeType(selectedEdge.id, 'elbow')}
                        className={`py-1.5 rounded text-xs transition-all cursor-pointer ${
                          selectedEdge.type === 'elbow' ? 'bg-indigo-600 text-white font-bold' : isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white text-slate-600'
                        }`}
                      >
                        {t.elbow}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`text-[11px] mb-1 block flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
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
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Header & footer custom image builders */}
                <div className="mb-4">
                  <h3 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <ImageIcon className="w-3 h-3 text-indigo-500" />
                    <span>{t.properties}</span>
                  </h3>
                </div>

                <div className="flex flex-col gap-5">
                  {/* Header configuration */}
                  <div className={`p-3 rounded-lg border transition ${isDark ? 'bg-slate-950/45 border-white/5' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                    <span className="text-[11px] font-bold text-indigo-600 uppercase block mb-2">{t.sheetHeader}</span>
                    
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <label className={`text-[10px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.headerText}</label>
                          <input
                            type="text"
                            value={doc.page.headerText || ''}
                            onChange={(e) => updatePageConfig({ headerText: e.target.value })}
                            className={`w-full border rounded p-1.5 text-xs transition ${
                              isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'
                            }`}
                            placeholder="e.g. OUR FAMILY TREE"
                          />
                        </div>

                        <div>
                          <label className={`text-[10px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Header Subtitle</label>
                          <input
                            type="text"
                            value={doc.page.headerSubText || ''}
                            onChange={(e) => updatePageConfig({ headerSubText: e.target.value })}
                            className={`w-full border rounded p-1.5 text-xs transition ${
                              isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'
                            }`}
                            placeholder="e.g. Genealogy & Org Relations Chart"
                          />
                        </div>

                        {((doc.page.headerTextOffsetX ?? 0) !== 0 || (doc.page.headerTextOffsetY ?? 0) !== 0) && (
                          <button
                            onClick={() => updatePageConfig({ headerTextOffsetX: 0, headerTextOffsetY: 0 })}
                            className="text-[10px] py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded transition font-medium cursor-pointer"
                          >
                            Reset Title Coordinates
                          </button>
                        )}
                      </div>

                      <div>
                        <label className={`text-[10px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Built-in Designs / Presets</label>
                        <select
                          value={BUILTIN_LETTERHEADS.find(b => b.svg === doc.page.headerImage)?.id || (doc.page.headerImage ? 'custom' : 'none')}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'none') {
                              updatePageConfig({ headerImage: undefined, headerScale: 1, headerOffsetX: 0, headerOffsetY: 0 });
                            } else if (val === 'custom') {
                              // Let them upload or keep custom
                            } else {
                              const found = BUILTIN_LETTERHEADS.find(b => b.id === val);
                              if (found) {
                                updatePageConfig({ 
                                  headerImage: found.svg,
                                  headerScale: 1,
                                  headerOffsetX: 0,
                                  headerOffsetY: 0
                                });
                              }
                            }
                          }}
                          className={`w-full border rounded text-xs p-1.5 transition ${
                            isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800 font-medium'
                          }`}
                        >
                          <option value="none">None (Standard Text)</option>
                          <option value="custom">-- Custom File Upload --</option>
                          {BUILTIN_LETTERHEADS.map(preset => (
                            <option key={preset.id} value={preset.id}>{preset.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={`text-[10px] block mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.uploadHeader}</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('header', e)}
                          className="w-full text-[10px] cursor-pointer text-indigo-500"
                        />
                      </div>

                      {doc.page.headerImage && (
                        <div className="flex flex-col gap-2 bg-indigo-500/5 dark:bg-white/5 p-2 rounded border border-indigo-500/10 dark:border-white/5 mt-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-500 block">Position & Scale</span>
                          
                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <label className={`text-[9px] block mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Height (px)</label>
                              <input
                                type="number"
                                min="20"
                                max="200"
                                value={doc.page.headerHeight}
                                onChange={(e) => updatePageConfig({ headerHeight: parseInt(e.target.value) || 40 })}
                                className={`w-full border rounded text-[11px] p-1 transition ${
                                  isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'
                                }`}
                              />
                            </div>
                            <div>
                              <label className={`text-[9px] block mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fit Mode</label>
                              <select
                                value={doc.page.headerFit}
                                onChange={(e) => updatePageConfig({ headerFit: e.target.value as ImageFit })}
                                className={`w-full border rounded text-[11px] p-1 transition ${
                                  isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-804 font-medium'
                                }`}
                              >
                                <option value="contain">Contain</option>
                                <option value="cover">Cover</option>
                                <option value="stretch">Stretch</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[9px] mb-0.5">
                              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Zoom Scale</span>
                              <span className="font-mono text-indigo-500">{(doc.page.headerScale ?? 1).toFixed(2)}x</span>
                            </div>
                            <input
                              type="range"
                              min="0.2"
                              max="3.0"
                              step="0.05"
                              value={doc.page.headerScale ?? 1}
                              onChange={(e) => updatePageConfig({ headerScale: parseFloat(e.target.value) })}
                              className="w-full h-1 accent-indigo-500 cursor-pointer bg-slate-200 dark:bg-slate-800 rounded-lg"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="flex justify-between text-[9px] mb-0.5">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Move X</span>
                                <span className="font-mono text-indigo-500">{doc.page.headerOffsetX ?? 0}px</span>
                              </div>
                              <input
                                type="range"
                                min="-400"
                                max="400"
                                step="5"
                                value={doc.page.headerOffsetX ?? 0}
                                onChange={(e) => updatePageConfig({ headerOffsetX: parseInt(e.target.value) })}
                                className="w-full h-1 accent-indigo-500 cursor-pointer bg-slate-200 dark:bg-slate-800 rounded-lg"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[9px] mb-0.5">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Move Y</span>
                                <span className="font-mono text-indigo-500">{doc.page.headerOffsetY ?? 0}px</span>
                              </div>
                              <input
                                type="range"
                                min="-150"
                                max="150"
                                step="2"
                                value={doc.page.headerOffsetY ?? 0}
                                onChange={(e) => updatePageConfig({ headerOffsetY: parseInt(e.target.value) })}
                                className="w-full h-1 accent-indigo-500 cursor-pointer bg-slate-200 dark:bg-slate-800 rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer configuration */}
                  <div className={`p-3 rounded-lg border transition ${isDark ? 'bg-slate-950/45 border-white/5' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                    <span className="text-[11px] font-bold text-indigo-600 uppercase block mb-2">{t.sheetFooter}</span>
                    
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <label className={`text-[10px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.footerText}</label>
                          <input
                            type="text"
                            value={doc.page.footerText || ''}
                            onChange={(e) => updatePageConfig({ footerText: e.target.value })}
                            className={`w-full border rounded p-1.5 text-xs transition ${
                              isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'
                            }`}
                            placeholder="e.g. Confidential Chart"
                          />
                        </div>

                        <div>
                          <label className={`text-[10px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Footer Subtext</label>
                          <input
                            type="text"
                            value={doc.page.footerSubText || ''}
                            onChange={(e) => updatePageConfig({ footerSubText: e.target.value })}
                            className={`w-full border rounded p-1.5 text-xs transition ${
                              isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'
                            }`}
                            placeholder="e.g. © 2026"
                          />
                        </div>

                        {((doc.page.footerTextOffsetX ?? 0) !== 0 || (doc.page.footerTextOffsetY ?? 0) !== 0) && (
                          <button
                            onClick={() => updatePageConfig({ footerTextOffsetX: 0, footerTextOffsetY: 0 })}
                            className="text-[10px] py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded transition font-medium cursor-pointer"
                          >
                            Reset Footer Coordinates
                          </button>
                        )}
                      </div>

                      <div>
                        <label className={`text-[10px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Built-in Designs / Presets</label>
                        <select
                          value={BUILTIN_LETTERHEADS.find(b => b.svg === doc.page.footerImage)?.id || (doc.page.footerImage ? 'custom' : 'none')}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'none') {
                              updatePageConfig({ footerImage: undefined, footerScale: 1, footerOffsetX: 0, footerOffsetY: 0 });
                            } else if (val === 'custom') {
                              // Let them upload or keep custom
                            } else {
                              const found = BUILTIN_LETTERHEADS.find(b => b.id === val);
                              if (found) {
                                updatePageConfig({ 
                                  footerImage: found.svg,
                                  footerScale: 1,
                                  footerOffsetX: 0,
                                  footerOffsetY: 0
                                });
                              }
                            }
                          }}
                          className={`w-full border rounded text-xs p-1.5 transition ${
                            isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800 font-medium'
                          }`}
                        >
                          <option value="none">None (Standard Text)</option>
                          <option value="custom">-- Custom File Upload --</option>
                          {BUILTIN_LETTERHEADS.map(preset => (
                            <option key={preset.id} value={preset.id}>{preset.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={`text-[10px] block mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.uploadFooter}</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('footer', e)}
                          className="w-full text-[10px] cursor-pointer text-indigo-500"
                        />
                      </div>

                      {doc.page.footerImage && (
                        <div className="flex flex-col gap-2 bg-indigo-500/5 dark:bg-white/5 p-2 rounded border border-indigo-500/10 dark:border-white/5 mt-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-500 block">Position & Scale</span>
                          
                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <label className={`text-[9px] block mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Height (px)</label>
                              <input
                                type="number"
                                min="20"
                                max="200"
                                value={doc.page.footerHeight}
                                onChange={(e) => updatePageConfig({ footerHeight: parseInt(e.target.value) || 40 })}
                                className={`w-full border rounded text-[11px] p-1 transition ${
                                  isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'
                                }`}
                              />
                            </div>
                            <div>
                              <label className={`text-[9px] block mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fit Mode</label>
                              <select
                                value={doc.page.footerFit}
                                onChange={(e) => updatePageConfig({ footerFit: e.target.value as ImageFit })}
                                className={`w-full border rounded text-[11px] p-1 transition ${
                                  isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800 font-medium'
                                }`}
                              >
                                <option value="contain">Contain</option>
                                <option value="cover">Cover</option>
                                <option value="stretch">Stretch</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[9px] mb-0.5">
                              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Zoom Scale</span>
                              <span className="font-mono text-indigo-500">{(doc.page.footerScale ?? 1).toFixed(2)}x</span>
                            </div>
                            <input
                              type="range"
                              min="0.2"
                              max="3.0"
                              step="0.05"
                              value={doc.page.footerScale ?? 1}
                              onChange={(e) => updatePageConfig({ footerScale: parseFloat(e.target.value) })}
                              className="w-full h-1 accent-indigo-500 cursor-pointer bg-slate-200 dark:bg-slate-800 rounded-lg"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="flex justify-between text-[9px] mb-0.5">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Move X</span>
                                <span className="font-mono text-indigo-500">{doc.page.footerOffsetX ?? 0}px</span>
                              </div>
                              <input
                                type="range"
                                min="-400"
                                max="400"
                                step="5"
                                value={doc.page.footerOffsetX ?? 0}
                                onChange={(e) => updatePageConfig({ footerOffsetX: parseInt(e.target.value) })}
                                className="w-full h-1 accent-indigo-500 cursor-pointer bg-slate-200 dark:bg-slate-800 rounded-lg"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[9px] mb-0.5">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Move Y</span>
                                <span className="font-mono text-indigo-500">{doc.page.footerOffsetY ?? 0}px</span>
                              </div>
                              <input
                                type="range"
                                min="-150"
                                max="150"
                                step="2"
                                value={doc.page.footerOffsetY ?? 0}
                                onChange={(e) => updatePageConfig({ footerOffsetY: parseInt(e.target.value) })}
                                className="w-full h-1 accent-indigo-500 cursor-pointer bg-slate-200 dark:bg-slate-800 rounded-lg"
                              />
                            </div>
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

      {/* Style Context Menu for Header & Footer */}
      {hdrFtrContextMenu && (
        <>
          <div 
            className="fixed inset-0 z-50 no-print" 
            onClick={() => setHdrFtrContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setHdrFtrContextMenu(null);
            }}
          />
          <div
            className="fixed z-50 bg-slate-900 border border-slate-700/60 text-slate-200 rounded-xl shadow-2xl p-4 w-72 no-print flex flex-col gap-4 font-sans select-none"
            style={{
              left: `${Math.min(window.innerWidth - 300, hdrFtrContextMenu.x)}px`,
              top: `${Math.min(window.innerHeight - 380, hdrFtrContextMenu.y)}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Style {hdrFtrContextMenu.target === 'header' ? 'Header' : 'Footer'} Title
              </span>
              <button 
                onClick={() => setHdrFtrContextMenu(null)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Font Family Selection */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Font Family</span>
              <select
                value={
                  (() => {
                    const current = hdrFtrContextMenu.target === 'header' 
                      ? (doc.page.headerTextFont || 'inherit') 
                      : (doc.page.footerTextFont || 'inherit');
                    const standardFonts = [
                      'inherit',
                      'IranSansWeb, IRANSans, sans-serif',
                      "'B Nazanin', Tahoma, sans-serif",
                      "'IranNastaliq', 'IRANNastaliq', cursive",
                      'Tahoma, Geneva, sans-serif',
                      'Arial, Helvetica, sans-serif',
                      "'Times New Roman', serif",
                      'Georgia, serif',
                      "'Playfair Display', serif",
                      "'JetBrains Mono', monospace",
                      "'Space Grotesk', sans-serif"
                    ];
                    return standardFonts.includes(current) ? current : (current !== 'inherit' && current ? 'custom' : 'inherit');
                  })()
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== 'custom') {
                    updatePageConfig(
                      hdrFtrContextMenu.target === 'header'
                        ? { headerTextFont: val === 'inherit' ? undefined : val }
                        : { footerTextFont: val === 'inherit' ? undefined : val }
                    );
                  }
                }}
                className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none cursor-pointer hover:border-indigo-500 transition"
              >
                <option value="inherit">Default Sans (System)</option>
                <option value="IranSansWeb, IRANSans, sans-serif">IranSansWeb (Persian)</option>
                <option value="'B Nazanin', Tahoma, sans-serif">B Nazanin (Persian)</option>
                <option value="'IranNastaliq', 'IRANNastaliq', cursive">IranNastaliq (Persian Calligraphy)</option>
                <option value="Tahoma, Geneva, sans-serif">Tahoma (Persian & Arabic standard)</option>
                <option value="Arial, Helvetica, sans-serif">Arial / Helvetica</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Playfair Display', serif">Playfair Display (Elegant)</option>
                <option value="'JetBrains Mono', monospace">JetBrains Mono (Technical)</option>
                <option value="'Space Grotesk', sans-serif">Space Grotesk (Modern)</option>
                <option value="custom">Custom Font...</option>
              </select>

              {/* Text Input for Custom or Typed Font Family */}
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[9px] text-slate-400 font-medium">Or type any custom/installed font:</span>
                <input
                  type="text"
                  placeholder="e.g. 'B Nazanin', 'Segoe UI', Impact"
                  value={
                    (hdrFtrContextMenu.target === 'header' 
                      ? doc.page.headerTextFont 
                      : doc.page.footerTextFont) || ''
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    updatePageConfig(
                      hdrFtrContextMenu.target === 'header'
                        ? { headerTextFont: val || undefined }
                        : { footerTextFont: val || undefined }
                    );
                  }}
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500 transition font-mono"
                />
              </div>
            </div>

            {/* Font Size Selector */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Font Size</span>
                <span className="text-[10px] font-bold text-indigo-400">
                  {(hdrFtrContextMenu.target === 'header' ? doc.page.headerTextSize : doc.page.footerTextSize) || (hdrFtrContextMenu.target === 'header' ? 16 : 14)}px
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="10"
                  max="64"
                  value={
                    (hdrFtrContextMenu.target === 'header' ? doc.page.headerTextSize : doc.page.footerTextSize) || 
                    (hdrFtrContextMenu.target === 'header' ? 16 : 14)
                  }
                  onChange={(e) => {
                    const size = parseInt(e.target.value);
                    updatePageConfig(
                      hdrFtrContextMenu.target === 'header'
                        ? { headerTextSize: size }
                        : { footerTextSize: size }
                    );
                  }}
                  className="flex-1 h-1 accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="10"
                  max="64"
                  value={
                    (hdrFtrContextMenu.target === 'header' ? doc.page.headerTextSize : doc.page.footerTextSize) || 
                    (hdrFtrContextMenu.target === 'header' ? 16 : 14)
                  }
                  onChange={(e) => {
                    const size = parseInt(e.target.value) || 12;
                    updatePageConfig(
                      hdrFtrContextMenu.target === 'header'
                        ? { headerTextSize: size }
                        : { footerTextSize: size }
                    );
                  }}
                  className="w-12 text-center text-xs bg-slate-800 border border-slate-700 text-white rounded p-1 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Color selector palette */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Text Color</span>
              <div className="grid grid-cols-5 gap-2 items-center">
                {[
                  '#000000', '#475569', '#dc2626', '#4f46e5', '#059669', 
                  '#d97706', '#7c2d12', '#0f172a', '#64748b', '#ffffff'
                ].map((color) => {
                  const currColor = 
                    (hdrFtrContextMenu.target === 'header' ? doc.page.headerTextColor : doc.page.footerTextColor) || '#000000';
                  const active = currColor.toLowerCase() === color.toLowerCase();
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        updatePageConfig(
                          hdrFtrContextMenu.target === 'header'
                            ? { headerTextColor: color }
                            : { footerTextColor: color }
                        );
                      }}
                      className={`w-6 h-6 rounded-full border transition cursor-pointer hover:scale-110 ${
                        active ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  );
                })}
                {/* Custom Color Input */}
                <div className="relative group cursor-pointer w-6 h-6 rounded-full border border-slate-700 overflow-hidden flex items-center justify-center bg-slate-800">
                  <input
                    type="color"
                    value={
                      (hdrFtrContextMenu.target === 'header' ? doc.page.headerTextColor : doc.page.footerTextColor) || '#000000'
                    }
                    onChange={(e) => {
                      updatePageConfig(
                        hdrFtrContextMenu.target === 'header'
                          ? { headerTextColor: e.target.value }
                          : { footerTextColor: e.target.value }
                      );
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full h-full rounded-full" style={{
                    background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)'
                  }} />
                </div>
              </div>
            </div>

            {/* Quick Resets */}
            <button
              onClick={() => {
                if (hdrFtrContextMenu.target === 'header') {
                  updatePageConfig({
                    headerTextColor: undefined,
                    headerTextFont: undefined,
                    headerTextSize: undefined,
                    headerTextWidth: undefined,
                    headerTextHeight: undefined,
                    headerTextOffsetX: 0,
                    headerTextOffsetY: 0
                  });
                } else {
                  updatePageConfig({
                    footerTextColor: undefined,
                    footerTextFont: undefined,
                    footerTextSize: undefined,
                    footerTextWidth: undefined,
                    footerTextHeight: undefined,
                    footerTextOffsetX: 0,
                    footerTextOffsetY: 0
                  });
                }
                setHdrFtrContextMenu(null);
              }}
              className="mt-1 w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-[10px] text-slate-300 font-bold uppercase tracking-wider rounded-lg border border-slate-700 transition cursor-pointer"
            >
              Reset Configuration
            </button>
          </div>
        </>
      )}

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
          
          /* Force physical colored graphics printing background vectors */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Force standard landscape or portrait printing parameters on body and high level layout elements */
          body, html, #root, .min-h-screen, main, .flex-1 {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
            width: ${pageSize.width}px !important;
            height: ${pageSize.height}px !important;
            min-width: ${pageSize.width}px !important;
            max-width: ${pageSize.width}px !important;
            min-height: ${pageSize.height}px !important;
            max-height: ${pageSize.height}px !important;
            overflow: visible !important;
            display: block !important;
            position: relative !important;
            box-shadow: none !important;
            border: none !important;
          }
          
          .no-print {
            display: none !important;
            height: 0 !important;
            width: 0 !important;
            visibility: hidden !important;
          }
          
          .print-container {
            width: ${pageSize.width}px !important;
            height: ${pageSize.height}px !important;
            min-width: ${pageSize.width}px !important;
            max-width: ${pageSize.width}px !important;
            min-height: ${pageSize.height}px !important;
            max-height: ${pageSize.height}px !important;
            transform: none !important;
            box-shadow: none !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            padding: ${doc.page.margin}px !important;
            margin: 0 !important;
            background: #ffffff !important;
            border: none !important;
            z-index: 9999 !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            float: none !important;
          }

          /* Style text fields for printing: remove focus rings, borders, and placeholders */
          .print-container input,
          .print-container select,
          .print-container textarea {
            border: none !important;
            outline: none !important;
            background: transparent !important;
            box-shadow: none !important;
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
