import { useRef, useEffect, useCallback } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import type { GraphData, GraphEdge } from '../../types/graph';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stylesheet: any[];
  onNodeClick: (nodeId: string, position: { x: number; y: number }) => void;
  onEdgeClick: (edgeId: number, position: { x: number; y: number }) => void;
  onBackgroundClick: () => void;
  layoutParams: { nodeRepulsion: number; idealEdgeLength: number; gravity: number };
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
  layoutParams,
}: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const layoutParamsRef = useRef(layoutParams);
  layoutParamsRef.current = layoutParams;

  // Build elements
  const visibleNodeIds = new Set<string>();
  for (const e of visibleEdges) {
    visibleNodeIds.add(e.source);
    visibleNodeIds.add(e.target);
  }

  const nodeElements = graphData.nodes
    .filter(n => visibleNodeIds.has(n.id))
    .map(n => ({
      data: { id: n.id, label: n.label, type: n.type, category: n.category },
    }));

  const edgeElements = visibleEdges.map(e => ({
    data: {
      id: 'e' + e.id,
      source: e.source,
      target: e.target,
      color: graphData.edgeTypes[e.type]?.color ?? '#555',
      edgeType: e.type,
    },
  }));

  // Init cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...nodeElements, ...edgeElements],
      style: stylesheet as any,
      layout: {
        name: 'fcose',
        animate: true,
        animationDuration: 500,
        nodeRepulsion: () => layoutParamsRef.current.nodeRepulsion,
        edgeElasticity: 0.45,
        idealEdgeLength: () => layoutParamsRef.current.idealEdgeLength,
        gravity: layoutParamsRef.current.gravity,
        nodeDimensionsIncludeLabels: true,
      } as any,
      wheelSensitivity: 0.3,
    });

    cyRef.current = cy;

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const pos = node.renderedPosition();
      onNodeClick(node.id(), { x: pos.x, y: pos.y });
    });

    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      const mp = edge.renderedMidpoint();
      const idStr = (edge.id() as string).replace(/^e/, '');
      onEdgeClick(Number(idStr), { x: mp.x, y: mp.y });
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        onBackgroundClick();
      }
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update elements when visibleEdges change
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // Batch update
    cy.batch(() => {
      // Remove all existing
      cy.elements().remove();

      // Add new
      cy.add(nodeElements as any);
      cy.add(edgeElements as any);
    });

    // Re-layout
    cy.layout({
      name: 'fcose',
      animate: true,
      animationDuration: 500,
      nodeRepulsion: () => layoutParamsRef.current.nodeRepulsion,
      edgeElasticity: 0.45,
      idealEdgeLength: () => layoutParamsRef.current.idealEdgeLength,
      gravity: layoutParamsRef.current.gravity,
      nodeDimensionsIncludeLabels: true,
    } as any).run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleEdges]);

  // Update classes for selection/highlighting
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      cy.elements().removeClass('selected dimmed highlighted');

      if (selectedNodeId) {
        const selNode = cy.getElementById(selectedNodeId);
        selNode.addClass('selected');

        // Dim all, then un-dim neighbors
        cy.elements().addClass('dimmed');
        selNode.removeClass('dimmed');
        neighbors.forEach(nId => {
          cy.getElementById(nId).removeClass('dimmed');
        });
        // Highlight edges connecting to selected
        cy.edges().forEach(edge => {
          const src = edge.source().id();
          const tgt = edge.target().id();
          if (src === selectedNodeId || tgt === selectedNodeId) {
            edge.removeClass('dimmed').addClass('highlighted');
          }
        });
      } else if (selectedEdgeId !== null) {
        const selEdge = cy.getElementById('e' + selectedEdgeId);
        selEdge.addClass('highlighted');
      }
    });
  }, [selectedNodeId, selectedEdgeId, neighbors]);

  // Re-layout on param change
  const relayout = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.layout({
      name: 'fcose',
      animate: true,
      animationDuration: 500,
      nodeRepulsion: () => layoutParamsRef.current.nodeRepulsion,
      edgeElasticity: 0.45,
      idealEdgeLength: () => layoutParamsRef.current.idealEdgeLength,
      gravity: layoutParamsRef.current.gravity,
      nodeDimensionsIncludeLabels: true,
    } as any).run();
  }, []);

  useEffect(() => {
    relayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutParams.nodeRepulsion, layoutParams.idealEdgeLength, layoutParams.gravity]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: '#0e1012' }}
    />
  );
}
