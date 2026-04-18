import type { GraphTweaks, CategoryPalette } from '../../types/graph';
import { CATEGORY_PALETTES } from './graphStyle';

export interface GraphTweaksPanelProps {
  open: boolean;
  onClose: () => void;
  tweaks: GraphTweaks;
  onTweaksChange: (tweaks: GraphTweaks) => void;
}

export function GraphTweaksPanel({
  open,
  onClose,
  tweaks,
  onTweaksChange,
}: GraphTweaksPanelProps) {
  if (!open) return null;

  const setKey = <K extends keyof GraphTweaks>(k: K, v: GraphTweaks[K]) =>
    onTweaksChange({ ...tweaks, [k]: v });

  return (
    <div className="kg-tweaks">
      <div className="kg-tweaks-head">
        <span>TWEAKS</span>
        <button onClick={onClose} className="kg-popup-x" style={{ position: 'static' }}>×</button>
      </div>

      <div className="kg-tweaks-section">
        <div className="kg-field-label">CATEGORY_PALETTE</div>
        <div className="kg-palette-grid">
          {Object.entries(CATEGORY_PALETTES).map(([name, pal]: [string, CategoryPalette]) => (
            <button
              key={name}
              className={`kg-pal ${tweaks.palette === name ? 'is-on' : ''}`}
              onClick={() => setKey('palette', name)}
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
        <div className="kg-field-label">AMBIENT_DRIFT</div>
        <label className="kg-sw">
          <input
            type="checkbox"
            checked={tweaks.drift}
            onChange={e => setKey('drift', e.target.checked)}
          />
          <span className="kg-sw-box"><span className="kg-sw-dot" /></span>
          <span>{tweaks.drift ? 'ON' : 'OFF'}</span>
        </label>
      </div>

      <div className="kg-tweaks-section">
        <div className="kg-field-label">BACKGROUND_FX</div>
        <label className="kg-sw">
          <input
            type="checkbox"
            checked={tweaks.bgFx}
            onChange={e => setKey('bgFx', e.target.checked)}
          />
          <span className="kg-sw-box"><span className="kg-sw-dot" /></span>
          <span>{tweaks.bgFx ? 'ENABLED' : 'DISABLED'}</span>
        </label>
      </div>

      <div className="kg-tweaks-section">
        <div className="kg-field-label">SCANLINE</div>
        <label className="kg-sw">
          <input
            type="checkbox"
            checked={tweaks.scanlines}
            onChange={e => setKey('scanlines', e.target.checked)}
          />
          <span className="kg-sw-box"><span className="kg-sw-dot" /></span>
          <span>{tweaks.scanlines ? 'ON' : 'OFF'}</span>
        </label>
      </div>
    </div>
  );
}
