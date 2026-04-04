import { describe, expect, it } from 'vitest';
import { parseSearchQuery, searchPosts } from '../src/features/search';
import type { Post, SearchIndexEntry } from '../src/types';

const posts: Post[] = [
  {
    id: 'a',
    slug: 'a',
    title: 'Flow Matching Overview',
    date: '2026-03-20',
    category: 'PAPER',
    tags: ['Flow', 'ODE'],
    groups: ['diffusion-foundations'],
    series: 'diffusion-reading',
    seriesTitle: 'Diffusion Reading',
    seriesOrder: 1,
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
    groups: ['vector-calculus'],
    series: 'diffusion-reading',
    seriesTitle: 'Diffusion Reading',
    seriesOrder: 2,
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
    groups: ['implementation-notes'],
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
  groups: post.groups,
  series: post.series,
  seriesTitle: post.seriesTitle,
  seriesOrder: post.seriesOrder,
  summary: post.summary,
  rawText: `${post.title} ${post.summary} ${post.tags.join(' ')}`,
}));

describe('parseSearchQuery', () => {
  it('키워드 검색을 파싱한다', () => {
    expect(parseSearchQuery(' Flow Matching ')).toEqual({
      scope: 'all',
      query: 'flow matching',
      tags: [],
      operator: 'keyword',
    });
  });

  it('태그 교집합과 합집합을 파싱한다', () => {
    expect(parseSearchQuery('#Flow and #ODE')).toEqual({
      scope: 'tag',
      query: '#flow and #ode',
      tags: ['flow', 'ode'],
      operator: 'and',
    });

    expect(parseSearchQuery('#Flow or #Math')).toEqual({
      scope: 'tag',
      query: '#flow or #math',
      tags: ['flow', 'math'],
      operator: 'or',
    });
  });

  it('스코프 접두사를 파싱한다', () => {
    expect(parseSearchQuery('group:diffusion-foundations')).toEqual({
      scope: 'group',
      query: 'diffusion-foundations',
      tags: [],
      operator: 'keyword',
    });

    expect(parseSearchQuery('series:diffusion-reading')).toEqual({
      scope: 'series',
      query: 'diffusion-reading',
      tags: [],
      operator: 'keyword',
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

  it('group 검색은 그룹 일치 문서를 반환한다', () => {
    const result = searchPosts(posts, indexEntries, 'group:vector-calculus');
    expect(result.matchedPosts.map((post) => post.id)).toEqual(['b']);
  });

  it('series 검색은 시리즈 일치 문서를 반환한다', () => {
    const result = searchPosts(posts, indexEntries, 'series:diffusion-reading');
    expect(result.matchedPosts.map((post) => post.id)).toEqual(['a', 'b']);
  });
});
