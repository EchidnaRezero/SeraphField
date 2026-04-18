import type { GraphEdge, GraphNode } from '../../types/graph';

export interface GraphFilters {
  edgeTypes: Set<string>;
  nodeTypes: Set<string>;
  activeTags: Set<string>;
}

export function computeNeighbors(nodeId: string, edges: GraphEdge[]): Set<string> {
  const neighbors = new Set<string>();
  for (const e of edges) {
    if (e.source === nodeId) neighbors.add(e.target);
    if (e.target === nodeId) neighbors.add(e.source);
  }
  return neighbors;
}

export function computeVisibleEdges(
  edges: GraphEdge[],
  filters: GraphFilters,
  nodes: GraphNode[],
): GraphEdge[] {
  const nodeTypeMap = new Map(nodes.map(n => [n.id, n.type]));
  return edges.filter(e => {
    if (!filters.edgeTypes.has(e.type)) return false;
    const srcType = nodeTypeMap.get(e.source);
    const tgtType = nodeTypeMap.get(e.target);
    if (!srcType || !filters.nodeTypes.has(srcType)) return false;
    if (!tgtType || !filters.nodeTypes.has(tgtType)) return false;
    if (filters.activeTags.size > 0) {
      if (!e.tags.some(t => filters.activeTags.has(t))) return false;
    }
    return true;
  });
}

export function computeComponents(nodeIds: string[], edges: GraphEdge[]): Set<string>[] {
  const parent = new Map<string, string>();
  for (const id of nodeIds) parent.set(id, id);

  function find(x: string): string {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)!)!);
      x = parent.get(x)!;
    }
    return x;
  }

  function union(a: string, b: string) {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }

  for (const e of edges) {
    if (parent.has(e.source) && parent.has(e.target)) {
      union(e.source, e.target);
    }
  }

  const groups = new Map<string, Set<string>>();
  for (const id of nodeIds) {
    const root = find(id);
    if (!groups.has(root)) groups.set(root, new Set());
    groups.get(root)!.add(id);
  }

  return [...groups.values()];
}
