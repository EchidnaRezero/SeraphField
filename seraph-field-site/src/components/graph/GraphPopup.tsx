import { useRef, useEffect } from 'react';
import type { GraphNode, GraphEdge, EdgeType, KgDocEntry } from '../../types/graph';

export interface GraphPopupProps {
  position: { x: number; y: number };
  type: 'node' | 'edge';
  nodeData?: GraphNode;
  edgeData?: GraphEdge;
  edgeTypeMeta?: EdgeType;
  documents: KgDocEntry[];
  onDocClick: (path: string) => void;
  onClose: () => void;
}

export function GraphPopup({
  position,
  type,
  nodeData,
  edgeData,
  edgeTypeMeta,
  documents,
  onDocClick,
  onClose,
}: GraphPopupProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Adjust position to stay in viewport
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (rect.right > vw) {
      el.style.left = `${position.x - rect.width - 10}px`;
    }
    if (rect.bottom > vh) {
      el.style.top = `${position.y - rect.height - 10}px`;
    }
  }, [position]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: position.x + 12,
    top: position.y + 12,
    zIndex: 100,
    minWidth: 220,
    maxWidth: 360,
  };

  return (
    <div
      ref={ref}
      style={style}
      className="border border-neon-cyan/60 bg-[#0a0a1a]/95 backdrop-blur-sm p-4 font-mono text-[0.8rem] text-text-main shadow-lg shadow-neon-cyan/10"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-neon-cyan/60 hover:text-neon-cyan text-sm leading-none"
      >
        x
      </button>

      {type === 'node' && nodeData && (
        <>
          <div className="text-neon-cyan font-bold text-[0.9rem] mb-1">{nodeData.label}</div>
          <div className="text-text-dim text-[0.68rem] uppercase tracking-wider mb-2">
            {nodeData.type} / {nodeData.category}
          </div>
          {nodeData.desc && (
            <p className="text-text-main/70 text-[0.75rem] mb-3 leading-relaxed">{nodeData.desc}</p>
          )}
        </>
      )}

      {type === 'edge' && edgeData && (
        <>
          <div className="text-neon-cyan font-bold text-[0.85rem] mb-1">
            {edgeTypeMeta?.label ?? edgeData.type}
          </div>
          {edgeData.label && (
            <div className="text-text-main/90 text-[0.78rem] mb-1">{edgeData.label}</div>
          )}
          {edgeData.detail && (
            <p className="text-text-main/60 text-[0.72rem] mb-3 leading-relaxed">{edgeData.detail}</p>
          )}
        </>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <div className="border-t border-neon-cyan/20 pt-2 mt-2">
          <div className="text-neon-cyan/50 text-[0.6rem] uppercase tracking-widest mb-1">
            Documents
          </div>
          {documents.map((doc, i) => (
            <button
              key={i}
              onClick={() => onDocClick(doc.path)}
              className="block w-full text-left text-text-main/80 hover:text-neon-cyan text-[0.72rem] py-0.5 transition-colors"
            >
              {doc.title} <span className="text-text-dim">&mdash; {doc.date}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
