import { useState, useMemo } from 'react';
import type { GraphData, GraphTweaks } from '../../types/graph';
import type { GraphFilters } from '../../features/graph/graphComputation';
import { CATEGORY_PALETTES } from './graphStyle';
import type { CategoryPalette } from '../../types/graph';
import { toggleSet } from './graphUtils';

export type PanelId = 'search' | 'filter' | 'tweaks' | null;

export interface GraphMobileControlsProps {
  graphData: GraphData;
  filters: GraphFilters;
  onFiltersChange: (filters: GraphFilters) => void;
  hideIsolated: boolean;
  onHideIsolatedChange: (v: boolean) => void;
  onSelectNode: (nodeId: string) => void;
  tweaks: GraphTweaks;
  onTweaksChange: (tweaks: GraphTweaks) => void;
  openPanel: PanelId;
  onClosePanel: () => void;
}

export function GraphMobileControls({
  graphData,
  filters,
  onFiltersChange,
  hideIsolated,
  onHideIsolatedChange,
  onSelectNode,
  tweaks,
  onTweaksChange,
  openPanel,
  onClosePanel,
}: GraphMobileControlsProps) {
  const [query, setQuery] = useState('');

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

  if (!openPanel) return null;

  return (
    <div className="kg-tweaks" style={{
      ...(openPanel === 'search'
        ? { top: 56, left: 16, width: 240, bottom: 'auto' as const }
        : openPanel === 'filter'
        ? { top: 56, right: 16, width: 280, bottom: 'auto' as const, maxHeight: '70vh', overflowY: 'auto' as const }
        : { top: 56, right: 16, width: 240, bottom: 'auto' as const, maxHeight: '70vh', overflowY: 'auto' as const }),
    }}>

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
                  onClick={() => { onSelectNode(n.id); setQuery(''); onClosePanel(); }}
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
  );
}
