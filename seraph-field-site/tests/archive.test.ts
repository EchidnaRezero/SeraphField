import React from 'react';
import { describe, expect, it } from 'vitest';
import { buildHeadingId, extractTableOfContents, isDisplayMathParagraph } from '../src/lib/archive';
import { filterPostsByCategoryAndQuery } from '../src/features/search';
import type { Post, SearchIndexEntry } from '../src/types';

describe('buildHeadingId', () => {
  it('공백과 문장부호를 정리한다', () => {
    expect(buildHeadingId('  Rectified Flow: 개요 / 메모  ')).toBe('rectified-flow-개요-메모');
  });
});

describe('extractTableOfContents', () => {
  it('## 헤딩만 TOC로 추출한다', () => {
    expect(extractTableOfContents('# 제목\n\n## 첫 섹션\n내용\n### 제외\n## 둘째 섹션')).toEqual([
      { text: '첫 섹션', id: '첫-섹션' },
      { text: '둘째 섹션', id: '둘째-섹션' },
    ]);
  });
});

describe('filterPostsByCategoryAndQuery', () => {
  const posts: Post[] = [
    {
      id: 'paper-a',
      slug: 'paper-a',
      title: 'Flow Matching',
      date: '2026-03-20',
      category: 'PAPER',
      tags: ['Flow'],
      groups: ['diffusion-foundations'],
      summary: 'summary',
      content: '# A',
    },
    {
      id: 'theory-b',
      slug: 'theory-b',
      title: 'Vector Field',
      date: '2026-03-19',
      category: 'THEORY',
      tags: ['Math'],
      groups: ['vector-calculus'],
      summary: 'summary',
      content: '# B',
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
    summary: post.summary,
    rawText: `${post.title} ${post.summary} ${post.tags.join(' ')}`,
  }));

  it('카테고리와 검색어를 함께 적용한다', () => {
    expect(filterPostsByCategoryAndQuery(posts, indexEntries, 'PAPER', 'flow').map((post) => post.id)).toEqual([
      'paper-a',
    ]);
    expect(filterPostsByCategoryAndQuery(posts, indexEntries, 'THEORY', 'flow')).toEqual([]);
  });

  it('group 스코프 검색도 카테고리 필터 안에서 동작한다', () => {
    expect(
      filterPostsByCategoryAndQuery(posts, indexEntries, 'THEORY', 'group:vector-calculus').map((post) => post.id),
    ).toEqual(['theory-b']);
  });
});

describe('isDisplayMathParagraph', () => {
  it('display math 전용 문단을 감지한다', () => {
    const element = React.createElement('span', { className: 'katex-display' }, 'math');
    expect(isDisplayMathParagraph(element)).toBe(true);
  });

  it('일반 문단은 false를 반환한다', () => {
    expect(isDisplayMathParagraph('plain text')).toBe(false);
  });
});
