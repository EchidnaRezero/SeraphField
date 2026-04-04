import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { posts, searchIndex } from '../data/content';
import { Category, SearchScope } from '../types';
import { CATEGORY_ICON_MAP } from '../config/categories';
import { formatSearchQuery, parseSearchQuery, searchPosts } from '../features/search';

interface SearchResultsProps {
  onBack: () => void;
  initialQuery: string;
  onOpenPost: (category?: Category, slug?: string) => void;
  onSearch: (query: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  onBack,
  initialQuery,
  onOpenPost,
  onSearch,
}) => {
  const formatGroupLabel = (value: string) =>
    value
      .split('-')
      .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
      .join(' ');

  const [query, setQuery] = useState(initialQuery);
  const [scope, setScope] = useState<SearchScope>('all');

  useEffect(() => {
    const parsed = parseSearchQuery(initialQuery);
    setQuery(
      parsed.scope === 'tag'
        ? parsed.tags.join(parsed.operator === 'or' ? ' or ' : ' and ')
        : parsed.query,
    );
    setScope(parsed.scope);
  }, [initialQuery]);

  const effectiveQuery = useMemo(() => formatSearchQuery(scope, query), [scope, query]);
  const searchResult = useMemo(() => searchPosts(posts, searchIndex, effectiveQuery), [effectiveQuery]);
  const parsedQuery = searchResult.parsedQuery;
  const matchedPosts = searchResult.matchedPosts;

  const submitSearch = () => {
    const formatted = formatSearchQuery(scope, query);
    if (!formatted) {
      return;
    }

    onSearch(formatted);
  };

  const searchModeLabel =
    parsedQuery.scope === 'tag'
      ? `Tag Search / ${parsedQuery.operator === 'or' ? 'Union' : 'Intersection'}`
      : parsedQuery.scope === 'group'
        ? 'Group Search'
        : parsedQuery.scope === 'series'
          ? 'Series Search'
          : parsedQuery.scope === 'title'
            ? 'Title Search'
            : parsedQuery.scope === 'body'
              ? 'Body Search'
              : parsedQuery.scope === 'title-body'
                ? 'Title + Body Search'
                : 'Integrated Search';

  return (
    <div className="relative h-full min-h-0 w-full overflow-x-hidden bg-hud-bg font-ui text-[#e0fbfc]">
      <div className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden p-4 md:p-8">
        <header className="mb-4 flex flex-col gap-4 pb-4 md:pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={onBack}
              className="rounded-full border border-neon-cyan/20 p-2 transition-colors group hover:bg-neon-cyan/10"
            >
              <ArrowLeft className="h-5 w-5 text-neon-cyan/60 group-hover:text-neon-cyan" />
            </button>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.36em] text-neon-cyan/60">
                Search_Control
              </div>
              <h1 className="text-3xl font-bold uppercase tracking-wider text-neon-cyan/88 md:text-4xl">
                Search Results
              </h1>
            </div>
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-neon-cyan/45 lg:text-right">
            {matchedPosts.length} matches
          </div>
        </header>

        <div className="mb-6 border border-neon-cyan/22 bg-black/34 p-4 backdrop-blur-md md:p-5">
          <div className="group/search relative max-w-3xl">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  submitSearch();
                }
              }}
              placeholder="SEARCH_TERM"
              className="w-full border border-neon-cyan/35 bg-neon-cyan/10 px-4 py-3 pr-12 text-base font-mono text-neon-cyan placeholder:text-neon-cyan/35 transition-all focus:border-neon-cyan/75 focus:outline-none"
            />
            <button
              type="button"
              onClick={submitSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label="search documents"
            >
              <Search className="h-4 w-4 text-neon-cyan/55 transition-colors group-focus-within/search:text-neon-cyan" />
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="inline-flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.16em] text-white/46">
              Scope
              <select
                value={scope}
                onChange={(event) => setScope(event.target.value as SearchScope)}
                className="border border-neon-cyan/25 bg-black/40 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-neon-cyan focus:border-neon-cyan/60 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="title">Title</option>
                <option value="body">Body</option>
                <option value="title-body">Title+Body</option>
                <option value="tag">Tag</option>
                <option value="group">Group</option>
                <option value="series">Series</option>
              </select>
            </label>
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-white/46">
              {searchModeLabel}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-neon-cyan/20 bg-black/30 backdrop-blur-md">
          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6">
            {matchedPosts.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-white/28">
                <Search className="mb-4 h-12 w-12 text-neon-cyan/35" />
                <div className="text-xl uppercase tracking-[0.26em]">No Search Match</div>
                <div className="mt-2 text-sm text-white/24">
                  검색 범위를 바꾸거나 `#tag1 and #tag2`, `group:...`, `series:...` 형식으로 다시 검색해보세요.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {matchedPosts.map((post, index) => {
                  const CategoryIcon = CATEGORY_ICON_MAP[post.category];

                  return (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => onOpenPost(post.category, post.slug)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onOpenPost(post.category, post.slug);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="w-full cursor-pointer border border-neon-cyan/14 bg-neon-cyan/[0.02] px-4 py-4 text-left transition-colors hover:bg-neon-cyan/[0.05] md:px-6 md:py-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="mb-2 flex items-center gap-3">
                            <CategoryIcon className="h-4 w-4 text-neon-cyan/78" />
                            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-neon-cyan/68">
                              {post.category}
                            </span>
                            <span className="text-[10px] font-mono text-neon-cyan/42">
                              {post.date.replace(/-/g, '.')}
                            </span>
                          </div>
                          <div className="mb-2 text-xl font-bold tracking-tight text-[rgba(246,252,255,0.94)] md:text-2xl">
                            {post.title}
                          </div>
                          <div className="line-clamp-2 text-sm leading-relaxed text-white/66">{post.summary}</div>
                        </div>
                        <div className="flex max-w-full flex-wrap justify-start gap-2 lg:max-w-xs lg:justify-end">
                          {post.tags.map((tag) => (
                            <button
                              key={`${post.id}-${tag}`}
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onSearch(formatSearchQuery('tag', tag));
                              }}
                              className="inline-flex items-center gap-1 border border-neon-cyan/22 px-2 py-1 text-[10px] font-mono text-neon-cyan/72 transition-colors hover:bg-neon-cyan hover:text-black"
                            >
                              <Tag className="h-3 w-3" />
                              {tag}
                            </button>
                          ))}
                          {post.series && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onSearch(formatSearchQuery('series', post.series ?? ''));
                              }}
                              className="inline-flex items-center gap-1 border border-neon-cyan/22 px-2 py-1 text-[10px] font-mono text-white/72 transition-colors hover:bg-neon-cyan hover:text-black"
                            >
                              SERIES
                              <span>{post.seriesTitle ?? post.series}</span>
                            </button>
                          )}
                          {(post.groups ?? []).map((group) => (
                            <button
                              key={`${post.id}-${group}`}
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onSearch(formatSearchQuery('group', group));
                              }}
                              className="inline-flex items-center gap-1 border border-neon-cyan/22 px-2 py-1 text-[10px] font-mono text-white/60 transition-colors hover:bg-neon-cyan hover:text-black"
                            >
                              GROUP
                              <span>{formatGroupLabel(group)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 229, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-neon-cyan);
        }
      `}</style>
    </div>
  );
};
