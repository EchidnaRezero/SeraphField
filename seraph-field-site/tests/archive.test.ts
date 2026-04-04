import React from 'react';
import { describe, expect, it } from 'vitest';
import { buildHeadingId, extractTableOfContents, isDisplayMathParagraph } from '../src/lib/archive';

describe('buildHeadingId', () => {
  it('공백과 문장부호를 정리한다', () => {
    expect(buildHeadingId('  Rectified Flow: 개요 / 메모  ')).toBe('rectified-flow-개요-메모');
  });
});

describe('extractTableOfContents', () => {
  it('## 헤딩만 TOC로 추출한다', () => {
    expect(extractTableOfContents('# 제목\n\n## 첫 섹션\n내용\n### 제외\n## 둘째 섹션')).toEqual([
      { text: '첫 섹션', id: '첫-섹션' },
      { text: '둘째 섹션', id: '둘째-섹션' },
    ]);
  });
});

describe('isDisplayMathParagraph', () => {
  it('display math 전용 문단을 감지한다', () => {
    const element = React.createElement('span', { className: 'katex-display' }, 'math');
    expect(isDisplayMathParagraph(element)).toBe(true);
  });

  it('일반 문단은 false를 반환한다', () => {
    expect(isDisplayMathParagraph('plain text')).toBe(false);
  });
});
