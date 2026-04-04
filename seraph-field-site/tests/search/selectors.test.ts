import { describe, expect, it } from 'vitest';
import { filterPostsByCategoryAndQuery, searchPosts } from '../../src/features/search';
import { searchFixtureIndexEntries, searchFixturePosts } from './fixtures';

describe('searchPosts', () => {
  it('공백이 있는 단일 태그를 정확히 매치한다', () => {
    const result = searchPosts(searchFixturePosts, searchFixtureIndexEntries, '#Flow Matching');
    expect(result.matchedPosts.map((post) => post.id)).toEqual(['a']);
  });

  it('태그 교집합은 모든 태그를 만족하는 글만 반환한다', () => {
    const result = searchPosts(searchFixturePosts, searchFixtureIndexEntries, '#Flow Matching and #ODE');
    expect(result.matchedPosts.map((post) => post.id)).toEqual(['a']);
  });

  it('태그 합집합은 하나라도 만족하는 글을 반환한다', () => {
    const result = searchPosts(searchFixturePosts, searchFixtureIndexEntries, '#Math or #Probability Flow ODE');
    expect(result.matchedPosts.map((post) => post.id)).toEqual(['b', 'c']);
  });

  it('키워드 검색은 제목 매치를 우선 정렬한다', () => {
    const result = searchPosts(searchFixturePosts, searchFixtureIndexEntries, 'flow');
    expect(result.matchedPosts.map((post) => post.id)).toEqual(['a', 'c']);
  });

  it('group 검색은 그룹 일치 문서를 반환한다', () => {
    const result = searchPosts(searchFixturePosts, searchFixtureIndexEntries, 'group:vector-calculus');
    expect(result.matchedPosts.map((post) => post.id)).toEqual(['b']);
  });

  it('series 검색은 시리즈 일치 문서를 반환한다', () => {
    const result = searchPosts(searchFixturePosts, searchFixtureIndexEntries, 'series:diffusion-reading');
    expect(result.matchedPosts.map((post) => post.id)).toEqual(['a', 'b']);
  });
});

describe('filterPostsByCategoryAndQuery', () => {
  it('카테고리와 검색어를 함께 적용한다', () => {
    expect(
      filterPostsByCategoryAndQuery(searchFixturePosts, searchFixtureIndexEntries, 'PAPER', '#Flow Matching').map(
        (post) => post.id,
      ),
    ).toEqual(['a']);
    expect(filterPostsByCategoryAndQuery(searchFixturePosts, searchFixtureIndexEntries, 'THEORY', '#Flow Matching')).toEqual([]);
  });

  it('group 스코프 검색도 카테고리 필터 안에서 동작한다', () => {
    expect(
      filterPostsByCategoryAndQuery(
        searchFixturePosts,
        searchFixtureIndexEntries,
        'THEORY',
        'group:vector-calculus',
      ).map((post) => post.id),
    ).toEqual(['b']);
  });
});
