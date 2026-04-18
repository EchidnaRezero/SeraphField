import { describe, it, expect } from 'vitest';
import { computeNeighbors, computeVisibleEdges, computeComponents } from '../src/features/graph/graphComputation';
import type { GraphEdge, GraphNode } from '../src/types/graph';

const nodes: GraphNode[] = [
  { id: 'A', label: 'A', type: 'definition', category: 'algebra', desc: null },
  { id: 'B', label: 'B', type: 'definition', category: 'algebra', desc: null },
  { id: 'C', label: 'C', type: 'instance', category: 'analysis', desc: null },
  { id: 'D', label: 'D', type: 'definition', category: 'geometry', desc: null },
];

const edges: GraphEdge[] = [
  { id: 1, source: 'A', target: 'B', type: 'strengthen', tags: [], label: null, detail: null },
  { id: 2, source: 'B', target: 'C', type: 'instance', tags: ['functor:free'], label: null, detail: null },
  { id: 3, source: 'A', target: 'C', type: 'dual', tags: [], label: null, detail: null },
];

describe('computeNeighbors', () => {
  it('returns direct neighbors', () => {
    expect(computeNeighbors('A', edges)).toEqual(new Set(['B', 'C']));
  });
  it('returns neighbors in both directions', () => {
    expect(computeNeighbors('C', edges)).toEqual(new Set(['B', 'A']));
  });
  it('returns empty for isolated', () => {
    expect(computeNeighbors('D', edges)).toEqual(new Set());
  });
});

describe('computeVisibleEdges', () => {
  it('returns all with no filter restriction', () => {
    const result = computeVisibleEdges(edges, { edgeTypes: new Set(['strengthen','instance','dual']), nodeTypes: new Set(['definition','instance']), activeTags: new Set() }, nodes);
    expect(result).toHaveLength(3);
  });
  it('filters by edge type', () => {
    const result = computeVisibleEdges(edges, { edgeTypes: new Set(['strengthen']), nodeTypes: new Set(['definition','instance']), activeTags: new Set() }, nodes);
    expect(result).toHaveLength(1);
  });
  it('filters by node type', () => {
    const result = computeVisibleEdges(edges, { edgeTypes: new Set(['strengthen','instance','dual']), nodeTypes: new Set(['definition']), activeTags: new Set() }, nodes);
    expect(result).toHaveLength(1);
  });

  it('filters by active tags (only edges with matching tag pass)', () => {
    const result = computeVisibleEdges(edges, {
      edgeTypes: new Set(['strengthen', 'instance', 'dual']),
      nodeTypes: new Set(['definition', 'instance']),
      activeTags: new Set(['functor:free']),
    }, nodes);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('filters by multiple active tags (OR logic)', () => {
    const edgesWithTags: GraphEdge[] = [
      ...edges,
      { id: 4, source: 'A', target: 'D', type: 'strengthen', tags: ['map:inclusion'], label: null, detail: null },
    ];
    const result = computeVisibleEdges(edgesWithTags, {
      edgeTypes: new Set(['strengthen', 'instance', 'dual']),
      nodeTypes: new Set(['definition', 'instance']),
      activeTags: new Set(['functor:free', 'map:inclusion']),
    }, nodes);
    expect(result).toHaveLength(2);
  });

  it('excludes edges whose source/target node is missing from nodeTypeMap', () => {
    const edgesWithUnknown: GraphEdge[] = [
      ...edges,
      { id: 5, source: 'A', target: 'UNKNOWN', type: 'strengthen', tags: [], label: null, detail: null },
    ];
    const result = computeVisibleEdges(edgesWithUnknown, {
      edgeTypes: new Set(['strengthen', 'instance', 'dual']),
      nodeTypes: new Set(['definition', 'instance']),
      activeTags: new Set(),
    }, nodes);
    expect(result).toHaveLength(3);
  });
});

describe('computeComponents', () => {
  it('finds connected components', () => {
    const components = computeComponents(nodes.map(n => n.id), edges);
    expect(components).toHaveLength(2);
    const big = components.find(c => c.size === 3);
    const small = components.find(c => c.size === 1);
    expect(big).toBeDefined();
    expect(small!.has('D')).toBe(true);
  });

  it('handles empty node list', () => {
    const components = computeComponents([], edges);
    expect(components).toHaveLength(0);
  });

  it('handles empty edge list', () => {
    const components = computeComponents(nodes.map(n => n.id), []);
    expect(components).toHaveLength(4);
  });

  it('handles single node', () => {
    const components = computeComponents(['A'], []);
    expect(components).toHaveLength(1);
    expect(components[0].has('A')).toBe(true);
  });
});
