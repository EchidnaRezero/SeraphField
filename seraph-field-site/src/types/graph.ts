export interface EdgeType {
  label: string;
  color: string;
  dash: string | null;
  reverseLabel: string | null;
}

export interface TagGroup {
  label: string;
  color: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'definition' | 'instance';
  category: string;
  desc: string | null;
}

export interface GraphEdge {
  id: number;
  source: string;
  target: string;
  type: string;
  tags: string[];
  label: string | null;
  detail: string | null;
}

export interface GraphData {
  edgeTypes: Record<string, EdgeType>;
  tagGroups: Record<string, TagGroup>;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface KgDocEntry {
  path: string;
  title: string;
  date: string;
}

export type KgDocsIndex = Record<string, KgDocEntry[]>;

export interface CategoryPalette {
  algebra: string;
  analysis: string;
  geometry: string;
  linalg: string;
  other: string;
  [key: string]: string;
}

export interface GraphTweaks {
  palette: string;
  drift: boolean;
  bgFx: boolean;
  scanlines: boolean;
}
