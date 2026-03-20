import React, { Suspense, lazy, useState, useEffect } from 'react';
import { AppView, Category } from './types';
import { Lobby } from './components/Lobby';
import { CustomCursor } from './components/CustomCursor';
import { QuantumField } from './components/QuantumField';
import { AnnihilationTransition } from './components/QuantumRainTransition';
import { AnimatePresence, motion } from 'motion/react';
import { postsBySlug } from './data/content';
import { DEFAULT_CATEGORY } from './config/categories';
import { navigateToHashRoute, parseHashRoute } from './lib/routes';

const Archive = lazy(() =>
  import('./components/Archive').then((module) => ({ default: module.Archive })),
);
const ReferenceLog = lazy(() =>
  import('./components/ReferenceLog').then((module) => ({ default: module.ReferenceLog })),
);
const SearchResults = lazy(() =>
  import('./components/SearchResults').then((module) => ({ default: module.SearchResults })),
);
const ProfilePage = lazy(() =>
  import('./components/ProfilePage').then((module) => ({ default: module.ProfilePage })),
);

export default function App() {
  const [view, setView] = useState<AppView>('lobby');
  const [initialCategory, setInitialCategory] = useState<Category>(DEFAULT_CATEGORY);
  const [initialPostSlug, setInitialPostSlug] = useState<string | undefined>(undefined);
  const [initialSearchQuery, setInitialSearchQuery] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingView, setPendingView] = useState<AppView | null>(null);

  useEffect(() => {
    const syncViewFromLocation = () => {
      const route = parseHashRoute(window.location.hash);

      setView(route.view);

      if (route.view === 'archive') {
        setInitialSearchQuery('');
        setInitialPostSlug(route.slug);
        if (!route.slug) {
          setInitialCategory(DEFAULT_CATEGORY);
          return;
        }

        const targetPost = postsBySlug.get(route.slug);
        if (targetPost) {
          setInitialCategory(targetPost.category);
        }
        return;
      }

      if (route.view === 'search') {
        setInitialPostSlug(undefined);
        setInitialSearchQuery(route.query ?? '');
        return;
      }

      setInitialPostSlug(undefined);
      setInitialSearchQuery('');
    };

    syncViewFromLocation();
    window.addEventListener('hashchange', syncViewFromLocation);
    window.addEventListener('popstate', syncViewFromLocation);

    return () => {
      window.removeEventListener('hashchange', syncViewFromLocation);
      window.removeEventListener('popstate', syncViewFromLocation);
    };
  }, []);

  const handleEnter = (category?: Category, slug?: string) => {
    if (category) {
      setInitialCategory(category);
    }

    if (slug) {
      setInitialPostSlug(slug);
      setInitialSearchQuery('');
      navigateToHashRoute({ view: 'archive', slug });
    } else {
      setInitialPostSlug(undefined);
      setInitialSearchQuery('');
      navigateToHashRoute({ view: 'archive' });
    }

    setPendingView('archive');
    setIsTransitioning(true);
  };

  const handleBack = () => {
    setInitialPostSlug(undefined);
    setInitialSearchQuery('');
    navigateToHashRoute({ view: 'lobby' });
    setPendingView('lobby');
    setIsTransitioning(true);
  };

  const handleOpenReferences = () => {
    setInitialPostSlug(undefined);
    setInitialSearchQuery('');
    navigateToHashRoute({ view: 'references' });
    setPendingView('references');
    setIsTransitioning(true);
  };

  const handleOpenProfile = () => {
    setInitialPostSlug(undefined);
    setInitialSearchQuery('');
    navigateToHashRoute({ view: 'profile' });
    setPendingView('profile');
    setIsTransitioning(true);
  };

  const handlePostOpen = (slug: string, category: Category) => {
    setInitialCategory(category);
    setInitialPostSlug(slug);
    setInitialSearchQuery('');
    navigateToHashRoute({ view: 'archive', slug });
  };

  const handleSearch = (query: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return;
    }

    setInitialPostSlug(undefined);
    setInitialSearchQuery(query.trim());
    navigateToHashRoute({ view: 'search', query: query.trim() });
    setPendingView('search');
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    if (pendingView) {
      setView(pendingView);
      setPendingView(null);
    }
    // Keep the effect for a bit after view change for smooth blend
    setTimeout(() => setIsTransitioning(false), 50);
  };

  const viewFallback = (
    <div className="flex h-full w-full items-center justify-center bg-hud-bg font-mono text-[11px] uppercase tracking-[0.34em] text-neon-cyan/58">
      Loading_View
    </div>
  );

  return (
    <div className="w-full h-screen bg-hud-bg cursor-none overflow-hidden">
      <div className="scanlines" />
      <div className="vignette" />
      <QuantumField />
      <CustomCursor />
      
      <AnnihilationTransition 
        isActive={isTransitioning} 
        onComplete={handleTransitionComplete} 
      />

      <AnimatePresence mode="wait">
        {view === 'lobby' ? (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ 
              opacity: 0,
              scale: 1.05,
              filter: "blur(20px)"
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <Lobby
              onEnter={handleEnter}
              onOpenReferences={handleOpenReferences}
              onSearch={handleSearch}
              onOpenProfile={handleOpenProfile}
            />
          </motion.div>
        ) : view === 'archive' ? (
          <motion.div
            key="archive"
            initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ 
              opacity: 0,
              scale: 0.95,
              filter: "blur(20px)"
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <Suspense fallback={viewFallback}>
              <Archive
                onBack={handleBack}
                initialCategory={initialCategory}
                initialPostSlug={initialPostSlug}
                initialSearchQuery={initialSearchQuery}
                onPostOpen={handlePostOpen}
              />
            </Suspense>
          </motion.div>
        ) : view === 'search' ? (
          <motion.div
            key="search"
            initial={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              scale: 0.98,
              filter: "blur(20px)"
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <Suspense fallback={viewFallback}>
              <SearchResults
                onBack={handleBack}
                initialQuery={initialSearchQuery}
                onOpenPost={handleEnter}
                onSearch={handleSearch}
              />
            </Suspense>
          </motion.div>
        ) : view === 'references' ? (
          <motion.div
            key="references"
            initial={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              scale: 0.98,
              filter: "blur(20px)"
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <Suspense fallback={viewFallback}>
              <ReferenceLog onBack={handleBack} onOpenPost={handleEnter} />
            </Suspense>
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              scale: 0.98,
              filter: "blur(20px)"
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <Suspense fallback={viewFallback}>
              <ProfilePage onBack={handleBack} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
