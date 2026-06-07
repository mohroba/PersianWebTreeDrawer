import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { TreeDocument, TreeNode, TreeEdge, PageConfig, EdgeType, NodeStyle } from '../types';
import { 
  FAMILY_TREE_TEMPLATE, 
  ORG_CHART_TEMPLATE, 
  BLANK_TEMPLATE,
  FAMILY_TREE_TEMPLATE_FA,
  ORG_CHART_TEMPLATE_FA,
  BLANK_TEMPLATE_FA
} from '../utils/sampleData';

export interface Project {
  id: string;
  name: string;
  updatedAt: string;
}

interface TreeContextType {
  document: TreeDocument;
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  connectingFromId: string | null;
  gridSnap: boolean;
  gridSize: number;
  zoom: number;
  pan: { x: number; y: number };
  undoStack: TreeDocument[];
  redoStack: TreeDocument[];
  canUndo: boolean;
  canRedo: boolean;
  
  projects: Project[];
  currentProjectId: string;
  createProject: (name: string, template?: 'family' | 'org' | 'blank') => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, newName: string) => void;
  setCurrentProjectId: (id: string) => void;
  
  // Selection Actions
  selectNode: (id: string, isMulti?: boolean) => void;
  selectEdge: (id: string, isMulti?: boolean) => void;
  clearSelection: () => void;
  
  // Node Actions
  addNode: (x?: number, y?: number, customId?: string, customLabel?: string) => void;
  addChildNode: (parentId: string, x: number, y: number, label?: string) => void;
  deleteNodeById: (id: string) => void;
  updateNode: (id: string, updates: Partial<TreeNode>) => void;
  deleteSelected: () => void;
  
  // Connection Actions
  startConnection: (fromId: string) => void;
  completeConnection: (toId: string) => void;
  cancelConnection: () => void;
  addEdge: (fromId: string, toId: string) => void;
  updateEdgeType: (id: string, type: EdgeType) => void;
  updateEdgeWidth: (id: string, strokeWidth: number) => void;
  
  // Page Settings
  updatePageConfig: (updates: Partial<PageConfig>) => void;
  
  // History & File Ops
  undo: () => void;
  redo: () => void;
  loadTemplate: (templateName: 'family' | 'org' | 'blank') => void;
  loadCustomJSON: (jsonString: string) => boolean;
  exportJSON: () => string;
  resetAll: () => void;
  lang: 'en' | 'fa';
  setLang: (lang: 'en' | 'fa') => void;
  
  // View Control
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setGridSnap: (snap: boolean) => void;
  setGridSize: (size: number) => void;
}

const TreeContext = createContext<TreeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'treesketch_pro_document_v1';

