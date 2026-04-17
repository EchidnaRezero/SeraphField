import type { GraphData } from '../../types/graph';
import type { GraphFilters } from '../../features/graph/graphComputation';

export interface GraphSidebarProps {
  graphData: GraphData;
  filters: GraphFilters;
  onFiltersChange: (filters: GraphFilters) => void;
  hideIsolated: boolean;
  onHideIsolatedChange: (v: boolean) => void;
  showReverse: boolean;
  onShowReverseChange: (v: boolean) => void;
}

function toggleSet<T>(set: Set<T>, item: T): Set<T> {
  const next = new Set(set);
  if (next.has(item)) next.delete(item);
  else next.add(item);
  return next;
}

export function GraphSidebar({
  graphData,
  filters,
  onFiltersChange,
  hideIsolated,
  onHideIsolatedChange,
  showReverse,
  onShowReverseChange,
}: GraphSidebarProps) {
  const nodeTypes = ['definition', 'instance'] as const;

  return (
    <aside className="w-[280px] shrink-0 h-full overflow-y-auto border-r border-neon-cyan/20 px-4 py-5 font-mono text-[0.78rem]"
      style={{ background: '#12122a' }}>

      {/* Node Types */}
      <section className="mb-5">
        <h3 className="text-neon-cyan/70 text-[0.65rem] uppercase tracking-[0.2em] mb-2">
          Node Types
        </h3>
        {nodeTypes.map(nt => (
          <label key={nt} className="flex items-center gap-2 mb-1.5 cursor-pointer text-text-main/80 hover:text-text-main">
            <input
              type="checkbox"
              checked={filters.nodeTypes.has(nt)}
              onChange={() => onFiltersChange({ ...filters, nodeTypes: toggleSet(filters.nodeTypes, nt) })}
              className="accent-neon-cyan"
            />
            <span className="capitalize">{nt}</span>
          </label>
        ))}
      </section>

      {/* Edge Types */}
      <section className="mb-5">
        <h3 className="text-neon-cyan/70 text-[0.65rem] uppercase tracking-[0.2em] mb-2">
          Edge Types
        </h3>
        {Object.entries(graphData.edgeTypes).map(([key, et]) => (
          <label key={key} className="flex items-center gap-2 mb-1.5 cursor-pointer text-text-main/80 hover:text-text-main">
            <input
              type="checkbox"
              checked={filters.edgeTypes.has(key)}
              onChange={() => onFiltersChange({ ...filters, edgeTypes: toggleSet(filters.edgeTypes, key) })}
              className="accent-neon-cyan"
            />
            <span
              className="inline-block w-3 h-3 rounded-sm shrink-0"
              style={{ background: et.color }}
            />
            <span>{et.label}</span>
          </label>
        ))}
      </section>

      {/* Tag Groups */}
      {Object.keys(graphData.tagGroups).length > 0 && (
        <section className="mb-5">
          <h3 className="text-neon-cyan/70 text-[0.65rem] uppercase tracking-[0.2em] mb-2">
            Tags
          </h3>
          {Object.entries(graphData.tagGroups).map(([key, tg]) => (
            <label key={key} className="flex items-center gap-2 mb-1.5 cursor-pointer text-text-main/80 hover:text-text-main">
              <input type="checkbox" className="accent-neon-cyan" />
              <span
                className="inline-block w-3 h-3 rounded-sm shrink-0"
                style={{ background: tg.color }}
              />
              <span>{tg.label}</span>
            </label>
          ))}
        </section>
      )}

      {/* Display Options */}
      <section>
        <h3 className="text-neon-cyan/70 text-[0.65rem] uppercase tracking-[0.2em] mb-2">
          Display
        </h3>
        <label className="flex items-center gap-2 mb-1.5 cursor-pointer text-text-main/80 hover:text-text-main">
          <input
            type="checkbox"
            checked={hideIsolated}
            onChange={e => onHideIsolatedChange(e.target.checked)}
            className="accent-neon-cyan"
          />
          <span>Hide isolated nodes</span>
        </label>
        <label className="flex items-center gap-2 mb-1.5 cursor-pointer text-text-main/80 hover:text-text-main">
          <input
            type="checkbox"
            checked={showReverse}
            onChange={e => onShowReverseChange(e.target.checked)}
            className="accent-neon-cyan"
          />
          <span>Show reverse direction</span>
        </label>
      </section>
    </aside>
  );
}
