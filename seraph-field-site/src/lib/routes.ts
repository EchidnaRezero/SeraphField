import type { AppView } from '../types';

export interface HashRoute {
  view: AppView;
  slug?: string;
  query?: string;
}

export const parseHashRoute = (hashValue: string): HashRoute => {
  const hash = hashValue.replace(/^#/, '');

  if (!hash || hash === 'lobby') {
    return { view: 'lobby' };
  }

  if (hash === 'archive') {
    return { view: 'archive' };
  }

  if (hash.startsWith('archive/')) {
    return {
      view: 'archive',
      slug: decodeURIComponent(hash.slice('archive/'.length)),
    };
  }

  if (hash === 'references') {
    return { view: 'references' };
  }

  if (hash === 'profile') {
    return { view: 'profile' };
  }

  if (hash === 'search') {
    return { view: 'search' };
  }

  if (hash.startsWith('search/')) {
    return {
      view: 'search',
      query: decodeURIComponent(hash.slice('search/'.length)),
    };
  }

  if (hash === 'graph') {
    return { view: 'graph' };
  }

  if (hash.startsWith('graph/')) {
    return {
      view: 'graph',
      slug: decodeURIComponent(hash.slice('graph/'.length)),
    };
  }

  return { view: 'lobby' };
};

export const buildHash = (route: HashRoute) => {
  switch (route.view) {
    case 'archive':
      return route.slug ? `#archive/${encodeURIComponent(route.slug)}` : '#archive';
    case 'references':
      return '#references';
    case 'search':
      return route.query ? `#search/${encodeURIComponent(route.query)}` : '#search';
    case 'profile':
      return '#profile';
    case 'graph':
      return route.slug ? `#graph/${encodeURIComponent(route.slug)}` : '#graph';
    case 'lobby':
    default:
      return '#lobby';
  }
};

export const navigateToHashRoute = (route: HashRoute, options?: { replace?: boolean }) => {
  const nextHash = buildHash(route);

  if (window.location.hash === nextHash) {
    return;
  }

  if (options?.replace) {
    window.history.replaceState(null, '', nextHash);
    return;
  }

  window.history.pushState(null, '', nextHash);
};
