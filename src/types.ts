export type PageSize = 'A4' | 'A3' | 'Letter' | 'Legal' | 'A5' | 'B5' | 'Custom';
export type Orientation = 'portrait' | 'landscape';
export type ImageFit = 'contain' | 'cover' | 'stretch';
export type EdgeType = 'straight' | 'elbow';
export type NodeStyle = 'rectangle' | 'text-only' | 'pill' | 'card';

export interface PageConfig {
  size: PageSize;
  customWidth?: number;
  customHeight?: number;
  orientation: Orientation;
  margin: number;
  headerHeight: number;
  footerHeight: number;
  headerImage?: string;
  footerImage?: string;
  headerFit: ImageFit;
  footerFit: ImageFit;
  headerText?: string;
  headerSubText?: string;
  footerText?: string;
  footerSubText?: string;
  headerScale?: number;
  headerOffsetX?: number;
  headerOffsetY?: number;
  footerScale?: number;
  footerOffsetX?: number;
  footerOffsetY?: number;
  headerTextOffsetX?: number;
  headerTextOffsetY?: number;
  headerTextWidth?: number;
  headerTextHeight?: number;
  headerTextColor?: string;
  headerTextFont?: string;
  headerTextSize?: number;
  footerTextWidth?: number;
  footerTextHeight?: number;
  footerTextOffsetX?: number;
  footerTextOffsetY?: number;
  footerTextColor?: string;
  footerTextFont?: string;
  footerTextSize?: number;
  defaultFontFamily?: string;
  defaultNodeStyle?: NodeStyle;
  defaultNodeColor?: string;
  defaultNodeBgColor?: string;
  defaultNodeTextColor?: string;
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
  fontFamily?: string;
  fontColor?: string;
  fontBold?: boolean;
  fontItalic?: boolean;
  fontUnderline?: boolean;
  footnote?: string;
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
