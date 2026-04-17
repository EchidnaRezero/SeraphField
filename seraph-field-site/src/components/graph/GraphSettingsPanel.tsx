import { useState } from 'react';

export interface GraphSettingsPanelProps {
  layoutParams: { nodeRepulsion: number; idealEdgeLength: number; gravity: number };
  onLayoutParamsChange: (params: { nodeRepulsion: number; idealEdgeLength: number; gravity: number }) => void;
  onRelayout: () => void;
}

export function GraphSettingsPanel({
  layoutParams,
  onLayoutParamsChange,
  onRelayout,
}: GraphSettingsPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="absolute right-0 top-0 h-full z-30 flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Handle */}
      <div
        className="w-1.5 h-16 rounded-l bg-neon-cyan/40 hover:bg-neon-cyan/70 transition-colors cursor-pointer shrink-0"
      />

      {/* Panel */}
      <div
        className="h-full overflow-y-auto border-l border-neon-cyan/20 font-mono text-[0.78rem] transition-all duration-200 ease-out"
        style={{
          background: '#12122a',
          width: open ? 240 : 0,
          opacity: open ? 1 : 0,
          padding: open ? '1.25rem 1rem' : '1.25rem 0',
        }}
      >
        <h3 className="text-neon-cyan/70 text-[0.65rem] uppercase tracking-[0.2em] mb-4 whitespace-nowrap">
          Layout Settings
        </h3>

        {/* Repulsion */}
        <label className="block mb-4">
          <span className="text-text-main/70 text-[0.7rem] block mb-1 whitespace-nowrap">
            Repulsion: {layoutParams.nodeRepulsion}
          </span>
          <input
            type="range"
            min={1000}
            max={10000}
            step={500}
            value={layoutParams.nodeRepulsion}
            onChange={e => onLayoutParamsChange({ ...layoutParams, nodeRepulsion: Number(e.target.value) })}
            className="w-full accent-neon-cyan"
          />
        </label>

        {/* Edge Length */}
        <label className="block mb-4">
          <span className="text-text-main/70 text-[0.7rem] block mb-1 whitespace-nowrap">
            Edge Length: {layoutParams.idealEdgeLength}
          </span>
          <input
            type="range"
            min={50}
            max={300}
            step={10}
            value={layoutParams.idealEdgeLength}
            onChange={e => onLayoutParamsChange({ ...layoutParams, idealEdgeLength: Number(e.target.value) })}
            className="w-full accent-neon-cyan"
          />
        </label>

        {/* Gravity */}
        <label className="block mb-4">
          <span className="text-text-main/70 text-[0.7rem] block mb-1 whitespace-nowrap">
            Gravity: {layoutParams.gravity.toFixed(2)}
          </span>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={Math.round(layoutParams.gravity * 100)}
            onChange={e => onLayoutParamsChange({ ...layoutParams, gravity: Number(e.target.value) / 100 })}
            className="w-full accent-neon-cyan"
          />
        </label>

        {/* Re-layout button */}
        <button
          onClick={onRelayout}
          className="w-full border border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan py-1.5 text-[0.7rem] uppercase tracking-widest hover:bg-neon-cyan/20 transition-colors whitespace-nowrap"
        >
          Re-layout
        </button>
      </div>
    </div>
  );
}
