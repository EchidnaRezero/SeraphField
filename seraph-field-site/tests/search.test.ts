import { describe, expect, it } from 'vitest';
import { parseSearchQuery, searchPosts } from '../src/lib/search';
import type { Post, SearchIndexEntry } from '../src/types';

const posts: Post[] = [
  {
    id: 'a',
    slug: 'a',
    title: 'Flow Matching Overview',
    date: '2026-03-20',
    category: 'PAPER',
    tags: ['Flow', 'ODE'],
    summary: 'Flow Matching summary',
    content: '# A',
  },
  {
    id: 'b',
    slug: 'b',
    title: 'Vector Fields',
    date: '2026-03-19',
    category: 'THEORY',
    tags: ['Math', 'Vector'],
    summary: 'Vector field basics',
    content: '# B',
  },
  {
    id: 'c',
    slug: 'c',
    title: 'Training Notes',
    date: '2026-03-18',
    category: 'IMPLEMENT',
    tags: ['Training', 'Flow'],
    summary: 'Implementation notes',
    content: '# C',
  },
];

const indexEntries: SearchIndexEntry[] = posts.map((post) => ({
  id: post.id,
  slug: post.slug,
  title: post.title,
  date: post.date,
  category: post.category,
  tags: post.tags,
  summary: post.summary,
  rawText: `${post.title} ${post.summary} ${post.tags.join(' ')}`,
}));

describe('parseSearchQuery', () => {
  it('키워드 검색을 파싱한다', () => {
    expect(parseSearchQuery(' Flow Matching ')).toEqual({
      mode: 'keyword',
      query: 'flow matching',
      tags: [],
      operator: 'keyword',
    });
  });

  it('태그 교집합과 합집합을 파싱한다', () => {
    expect(parseSearchQuery('#Flow and #ODE')).toEqual({
      mode: 'tag',
      query: '#flow and #ode',
      tags: ['flow', 'ode'],
      operator: 'and',
    });

    expect(parseSearchQuery('#Flow or #Math')).toEqual({
      mode: 'tag',
      query: '#flow or #math',
      tags: ['flow', 'math'],
      operator: 'or',
    });
  });
});

describe('searchPosts', () => {
  it('태그 교집합은 모든 태그를 만족하는 글만 반환한다', () => {
    const result = searchPosts(posts, indexEntries, '#Flow and #ODE');
    expect(result.matchedPosts.map((post) => post.id)).toEqual(['a']);
  });

  it('태그 합집합은 하나라도 만족하는 글을 반환한다', () => {
    const result = searchPosts(posts, indexEntries, '#Math or #Training');
    expect(result.matchedPosts.map((post) => post.id)).toEqual(['b', 'c']);
  });

  it('키워드 검색은 제목 매치를 우선 정렬한다', () => {
    const result = searchPosts(posts, indexEntries, 'flow');
    expect(result.matchedPosts.map((post) => post.id)).toEqual(['a', 'c']);
  });
});
