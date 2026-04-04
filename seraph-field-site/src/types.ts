export type Category = 'THEORY' | 'REPO' | 'PAPER' | 'IMPLEMENT';
export type AppView = 'lobby' | 'archive' | 'references' | 'search' | 'profile';
export type SearchQueryOperator = 'keyword' | 'and' | 'or';
export type SearchScope = 'all' | 'title' | 'body' | 'title-body' | 'tag' | 'group' | 'series';

export interface VersionInfo {
  library: string;
  version: string;
  date: string;
  url?: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: Category;
  tags: string[];
  groups?: string[];
  series?: string;
  seriesTitle?: string;
  seriesOrder?: number;
  summary: string;
  content: string;
  sourcePath?: string;
  versions?: VersionInfo[];
  relatedPosts?: string[]; // IDs of related posts
}

export interface SearchIndexEntry {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: Category;
  tags: string[];
  groups?: string[];
  series?: string;
  seriesTitle?: string;
  seriesOrder?: number;
  summary: string;
  rawText: string;
  sourcePath?: string;
}

export interface SearchQueryParseResult {
  scope: SearchScope;
  query: string;
  tags: string[];
  operator: SearchQueryOperator;
}

export interface CategoryInfo {
  id: Category;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export interface TrackedRepository {
  library: string;
  version: string;
  date: string;
  url?: string;
  sourceSlug: string;
  sourceTitle: string;
  sourceCategory: Category;
}
