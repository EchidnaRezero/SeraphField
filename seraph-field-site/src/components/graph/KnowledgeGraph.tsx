import { useState, useMemo, useCallback } from 'react';
import type { Category } from '../../types';
import type { KgDocEntry } from '../../types/graph';
import { loadGraphData, loadKgDocs } from '../../features/graph/loadGraph';
import {
  computeNeighbors,
  computeVisibleEdges,
  type GraphFilters,
} from '../../features/graph/graphComputation';
import { buildGraphStylesheet } from './graphStyle';
import { GraphView } from './GraphView';
import { GraphSidebar } from './GraphSidebar';
import { GraphPopup } from './GraphPopup';
import { GraphSettingsPanel } from './GraphSettingsPanel';

export interface KnowledgeGraphProps {
  onBack: () => void;
  onOpenPost: (slug: string, category: Category) => void;
}

const graphData = loadGraphData();
const kgDocs = loadKgDocs();

export function KnowledgeGraph({ onBack, onOpenPost }: KnowledgeGraphProps) {
  // Filters: all enabled by default
  const [filters, setFilters] = useState<GraphFilters>(() => ({
    edgeTypes: new Set(Object.keys(graphData.edgeTypes)),
    nodeTypes: new Set(['definition', 'instance']),
  }));

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<number | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [hideIsolated, setHideIsolated] = useState(false);
  const [showReverse, setShowReverse] = useState(false);
  const [layoutParams, setLayoutParams] = useState({
    nodeRepulsion: 4500,
    idealEdgeLength: 120,
    gravity: 0.25,
  });

  const visibleEdges = useMemo(
    () => computeVisibleEdges(graphData.edges, filters, graphData.nodes),
    [filters],
  );

  const visibleNodes = useMemo(() => {
    if (!hideIsolated) return graphData.nodes;
    const connected = new Set<string>();
    for (const e of visibleEdges) {
      connected.add(e.source);
      connected.add(e.target);
    }
    return graphData.nodes.filter(n => connected.has(n.id));
  }, [visibleEdges, hideIsolated]);

  const neighbors = useMemo(
    () => (selectedNodeId ? computeNeighbors(selectedNodeId, visibleEdges) : new Set<string>()),
    [selectedNodeId, visibleEdges],
  );

  const stylesheet = useMemo(() => buildGraphStylesheet(graphData), []);

  // Documents for popup
  const popupDocuments = useMemo<KgDocEntry[]>(() => {
    if (selectedNodeId) return kgDocs[selectedNodeId] ?? [];
    if (selectedEdgeId !== null) {
      const edge = graphData.edges.find(e => e.id === selectedEdgeId);
      if (edge) {
        // Docs keyed by edge type or tags
        const docs: KgDocEntry[] = [];
        const seen = new Set<string>();
        for (const tag of edge.tags) {
          for (const d of kgDocs[tag] ?? []) {
            if (!seen.has(d.path)) { seen.add(d.path); docs.push(d); }
          }
        }
        // Also check by edge type key
        for (const d of kgDocs[edge.type] ?? []) {
          if (!seen.has(d.path)) { seen.add(d.path); docs.push(d); }
        }
        return docs;
      }
    }
    return [];
  }, [selectedNodeId, selectedEdgeId]);

  const selectedNode = selectedNodeId ? graphData.nodes.find(n => n.id === selectedNodeId) : undefined;
  const selectedEdge = selectedEdgeId !== null ? graphData.edges.find(e => e.id === selectedEdgeId) : undefined;
  const selectedEdgeTypeMeta = selectedEdge ? graphData.edgeTypes[selectedEdge.type] : undefined;

  const handleNodeClick = useCallback((nodeId: string, pos: { x: number; y: number }) => {
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
    setPopupPosition(pos);
  }, []);

  const handleEdgeClick = useCallback((edgeId: number, pos: { x: number; y: number }) => {
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
    setPopupPosition(pos);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setPopupPosition(null);
  }, []);

  const handleDocClick = useCallback((path: string) => {
    // path is like "THEORY/some-post.md" — extract slug
    const slug = path.replace(/\.md$/, '').replace(/^[A-Z]+\//, '');
    onOpenPost(slug, 'THEORY');
  }, [onOpenPost]);

  const handleRelayout = useCallback(() => {
    // Trigger re-layout by nudging a param slightly and back
    setLayoutParams(p => ({ ...p, gravity: p.gravity + 0.001 }));
    setTimeout(() => setLayoutParams(p => ({ ...p, gravity: p.gravity - 0.001 })), 50);
  }, []);

  return (
    <div className="relative w-full h-full flex">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-40 border border-neon-cyan/40 bg-hud-box px-3 py-1.5 font-mono text-[0.72rem] uppercase tracking-widest text-neon-cyan hover:bg-neon-cyan/15 transition-colors"
      >
        &larr; Back
      </button>

      {/* Sidebar */}
      <GraphSidebar
        graphData={graphData}
        filters={filters}
        onFiltersChange={setFilters}
        hideIsolated={hideIsolated}
        onHideIsolatedChange={setHideIsolated}
        showReverse={showReverse}
        onShowReverseChange={setShowReverse}
      />

      {/* Graph area */}
      <div className="relative flex-1 h-full">
        <GraphView
          graphData={{ ...graphData, nodes: visibleNodes }}
          visibleEdges={visibleEdges}
          selectedNodeId={selectedNodeId}
          selectedEdgeId={selectedEdgeId}
          neighbors={neighbors}
          stylesheet={stylesheet}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onBackgroundClick={handleBackgroundClick}
          layoutParams={layoutParams}
        />

        {/* Popup */}
        {popupPosition && (selectedNodeId || selectedEdgeId !== null) && (
          <GraphPopup
            position={popupPosition}
            type={selectedNodeId ? 'node' : 'edge'}
            nodeData={selectedNode}
            edgeData={selectedEdge}
            edgeTypeMeta={selectedEdgeTypeMeta}
            documents={popupDocuments}
            onDocClick={handleDocClick}
            onClose={handleBackgroundClick}
          />
        )}

        {/* Settings panel */}
        <GraphSettingsPanel
          layoutParams={layoutParams}
          onLayoutParamsChange={setLayoutParams}
          onRelayout={handleRelayout}
        />
      </div>
    </div>
  );
}
