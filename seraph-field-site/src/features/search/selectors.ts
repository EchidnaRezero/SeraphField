import type { Category, Post, SearchIndexEntry } from '../../types';
import { parseSearchQuery } from './query';
import { rankKeywordEntries, rankScopedEntries, rankTagEntries } from './rank';

export const searchPosts = (
  allPosts: Post[],
  indexEntries: SearchIndexEntry[],
  query: string,
) => {
  const parsedQuery = parseSearchQuery(query);

  if (!parsedQuery.query) {
    return { parsedQuery, matchedPosts: [] as Post[] };
  }

  const rankedEntries =
    parsedQuery.scope === 'tag'
      ? rankTagEntries(indexEntries, parsedQuery)
      : parsedQuery.scope === 'all'
        ? rankKeywordEntries(indexEntries, parsedQuery.query)
        : rankScopedEntries(indexEntries, parsedQuery);

  return {
    parsedQuery,
    matchedPosts: rankedEntries
      .map(({ entry }) => allPosts.find((post) => post.id === entry.id))
      .filter((post): post is Post => Boolean(post)),
  };
};

export const filterPostsByCategoryAndQuery = (
  allPosts: Post[],
  indexEntries: SearchIndexEntry[],
  category: Category,
  query: string,
) => {
  const categoryPosts = allPosts.filter((post) => post.category === category);
  const categoryEntries = indexEntries.filter((entry) => entry.category === category);

  if (!query.trim()) {
    return categoryPosts;
  }

  return searchPosts(categoryPosts, categoryEntries, query).matchedPosts;
};
