import { describe, expect, it } from 'vitest';
import { formatSearchQuery, parseSearchQuery } from '../../src/features/search';

describe('parseSearchQuery', () => {
  it('키워드 검색을 파싱한다', () => {
    expect(parseSearchQuery(' Flow Matching ')).toEqual({
      scope: 'all',
      query: 'flow matching',
      tags: [],
      operator: 'keyword',
    });
  });

  it('공백이 있는 단일 태그를 하나의 태그로 파싱한다', () => {
    expect(parseSearchQuery('#Flow Matching')).toEqual({
      scope: 'tag',
      query: '#flow matching',
      tags: ['flow matching'],
      operator: 'and',
    });
  });

  it('태그 교집합과 합집합을 공백 태그와 함께 파싱한다', () => {
    expect(parseSearchQuery('#Flow Matching and #ODE')).toEqual({
      scope: 'tag',
      query: '#flow matching and #ode',
      tags: ['flow matching', 'ode'],
      operator: 'and',
    });

    expect(parseSearchQuery('#Math or #Probability Flow ODE')).toEqual({
      scope: 'tag',
      query: '#math or #probability flow ode',
      tags: ['math', 'probability flow ode'],
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

describe('formatSearchQuery', () => {
  it('태그 스코프에서 공백 태그 전체를 하나의 태그로 감싼다', () => {
    expect(formatSearchQuery('tag', 'Flow Matching')).toBe('#Flow Matching');
  });

  it('태그 스코프에서 and/or 기준으로만 여러 태그를 분리한다', () => {
    expect(formatSearchQuery('tag', 'Flow Matching and ODE')).toBe('#Flow Matching and #ODE');
    expect(formatSearchQuery('tag', 'Math or Probability Flow ODE')).toBe('#Math or #Probability Flow ODE');
  });
});
