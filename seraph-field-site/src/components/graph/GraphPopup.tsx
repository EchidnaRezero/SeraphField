import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import type { GraphNode, GraphEdge, EdgeType, KgDocEntry } from '../../types/graph';

export interface EdgeInfo {
  edge: GraphEdge;
  typeMeta?: EdgeType;
}

export interface GraphPopupProps {
  position: { x: number; y: number };
  type: 'node' | 'edge';
  nodeData?: GraphNode;
  edges: EdgeInfo[];
  documents: KgDocEntry[];
  onDocClick: (path: string) => void;
  onClose: () => void;
}

export function GraphPopup({
  position,
  type,
  nodeData,
  edges,
  documents,
  onDocClick,
  onClose,
}: GraphPopupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [boxPos, setBoxPos] = useState(position);

  useEffect(() => { setBoxPos(position); }, [position]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const parent = ref.current.offsetParent as HTMLElement | null;
    const vw = parent ? parent.clientWidth : window.innerWidth;
    const vh = parent ? parent.clientHeight : window.innerHeight;
    let nx = position.x + 16, ny = position.y + 16;
    if (nx + r.width > vw) nx = position.x - r.width - 16;
    if (ny + r.height > vh) ny = Math.max(10, position.y - r.height - 16);
    if (nx < 10) nx = 10;
    if (ny < 10) ny = 10;
    setBoxPos({ x: nx, y: ny });
  }, [position, type, nodeData, edges]);

  return (
    <div
      ref={ref}
      className="kg-popup"
      style={{ left: boxPos.x, top: boxPos.y }}
    >
      <button onClick={onClose} className="kg-popup-x" aria-label="닫기">×</button>

      {type === 'node' && nodeData && (
        <>
          <div className="kg-popup-head">
            <div className="kg-popup-badge" data-cat={nodeData.category}>
              {nodeData.type === 'definition' ? 'DEFINITION' : 'INSTANCE'}
            </div>
            <div className="kg-popup-cat">{nodeData.category.toUpperCase()}</div>
          </div>
          <h2 className="kg-popup-title">{nodeData.label}</h2>
          <div className="kg-popup-divider" />
          {nodeData.desc && <p className="kg-popup-desc">{nodeData.desc}</p>}
          <div className="kg-popup-meta">
            <div className="kg-popup-meta-row"><span>NODE_ID</span><code>{nodeData.id}</code></div>
          </div>
          {documents.length > 0 && (
            <div className="kg-popup-actions">
              {documents.map((doc, i) => (
                <button key={i} className="kg-btn kg-btn-primary" onClick={() => onDocClick(doc.path)}>
                  {doc.title} ▸
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {type === 'edge' && edges.length > 0 && (
        <>
          <div className="kg-popup-head">
            <div className="kg-popup-badge is-edge">
              EDGE · {edges.length} RELATION{edges.length > 1 ? 'S' : ''}
            </div>
          </div>
          <div className="kg-popup-divider" />
          <div className="kg-popup-edges">
            {edges.map(({ edge, typeMeta }) => (
              <div key={edge.id} className="kg-popup-edge">
                <span
                  className="kg-popup-edge-color"
                  style={{ background: typeMeta?.color ?? '#555' }}
                />
                <div>
                  <div className="kg-popup-edge-label">{typeMeta?.label ?? edge.type}</div>
                  {edge.label && <div className="kg-popup-edge-detail">{edge.label}</div>}
                </div>
              </div>
            ))}
          </div>
          {documents.length > 0 && (
            <>
              <div className="kg-popup-divider" />
              <div className="kg-popup-actions">
                {documents.map((doc, i) => (
                  <button key={i} className="kg-btn kg-btn-primary" onClick={() => onDocClick(doc.path)}>
                    {doc.title} ▸
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
