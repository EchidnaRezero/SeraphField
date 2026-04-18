import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
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
  isMobile?: boolean;
}

function PopupContent({
  type,
  nodeData,
  edges,
  documents,
  onDocClick,
}: Pick<GraphPopupProps, 'type' | 'nodeData' | 'edges' | 'documents' | 'onDocClick'>) {
  return (
    <>
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
    </>
  );
}

export function GraphPopup({
  position,
  type,
  nodeData,
  edges,
  documents,
  onDocClick,
  onClose,
  isMobile,
}: GraphPopupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [boxPos, setBoxPos] = useState(position);
  const [collapsed, setCollapsed] = useState(false);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setCollapsed(false);
    if (isMobile) {
      setBoxPos({ x: 10, y: 10 });
    } else {
      setBoxPos(position);
    }
  }, [position, isMobile]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useLayoutEffect(() => {
    if (isMobile || !ref.current) return;
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
  }, [position, type, nodeData, edges, isMobile]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - boxPos.x, y: e.clientY - boxPos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [boxPos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    setBoxPos({
      x: Math.max(0, e.clientX - dragOffset.current.x),
      y: Math.max(0, e.clientY - dragOffset.current.y),
    });
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const centerPopup = useCallback(() => {
    const parent = ref.current?.offsetParent as HTMLElement | null;
    const vw = parent ? parent.clientWidth : window.innerWidth;
    const vh = parent ? parent.clientHeight : window.innerHeight;
    const r = ref.current?.getBoundingClientRect();
    const w = r?.width ?? 280;
    const h = r?.height ?? 200;
    setBoxPos({ x: Math.max(0, (vw - w) / 2), y: Math.max(0, (vh - h) / 2) });
  }, []);

  return (
    <div
      ref={ref}
      className={`kg-popup ${collapsed ? 'is-collapsed' : ''}`}
      style={{ left: boxPos.x, top: boxPos.y }}
    >
      {isMobile && (
        <>
          <div
            className="kg-popup-drag"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
          <div className="kg-popup-toolbar">
            <button onClick={centerPopup} aria-label="중앙 이동" title="중앙">⊕</button>
            <button onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? '펼치기' : '접기'} title={collapsed ? '펼치기' : '접기'}>
              {collapsed ? '▼' : '▲'}
            </button>
            <button onClick={onClose} aria-label="닫기" title="닫기">×</button>
          </div>
        </>
      )}
      {!isMobile && (
        <button onClick={onClose} className="kg-popup-x" aria-label="닫기">×</button>
      )}
      <PopupContent type={type} nodeData={nodeData} edges={edges} documents={documents} onDocClick={onDocClick} />
    </div>
  );
}
