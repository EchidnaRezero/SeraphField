import type { GraphData, CategoryPalette } from '../../types/graph';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Stylesheet = any;

export const CATEGORY_PALETTES: Record<string, CategoryPalette> = {
  sibyl: {
    algebra: '#8ec6ff',
    analysis: '#8fe8c6',
    geometry: '#f0b788',
    linalg: '#e8dc9a',
    other: '#9ef0f0',
  },
  'cyan-aurora': {
    algebra: '#7aa8ff',
    analysis: '#5fe3a8',
    geometry: '#ff9269',
    linalg: '#ffd76a',
    other: '#4ddbe0',
  },
  starrail: {
    algebra: '#a88bff',
    analysis: '#7de3c7',
    geometry: '#ff9e6b',
    linalg: '#ffd86b',
    other: '#8cdfff',
  },
  reverse1999: {
    algebra: '#c7a3ff',
    analysis: '#b9e8b2',
    geometry: '#ffb78f',
    linalg: '#f5d88a',
    other: '#a0e6e0',
  },
  arknights: {
    algebra: '#5aa8ff',
    analysis: '#4adb8f',
    geometry: '#ff7a5a',
    linalg: '#ffcf4a',
    other: '#19b8be',
  },
};

// Node "planet" look is achieved purely via Cytoscape's native
// background-color, border, and underlay — no SVG images needed.

export function buildGraphStylesheet(
  graphData: GraphData,
  palette: CategoryPalette = CATEGORY_PALETTES.sibyl,
): Stylesheet[] {
  const styles: Stylesheet[] = [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 8,
        'font-family': '"Share Tech Mono", ui-monospace, monospace',
        'font-size': 10,
        'color': '#bfe0e4',
        'text-outline-width': 0,
        'text-background-opacity': 0,
        'background-color': '#0a1e26',
        'background-opacity': 0.35,
        'width': 26,
        'height': 26,
        'border-width': 1.2,
        'border-color': palette.other,
        'border-opacity': 0.75,
        'underlay-color': palette.other,
        'underlay-padding': 7,
        'underlay-opacity': 0.28,
        'underlay-shape': 'ellipse',
      },
    },
    {
      selector: 'node[type="definition"]',
      style: {
        'width': 30,
        'height': 30,
        'border-width': 1.4,
        'border-opacity': 1,
      },
    },
    {
      selector: 'node[type="instance"]',
      style: {
        'width': 18,
        'height': 18,
        'font-size': 9,
        'background-opacity': 0.55,
        'border-width': 1.1,
        'border-opacity': 0.7,
        'underlay-padding': 4,
        'underlay-opacity': 0.18,
      },
    },
    {
      selector: 'node.selected',
      style: {
        'border-color': '#ffffff',
        'border-width': 2.2,
        'border-opacity': 1,
        'z-index': 10,
        'width': 36,
        'height': 36,
        'underlay-padding': 14,
        'underlay-opacity': 0.85,
      },
    },
    {
      selector: 'node.dimmed',
      style: {
        'opacity': 0.22,
        'text-opacity': 0.3,
      },
    },
    {
      selector: 'node.neighbor',
      style: {
        'border-opacity': 1,
        'border-width': 1.8,
        'underlay-opacity': 0.55,
      },
    },
    {
      selector: 'edge',
      style: {
        'width': 1.1,
        'curve-style': 'unbundled-bezier',
        'control-point-distances': [8],
        'control-point-weights': [0.5],
        'target-arrow-shape': 'triangle',
        'target-arrow-color': 'data(color)',
        'line-color': 'data(color)',
        'arrow-scale': 0.75,
        'opacity': 0.42,
      },
    },
    {
      selector: 'edge[edgeType="isomorphism"]',
      style: {
        'source-arrow-shape': 'triangle',
        'source-arrow-color': 'data(color)',
      },
    },
    {
      selector: 'edge[edgeType="dual"]',
      style: {
        'source-arrow-shape': 'triangle',
        'source-arrow-color': 'data(color)',
      },
    },
    {
      selector: 'edge[?parallel]',
      style: {
        'line-style': 'dashed',
        'line-dash-pattern': [6, 4],
      },
    },
    {
      selector: 'edge.dimmed',
      style: { 'opacity': 0.08 },
    },
    {
      selector: 'edge.highlighted',
      style: {
        'width': 3.6,
        'opacity': 1,
        'z-index': 10,
        'arrow-scale': 1.2,
      },
    },
  ];

  for (const [cat, color] of Object.entries(palette)) {
    styles.push({
      selector: `node[category="${cat}"][type="definition"]`,
      style: {
        'border-color': color,
        'background-color': '#0a1e26',
        'background-opacity': 0.85,
        'underlay-color': color,
      },
    });
    styles.push({
      selector: `node[category="${cat}"][type="instance"]`,
      style: {
        'border-color': color,
        'underlay-color': color,
      },
    });
    styles.push({
      selector: `node[category="${cat}"].neighbor`,
      style: { 'border-color': color },
    });
  }

  for (const [typeId, typeInfo] of Object.entries(graphData.edgeTypes)) {
    if (typeInfo.dash) {
      styles.push({
        selector: `edge[edgeType="${typeId}"]`,
        style: {
          'line-style': 'dashed',
          'line-dash-pattern': typeInfo.dash.split(',').map(Number),
        },
      });
    }
  }

  return styles;
}
