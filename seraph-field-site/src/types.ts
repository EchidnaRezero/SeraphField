export type Category = 'THEORY' | 'REPO' | 'PAPER' | 'IMPLEMENT';
export type AppView = 'lobby' | 'archive' | 'references' | 'search' | 'profile';
export type SearchQueryOperator = 'keyword' | 'and' | 'or';
export type SearchQueryMode = 'keyword' | 'tag';

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
  summary: string;
  rawText: string;
  sourcePath?: string;
}

export interface SearchQueryParseResult {
  mode: SearchQueryMode;
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
