import { useState, useMemo } from 'react';
import type { GraphData, GraphTweaks } from '../../types/graph';
import type { GraphFilters } from '../../features/graph/graphComputation';
import { CATEGORY_PALETTES } from './graphStyle';
import type { CategoryPalette } from '../../types/graph';
import { toggleSet } from './graphUtils';

export interface GraphMobileControlsProps {
  graphData: GraphData;
  filters: GraphFilters;
  onFiltersChange: (filters: GraphFilters) => void;
  hideIsolated: boolean;
  onHideIsolatedChange: (v: boolean) => void;
  onSelectNode: (nodeId: string) => void;
  tweaks: GraphTweaks;
  onTweaksChange: (tweaks: GraphTweaks) => void;
}

type PanelId = 'search' | 'filter' | 'tweaks' | null;

export function GraphMobileControls({
  graphData,
  filters,
  onFiltersChange,
  hideIsolated,
  onHideIsolatedChange,
  onSelectNode,
  tweaks,
  onTweaksChange,
}: GraphMobileControlsProps) {
  const [openPanel, setOpenPanel] = useState<PanelId>(null);
  const [query, setQuery] = useState('');

  const toggle = (id: PanelId) => setOpenPanel(prev => prev === id ? null : id);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return graphData.nodes
      .filter(n => n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, graphData.nodes]);

  const usedTags = useMemo(() => {
    const tags = new Set<string>();
    for (const e of graphData.edges) {
      for (const t of e.tags) tags.add(t);
    }
    return [...tags].sort();
  }, [graphData.edges]);

  const setTweakKey = <K extends keyof GraphTweaks>(k: K, v: GraphTweaks[K]) =>
    onTweaksChange({ ...tweaks, [k]: v });

  return (
    <>
      {/* Bottom-left — search */}
      <button
        onClick={() => toggle('search')}
        className={`kg-chip-btn ${openPanel === 'search' ? 'is-on' : ''}`}
        style={{ position: 'absolute', bottom: 20, left: 16, zIndex: 30, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
        aria-label="검색"
      >
        S
      </button>

      {/* Bottom-right — filter */}
      <button
        onClick={() => toggle('filter')}
        className={`kg-chip-btn ${openPanel === 'filter' ? 'is-on' : ''}`}
        style={{ position: 'absolute', bottom: 20, right: 16, zIndex: 30, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
        aria-label="필터"
      >
        F
      </button>

      {/* Top-right — tweaks */}
      <button
        onClick={() => toggle('tweaks')}
        className={`kg-chip-btn ${openPanel === 'tweaks' ? 'is-on' : ''}`}
        style={{ position: 'absolute', top: 60, right: 16, zIndex: 30, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
        aria-label="설정"
      >
        ⚙
      </button>

      {/* Panel */}
      {openPanel && (
        <div className="kg-tweaks" style={{
          ...(openPanel === 'search'
            ? { bottom: 68, left: 16, width: 240, top: 'auto' as const }
            : openPanel === 'filter'
            ? { bottom: 68, right: 16, width: 280, top: 'auto' as const, maxHeight: '60vh', overflowY: 'auto' as const }
            : { top: 100, right: 16, width: 240, bottom: 'auto' as const, maxHeight: '65vh', overflowY: 'auto' as const }),
        }}>

          {/* Search */}
          {openPanel === 'search' && (
            <div>
              <div className="kg-field-label">FIND_TOPIC</div>
              <div className="kg-search-wrap">
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="검색..."
                  className="kg-input"
                  autoFocus
                />
                <span className="kg-search-glyph">▸</span>
              </div>
              {searchResults.length > 0 && (
                <div className="kg-search-list">
                  {searchResults.map(n => (
                    <button
                      key={n.id}
                      onClick={() => { onSelectNode(n.id); setQuery(''); setOpenPanel(null); }}
                      className="kg-search-item"
                    >
                      <span className="kg-search-dot" data-cat={n.category} />
                      <span className="kg-search-label">{n.label}</span>
                      <span className="kg-search-type">{n.type === 'definition' ? 'DEF' : 'INS'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Filter */}
          {openPanel === 'filter' && (
            <div>
              <section className="kg-section" style={{ marginTop: 0 }}>
                <div className="kg-sec-head">
                  <span className="kg-sec-bar" />
                  <span className="kg-sec-title">NODE_TYPE</span>
                </div>
                <div className="kg-seg">
                  {(['definition', 'instance'] as const).map(nt => {
                    const on = filters.nodeTypes.has(nt);
                    return (
                      <button
                        key={nt}
                        className={`kg-seg-btn ${on ? 'is-on' : ''}`}
                        onClick={() => onFiltersChange({ ...filters, nodeTypes: toggleSet(filters.nodeTypes, nt) })}
                      >
                        <span className="kg-seg-dot" />
                        {nt === 'definition' ? 'DEF' : 'INS'}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="kg-section">
                <div className="kg-sec-head">
                  <span className="kg-sec-bar" />
                  <span className="kg-sec-title">EDGE_TYPE</span>
                </div>
                <div className="kg-grid">
                  {Object.entries(graphData.edgeTypes).map(([key, et]) => {
                    const on = filters.edgeTypes.has(key);
                    return (
                      <button
                        key={key}
                        className={`kg-cell ${on ? 'is-on' : 'is-off'}`}
                        onClick={() => onFiltersChange({ ...filters, edgeTypes: toggleSet(filters.edgeTypes, key) })}
                      >
                        <span className="kg-cell-glow" style={{ background: et.color }} />
                        <span className="kg-cell-label">{et.label}</span>
                        {on && <span className="kg-cell-tick">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </section>

              {Object.entries(graphData.tagGroups).map(([gid, tg]) => {
                const groupTags = usedTags.filter(t => t.startsWith(gid + ':'));
                if (groupTags.length === 0) return null;
                return (
                  <section key={gid} className="kg-section">
                    <div className="kg-taggroup">
                      <div className="kg-taggroup-head" style={{ color: tg.color }}>
                        <span className="kg-tg-square" style={{ background: tg.color }} />
                        {tg.label}
                      </div>
                      <div className="kg-chiplist">
                        {groupTags.map(tag => (
                          <button
                            key={tag}
                            className={`kg-chip ${filters.activeTags.has(tag) ? 'is-on' : ''}`}
                            onClick={() => onFiltersChange({ ...filters, activeTags: toggleSet(filters.activeTags, tag) })}
                          >
                            {tag.split(':')[1]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                );
              })}

              <section className="kg-section">
                <div className="kg-sec-head">
                  <span className="kg-sec-bar" />
                  <span className="kg-sec-title">DISPLAY</span>
                </div>
                <label className="kg-sw">
                  <input type="checkbox" checked={hideIsolated} onChange={e => onHideIsolatedChange(e.target.checked)} />
                  <span className="kg-sw-box"><span className="kg-sw-dot" /></span>
                  <span>HIDE_ISOLATED</span>
                </label>
              </section>
            </div>
          )}

          {/* Tweaks */}
          {openPanel === 'tweaks' && (
            <div>
              <div className="kg-tweaks-section">
                <div className="kg-field-label">PALETTE</div>
                <div className="kg-palette-grid">
                  {Object.entries(CATEGORY_PALETTES).map(([name, pal]: [string, CategoryPalette]) => (
                    <button
                      key={name}
                      className={`kg-pal ${tweaks.palette === name ? 'is-on' : ''}`}
                      onClick={() => setTweakKey('palette', name)}
                    >
                      <div className="kg-pal-swatches">
                        {Object.values(pal).map((c, i) => (
                          <span key={i} style={{ background: c }} />
                        ))}
                      </div>
                      <div className="kg-pal-name">{name.replace(/-/g, '_')}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="kg-tweaks-section">
                <div className="kg-field-label">BACKGROUND_FX</div>
                <label className="kg-sw">
                  <input type="checkbox" checked={tweaks.bgFx} onChange={e => setTweakKey('bgFx', e.target.checked)} />
                  <span className="kg-sw-box"><span className="kg-sw-dot" /></span>
                  <span>{tweaks.bgFx ? 'ON' : 'OFF'}</span>
                </label>
              </div>

              <div className="kg-tweaks-section">
                <div className="kg-field-label">SCANLINE</div>
                <label className="kg-sw">
                  <input type="checkbox" checked={tweaks.scanlines} onChange={e => setTweakKey('scanlines', e.target.checked)} />
                  <span className="kg-sw-box"><span className="kg-sw-dot" /></span>
                  <span>{tweaks.scanlines ? 'ON' : 'OFF'}</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
