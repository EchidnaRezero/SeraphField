import React, { useState, useEffect, useMemo } from 'react';
import { Category, Post } from '../types';
import { posts, postsBySlug, searchIndex } from '../data/content';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, ArrowLeft, Search } from 'lucide-react';
import { CATEGORY_ITEMS } from '../config/categories';
import { extractTableOfContents, filterPostsByCategoryAndQuery } from '../lib/archive';
import { ArchiveMarkdown } from './ArchiveMarkdown';
import { ArchiveToc } from './ArchiveToc';

interface ArchiveProps {
  onBack: () => void;
  initialCategory?: Category;
  initialPostSlug?: string;
  initialSearchQuery?: string;
  onPostOpen?: (slug: string, category: Category) => void;
}

export const Archive: React.FC<ArchiveProps> = ({
  onBack,
  initialCategory,
  initialPostSlug,
  initialSearchQuery,
  onPostOpen,
}) => {
  const [currentCategory, setCurrentCategory] = useState<Category>(initialCategory || 'THEORY');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const contentRef = React.useRef<HTMLDivElement>(null);
  const pendingLinkedSlugRef = React.useRef<string | null>(null);

  const filteredPosts = useMemo(
    () => filterPostsByCategoryAndQuery(posts, searchIndex, currentCategory, searchQuery),
    [currentCategory, searchQuery],
  );

  useEffect(() => {
    if (initialCategory) {
      setCurrentCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (!initialPostSlug) {
      setSearchQuery(initialSearchQuery ?? '');
    }
  }, [initialPostSlug, initialSearchQuery]);

  useEffect(() => {
    if (!initialPostSlug) {
      return;
    }

    const targetPost = postsBySlug.get(initialPostSlug);
    if (!targetPost) {
      return;
    }

    pendingLinkedSlugRef.current = initialPostSlug;
    setCurrentCategory(targetPost.category);
    setSearchQuery('');
    setSelectedPost(targetPost);

    requestAnimationFrame(() => {
      contentRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    });
  }, [initialPostSlug]);

  useEffect(() => {
    if (filteredPosts.length === 0) {
      pendingLinkedSlugRef.current = null;
      setSelectedPost(null);
      return;
    }

    if (pendingLinkedSlugRef.current) {
      const linkedPost = filteredPosts.find((post) => post.slug === pendingLinkedSlugRef.current);
      if (linkedPost) {
        setSelectedPost(linkedPost);
        pendingLinkedSlugRef.current = null;
        return;
      }
    }

    if (!selectedPost || !filteredPosts.find((post) => post.id === selectedPost.id)) {
      setSelectedPost(filteredPosts[0]);
      onPostOpen?.(filteredPosts[0].slug, filteredPosts[0].category);
    }
  }, [filteredPosts, onPostOpen, selectedPost]);

  useEffect(() => {
    if (!selectedPost) {
      return;
    }

    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveHeading(entry.target.id);
            }
          });
        },
        { rootMargin: '-10% 0% -80% 0%' },
      );

      const headings = contentRef.current?.querySelectorAll('h2');
      headings?.forEach((heading) => observer.observe(heading));

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedPost]);

  const toc = useMemo(() => {
    if (!selectedPost) {
      return [];
    }

    return extractTableOfContents(selectedPost.content);
  }, [selectedPost]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveHeading(id);
    }
  };

  const openPostBySlug = (slug: string) => {
    const targetPost = postsBySlug.get(slug);
    if (!targetPost) {
      return;
    }

    pendingLinkedSlugRef.current = slug;
    setCurrentCategory(targetPost.category);
    setSearchQuery('');
    setSelectedPost(targetPost);
    onPostOpen?.(targetPost.slug, targetPost.category);

    requestAnimationFrame(() => {
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-hud-bg font-ui text-[#e0fbfc]">
      <div className="relative z-10 flex min-h-[100dvh] flex-col p-4 md:h-screen md:min-h-0 md:p-8">
        <header className="mb-4 flex flex-col gap-4 pb-4 md:pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
            <button
              onClick={onBack}
              className="mr-4 rounded-full border border-neon-cyan/20 p-2 transition-colors group hover:bg-neon-cyan/10"
            >
              <ArrowLeft className="h-5 w-5 text-neon-cyan/60 group-hover:text-neon-cyan" />
            </button>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {CATEGORY_ITEMS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCurrentCategory(cat.id as Category)}
                  className={`group/nav relative shrink-0 rounded-sm px-4 py-2 transition-all md:px-6
                    ${currentCategory === cat.id ? 'text-white' : 'text-white/20 hover:text-white/40'}
                  `}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <cat.icon
                      className={`h-5 w-5 transition-colors
                        ${currentCategory === cat.id ? 'text-neon-cyan' : 'text-white/20 group-hover/nav:text-white/40'}
                      `}
                    />
                    <span
                      className={`relative text-lg font-bold tracking-wider uppercase transition-all md:text-2xl
                        ${currentCategory === cat.id ? 'text-white' : 'text-white/20 group-hover/nav:text-white'}
                      `}
                      data-text={cat.label}
                    >
                      <span className="relative z-10 inline-block group-hover/nav:animate-[glitch-fast_0.2s_infinite]">
                        {cat.archiveLabel}
                      </span>
                      <span className="absolute inset-0 z-0 -translate-x-[2px] text-neon-accent opacity-0 group-hover/nav:animate-[glitch-1_0.3s_infinite] group-hover/nav:opacity-70">
                        {cat.archiveLabel}
                      </span>
                      <span className="absolute inset-0 z-0 translate-x-[2px] text-neon-cyan opacity-0 group-hover/nav:animate-[glitch-2_0.3s_infinite] group-hover/nav:opacity-70">
                        {cat.archiveLabel}
                      </span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="hidden font-mono text-[9px] uppercase tracking-[0.4em] text-neon-cyan/20 md:block" />
        </header>

        <div className="relative flex flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
          <aside className="relative flex max-h-64 w-full flex-col overflow-hidden lg:my-4 lg:ml-4 lg:w-64 lg:max-h-none">
            <div className="relative z-10 px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">
              <div className="group relative">
                <Search className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-neon-cyan/40 transition-colors group-focus-within:text-neon-cyan" />
                <input
                  type="text"
                  placeholder="SEARCH_TOPIC..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full border border-neon-cyan/20 bg-neon-cyan/5 px-4 py-1.5 pl-9 text-[10px] font-mono text-neon-cyan placeholder:text-neon-cyan/20 transition-all focus:border-neon-cyan/60 focus:outline-none"
                />
              </div>
            </div>

            <div className="custom-scrollbar flex flex-1 flex-col overflow-y-auto py-2 md:py-4 lg:py-6">
              {filteredPosts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => {
                    setSelectedPost(post);
                    onPostOpen?.(post.slug, post.category);
                  }}
                  className={`group relative px-4 py-3 text-left font-ui tracking-wider uppercase transition-all md:px-6 lg:px-8
                    ${selectedPost?.id === post.id ? 'text-neon-cyan' : 'text-white/20 hover:text-white/50'}
                  `}
                >
                  <div className="mb-0.5 font-mono text-[7px] opacity-20">{post.date.replace(/-/g, '.')}</div>
                  <div className="text-lg font-bold md:text-xl">{post.title}</div>
                </button>
              ))}
            </div>
          </aside>

          <main
            className="content-scroll-area relative min-h-[24rem] flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 md:px-8 md:py-8 lg:mx-4 lg:my-4 lg:min-h-0 lg:px-12 lg:py-12"
            ref={contentRef}
          >
            <AnimatePresence mode="wait">
              {!selectedPost ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full flex-col items-center justify-center text-center opacity-20"
                >
                  <BookOpen className="mb-4 h-12 w-12" />
                  <div className="font-ui text-xl uppercase tracking-[0.3em]">Select_Node</div>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedPost.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="pb-24 md:pb-32"
                >
                  <ArchiveMarkdown post={selectedPost} onOpenPostBySlug={openPostBySlug} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <aside className="relative flex w-full flex-col overflow-hidden lg:my-4 lg:mr-4 lg:w-72">
            <div className="relative z-10 flex h-full flex-col py-4 md:py-6 lg:py-8 lg:pr-8">
              <div className="flex-1 overflow-hidden">
                <div className="flex h-full flex-col">
                  {selectedPost ? (
                    <ArchiveToc items={toc} activeHeading={activeHeading} onSelect={scrollToHeading} />
                  ) : (
                    <div className="pl-0 text-[9px] font-mono italic uppercase tracking-widest text-white/10 md:pl-6">
                      No map data available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 0px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 229, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-neon-cyan);
        }
        .content-scroll-area {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .content-scroll-area::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
