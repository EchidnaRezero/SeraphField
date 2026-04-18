import { useRef, useEffect, useCallback, useMemo } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import type { GraphData, GraphEdge } from '../../types/graph';
import { computeNeighbors } from '../../features/graph/graphComputation';

let fcoseRegistered = false;
if (!fcoseRegistered) {
  cytoscape.use(fcose);
  fcoseRegistered = true;
}

export interface GraphViewProps {
  graphData: GraphData;
  visibleEdges: GraphEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: number | null;
  neighbors: Set<string>;
  stylesheet: any[];
  onNodeClick: (nodeId: string, position: { x: number; y: number }) => void;
  onEdgeClick: (edgeId: number, position: { x: number; y: number }) => void;
  onBackgroundClick: () => void;
  driftOn: boolean;
}

function buildFcoseOptions() {
  return {
    name: 'fcose',
    animate: true,
    animationDuration: 500,
    nodeRepulsion: () => 4500,
    edgeElasticity: 0.45,
    idealEdgeLength: () => 120,
    gravity: 0.25,
    nodeDimensionsIncludeLabels: true,
    fit: true,
    padding: 60,
  } as any;
}

function startDrift(cy: cytoscape.Core, intensity = 0.12): { stop: () => void } {
  const vels = new Map<string, { vx: number; vy: number }>();
  cy.nodes().forEach(n => {
    const a = Math.random() * Math.PI * 2;
    vels.set(n.id(), { vx: Math.cos(a) * intensity, vy: Math.sin(a) * intensity });
  });
  let running = true;
  let last = performance.now();
  const tick = (now: number) => {
    if (!running) return;
    const dt = Math.min(now - last, 100) / 50;
    last = now;
    cy.nodes().forEach(n => {
      if (n.grabbed()) return;
      const v = vels.get(n.id());
      if (!v) return;
      const p = n.position();
      n.position({ x: p.x + v.vx * dt, y: p.y + v.vy * dt });
      v.vx += (Math.random() - 0.5) * 0.03 * dt;
      v.vy += (Math.random() - 0.5) * 0.03 * dt;
      const s = Math.hypot(v.vx, v.vy);
      if (s > intensity) {
        v.vx = (v.vx / s) * intensity;
        v.vy = (v.vy / s) * intensity;
      }
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return { stop: () => { running = false; } };
}


export function GraphView({
  graphData,
  visibleEdges,
  selectedNodeId,
  selectedEdgeId,
  neighbors,
  stylesheet,
  onNodeClick,
  onEdgeClick,
  onBackgroundClick,
  driftOn,
}: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const driftRef = useRef<{ stop: () => void } | null>(null);
  const prevEdgesRef = useRef(visibleEdges);
  const prevNodesRef = useRef(graphData.nodes);

  const onNodeClickRef = useRef(onNodeClick);
  const onEdgeClickRef = useRef(onEdgeClick);
  const onBackgroundClickRef = useRef(onBackgroundClick);
  useEffect(() => { onNodeClickRef.current = onNodeClick; }, [onNodeClick]);
  useEffect(() => { onEdgeClickRef.current = onEdgeClick; }, [onEdgeClick]);
  useEffect(() => { onBackgroundClickRef.current = onBackgroundClick; }, [onBackgroundClick]);

  const pairCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of visibleEdges) {
      const key = [e.source, e.target].sort().join('|');
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [visibleEdges]);

  const nodeElements = useMemo(() =>
    graphData.nodes.map(n => ({
      data: { id: n.id, label: n.label, type: n.type, category: n.category, desc: n.desc },
    })),
    [graphData.nodes],
  );

  const edgeElements = useMemo(() =>
    visibleEdges.map(e => {
      const key = [e.source, e.target].sort().join('|');
      const isParallel = (pairCount.get(key) ?? 0) > 1;
      return {
        data: {
          id: 'e' + e.id,
          source: e.source,
          target: e.target,
          color: graphData.edgeTypes[e.type]?.color ?? '#555',
          edgeType: e.type,
          parallel: isParallel,
        },
      };
    }),
    [visibleEdges, pairCount, graphData.edgeTypes],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...nodeElements, ...edgeElements],
      style: stylesheet as any,
      layout: buildFcoseOptions(),
      wheelSensitivity: 0.3,
      minZoom: 0.3,
      maxZoom: 3,
      boxSelectionEnabled: false,
    });

    cyRef.current = cy;

    cy.one('layoutstop', () => {
      if (driftOn) driftRef.current = startDrift(cy);
    });

    cy.on('tap', 'node', (evt) => {
      const n = evt.target;
      const p = n.renderedPosition();
      onNodeClickRef.current(n.id(), { x: p.x, y: p.y });
    });

    cy.on('tap', 'edge', (evt) => {
      const e = evt.target;
      const m = e.renderedMidpoint();
      const id = Number((e.id() as string).replace(/^e/, ''));
      onEdgeClickRef.current(id, { x: m.x, y: m.y });
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) onBackgroundClickRef.current();
    });

    return () => {
      if (driftRef.current !== null) driftRef.current.stop();
      cy.destroy();
      cyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update stylesheet when palette changes
  useEffect(() => {
    if (!cyRef.current) return;
    cyRef.current.style(stylesheet);
  }, [stylesheet]);

  // Update elements on filter/node change (skip first mount)
  useEffect(() => {
    if (prevEdgesRef.current === visibleEdges && prevNodesRef.current === graphData.nodes) return;
    prevEdgesRef.current = visibleEdges;
    prevNodesRef.current = graphData.nodes;

    const cy = cyRef.current;
    if (!cy) return;

    if (driftRef.current !== null) {
      driftRef.current.stop();
      driftRef.current = null;
    }

    cy.batch(() => {
      cy.elements().remove();
      cy.add(nodeElements as any);
      cy.add(edgeElements as any);
    });

    const layout = cy.layout(buildFcoseOptions());
    cy.one('layoutstop', () => {
      if (driftOn) driftRef.current = startDrift(cy);
    });
    layout.run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleEdges, graphData.nodes]);

  // Selection highlighting
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      cy.elements().removeClass('selected dimmed highlighted neighbor');

      if (selectedNodeId) {
        const sn = cy.getElementById(selectedNodeId);
        sn.addClass('selected');
        cy.elements().addClass('dimmed');
        sn.removeClass('dimmed');
        const localNeighbors = computeNeighbors(selectedNodeId, visibleEdges);
        localNeighbors.forEach(id => {
          cy.getElementById(id).removeClass('dimmed').addClass('neighbor');
        });
        cy.edges().forEach(ed => {
          const s = ed.source().id(), t = ed.target().id();
          if (s === selectedNodeId || t === selectedNodeId) {
            ed.removeClass('dimmed').addClass('highlighted');
          }
        });
        cy.animate({ center: { eles: sn }, duration: 300 });
      } else if (selectedEdgeId !== null) {
        const se = cy.getElementById('e' + selectedEdgeId);
        if (se.length > 0) {
          cy.elements().addClass('dimmed');
          se.removeClass('dimmed').addClass('highlighted');
          cy.getElementById(se.source().id()).removeClass('dimmed');
          cy.getElementById(se.target().id()).removeClass('dimmed');
        }
      }
    });
  }, [selectedNodeId, selectedEdgeId, neighbors, visibleEdges]);

  // Drift toggle
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    if (driftOn && !driftRef.current) {
      driftRef.current = startDrift(cy);
    } else if (!driftOn && driftRef.current) {
      driftRef.current.stop();
      driftRef.current = null;
    }
  }, [driftOn]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
