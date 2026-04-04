import type { SearchIndexEntry, SearchQueryParseResult } from '../../types';

export interface KeywordMatchParts {
  titleHit: boolean;
  summaryHit: boolean;
  tagHit: boolean;
  groupHit: boolean;
  seriesHit: boolean;
  bodyHit: boolean;
}

export const matchTags = (entry: SearchIndexEntry, parsedQuery: SearchQueryParseResult) => {
  const normalizedTags = entry.tags.map((tag) => tag.toLowerCase());
  const matchedTagCount = parsedQuery.tags.filter((tag) => normalizedTags.includes(tag)).length;
  const isMatched =
    parsedQuery.operator === 'or'
      ? matchedTagCount > 0
      : matchedTagCount === parsedQuery.tags.length;

  return {
    isMatched,
    matchedTagCount,
  };
};

export const matchKeyword = (entry: SearchIndexEntry, query: string): KeywordMatchParts => ({
  titleHit: entry.title.toLowerCase().includes(query),
  summaryHit: entry.summary.toLowerCase().includes(query),
  tagHit: entry.tags.some((tag) => tag.toLowerCase().includes(query)),
  groupHit: (entry.groups ?? []).some((group) => group.toLowerCase().includes(query)),
  seriesHit:
    Boolean(entry.series && entry.series.toLowerCase().includes(query)) ||
    Boolean(entry.seriesTitle && entry.seriesTitle.toLowerCase().includes(query)),
  bodyHit: entry.rawText.toLowerCase().includes(query),
});

export const matchScopedField = (entry: SearchIndexEntry, scope: SearchQueryParseResult['scope'], query: string) => {
  switch (scope) {
    case 'title':
      return entry.title.toLowerCase().includes(query);
    case 'body':
      return entry.rawText.toLowerCase().includes(query);
    case 'title-body':
      return entry.title.toLowerCase().includes(query) || entry.rawText.toLowerCase().includes(query);
    case 'group':
      return (entry.groups ?? []).some((group) => group.toLowerCase().includes(query));
    case 'series':
      return (
        Boolean(entry.series && entry.series.toLowerCase().includes(query)) ||
        Boolean(entry.seriesTitle && entry.seriesTitle.toLowerCase().includes(query))
      );
    default:
      return false;
  }
};