const loadProjectDoc = (projId: string, language: 'en' | 'fa'): TreeDocument => {
  try {
    const saved = localStorage.getItem(`treesketch_project_doc_${projId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.nodes && parsed.page) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse project document', e);
  }
  
  // Backward compatibility: check if there's old treesketch_pro_document_v1
  if (projId === 'proj-default') {
    try {
      const savedOld = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedOld) {
        const parsed = JSON.parse(savedOld);
        if (parsed.nodes && parsed.page) {
          return parsed;
        }
      }
    } catch (e) {}
  }

  return language === 'fa' ? FAMILY_TREE_TEMPLATE_FA : FAMILY_TREE_TEMPLATE;
};

export const TreeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<'en' | 'fa'>(() => {
    try {
      const savedLang = localStorage.getItem('treesketch_pro_lang');
      if (savedLang === 'fa' || savedLang === 'en') {
        return savedLang;
      }
    } catch (e) {}
    return 'fa'; // Default to Persian RTL
  });

  const setLang = useCallback((newLang: 'en' | 'fa') => {
    setLangState(newLang);
    try {
      localStorage.setItem('treesketch_pro_lang', newLang);
    } catch (e) {}
  }, []);

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('treesketch_projects_list_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved projects', e);
    }
    return [{ id: 'proj-default', name: 'شجره‌نامه من (My Family Tree)', updatedAt: new Date().toISOString() }];
  });

  const [currentProjectId, setCurrentProjectIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('treesketch_current_project_id_v2');
      if (saved) {
        return saved;
      }
    } catch (e) {}
    return 'proj-default';
  });

  const [document, setDocumentState] = useState<TreeDocument>(() => {
    return loadProjectDoc(currentProjectId, lang);
  });

  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  
  const [gridSnap, setGridSnap] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(10);
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // History stack
  const [undoStack, setUndoStack] = useState<TreeDocument[]>([]);
  const [redoStack, setRedoStack] = useState<TreeDocument[]>([]);

  // Ref to hold the latest document status to prevent circular state dependencies
  const documentRef = useRef<TreeDocument>(document);
  const projectsRef = useRef<Project[]>(projects);

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    documentRef.current = document;

    // Check if the current project actually exists in projects list before saving
    const projectExists = projectsRef.current.some((p) => p.id === currentProjectId);
    if (!projectExists && projectsRef.current.length > 0) {
      return;
    }

    // Auto-save active document
    try {
      localStorage.setItem(`treesketch_project_doc_${currentProjectId}`, JSON.stringify(document));
      // For backwards compatibility
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(document));
    } catch (e) {
      console.error('Failed to save document to localStorage', e);
    }

    // Update the updatedAt timestamp for this project in the list
    setProjects((prevProjects) => {
      const existingProj = prevProjects.find((p) => p.id === currentProjectId);
      if (existingProj) {
        const updated = prevProjects.map((p) => {
          if (p.id === currentProjectId) {
            return { ...p, updatedAt: new Date().toISOString() };
          }
          return p;
        });
        try {
          localStorage.setItem('treesketch_projects_list_v2', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      }
      return prevProjects;
    });
  }, [document, currentProjectId]);

  // Helper to commit current state to history before conducting an update
  const pushToHistory = useCallback((currentDoc: TreeDocument) => {
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(currentDoc))]);
    setRedoStack([]); // Clear redo stack on new action
  }, []);

  const setDocumentAndHistory = useCallback((newDoc: TreeDocument) => {
    pushToHistory(documentRef.current);
    setDocumentState(newDoc);
  }, [pushToHistory]);

  const selectNode = useCallback((id: string, isMulti = false) => {
    if (isMulti) {
      setSelectedNodeIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
      setSelectedEdgeIds([]);
    } else {
      setSelectedNodeIds([id]);
      setSelectedEdgeIds([]);
    }
  }, []);

  const selectEdge = useCallback((id: string, isMulti = false) => {
    if (isMulti) {
      setSelectedEdgeIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
      setSelectedNodeIds([]);
    } else {
      setSelectedEdgeIds([id]);
      setSelectedNodeIds([]);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodeIds([]);
    setSelectedEdgeIds([]);
    setConnectingFromId(null);
  }, []);

  const addNode = useCallback((x = 150, y = 150, customId?: string, customLabel?: string) => {
    const newId = customId || `node-${Date.now()}`;
    const newNode: TreeNode = {
      id: newId,
      label: customLabel || 'New Node',
      subLabel: 'Sub description',
      x: gridSnap ? Math.round(x / gridSize) * gridSize : x,
      y: gridSnap ? Math.round(y / gridSize) * gridSize : y,
      width: 130,
      height: 45,
      fontSize: 12,
      textAlign: 'center'
    };

    setDocumentAndHistory({
      ...documentRef.current,
      nodes: [...documentRef.current.nodes, newNode]
    });
    setSelectedNodeIds([newId]);
    setSelectedEdgeIds([]);
  }, [gridSnap, gridSize, setDocumentAndHistory]);

  const addChildNode = useCallback((parentId: string, x: number, y: number, label = 'New Node') => {
    const newId = `node-${Date.now()}`;
    const newEdgeId = `edge-${Date.now()}`;
    const snappedX = gridSnap ? Math.round(x / gridSize) * gridSize : x;
    const snappedY = gridSnap ? Math.round(y / gridSize) * gridSize : y;
    const newNode: TreeNode = {
      id: newId,
      label,
      subLabel: '',
      x: snappedX,
      y: snappedY,
      width: 130,
      height: 45,
      fontSize: 12,
      textAlign: 'center'
    };
    const newEdge: TreeEdge = { id: newEdgeId, from: parentId, to: newId, type: 'elbow', strokeWidth: 1.5 };
    setDocumentAndHistory({
      ...documentRef.current,
      nodes: [...documentRef.current.nodes, newNode],
      edges: [...documentRef.current.edges, newEdge]
    });
    setSelectedNodeIds([newId]);
    setSelectedEdgeIds([]);
  }, [gridSnap, gridSize, setDocumentAndHistory]);

  const deleteNodeById = useCallback((id: string) => {
    pushToHistory(documentRef.current);
    setDocumentState((prev) => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== id),
      edges: prev.edges.filter(e => e.from !== id && e.to !== id)
    }));
    setSelectedNodeIds(prev => prev.filter(nid => nid !== id));
  }, [pushToHistory]);

  const updateNode = useCallback((id: string, updates: Partial<TreeNode>) => {
    // Note: To avoid committing heavy history frames for high-frequency dragging, 
    // the actual drag caller should push to history ON MOUSE DOWN or ON DRAG END.
    // This function acts as a pure state updater.
    setDocumentState((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n))
    }));
  }, []);

  const deleteSelected = useCallback(() => {
    if (selectedNodeIds.length === 0 && selectedEdgeIds.length === 0) return;

    pushToHistory(documentRef.current);
    
    let updatedNodes = [...documentRef.current.nodes];
    let updatedEdges = [...documentRef.current.edges];

    if (selectedNodeIds.length > 0) {
      updatedNodes = updatedNodes.filter((n) => !selectedNodeIds.includes(n.id));
      // Delete connected edges automatically
      updatedEdges = updatedEdges.filter(
        (e) => !selectedNodeIds.includes(e.from) && !selectedNodeIds.includes(e.to)
      );
    }

    if (selectedEdgeIds.length > 0) {
      updatedEdges = updatedEdges.filter((e) => !selectedEdgeIds.includes(e.id));
    }

    setDocumentState((prev) => ({
      ...prev,
      nodes: updatedNodes,
      edges: updatedEdges
    }));

    setSelectedNodeIds([]);
    setSelectedEdgeIds([]);
    setConnectingFromId(null);
  }, [selectedNodeIds, selectedEdgeIds, pushToHistory]);

  const startConnection = useCallback((fromId: string) => {
    setConnectingFromId(fromId);
  }, []);

  const completeConnection = useCallback((toId: string) => {
    if (!connectingFromId || connectingFromId === toId) {
      setConnectingFromId(null);
      return;
    }

    // Check if edge already exists
    const exists = documentRef.current.edges.some(
      (e) => (e.from === connectingFromId && e.to === toId) || (e.from === toId && e.to === connectingFromId)
    );

    if (exists) {
      setConnectingFromId(null);
      return;
    }

    const newEdge: TreeEdge = {
      id: `edge-${Date.now()}`,
      from: connectingFromId,
      to: toId,
      type: 'elbow',
      strokeWidth: 1.5
    };

    setDocumentAndHistory({
      ...documentRef.current,
      edges: [...documentRef.current.edges, newEdge]
    });

    setConnectingFromId(null);
  }, [connectingFromId, setDocumentAndHistory]);

  const cancelConnection = useCallback(() => {
    setConnectingFromId(null);
  }, []);

  const addEdge = useCallback((fromId: string, toId: string) => {
    // Check if edge already exists
    const exists = documentRef.current.edges.some(
      (e) => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId)
    );

    if (exists) return;

    const newEdge: TreeEdge = {
      id: `edge-${Date.now()}`,
      from: fromId,
      to: toId,
      type: 'elbow',
      strokeWidth: 1.5
    };

    setDocumentAndHistory({
      ...documentRef.current,
      edges: [...documentRef.current.edges, newEdge]
    });
  }, [setDocumentAndHistory]);

  const updateEdgeType = useCallback((id: string, type: EdgeType) => {
    setDocumentAndHistory({
      ...documentRef.current,
      edges: documentRef.current.edges.map((e) => (e.id === id ? { ...e, type } : e))
    });
  }, [setDocumentAndHistory]);

  const updateEdgeWidth = useCallback((id: string, strokeWidth: number) => {
    setDocumentAndHistory({
      ...documentRef.current,
      edges: documentRef.current.edges.map((e) => (e.id === id ? { ...e, strokeWidth } : e))
    });
  }, [setDocumentAndHistory]);

  const updatePageConfig = useCallback((updates: Partial<PageConfig>) => {
    setDocumentAndHistory({
      ...documentRef.current,
      page: {
        ...documentRef.current.page,
        ...updates
      }
    });
  }, [setDocumentAndHistory]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [JSON.parse(JSON.stringify(documentRef.current)), ...prev]);
    setDocumentState(previous);
  }, [undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack((prev) => prev.slice(1));
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(documentRef.current))]);
    setDocumentState(next);
  }, [redoStack]);

  const loadTemplate = useCallback((templateName: 'family' | 'org' | 'blank') => {
    pushToHistory(documentRef.current);
    if (lang === 'fa') {
      if (templateName === 'family') {
        setDocumentState(FAMILY_TREE_TEMPLATE_FA);
      } else if (templateName === 'org') {
        setDocumentState(ORG_CHART_TEMPLATE_FA);
      } else {
        setDocumentState(BLANK_TEMPLATE_FA);
      }
    } else {
      if (templateName === 'family') {
        setDocumentState(FAMILY_TREE_TEMPLATE);
      } else if (templateName === 'org') {
        setDocumentState(ORG_CHART_TEMPLATE);
      } else {
        setDocumentState(BLANK_TEMPLATE);
      }
    }
    setSelectedNodeIds([]);
    setSelectedEdgeIds([]);
    setConnectingFromId(null);
  }, [pushToHistory, lang]);

  const loadCustomJSON = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object' && parsed.page && Array.isArray(parsed.nodes)) {
        pushToHistory(documentRef.current);
        setDocumentState(parsed);
        setSelectedNodeIds([]);
        setSelectedEdgeIds([]);
        setConnectingFromId(null);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }, [pushToHistory]);

  const exportJSON = useCallback(() => {
    return JSON.stringify(document, null, 2);
  }, [document]);

  const resetAll = useCallback(() => {
    pushToHistory(documentRef.current);
    setDocumentState(lang === 'fa' ? BLANK_TEMPLATE_FA : BLANK_TEMPLATE);
    setSelectedNodeIds([]);
    setSelectedEdgeIds([]);
    setConnectingFromId(null);
  }, [pushToHistory, lang]);

  const setCurrentProjectId = useCallback((id: string) => {
    try {
      localStorage.setItem('treesketch_current_project_id_v2', id);
    } catch (e) {}
    setCurrentProjectIdState(id);
    
    // Clear selection, undo/redo stacks when switching projects
    setSelectedNodeIds([]);
    setSelectedEdgeIds([]);
    setConnectingFromId(null);
    setUndoStack([]);
    setRedoStack([]);
    
    const docForProj = loadProjectDoc(id, lang);
    setDocumentState(docForProj);
  }, [lang]);

  const createProject = useCallback((name: string, template?: 'family' | 'org' | 'blank') => {
    const newId = `proj-${Date.now()}`;
    const newProject = {
      id: newId,
      name: name || `Project ${newId}`,
      updatedAt: new Date().toISOString()
    };
    
    let initialDoc = lang === 'fa' ? FAMILY_TREE_TEMPLATE_FA : FAMILY_TREE_TEMPLATE;
    if (template === 'org') {
      initialDoc = lang === 'fa' ? ORG_CHART_TEMPLATE_FA : ORG_CHART_TEMPLATE;
    } else if (template === 'blank') {
      initialDoc = lang === 'fa' ? BLANK_TEMPLATE_FA : BLANK_TEMPLATE;
    }

    try {
      localStorage.setItem(`treesketch_project_doc_${newId}`, JSON.stringify(initialDoc));
    } catch (e) {
      console.error(e);
    }

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    try {
      localStorage.setItem('treesketch_projects_list_v2', JSON.stringify(updatedProjects));
    } catch (e) {}

    setCurrentProjectId(newId);
  }, [projects, lang, setCurrentProjectId]);

  const deleteProject = useCallback((id: string) => {
    if (projects.length <= 1) {
      // Create a blank project if the last one is deleted
      const newId = 'proj-default';
      const defaultedProj = [{ id: newId, name: 'شجره‌نامه من (My Family Tree)', updatedAt: new Date().toISOString() }];
      setProjects(defaultedProj);
      try {
        localStorage.removeItem(`treesketch_project_doc_${id}`);
        localStorage.setItem('treesketch_projects_list_v2', JSON.stringify(defaultedProj));
      } catch (e) {}
      setCurrentProjectId(newId);
      return;
    }

    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
    try {
      localStorage.removeItem(`treesketch_project_doc_${id}`);
      localStorage.setItem('treesketch_projects_list_v2', JSON.stringify(updatedProjects));
    } catch (e) {}

    if (currentProjectId === id) {
      const nextProj = updatedProjects[0];
      setCurrentProjectId(nextProj.id);
    }
  }, [projects, currentProjectId, setCurrentProjectId]);

  const renameProject = useCallback((id: string, newName: string) => {
    const updatedProjects = projects.map(p => {
      if (p.id === id) {
        return { ...p, name: newName, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    setProjects(updatedProjects);
    try {
      localStorage.setItem('treesketch_projects_list_v2', JSON.stringify(updatedProjects));
    } catch (e) {}
  }, [projects]);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  return (
    <TreeContext.Provider
      value={{
        document,
        selectedNodeIds,
        selectedEdgeIds,
        connectingFromId,
        gridSnap,
        gridSize,
        zoom,
        pan,
        undoStack,
        redoStack,
        canUndo,
        canRedo,
        
        projects,
        currentProjectId,
        createProject,
        deleteProject,
        renameProject,
        setCurrentProjectId,
        
        selectNode,
        selectEdge,
        clearSelection,
        
        addNode,
        addChildNode,
        deleteNodeById,
        updateNode,
        deleteSelected,
        
        startConnection,
        completeConnection,
        cancelConnection,
        addEdge,
        updateEdgeType,
        updateEdgeWidth,
        
        updatePageConfig,
        
        undo,
        redo,
        loadTemplate,
        loadCustomJSON,
        exportJSON,
        resetAll,
        lang,
        setLang,
        
        setZoom,
        setPan,
        setGridSnap,
        setGridSize
      }}
    >
      {children}
    </TreeContext.Provider>
  );
};

export const useTree = () => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error('useTree must be used within a TreeProvider');
  }
  return context;
};
