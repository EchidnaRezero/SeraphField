import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Category } from '../../types';
import type { KgDocEntry, GraphTweaks, CategoryPalette } from '../../types/graph';
import { loadGraphData, loadKgDocs } from '../../features/graph/loadGraph';
import {
  computeNeighbors,
  computeVisibleEdges,
  type GraphFilters,
} from '../../features/graph/graphComputation';
import { buildGraphStylesheet, CATEGORY_PALETTES } from './graphStyle';
import { GraphView } from './GraphView';
import { GraphSidebar } from './GraphSidebar';
import { GraphMobileControls } from './GraphMobileControls';
import { GraphPopup, type EdgeInfo } from './GraphPopup';
import { GraphTweaksPanel } from './GraphTweaksPanel';
import { GraphBackground } from './GraphBackground';
import './graph.css';

export interface KnowledgeGraphProps {
  onBack: () => void;
  onOpenPost: (slug: string, category: Category) => void;
}

const graphData = loadGraphData();
const kgDocs = loadKgDocs();

export function KnowledgeGraph({ onBack, onOpenPost }: KnowledgeGraphProps) {
  const [isMobileLayout, setIsMobileLayout] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobileLayout(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [filters, setFilters] = useState<GraphFilters>(() => ({
    edgeTypes: new Set(Object.keys(graphData.edgeTypes)),
    nodeTypes: new Set(['definition', 'instance']),
    activeTags: new Set<string>(),
  }));

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<number | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [hideIsolated, setHideIsolated] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [tweaks, setTweaks] = useState<GraphTweaks>({
    palette: 'sibyl',
    drift: true,
    bgFx: true,
    scanlines: true,
  });

  const palette: CategoryPalette = CATEGORY_PALETTES[tweaks.palette] ?? CATEGORY_PALETTES.sibyl;

  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--cat-algebra', palette.algebra);
    r.style.setProperty('--cat-analysis', palette.analysis);
    r.style.setProperty('--cat-geometry', palette.geometry);
    r.style.setProperty('--cat-linalg', palette.linalg);
    r.style.setProperty('--cat-other', palette.other);
  }, [palette]);

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

  const stylesheet = useMemo(() => buildGraphStylesheet(graphData, palette), [palette]);

  const popupEdges = useMemo<EdgeInfo[]>(() => {
    if (selectedEdgeId === null) return [];
    const clicked = visibleEdges.find(e => e.id === selectedEdgeId);
    if (!clicked) return [];
    const pair = [clicked.source, clicked.target].sort().join('|');
    return visibleEdges
      .filter(e => [e.source, e.target].sort().join('|') === pair)
      .map(e => ({ edge: e, typeMeta: graphData.edgeTypes[e.type] }));
  }, [selectedEdgeId, visibleEdges]);

  const popupDocuments = useMemo<KgDocEntry[]>(() => {
    if (selectedNodeId) return kgDocs[selectedNodeId] ?? [];
    if (popupEdges.length > 0) {
      const docs: KgDocEntry[] = [];
      const seen = new Set<string>();
      for (const { edge } of popupEdges) {
        for (const tag of edge.tags) {
          for (const d of kgDocs[tag] ?? []) {
            if (!seen.has(d.path)) { seen.add(d.path); docs.push(d); }
          }
        }
        for (const d of kgDocs[edge.type] ?? []) {
          if (!seen.has(d.path)) { seen.add(d.path); docs.push(d); }
        }
      }
      return docs;
    }
    return [];
  }, [selectedNodeId, popupEdges]);

  const selectedNode = selectedNodeId ? graphData.nodes.find(n => n.id === selectedNodeId) : undefined;

  const handleNodeClick = useCallback((nodeId: string, pos: { x: number; y: number }) => {
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
    setPopupPosition(pos);
  }, []);

  const handleSearchSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
    setPopupPosition(null);
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
    const slug = path.replace(/\.md$/, '').replace(/^[A-Z]+\//, '');
    onOpenPost(slug, 'THEORY');
  }, [onOpenPost]);

  const graphViewProps = {
    graphData: { ...graphData, nodes: visibleNodes },
    visibleEdges,
    selectedNodeId,
    selectedEdgeId,
    neighbors,
    stylesheet,
    onNodeClick: handleNodeClick,
    onEdgeClick: handleEdgeClick,
    onBackgroundClick: handleBackgroundClick,
    driftOn: tweaks.drift,
  };

  const popup = popupPosition && (selectedNodeId || selectedEdgeId !== null) ? (
    <GraphPopup
      position={popupPosition}
      type={selectedNodeId ? 'node' : 'edge'}
      nodeData={selectedNode}
      edges={popupEdges}
      documents={popupDocuments}
      onDocClick={handleDocClick}
      onClose={handleBackgroundClick}
    />
  ) : null;

  if (isMobileLayout) {
    return (
      <div className="kg-root" style={{ flexDirection: 'column' }}>
        <div className="kg-main">
          <GraphBackground enabled={tweaks.bgFx} />
          <div className="kg-cy">
            <GraphView {...graphViewProps} />
          </div>

          <div className="kg-topbar" style={{ left: 16 }}>
            <button className="kg-back" onClick={onBack}>← BACK</button>
            <button
              className={`kg-chip-btn ${tweaks.drift ? 'is-on' : ''}`}
              onClick={() => setTweaks({ ...tweaks, drift: !tweaks.drift })}
            >◈ DRIFT</button>
          </div>

          <GraphMobileControls
            graphData={graphData}
            filters={filters}
            onFiltersChange={setFilters}
            hideIsolated={hideIsolated}
            onHideIsolatedChange={setHideIsolated}
            onSelectNode={handleSearchSelect}
            tweaks={tweaks}
            onTweaksChange={setTweaks}
          />

          {popup}
          {tweaks.scanlines && <div className="kg-scanlines" />}
        </div>
      </div>
    );
  }

  return (
    <div className="kg-root">
      <GraphSidebar
        graphData={graphData}
        filters={filters}
        onFiltersChange={setFilters}
        hideIsolated={hideIsolated}
        onHideIsolatedChange={setHideIsolated}
        onSelectNode={handleSearchSelect}
      />

      <div className="kg-main">
        <GraphBackground enabled={tweaks.bgFx} />
        <div className="kg-cy">
          <GraphView {...graphViewProps} />
        </div>

        <div className="kg-topbar">
          <button className="kg-back" onClick={onBack}>← BACK</button>
<div className="kg-topbar-right">
            <button
              className={`kg-chip-btn ${tweaks.drift ? 'is-on' : ''}`}
              onClick={() => setTweaks({ ...tweaks, drift: !tweaks.drift })}
            >◈ DRIFT</button>
            <button
              className={`kg-chip-btn ${tweaks.bgFx ? 'is-on' : ''}`}
              onClick={() => setTweaks({ ...tweaks, bgFx: !tweaks.bgFx })}
            >◉ BG_FX</button>
            <button
              className={`kg-chip-btn ${tweaksOpen ? 'is-on' : ''}`}
              onClick={() => setTweaksOpen(v => !v)}
            >⚙ TWEAKS</button>
          </div>
        </div>

        {popup}

        <GraphTweaksPanel
          open={tweaksOpen}
          onClose={() => setTweaksOpen(false)}
          tweaks={tweaks}
          onTweaksChange={setTweaks}
        />

        {tweaks.scanlines && <div className="kg-scanlines" />}
      </div>
    </div>
  );
}
