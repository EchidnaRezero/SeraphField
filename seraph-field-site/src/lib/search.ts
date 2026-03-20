import type { Post, SearchIndexEntry, SearchQueryOperator, SearchQueryParseResult } from '../types';

export const normalizeTag = (value: string) => value.trim().replace(/^#/, '').toLowerCase();

export const extractTagTerms = (value: string) =>
  [...value.matchAll(/#([^\s,#]+)/g)].map((match) => normalizeTag(match[1] ?? ''));

export const parseSearchQuery = (value: string): SearchQueryParseResult => {
  const normalizedValue = value.trim().toLowerCase();
  const tags = extractTagTerms(normalizedValue);
  const hasTagSearch = tags.length > 0;

  if (!hasTagSearch) {
    return {
      mode: 'keyword',
      query: normalizedValue,
      tags: [],
      operator: 'keyword',
    };
  }

  const operator: SearchQueryOperator = /\bor\b/i.test(normalizedValue) ? 'or' : 'and';

  return {
    mode: 'tag',
    query: normalizedValue,
    tags,
    operator,
  };
};

export const searchPosts = (
  allPosts: Post[],
  indexEntries: SearchIndexEntry[],
  query: string,
) => {
  const parsedQuery = parseSearchQuery(query);

  if (!parsedQuery.query) {
    return { parsedQuery, matchedPosts: [] as Post[] };
  }

  if (parsedQuery.mode === 'tag') {
    const rankedEntries = indexEntries
      .map((entry) => {
        const normalizedTags = entry.tags.map((tag) => tag.toLowerCase());
        const matchedTagCount = parsedQuery.tags.filter((tag) => normalizedTags.includes(tag)).length;
        const isMatched =
          parsedQuery.operator === 'or'
            ? matchedTagCount > 0
            : matchedTagCount === parsedQuery.tags.length;

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

    return {
      parsedQuery,
      matchedPosts: rankedEntries
        .map(({ entry }) => allPosts.find((post) => post.id === entry.id))
        .filter((post): post is Post => Boolean(post)),
    };
  }

  const rankedEntries = indexEntries
    .map((entry) => {
      const titleHit = entry.title.toLowerCase().includes(parsedQuery.query);
      const summaryHit = entry.summary.toLowerCase().includes(parsedQuery.query);
      const tagHit = entry.tags.some((tag) => tag.toLowerCase().includes(parsedQuery.query));
      const bodyHit = entry.rawText.toLowerCase().includes(parsedQuery.query);

      const score = (titleHit ? 5 : 0) + (tagHit ? 3 : 0) + (summaryHit ? 2 : 0) + (bodyHit ? 1 : 0);

      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        new Date(right.entry.date).getTime() - new Date(left.entry.date).getTime(),
    );

  return {
    parsedQuery,
    matchedPosts: rankedEntries
      .map(({ entry }) => allPosts.find((post) => post.id === entry.id))
      .filter((post): post is Post => Boolean(post)),
  };
};
