import graphDataJson from '../../generated/graph-data.json';
import kgDocsJson from '../../generated/kg-docs.json';
import type { GraphData, KgDocsIndex } from '../../types/graph';

export function loadGraphData(): GraphData {
  return graphDataJson as GraphData;
}

export function loadKgDocs(): KgDocsIndex {
  return kgDocsJson as KgDocsIndex;
}
