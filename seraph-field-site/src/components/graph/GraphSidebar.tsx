import { useMemo, useState } from 'react';
import type { GraphData } from '../../types/graph';
import type { GraphFilters } from '../../features/graph/graphComputation';

export interface GraphSidebarProps {
  graphData: GraphData;
  filters: GraphFilters;
  onFiltersChange: (filters: GraphFilters) => void;
  hideIsolated: boolean;
  onHideIsolatedChange: (v: boolean) => void;
  onSelectNode: (nodeId: string) => void;
}

function toggleSet<T>(set: Set<T>, item: T): Set<T> {
  const next = new Set(set);
  if (next.has(item)) next.delete(item);
  else next.add(item);
  return next;
}

type TabId = 'filter' | 'search' | 'stats';

export function GraphSidebar({
  graphData,
  filters,
  onFiltersChange,
  hideIsolated,
  onHideIsolatedChange,
  onSelectNode,
}: GraphSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabId>('filter');
  const [query, setQuery] = useState('');

  const usedTags = useMemo(() => {
    const tags = new Set<string>();
    for (const e of graphData.edges) {
      for (const t of e.tags) tags.add(t);
    }
    return [...tags].sort();
  }, [graphData.edges]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return graphData.nodes
      .filter(n => n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q))
      .slice(0, 10);
  }, [query, graphData.nodes]);

  const stats = useMemo(() => {
    const byCat: Record<string, number> = {};
    for (const n of graphData.nodes) byCat[n.category] = (byCat[n.category] || 0) + 1;
    return { nodes: graphData.nodes.length, edges: graphData.edges.length, byCat };
  }, [graphData]);

  return (
    <aside className="kg-sidebar">
      <div className="kg-side-header">
        <div className="kg-chev">◆</div>
        <div>
          <div className="kg-side-title">KNOWLEDGE_GRAPH</div>
          <div className="kg-side-sub">// {stats.nodes} nodes · {stats.edges} edges</div>
        </div>
      </div>

      <div className="kg-tabs">
        {([['filter', 'FILTER'], ['search', 'SEARCH'], ['stats', 'STATS']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`kg-tab ${activeTab === id ? 'is-active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="kg-side-body">
        {activeTab === 'search' && (
          <div>
            <div className="kg-field-label">FIND_TOPIC</div>
            <div className="kg-search-wrap">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="node label or id..."
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
                    onClick={() => { onSelectNode(n.id); setQuery(''); }}
                    className="kg-search-item"
                  >
                    <span className="kg-search-dot" data-cat={n.category} />
                    <span className="kg-search-label">{n.label}</span>
                    <span className="kg-search-type">{n.type === 'definition' ? 'DEF' : 'INS'}</span>
                  </button>
                ))}
              </div>
            )}
            {query && searchResults.length === 0 && (
              <div className="kg-empty">// no match</div>
            )}
          </div>
        )}

        {activeTab === 'filter' && (
          <>
            <section className="kg-section">
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
                <span className="kg-sec-count">{filters.edgeTypes.size}/{Object.keys(graphData.edgeTypes).length}</span>
              </div>
              <div className="kg-grid">
                {Object.entries(graphData.edgeTypes).map(([key, et]) => {
                  const on = filters.edgeTypes.has(key);
                  return (
                    <button
                      key={key}
                      className={`kg-cell ${on ? 'is-on' : 'is-off'}`}
                      onClick={() => onFiltersChange({ ...filters, edgeTypes: toggleSet(filters.edgeTypes, key) })}
                      title={et.label}
                    >
                      <span className="kg-cell-glow" style={{ background: et.color }} />
                      <span className="kg-cell-label">{et.label}</span>
                      {on && <span className="kg-cell-tick">✓</span>}
                    </button>
                  );
                })}
              </div>
            </section>

            {Object.keys(graphData.tagGroups).length > 0 && (
              <section className="kg-section">
                <div className="kg-sec-head">
                  <span className="kg-sec-bar" />
                  <span className="kg-sec-title">TAG</span>
                </div>
                {Object.entries(graphData.tagGroups).map(([gid, tg]) => {
                  const groupTags = usedTags.filter(t => t.startsWith(gid + ':'));
                  if (groupTags.length === 0) return null;
                  return (
                    <div key={gid} className="kg-taggroup">
                      <div className="kg-taggroup-head" style={{ color: tg.color }}>
                        <span className="kg-tg-square" style={{ background: tg.color }} />
                        {tg.label}
                      </div>
                      <div className="kg-chiplist">
                        {groupTags.map(tag => {
                          const on = filters.activeTags.has(tag);
                          const name = tag.split(':')[1];
                          return (
                            <button
                              key={tag}
                              className={`kg-chip ${on ? 'is-on' : ''}`}
                              onClick={() => onFiltersChange({ ...filters, activeTags: toggleSet(filters.activeTags, tag) })}
                            >
                              {name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            <section className="kg-section">
              <div className="kg-sec-head">
                <span className="kg-sec-bar" />
                <span className="kg-sec-title">DISPLAY</span>
              </div>
              <label className="kg-sw">
                <input
                  type="checkbox"
                  checked={hideIsolated}
                  onChange={e => onHideIsolatedChange(e.target.checked)}
                />
                <span className="kg-sw-box"><span className="kg-sw-dot" /></span>
                <span>HIDE_ISOLATED</span>
              </label>
            </section>
          </>
        )}

        {activeTab === 'stats' && (
          <div>
            <div className="kg-stat-big">
              <div className="kg-stat-num">{stats.nodes}</div>
              <div className="kg-stat-lbl">total_nodes</div>
            </div>
            <div className="kg-stat-big">
              <div className="kg-stat-num">{stats.edges}</div>
              <div className="kg-stat-lbl">total_edges</div>
            </div>
            <div className="kg-sec-head" style={{ marginTop: 18 }}>
              <span className="kg-sec-bar" />
              <span className="kg-sec-title">BY_CATEGORY</span>
            </div>
            {Object.entries(stats.byCat).map(([cat, n]) => (
              <div key={cat} className="kg-stat-row">
                <span className="kg-search-dot" data-cat={cat} />
                <span className="kg-stat-catname">{cat}</span>
                <span className="kg-stat-catnum">{n}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
