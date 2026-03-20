import React from 'react';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
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
import { buildHash } from '../lib/routes';
import { buildHeadingId, isDisplayMathParagraph } from '../lib/archive';

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
}

export const ArchiveMarkdown: React.FC<ArchiveMarkdownProps> = ({ post, onOpenPostBySlug }) => {
  return (
    <article className="mx-auto max-w-4xl font-body">
      <header className="mb-8 md:mb-12">
        <h1 className="article-title" data-text={post.title}>
          {post.title}
        </h1>
        <div className="meta-data">
          <span className="tag">DATE: {post.date.replace(/-/g, '.')}</span>
          <div className="flex gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
          {post.versions && post.versions.length > 0 && (
            <div className="flex gap-2">
              {post.versions.map((version) => (
                <span key={`${version.library}-${version.version}`} className="tag">
                  {version.library}:{version.version}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="markdown-body content-body">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
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
                return <div className="math-block">{children}</div>;
              }

              return <p {...props}>{children}</p>;
            },
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              const fileName = match ? `/// ${post.id}.${match[1] === 'python' ? 'py' : match[1]}` : '/// snippet';

              return !inline && match ? (
                <div className="code-wrapper">
                  <div className="code-header">
                    <span>{fileName}</span>
                    <span>[EXECUTABLE]</span>
                  </div>
                  <SyntaxHighlighter
                    style={atomDark}
                    language={match[1]}
                    PreTag="pre"
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      background: 'transparent',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1rem',
                      overflowX: 'hidden',
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
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
};
