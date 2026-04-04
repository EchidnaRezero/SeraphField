import React from 'react';
import { ChevronDown } from 'lucide-react';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import 'katex/dist/katex.min.css';
import type { Post } from '../types';
import { postsByGroup, postsBySeries } from '../data/content';
import { buildHash } from '../lib/routes';
import { buildHeadingId, isDisplayMathParagraph, normalizeMathDelimiters } from '../lib/archive';
import { MermaidBlock } from './MermaidBlock';
import { ResponsiveMathBlock } from './ResponsiveMathBlock';

SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('shell', bash);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('md', markdown);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('tsx', tsx);

interface ArchiveMarkdownProps {
  post: Post;
  onOpenPostBySlug: (slug: string) => void;
  onSelectTag: (tag: string) => void;
  onSearchQuery: (query: string) => void;
}

const formatCollectionLabel = (value: string) =>
  value
    .split('-')
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(' ');

export const ArchiveMarkdown: React.FC<ArchiveMarkdownProps> = ({
  post,
  onOpenPostBySlug,
  onSelectTag,
  onSearchQuery,
}) => {
  const articleRef = React.useRef<HTMLElement | null>(null);
  const [isCompactViewport, setIsCompactViewport] = React.useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.innerWidth < 1024;
  });
  const [isNetworkOpen, setIsNetworkOpen] = React.useState(false);
  const [isSeriesOpen, setIsSeriesOpen] = React.useState(false);
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});
  const normalizedContent = normalizeMathDelimiters(post.content);
  const seriesPosts = post.series ? postsBySeries.get(post.series) ?? [] : [];
  const relatedGroupEntries = (post.groups ?? []).map((group) => ({
    group,
    posts: (postsByGroup.get(group) ?? []).filter((entry) => entry.id !== post.id),
  }));
  const currentSeriesIndex = seriesPosts.findIndex((entry) => entry.id === post.id);
  const previousSeriesPost = currentSeriesIndex > 0 ? seriesPosts[currentSeriesIndex - 1] : null;
  const nextSeriesPost =
    currentSeriesIndex >= 0 && currentSeriesIndex < seriesPosts.length - 1
      ? seriesPosts[currentSeriesIndex + 1]
      : null;
  const visibleGroupEntries = relatedGroupEntries.filter((entry) => entry.posts.length > 0);
  const hasCollectionHub = seriesPosts.length > 1 || visibleGroupEntries.length > 0;

  React.useEffect(() => {
    const handleResize = () => {
      setIsCompactViewport(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  React.useEffect(() => {
    setIsNetworkOpen(false);
    setIsSeriesOpen(false);
    setOpenGroups({});
  }, [post.id]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let frameId = 0;

    const updateLooseKatexDisplays = () => {
      const articleElement = articleRef.current;
      if (!articleElement) {
        return;
      }

      const displayNodes = articleElement.querySelectorAll<HTMLElement>('.katex-display');

        displayNodes.forEach((displayNode) => {
          if (displayNode.closest('.responsive-math-block')) {
            return;
          }

        displayNode.style.fontSize = '';

        if (window.innerWidth >= 1024) {
          return;
        }

        const parentWidth = displayNode.parentElement?.clientWidth ?? 0;
        const contentWidth = displayNode.scrollWidth;

        if (!parentWidth || !contentWidth || contentWidth <= parentWidth) {
          return;
        }

          const scale = Math.max(0.6, Math.min(1, parentWidth / contentWidth));
          displayNode.style.fontSize = `${scale}em`;
        });
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateLooseKatexDisplays);
    };

    scheduleUpdate();
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [post.id, normalizedContent]);

  return (
    <article ref={articleRef} className="mx-auto max-w-4xl font-body">
      <header className="mb-8 md:mb-12">
        <h1 className="article-title" data-text={post.title}>
          {post.title}
        </h1>
        <div className="meta-data">
          <div className="meta-row">
            <span className="meta-label">Date</span>
            <span className="tag">{post.date.replace(/-/g, '.')}</span>
          </div>
          {post.tags.length > 0 && (
            <div className="meta-row">
              <span className="meta-label">Tags</span>
              <div className="meta-chip-list">
                {post.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="tag cursor-pointer transition-colors hover:bg-neon-cyan hover:text-black"
                    onClick={() => onSelectTag(tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
          {post.versions && post.versions.length > 0 && (
            <div className="meta-row">
              <span className="meta-label">Versions</span>
              <div className="meta-chip-list">
                {post.versions.map((version) => (
                  <span key={`${version.library}-${version.version}`} className="tag">
                    {version.library}:{version.version}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="markdown-body content-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          urlTransform={(url) => {
            if (url.startsWith('post://')) {
              return url;
            }

            return defaultUrlTransform(url);
          }}
          components={{
            h1: () => null,
            h2: ({ node, ...props }) => {
              const id = buildHeadingId(String(props.children));
              return <h2 id={id} className="article-section-title" {...props} />;
            },
            p: ({ node, children, ...props }) => {
              if (isDisplayMathParagraph(children)) {
                return <ResponsiveMathBlock>{children}</ResponsiveMathBlock>;
              }

              return <p {...props}>{children}</p>;
            },
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match?.[1]?.toLowerCase();
              const fileName = language ? `/// ${post.id}.${language === 'python' ? 'py' : language}` : '/// snippet';

              if (!inline && language === 'mermaid') {
                return <MermaidBlock chart={String(children).replace(/\n$/, '')} />;
              }

              return !inline && language ? (
                <div className="code-wrapper">
                  <div className="code-header">
                    <span>{fileName}</span>
                    <span>[EXECUTABLE]</span>
                  </div>
                  <SyntaxHighlighter
                    style={atomDark}
                    language={language}
                    PreTag="pre"
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      background: 'transparent',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1rem',
                      overflowX: 'auto',
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            a: ({ href, children, ...props }) => {
              if (typeof href === 'string' && href.startsWith('post://')) {
                const slug = href.replace('post://', '').trim();
                const archiveHash = buildHash({ view: 'archive', slug });

                return (
                  <a
                    href={archiveHash}
                    className="cursor-pointer text-neon-cyan underline decoration-neon-cyan/35 underline-offset-4 transition-colors hover:text-white"
                    onClick={(event) => {
                      if (
                        event.button !== 0 ||
                        event.metaKey ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey
                      ) {
                        return;
                      }

                      event.preventDefault();
                      onOpenPostBySlug(slug);
                    }}
                  >
                    {children}
                  </a>
                );
              }

              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neon-cyan underline decoration-neon-cyan/35 underline-offset-4 transition-colors hover:text-white"
                  {...props}
                >
                  {children}
                </a>
              );
            },
          }}
        >
          {normalizedContent}
        </ReactMarkdown>
      </div>

      {hasCollectionHub && (
        <section className="collection-hub">
          {isCompactViewport ? (
            <button
              type="button"
              onClick={() => setIsNetworkOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-3 border border-neon-cyan/14 bg-black/20 px-4 py-3 text-left"
            >
              <div>
                <div className="collection-hub__eyebrow">Document Network</div>
                <h2 className="collection-hub__title">Series and Groups</h2>
                <p className="collection-hub__summary">관련 시리즈와 그룹 탐색</p>
              </div>
              <ChevronDown
                className={`h-4 w-4 flex-shrink-0 text-neon-cyan/70 transition-transform ${
                  isNetworkOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          ) : (
            <div className="collection-hub__header">
              <div className="collection-hub__eyebrow">Document Network</div>
              <h2 className="collection-hub__title">Series and Groups</h2>
              <p className="collection-hub__summary">
                같은 읽기 흐름과 같은 주제 묶음을 한곳에서 이동할 수 있게 정리한 탐색 구역이다.
              </p>
            </div>
          )}

          {(!isCompactViewport || isNetworkOpen) && (
            <>
              {seriesPosts.length > 1 &&
                (isCompactViewport ? (
                  <div className="collection-cluster">
                    <button
                      type="button"
                      onClick={() => setIsSeriesOpen((current) => !current)}
                      className="flex w-full items-center justify-between gap-3 text-left"
                    >
                      <div>
                        <div className="collection-cluster__eyebrow">Series</div>
                        <h3 className="collection-cluster__title">
                          {post.seriesTitle ?? formatCollectionLabel(post.series ?? '')}
                        </h3>
                        <div className="collection-cluster__meta">
                          {currentSeriesIndex + 1} / {seriesPosts.length} 문서
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 flex-shrink-0 text-neon-cyan/70 transition-transform ${
                          isSeriesOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isSeriesOpen && (
                      <>
                        <button
                          type="button"
                          onClick={() => onSearchQuery(`series:${post.series}`)}
                          className="collection-cluster__action"
                        >
                          Search Series
                        </button>

                        <div className="collection-nav-grid">
                          {previousSeriesPost && (
                            <button
                              type="button"
                              onClick={() => onOpenPostBySlug(previousSeriesPost.slug)}
                              className="collection-nav-card"
                            >
                              <div className="collection-nav-card__eyebrow">
                                Previous In Series
                              </div>
                              <div className="collection-nav-card__title">{previousSeriesPost.title}</div>
                            </button>
                          )}
                          {nextSeriesPost && (
                            <button
                              type="button"
                              onClick={() => onOpenPostBySlug(nextSeriesPost.slug)}
                              className="collection-nav-card"
                            >
                              <div className="collection-nav-card__eyebrow">
                                Next In Series
                              </div>
                              <div className="collection-nav-card__title">{nextSeriesPost.title}</div>
                            </button>
                          )}
                        </div>

                        <div className="collection-series-list">
                          {seriesPosts.map((entry) => (
                            <button
                              key={entry.id}
                              type="button"
                              onClick={() => onOpenPostBySlug(entry.slug)}
                              className={`collection-series-item ${
                                entry.id === post.id
                                  ? 'collection-series-item--active'
                                  : 'collection-series-item--idle'
                              }`}
                            >
                              <span className="collection-series-item__title">{entry.title}</span>
                              <span className="collection-series-item__order">
                                #{entry.seriesOrder ?? '?'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="collection-cluster">
                    <div className="collection-cluster__header">
                      <div>
                        <div className="collection-cluster__eyebrow">Series</div>
                        <h3 className="collection-cluster__title">
                          {post.seriesTitle ?? formatCollectionLabel(post.series ?? '')}
                        </h3>
                        <div className="collection-cluster__meta">
                          {currentSeriesIndex + 1} / {seriesPosts.length} 문서
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSearchQuery(`series:${post.series}`)}
                        className="collection-cluster__action"
                      >
                        Search Series
                      </button>
                    </div>

                    <div className="collection-nav-grid">
                      {previousSeriesPost && (
                        <button
                          type="button"
                          onClick={() => onOpenPostBySlug(previousSeriesPost.slug)}
                          className="collection-nav-card"
                        >
                          <div className="collection-nav-card__eyebrow">
                            Previous In Series
                          </div>
                          <div className="collection-nav-card__title">{previousSeriesPost.title}</div>
                        </button>
                      )}
                      {nextSeriesPost && (
                        <button
                          type="button"
                          onClick={() => onOpenPostBySlug(nextSeriesPost.slug)}
                          className="collection-nav-card"
                        >
                          <div className="collection-nav-card__eyebrow">
                            Next In Series
                          </div>
                          <div className="collection-nav-card__title">{nextSeriesPost.title}</div>
                        </button>
                      )}
                    </div>

                    <div className="collection-series-list">
                      {seriesPosts.map((entry) => (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => onOpenPostBySlug(entry.slug)}
                          className={`collection-series-item ${
                            entry.id === post.id
                              ? 'collection-series-item--active'
                              : 'collection-series-item--idle'
                          }`}
                        >
                          <span className="collection-series-item__title">{entry.title}</span>
                          <span className="collection-series-item__order">
                            #{entry.seriesOrder ?? '?'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

              {visibleGroupEntries.length > 0 &&
                (isCompactViewport ? (
                  <div className="collection-group-grid">
                    {visibleGroupEntries.map((entry) => {
                      const isOpen = openGroups[entry.group] ?? false;

                      return (
                        <div key={entry.group} className="collection-group-card">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenGroups((current) => ({
                                ...current,
                                [entry.group]: !current[entry.group],
                              }))
                            }
                            className="flex w-full items-center justify-between gap-3 text-left"
                          >
                            <div>
                              <div className="collection-group-card__eyebrow">Group</div>
                              <h4 className="collection-group-card__title">
                                {formatCollectionLabel(entry.group)}
                              </h4>
                              <div className="collection-group-card__meta">
                                {entry.posts.length} related document{entry.posts.length === 1 ? '' : 's'}
                              </div>
                            </div>
                            <ChevronDown
                              className={`h-4 w-4 flex-shrink-0 text-neon-cyan/70 transition-transform ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {isOpen && (
                            <>
                              <button
                                type="button"
                                onClick={() => onSearchQuery(`group:${entry.group}`)}
                                className="collection-cluster__action"
                              >
                                Open Search
                              </button>

                              <div className="collection-group-card__list">
                                {entry.posts.slice(0, 5).map((relatedPost) => (
                                  <button
                                    key={relatedPost.id}
                                    type="button"
                                    onClick={() => onOpenPostBySlug(relatedPost.slug)}
                                    className="collection-group-item"
                                  >
                                    <span className="collection-group-item__title">{relatedPost.title}</span>
                                    <span className="collection-group-item__category">{relatedPost.category}</span>
                                  </button>
                                ))}
                              </div>

                              {entry.posts.length > 5 && (
                                <div className="collection-group-card__more">
                                  +{entry.posts.length - 5} more in this group
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="collection-cluster">
                    <div className="collection-cluster__header">
                      <div>
                        <div className="collection-cluster__eyebrow">Groups</div>
                        <h3 className="collection-cluster__title">Related Group Collections</h3>
                        <div className="collection-cluster__meta">
                          {visibleGroupEntries.length}개 그룹에서 관련 문서를 찾을 수 있다.
                        </div>
                      </div>
                    </div>

                    <div className="collection-group-grid">
                      {visibleGroupEntries.map((entry) => (
                        <div key={entry.group} className="collection-group-card">
                          <div className="collection-group-card__header">
                            <div>
                              <div className="collection-group-card__eyebrow">Group</div>
                              <h4 className="collection-group-card__title">
                                {formatCollectionLabel(entry.group)}
                              </h4>
                              <div className="collection-group-card__meta">
                                {entry.posts.length} related document{entry.posts.length === 1 ? '' : 's'}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => onSearchQuery(`group:${entry.group}`)}
                              className="collection-cluster__action"
                            >
                              Open Search
                            </button>
                          </div>

                          <div className="collection-group-card__list">
                            {entry.posts.slice(0, 5).map((relatedPost) => (
                              <button
                                key={relatedPost.id}
                                type="button"
                                onClick={() => onOpenPostBySlug(relatedPost.slug)}
                                className="collection-group-item"
                              >
                                <span className="collection-group-item__title">{relatedPost.title}</span>
                                <span className="collection-group-item__category">{relatedPost.category}</span>
                              </button>
                            ))}
                          </div>

                          {entry.posts.length > 5 && (
                            <div className="collection-group-card__more">
                              +{entry.posts.length - 5} more in this group
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </>
          )}
        </section>
      )}
    </article>
  );
};
