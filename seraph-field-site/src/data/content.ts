import postsData from "../generated/posts.json";
import searchIndexData from "../generated/search-index.json";
import type { Post, SearchIndexEntry, TrackedRepository } from "../types";

export const posts = postsData as Post[];
export const searchIndex = searchIndexData as SearchIndexEntry[];
export const postsBySlug = new Map(posts.map((post) => [post.slug, post]));

export const contentStats = (() => {
  const uniqueTags = new Set(posts.flatMap((post) => post.tags.map((tag) => tag.toLowerCase())));
  const latestPost = [...posts].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
  )[0];

  return {
    postCount: posts.length,
    uniqueTagCount: uniqueTags.size,
    latestPostDate: latestPost?.date.replace(/-/g, '.') ?? 'N/A',
  };
})();

export const popularTags = (() => {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'ko'))
    .slice(0, 4)
    .map(([tag]) => `#${tag}`);
})();

export const trackedRepositories: TrackedRepository[] = (() => {
  const references = new Map<string, TrackedRepository>();

  for (const post of posts.filter((entry) => entry.category === "REPO")) {
    for (const version of post.versions ?? []) {
      const existing = references.get(version.library);
      if (!existing || new Date(version.date).getTime() > new Date(existing.date).getTime()) {
        references.set(version.library, {
          library: version.library,
          version: version.version,
          date: version.date,
          url: version.url,
          sourceSlug: post.slug,
          sourceTitle: post.title,
          sourceCategory: post.category,
        });
      }
    }
  }

  return [...references.values()].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
})();
