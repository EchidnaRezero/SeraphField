import type { SearchIndexEntry, SearchQueryParseResult } from '../../types';
import { matchKeyword, matchScopedField, matchTags } from './match';

export interface RankedSearchEntry {
  entry: SearchIndexEntry;
  score: number;
}

export const rankTagEntries = (
  entries: SearchIndexEntry[],
  parsedQuery: SearchQueryParseResult,
) =>
  entries
    .map((entry) => {
      const { isMatched, matchedTagCount } = matchTags(entry, parsedQuery);
      return {
        entry,
        score: isMatched ? matchedTagCount : 0,
      };
    })
    .filter((item) => item.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        new Date(right.entry.date).getTime() - new Date(left.entry.date).getTime(),
    );

export const rankKeywordEntries = (entries: SearchIndexEntry[], query: string) =>
  entries
    .map((entry) => {
      const { titleHit, summaryHit, tagHit, groupHit, seriesHit, bodyHit } = matchKeyword(entry, query);
      const score =
        (titleHit ? 5 : 0) +
        (groupHit ? 4 : 0) +
        (seriesHit ? 4 : 0) +
        (tagHit ? 3 : 0) +
        (summaryHit ? 2 : 0) +
        (bodyHit ? 1 : 0);

      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        new Date(right.entry.date).getTime() - new Date(left.entry.date).getTime(),
    );

export const rankScopedEntries = (
  entries: SearchIndexEntry[],
  parsedQuery: SearchQueryParseResult,
) =>
  entries
    .map((entry) => ({
      entry,
      score: matchScopedField(entry, parsedQuery.scope, parsedQuery.query) ? 1 : 0,
    }))
    .filter((item) => item.score > 0)
    .sort(
      (left, right) =>
        new Date(right.entry.date).getTime() - new Date(left.entry.date).getTime() ||
        left.entry.title.localeCompare(right.entry.title, 'ko'),
    );
