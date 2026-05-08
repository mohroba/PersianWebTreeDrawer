export type PageSize = 'A4' | 'A3' | 'Letter' | 'Legal';
export type Orientation = 'portrait' | 'landscape';
export type ImageFit = 'contain' | 'cover' | 'stretch';
export type EdgeType = 'straight' | 'elbow';
export type NodeStyle = 'rectangle' | 'text-only' | 'pill' | 'card';

export interface PageConfig {
  size: PageSize;
  orientation: Orientation;
  margin: number;
  headerHeight: number;
  footerHeight: number;
  headerImage?: string;
  footerImage?: string;
  headerFit: ImageFit;
  footerFit: ImageFit;
  headerText?: string;
  footerText?: string;
}

export interface TreeNode {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  textAlign: 'left' | 'center' | 'right';
  style?: NodeStyle;
  subLabel?: string; // Optional for multi-line professional genealogy/org details
}

export interface TreeEdge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  strokeWidth: number;
}

export interface TreeDocument {
  page: PageConfig;
  nodes: TreeNode[];
  edges: TreeEdge[];
}

export interface HistoryState {
  past: TreeDocument[];
  present: TreeDocument;
  future: TreeDocument[];
}
