import type { SearchQueryOperator, SearchQueryParseResult, SearchScope } from '../../types';

export const normalizeTag = (value: string) => value.trim().replace(/^#/, '').toLowerCase();

export const extractTagTerms = (value: string) =>
  [...value.matchAll(/#([^\s,#]+)/g)].map((match) => normalizeTag(match[1] ?? ''));

const PREFIX_SCOPES: Array<{ prefix: string; scope: SearchScope }> = [
  { prefix: 'title:', scope: 'title' },
  { prefix: 'body:', scope: 'body' },
  { prefix: 'title-body:', scope: 'title-body' },
  { prefix: 'group:', scope: 'group' },
  { prefix: 'series:', scope: 'series' },
];

export const parseSearchQuery = (value: string): SearchQueryParseResult => {
  const normalizedValue = value.trim().toLowerCase();
  const tags = extractTagTerms(normalizedValue);
  const hasTagSearch = tags.length > 0;

  if (!hasTagSearch) {
    for (const { prefix, scope } of PREFIX_SCOPES) {
      if (normalizedValue.startsWith(prefix)) {
        return {
          scope,
          query: normalizedValue.slice(prefix.length).trim(),
          tags: [],
          operator: 'keyword',
        };
      }
    }

    return {
      scope: 'all',
      query: normalizedValue,
      tags: [],
      operator: 'keyword',
    };
  }

  const operator: SearchQueryOperator = /\bor\b/i.test(normalizedValue) ? 'or' : 'and';

  return {
    scope: 'tag',
    query: normalizedValue,
    tags,
    operator,
  };
};

export const formatSearchQuery = (scope: SearchScope, value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  switch (scope) {
    case 'all':
      return trimmed;
    case 'tag':
      return trimmed
        .split(/\s+/)
        .map((part) => {
          const lowerPart = part.toLowerCase();
          if (lowerPart === 'and' || lowerPart === 'or') {
            return lowerPart;
          }

          return part.startsWith('#') ? part : `#${part}`;
        })
        .join(' ');
    case 'title':
      return `title:${trimmed}`;
    case 'body':
      return `body:${trimmed}`;
    case 'title-body':
      return `title-body:${trimmed}`;
    case 'group':
      return `group:${trimmed}`;
    case 'series':
      return `series:${trimmed}`;
    default:
      return trimmed;
  }
};
