import React from 'react';

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

export const normalizeMathDelimiters = (content: string) => {
  const lines = content.split('\n');
  const normalized: string[] = [];
  let inFence = false;

  for (const line of lines) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('```')) {
      inFence = !inFence;
      normalized.push(line);
      continue;
    }

    if (inFence) {
      normalized.push(line);
      continue;
    }

    normalized.push(line.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$').replace(/\\\(/g, '$').replace(/\\\)/g, '$'));
  }

  return normalized.join('\n');
};
