import type cytoscape from 'cytoscape';
import type {GraphData} from '../../types/graph';

type Stylesheet = cytoscape.Stylesheet;

const CAT_COLORS: Record<string, string> = {
  algebra: '#6688ff',
  analysis: '#66ddaa',
  geometry: '#ff8866',
  linalg: '#dddd66',
};

const DEFAULT_NODE_COLOR = '#19b8be';

export function buildGraphStylesheet(graphData: GraphData): Stylesheet[] {
  const styles: Stylesheet[] = [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 8,
        'font-family': 'monospace',
        'font-size': 11,
        'color': '#cfd8dc',
        'background-color': DEFAULT_NODE_COLOR,
        'width': 28,
        'height': 28,
        'border-width': 2,
        'border-color': '#ffffff44',
      },
    },
    {
      selector: 'node[type="instance"]',
      style: {width: 20, height: 20, 'font-size': 10},
    },
    {
      selector: 'node.selected',
      style: {'border-color': '#ffffff', 'border-width': 3, 'z-index': 10},
    },
    {
      selector: 'node.dimmed',
      style: {opacity: 0.2},
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'target-arrow-color': 'data(color)',
        'line-color': 'data(color)',
        'arrow-scale': 0.8,
      },
    },
    {
      selector: 'edge.dimmed',
      style: {opacity: 0.1},
    },
    {
      selector: 'edge.highlighted',
      style: {width: 3, 'z-index': 10},
    },
  ];

  // Category-based node colors
  for (const [cat, color] of Object.entries(CAT_COLORS)) {
    styles.push({
      selector: `node[category="${cat}"]`,
      style: {'background-color': color},
    });
  }

  // Edge type dash patterns from data
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
