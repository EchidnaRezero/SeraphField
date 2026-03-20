import { describe, expect, it } from 'vitest';
import { validateFrontmatterContract } from '../scripts/content-validation.mjs';

describe('validateFrontmatterContract', () => {
  const validFrontmatter = {
    title: '문서 제목',
    date: '2026-03-20',
    category: 'REPO',
    tags: ['TagA', 'TagB'],
    summary: '한 줄 요약',
    tracked_versions: ['repo-a'],
  };

  it('정상 frontmatter는 통과한다', () => {
    expect(() =>
      validateFrontmatterContract(validFrontmatter, '# 문서 제목\n\n## 섹션\n내용', '레포/test.md'),
    ).not.toThrow();
  });

  it('tags 문자열 입력은 거부한다', () => {
    expect(() =>
      validateFrontmatterContract(
        { ...validFrontmatter, category: 'THEORY', tracked_versions: undefined, tags: 'TagA, TagB' },
        '# 문서 제목',
        '수학/test.md',
      ),
    ).toThrow(/tags must be a non-empty YAML string array/);
  });

  it('REPO 외 tracked_versions 사용을 거부한다', () => {
    expect(() =>
      validateFrontmatterContract(
        { ...validFrontmatter, category: 'PAPER' },
        '# 문서 제목',
        '논문/test.md',
      ),
    ).toThrow(/tracked_versions is only allowed for REPO documents/);
  });

  it('로컬 절대 경로를 거부한다', () => {
    expect(() =>
      validateFrontmatterContract(
        { ...validFrontmatter },
        '# 문서 제목\n\nC:\\private\\note.md',
        '레포/test.md',
      ),
    ).toThrow(/absolute local paths are not allowed/);
  });
});
