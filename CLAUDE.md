# YUKINET / Seraph Field — Project Guidelines

## Design Philosophy

The site's visual language is **Psycho-Pass Sibyla System / Dominator HUD** — dark cyan backgrounds with tonal, desaturated accents that merge into the environment rather than popping out.

### Core Principles
- **Tonal, not candy-pop**: Category differentiation via hue shift within a low-saturation cyan family, not via bright primary colors.
- **Dark translucent nodes**: Nodes are dark orbs with atmospheric rim glow (like planets seen from space). No internal symbols or highlights.
- **Edges as structure, not decoration**: Thin, low-opacity lines. They communicate relationships without visual noise.
- **Spatial depth via background, not graph elements**: 3D feeling comes from floor grids, horizon glow, atmospheric haze — the graph floats inside this space.
- **HUD frame**: L-bracket corners, periodic scanline sweeps, frosted-glass panels.

### Palette (CSS Custom Properties)
- `--color-neon-cyan: #19b8be` — primary accent
- `--color-hud-bg: #0e1012` — canvas background
- `--color-hud-box: rgba(8,10,12,0.75)` — panel background
- `--color-text-main: #e0fbfc` — body text
- `--color-text-dim: #757788` — secondary text

### Category Palette (default: "sibyl")
- algebra: `#8ec6ff` (ice blue)
- analysis: `#8fe8c6` (mint teal)
- geometry: `#f0b788` (muted amber)
- linalg: `#e8dc9a` (pale caution)
- other: `#9ef0f0` (primary cyan)

### Typography
- Display: Teko — logo, H1, node emphasis
- Mono: Share Tech Mono — labels, captions, HUD text
- Body: Noto Sans KR — descriptions, help text

### UI Elements
- Clip-path corner cuts on buttons and inventory cells
- Custom toggle switches (not native checkboxes) for settings
- Frosted glass panels with `backdrop-filter: blur`
- Sidebar styled as a device shell (bezel gradient, power button, speaker slit)

### Knowledge Graph Data Workflow
- Data source of truth: `KNOWLEDGE_GRAPH/seed.mjs`
- Pipeline: `seed.mjs` → `math-kg.db` → `export.mjs` → `graph-data.json`
- Full specification: `docs/KNOWLEDGE_GRAPH.md`
- `graph:export` is NOT part of the automatic build chain — run manually after DB changes

### Reference
- Design notes: `docs/design-notes.html`
