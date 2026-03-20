import React from 'react';
import type { Category, Post, SearchIndexEntry } from '../types';

export interface TocItem {
  text: string;
  id: string;
}

export const buildHeadingId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');

export const extractTableOfContents = (content: string): TocItem[] =>
  content
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => {
      const text = line.replace('## ', '').trim();
      return { text, id: buildHeadingId(text) };
    });

export const filterPostsByCategoryAndQuery = (
  allPosts: Post[],
  indexEntries: SearchIndexEntry[],
  category: Category,
  query: string,
) => {
  const normalizedQuery = query.trim().toLowerCase();
  const allowedIds = new Set(
    indexEntries
      .filter((entry) => entry.category === category)
      .filter((entry) => {
        if (!normalizedQuery) {
          return true;
        }

        return (
          entry.title.toLowerCase().includes(normalizedQuery) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
          entry.rawText.toLowerCase().includes(normalizedQuery)
        );
      })
      .map((entry) => entry.id),
  );

  return allPosts.filter((post) => allowedIds.has(post.id));
};

export const isDisplayMathParagraph = (children: React.ReactNode) => {
  const childArray = React.Children.toArray(children).filter((child) => {
    if (typeof child === 'string') {
      return child.trim().length > 0;
    }
    return true;
  });
  const firstChild = childArray[0] as React.ReactElement<{ className?: string }> | undefined;

  return (
    childArray.length === 1 &&
    React.isValidElement(firstChild) &&
    typeof firstChild.props.className === 'string' &&
    firstChild.props.className.includes('katex-display')
  );
};
