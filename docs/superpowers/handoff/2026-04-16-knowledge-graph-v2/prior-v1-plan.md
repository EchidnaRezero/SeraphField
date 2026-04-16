# 지식그래프 기능 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** RAW의 수학 문서에 `graph:` 프론트매터를 단 문서들을 빌드 시 `graphs.json`으로 변환하고, 홈에서 진입하면 Cytoscape 기반 2D 뷰어로 망각·포함 관계를 탐색할 수 있는 기능을 추가한다.

**Architecture:** 별도 빌드 스크립트(`build-graph.mjs`)가 RAW를 스캔해 `src/generated/graphs.json`을 생성. React 뷰어 컴포넌트(`GraphView`)는 별도 Vite chunk로 분리되어 지연 로딩. 기존 블로그 파이프라인과 독립적으로 동작.

**Tech Stack:** Node.js, gray-matter, Vite manualChunks, React 19, TypeScript, Cytoscape.js + cytoscape-dagre, Vitest, Tailwind CSS 4.

**Spec:** [docs/superpowers/specs/2026-04-16-knowledge-graph-design.md](../specs/2026-04-16-knowledge-graph-design.md)

---

## 파일 구조

### 생성
- `seraph-field-site/scripts/build-graph.mjs` — md 스캔·검증·JSON 생성
- `seraph-field-site/scripts/graph-validation.mjs` — 공유 검증 규칙
- `seraph-field-site/scripts/__tests__/build-graph.test.mjs` — 빌드 스크립트 테스트
- `seraph-field-site/src/generated/graphs.json` — 빌드 산출물 (git ignore 안 함; 현재 `posts.json`도 커밋되는 패턴 따름)
- `seraph-field-site/src/types/graph.ts` — TS 타입 정의
- `seraph-field-site/src/features/graph/loadGraph.ts` — 로더
- `seraph-field-site/src/features/graph/useGraphInteraction.ts` — 상호작용 상태 훅
- `seraph-field-site/src/features/graph/__tests__/loadGraph.test.ts`
- `seraph-field-site/src/features/graph/__tests__/useGraphInteraction.test.ts`
- `seraph-field-site/src/components/graph/graphStyle.ts` — Cytoscape 스타일 상수
- `seraph-field-site/src/components/graph/GraphView.tsx`
- `seraph-field-site/src/components/graph/GraphFilters.tsx`
- `seraph-field-site/src/components/graph/GraphPanel.tsx`
- `seraph-field-site/src/components/lobby/GraphClusterCard.tsx` — Lobby 진입 카드
- `RAW/THEORY/algebra-seed/` — 시드 데이터용 디렉토리 (5~6개 md)

### 수정
- `seraph-field-site/package.json` — `graph:build` 스크립트 + `cytoscape` / `cytoscape-dagre` 의존성
- `seraph-field-site/vite.config.ts` — graph 관련 manualChunk
- `seraph-field-site/src/types.ts` — `AppView`에 `'graph'` 추가, 그래프 라우트 타입
- `seraph-field-site/src/lib/routes.ts` — `#graph/:name` 해시 파싱·빌드
- `seraph-field-site/src/App.tsx` — `graph` 뷰 렌더링 분기
- `seraph-field-site/src/components/lobby/LobbyDesktopLayout.tsx` — `GraphClusterCard` 삽입
- `seraph-field-site/src/components/lobby/LobbyMobileLayout.tsx` — 동일
- `seraph-field-site/src/components/Archive.tsx` 또는 문서 상세 렌더 컴포넌트 — 하단 "이 그래프에 속함" 링크
- `seraph-field-site/scripts/content-validation.mjs` — 로컬 경로 패턴 확장

---

## Task 1: 로컬 경로 검증 패턴 확장

**Files:**
- Modify: `seraph-field-site/scripts/content-validation.mjs:63-67`
- Create: `seraph-field-site/scripts/__tests__/content-validation.test.mjs`

- [ ] **Step 1: 테스트 파일 작성**

`seraph-field-site/scripts/__tests__/content-validation.test.mjs`:
```js
import { describe, it, expect } from 'vitest';
import { validateFrontmatterContract } from '../content-validation.mjs';

const baseFm = {
  title: 'T',
  date: '2026-04-16',
  category: 'THEORY',
  tags: ['x'],
  summary: 's',
};
const baseBody = '# T\n\nbody';

function run(fm, body = baseBody) {
  return () => validateFrontmatterContract({ ...baseFm, ...fm }, body, 'test.md');
}

describe('local path detection', () => {
  const cases = [
    ['C:\\Users\\kazuk\\file.md', 'windows backslash'],
    ['C:/Users/kazuk/file.md', 'windows forward slash'],
    ['/Users/kazuk/file.md', 'macOS absolute'],
    ['/home/kazuk/file.md', 'linux absolute'],
    ['~/Documents/file.md', 'tilde home'],
    ['$HOME/file.md', 'HOME env'],
    ['%USERPROFILE%\\file.md', 'userprofile env'],
    ['%APPDATA%\\file.md', 'appdata env'],
    ['file:///C:/x', 'file url'],
  ];
  for (const [path, label] of cases) {
    it(`rejects ${label}`, () => {
      expect(run({}, `# T\n\nsee ${path}\n`)).toThrow(/local paths/);
    });
  }
  it('accepts normal content', () => {
    expect(run({})).not.toThrow();
  });
  it('rejects local path in frontmatter', () => {
    expect(run({ summary: 'see C:/Users/kazuk' })).toThrow(/local paths/);
  });
});
```

- [ ] **Step 2: 테스트 실행 (실패 예상)**

Run: `cd seraph-field-site && npm test -- content-validation`
Expected: Windows forward slash · Unix · tilde · env 케이스들이 FAIL (현재 패턴은 backslash · file:// 만 잡음).

- [ ] **Step 3: `content-validation.mjs` export 및 패턴 확장**

`validateFrontmatterContract`가 이미 `export` 되어 있는지 확인. 없으면 `export` 추가. 그리고 `localPathPattern` 교체:

```js
const localPathPattern =
  /(?:[A-Za-z]:[\\/]|file:\/\/|(?:^|\s|["'(\[])~\/|\$HOME\b|%USERPROFILE%|%APPDATA%|\/Users\/|\/home\/)/i;
```

`~/`는 단순 `~/`로 잡으면 URL 프래그먼트 등에 오탐 가능성이 있어 앞에 공백·따옴표·행시작 중 하나를 요구하도록 묶음.

- [ ] **Step 4: 테스트 재실행 (전부 통과)**

Run: `cd seraph-field-site && npm test -- content-validation`
Expected: PASS.

- [ ] **Step 5: 수동 스모크**

Run: `cd seraph-field-site && npm run content:build`
Expected: 기존 RAW 문서들이 그대로 통과 (오탐 없음).

- [ ] **Step 6: 커밋**

```bash
git add seraph-field-site/scripts/content-validation.mjs seraph-field-site/scripts/__tests__/content-validation.test.mjs
git commit -m "feat(validation): broaden local path detection to Unix/env/forward-slash"
```

---

## Task 2: 의존성 설치 + Vite chunk 설정

**Files:**
- Modify: `seraph-field-site/package.json`
- Modify: `seraph-field-site/vite.config.ts`

- [ ] **Step 1: Cytoscape 최신 버전 확인**

Run: `cd seraph-field-site && npm view cytoscape version && npm view cytoscape-dagre version`
예상 출력 (2026-04 기준): cytoscape ^3.30.x, cytoscape-dagre ^2.5.x.

- [ ] **Step 2: 설치**

Run: `cd seraph-field-site && npm install cytoscape cytoscape-dagre`

- [ ] **Step 3: `vite.config.ts` manualChunks에 graph chunk 추가**

`vite.config.ts`의 `manualChunks` 함수 안에 다음 블록 추가 (기존 `markdown-stack` 분기들과 같은 수준):

```ts
if (id.includes('/src/generated/graphs.json')) {
  return 'content-graphs';
}

if (
  id.includes('/node_modules/cytoscape') ||
  id.includes('/node_modules/dagre') ||
  id.includes('/node_modules/@cytoscape') ||
  id.includes('/src/components/graph/') ||
  id.includes('/src/features/graph/')
) {
  return 'graph-viewer';
}
```

- [ ] **Step 4: 빌드 스모크 (아직 graph.json 없으므로 컴포넌트도 없음)**

`src/generated/graphs.json` 가 아직 없지만 chunk 규칙만 추가한 상태에선 빌드가 깨지지 않아야 함.

Run: `cd seraph-field-site && npm run build`
Expected: 기존처럼 성공.

- [ ] **Step 5: 커밋**

```bash
git add seraph-field-site/package.json seraph-field-site/package-lock.json seraph-field-site/vite.config.ts
git commit -m "chore(graph): add cytoscape deps and vite chunk split"
```

---

## Task 3: 그래프 타입 정의

**Files:**
- Create: `seraph-field-site/src/types/graph.ts`

- [ ] **Step 1: 타입 파일 작성**

```ts
// src/types/graph.ts
export type GraphRelation = 'forgets_to' | 'embeds_into';

export interface GraphNode {
  id: string;
  title: string;
  docPath: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: GraphRelation;
  diff: string;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type GraphsIndex = Record<string, Graph>;
```

- [ ] **Step 2: 타입 체크**

Run: `cd seraph-field-site && npm run lint`
Expected: PASS.

- [ ] **Step 3: 커밋**

```bash
git add seraph-field-site/src/types/graph.ts
git commit -m "feat(graph): add graph TS types"
```

---

## Task 4: `graph-validation.mjs` 규칙 + 테스트

**Files:**
- Create: `seraph-field-site/scripts/graph-validation.mjs`
- Create: `seraph-field-site/scripts/__tests__/graph-validation.test.mjs`

- [ ] **Step 1: 실패 테스트 작성**

`seraph-field-site/scripts/__tests__/graph-validation.test.mjs`:
```js
import { describe, it, expect } from 'vitest';
import { validateGraphGroup } from '../graph-validation.mjs';

function doc(slug, extra = {}) {
  return {
    relativePath: `RAW/THEORY/${slug}.md`,
    frontmatter: { graph: 'algebra', slug, title: slug, ...extra },
  };
}

describe('validateGraphGroup', () => {
  it('accepts a valid group', () => {
    const docs = [
      doc('group', { forgets_to: [{ to: 'monoid', loses: 'inverse' }] }),
      doc('monoid'),
    ];
    expect(() => validateGraphGroup('algebra', docs)).not.toThrow();
  });

  it('rule 1: graph without slug throws', () => {
    const docs = [{ relativePath: 'x.md', frontmatter: { graph: 'algebra' } }];
    expect(() => validateGraphGroup('algebra', docs)).toThrow(/slug is required/);
  });

  it('rule 2: duplicate slug within graph throws', () => {
    const docs = [doc('group'), doc('group')];
    expect(() => validateGraphGroup('algebra', docs)).toThrow(/duplicate slug/);
  });

  it('rule 3: unknown edge target throws', () => {
    const docs = [doc('group', { forgets_to: [{ to: 'zzz', loses: 'x' }] })];
    expect(() => validateGraphGroup('algebra', docs)).toThrow(/unknown slug/);
  });

  it('rule 4: self-reference throws', () => {
    const docs = [doc('group', { forgets_to: [{ to: 'group', loses: 'x' }] })];
    expect(() => validateGraphGroup('algebra', docs)).toThrow(/self-reference/);
  });

  it('rule 5: empty loses throws', () => {
    const docs = [
      doc('group', { forgets_to: [{ to: 'monoid', loses: '' }] }),
      doc('monoid'),
    ];
    expect(() => validateGraphGroup('algebra', docs)).toThrow(/non-empty/);
  });

  it('rule 5: empty gains throws', () => {
    const docs = [
      doc('g1', { embeds_into: [{ to: 'g2', gains: '   ' }] }),
      doc('g2'),
    ];
    expect(() => validateGraphGroup('algebra', docs)).toThrow(/non-empty/);
  });

  it('rule 6: duplicate (from,to,relation) throws', () => {
    const docs = [
      doc('g1', {
        forgets_to: [
          { to: 'g2', loses: 'a' },
          { to: 'g2', loses: 'b' },
        ],
      }),
      doc('g2'),
    ];
    expect(() => validateGraphGroup('algebra', docs)).toThrow(/duplicate edge/);
  });
});
```

- [ ] **Step 2: 테스트 실행 (전부 실패 — 함수가 아직 없음)**

Run: `cd seraph-field-site && npm test -- graph-validation`
Expected: 모든 테스트 FAIL.

- [ ] **Step 3: `graph-validation.mjs` 구현**

`seraph-field-site/scripts/graph-validation.mjs`:
```js
export function validateGraphGroup(graphName, docs) {
  const errors = [];
  const slugs = new Set();

  for (const d of docs) {
    const fm = d.frontmatter;
    if (!fm.slug || typeof fm.slug !== 'string' || !fm.slug.trim()) {
      errors.push(`[${d.relativePath}] slug is required when graph is set`);
      continue;
    }
    if (slugs.has(fm.slug)) {
      errors.push(`[${d.relativePath}] duplicate slug "${fm.slug}" in graph "${graphName}"`);
    }
    slugs.add(fm.slug);
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  const seenEdge = new Set();
  for (const d of docs) {
    const fm = d.frontmatter;
    checkEdges(d, fm, 'forgets_to', 'loses', slugs, graphName, seenEdge, errors);
    checkEdges(d, fm, 'embeds_into', 'gains', slugs, graphName, seenEdge, errors);
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
}

function checkEdges(d, fm, key, diffKey, slugs, graphName, seenEdge, errors) {
  const rel = fm[key];
  if (rel === undefined) return;
  if (!Array.isArray(rel)) {
    errors.push(`[${d.relativePath}] ${key} must be an array`);
    return;
  }
  for (const [i, e] of rel.entries()) {
    if (!e || typeof e !== 'object') {
      errors.push(`[${d.relativePath}] ${key}[${i}] must be an object with to/${diffKey}`);
      continue;
    }
    const to = e.to;
    const diff = e[diffKey];
    if (!to || typeof to !== 'string' || !to.trim()) {
      errors.push(`[${d.relativePath}] ${key}[${i}].to is required`);
      continue;
    }
    if (!slugs.has(to)) {
      errors.push(`[${d.relativePath}] ${key}[${i}] references unknown slug "${to}" (must exist in graph "${graphName}")`);
    }
    if (to === fm.slug) {
      errors.push(`[${d.relativePath}] ${key}[${i}] self-reference ("${to}") is not allowed`);
    }
    if (typeof diff !== 'string' || !diff.trim()) {
      errors.push(`[${d.relativePath}] ${key}[${i}].${diffKey} must be a non-empty string`);
    }
    const edgeKey = `${fm.slug}|${to}|${key}`;
    if (seenEdge.has(edgeKey)) {
      errors.push(`[${d.relativePath}] duplicate edge (${fm.slug} -${key}-> ${to})`);
    }
    seenEdge.add(edgeKey);
  }
}
```

- [ ] **Step 4: 테스트 재실행 (전부 통과)**

Run: `cd seraph-field-site && npm test -- graph-validation`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add seraph-field-site/scripts/graph-validation.mjs seraph-field-site/scripts/__tests__/graph-validation.test.mjs
git commit -m "feat(graph): graph validation rules + tests"
```

---

## Task 5: `build-graph.mjs` 빌더 + 통합 테스트

**Files:**
- Create: `seraph-field-site/scripts/build-graph.mjs`
- Create: `seraph-field-site/scripts/__tests__/build-graph.test.mjs`

- [ ] **Step 1: 통합 테스트 작성 (fixture 기반)**

`seraph-field-site/scripts/__tests__/build-graph.test.mjs`:
```js
import { describe, it, expect } from 'vitest';
import { buildGraphs } from '../build-graph.mjs';

function fm(obj) {
  return obj;
}

describe('buildGraphs', () => {
  it('skips docs without graph field', () => {
    const docs = [
      { relativePath: 'a.md', frontmatter: fm({ title: 'A' }) },
    ];
    expect(buildGraphs(docs)).toEqual({});
  });

  it('groups docs by graph name and emits nodes/edges', () => {
    const docs = [
      {
        relativePath: 'RAW/THEORY/group.md',
        frontmatter: fm({
          graph: 'algebra',
          slug: 'group',
          title: 'Group',
          forgets_to: [{ to: 'monoid', loses: '역원' }],
        }),
      },
      {
        relativePath: 'RAW/THEORY/monoid.md',
        frontmatter: fm({ graph: 'algebra', slug: 'monoid', title: 'Monoid' }),
      },
      {
        relativePath: 'RAW/THEORY/abelian.md',
        frontmatter: fm({
          graph: 'algebra',
          slug: 'abelian_group',
          title: 'Abelian Group',
          embeds_into: [{ to: 'group', gains: '교환법칙' }],
        }),
      },
    ];
    const result = buildGraphs(docs);
    expect(Object.keys(result)).toEqual(['algebra']);
    expect(result.algebra.nodes).toHaveLength(3);
    expect(result.algebra.edges).toEqual([
      { from: 'group', to: 'monoid', relation: 'forgets_to', diff: '역원' },
      { from: 'abelian_group', to: 'group', relation: 'embeds_into', diff: '교환법칙' },
    ]);
  });

  it('docPath strips the RAW/ prefix and .md extension', () => {
    const docs = [
      {
        relativePath: 'RAW/THEORY/group.md',
        frontmatter: fm({ graph: 'algebra', slug: 'group', title: 'Group' }),
      },
    ];
    expect(buildGraphs(docs).algebra.nodes[0].docPath).toBe('THEORY/group');
  });

  it('falls back to slug if title missing', () => {
    const docs = [
      {
        relativePath: 'RAW/THEORY/group.md',
        frontmatter: fm({ graph: 'algebra', slug: 'group' }),
      },
    ];
    expect(buildGraphs(docs).algebra.nodes[0].title).toBe('group');
  });

  it('cross-graph edge references are rejected', () => {
    const docs = [
      {
        relativePath: 'a.md',
        frontmatter: fm({
          graph: 'algebra', slug: 'g', forgets_to: [{ to: 't', loses: 'x' }],
        }),
      },
      {
        relativePath: 't.md',
        frontmatter: fm({ graph: 'topology', slug: 't' }),
      },
    ];
    expect(() => buildGraphs(docs)).toThrow(/unknown slug/);
  });
});
```

- [ ] **Step 2: 테스트 실행 (FAIL)**

Run: `cd seraph-field-site && npm test -- build-graph`
Expected: 모듈 없음으로 FAIL.

- [ ] **Step 3: `build-graph.mjs` 구현**

`seraph-field-site/scripts/build-graph.mjs`:
```js
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, relative, resolve } from 'node:path';
import { globSync } from 'node:fs';
import matter from 'gray-matter';
import { validateGraphGroup } from './graph-validation.mjs';
import { validateFrontmatterContract } from './content-validation.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..', '..');
const rawRoot = resolve(repoRoot, 'RAW');
const outFile = resolve(__dirname, '..', 'src', 'generated', 'graphs.json');

export function buildGraphs(docs) {
  const byGraph = new Map();
  for (const d of docs) {
    const g = d.frontmatter.graph;
    if (!g || typeof g !== 'string') continue;
    if (!byGraph.has(g)) byGraph.set(g, []);
    byGraph.get(g).push(d);
  }

  const index = {};
  for (const [graphName, groupDocs] of byGraph) {
    validateGraphGroup(graphName, groupDocs);
    const nodes = groupDocs.map((d) => ({
      id: d.frontmatter.slug,
      title: d.frontmatter.title || d.frontmatter.slug,
      docPath: toDocPath(d.relativePath),
    }));
    const edges = [];
    for (const d of groupDocs) {
      const fm = d.frontmatter;
      for (const e of fm.forgets_to ?? []) {
        edges.push({ from: fm.slug, to: e.to, relation: 'forgets_to', diff: e.loses });
      }
      for (const e of fm.embeds_into ?? []) {
        edges.push({ from: fm.slug, to: e.to, relation: 'embeds_into', diff: e.gains });
      }
    }
    index[graphName] = { nodes, edges };
  }
  return index;
}

function toDocPath(relativePath) {
  // "RAW/THEORY/group.md" -> "THEORY/group"
  return relativePath.replace(/^RAW[\\/]/, '').replace(/\.md$/, '').replace(/\\/g, '/');
}

async function main() {
  const pattern = resolve(rawRoot, '**/*.md').replace(/\\/g, '/');
  const files = globSync(pattern);
  const docs = [];
  for (const abs of files) {
    const raw = await readFile(abs, 'utf8');
    const parsed = matter(raw);
    const rel = relative(repoRoot, abs).replace(/\\/g, '/');
    // 공용 검증 재사용 (지식그래프 문서도 같은 보안·형식 규칙 통과해야 함)
    try {
      validateFrontmatterContract(parsed.data, parsed.content, rel);
    } catch (err) {
      // graph 필드만 있는 문서가 기존 블로그 스키마를 안 맞출 수도 있으니
      // 최소한 로컬 경로 누출만 무조건 체크하도록 content-validation의 별도 헬퍼 사용을 고려할 수도 있음.
      // 여기선 일단 기존 계약을 그대로 요구해 보안/형식 일관성을 보장.
      throw err;
    }
    docs.push({ relativePath: rel, frontmatter: parsed.data });
  }
  const index = buildGraphs(docs);
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(index, null, 2) + '\n', 'utf8');
  const summary = Object.entries(index).map(
    ([k, g]) => `  ${k}: ${g.nodes.length} nodes, ${g.edges.length} edges`
  ).join('\n');
  console.log(`[graph] wrote ${outFile}\n${summary || '  (no graphs)'}`);
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  main().catch((err) => {
    console.error(`[graph] build failed:\n${err.message}`);
    process.exit(1);
  });
}
```

- [ ] **Step 4: 테스트 재실행 (PASS)**

Run: `cd seraph-field-site && npm test -- build-graph`
Expected: PASS.

- [ ] **Step 5: 빈 RAW 상태에서 스크립트 실행 스모크**

Run: `cd seraph-field-site && node scripts/build-graph.mjs`
Expected: `src/generated/graphs.json`에 `{}` 가 기록됨.

- [ ] **Step 6: 커밋**

```bash
git add seraph-field-site/scripts/build-graph.mjs seraph-field-site/scripts/__tests__/build-graph.test.mjs seraph-field-site/src/generated/graphs.json
git commit -m "feat(graph): add build-graph.mjs + integration tests"
```

---

## Task 6: `package.json` 빌드 체인 연결

**Files:**
- Modify: `seraph-field-site/package.json`

- [ ] **Step 1: scripts 갱신**

```json
"scripts": {
  "content:build": "node ./scripts/build-content.mjs",
  "graph:build": "node ./scripts/build-graph.mjs",
  "dev": "npm run content:build && npm run graph:build && vite --port=3000 --host=0.0.0.0",
  "build": "npm run content:build && npm run graph:build && vite build",
  ...
}
```

- [ ] **Step 2: 빌드 스모크**

Run: `cd seraph-field-site && npm run build`
Expected: PASS. dist 생성 확인.

- [ ] **Step 3: 커밋**

```bash
git add seraph-field-site/package.json
git commit -m "chore(graph): wire graph:build into build/dev chain"
```

---

## Task 7: `loadGraph` 로더

**Files:**
- Create: `seraph-field-site/src/features/graph/loadGraph.ts`
- Create: `seraph-field-site/src/features/graph/__tests__/loadGraph.test.ts`

- [ ] **Step 1: 테스트 작성**

```ts
// src/features/graph/__tests__/loadGraph.test.ts
import { describe, it, expect, vi } from 'vitest';
import type { GraphsIndex } from '../../../types/graph';

vi.mock('../../../generated/graphs.json', () => ({
  default: {
    algebra: {
      nodes: [{ id: 'group', title: 'Group', docPath: 'THEORY/group' }],
      edges: [],
    },
  } satisfies GraphsIndex,
}));

import { loadGraph, listGraphNames } from '../loadGraph';

describe('loadGraph', () => {
  it('returns graph when name exists', () => {
    const g = loadGraph('algebra');
    expect(g?.nodes).toHaveLength(1);
  });
  it('returns null when name missing', () => {
    expect(loadGraph('nope')).toBeNull();
  });
  it('listGraphNames returns sorted names', () => {
    expect(listGraphNames()).toEqual(['algebra']);
  });
});
```

- [ ] **Step 2: 테스트 실행 (FAIL — 모듈 없음)**

Run: `cd seraph-field-site && npm test -- loadGraph`

- [ ] **Step 3: 구현**

```ts
// src/features/graph/loadGraph.ts
import graphs from '../../generated/graphs.json';
import type { Graph, GraphsIndex } from '../../types/graph';

const index = graphs as GraphsIndex;

export function loadGraph(name: string): Graph | null {
  return index[name] ?? null;
}

export function listGraphNames(): string[] {
  return Object.keys(index).sort();
}
```

`tsconfig.json`에 `resolveJsonModule`이 켜져 있지 않으면 켠다. (기존 `posts.json` 임포트 경로가 동작하므로 이미 켜져 있을 가능성 높음. 문제 발생 시 `tsconfig.json`에 `"resolveJsonModule": true` 추가.)

- [ ] **Step 4: 테스트 재실행 (PASS)**

Run: `cd seraph-field-site && npm test -- loadGraph`

- [ ] **Step 5: 커밋**

```bash
git add seraph-field-site/src/features/graph/loadGraph.ts seraph-field-site/src/features/graph/__tests__/loadGraph.test.ts
git commit -m "feat(graph): loadGraph + listGraphNames with tests"
```

---

## Task 8: `useGraphInteraction` 상태 훅

**Files:**
- Create: `seraph-field-site/src/features/graph/useGraphInteraction.ts`
- Create: `seraph-field-site/src/features/graph/__tests__/useGraphInteraction.test.ts`

- [ ] **Step 1: 테스트 작성**

```ts
// src/features/graph/__tests__/useGraphInteraction.test.ts
import { describe, it, expect } from 'vitest';
import { computeNeighbors, computeVisibleEdges } from '../useGraphInteraction';
import type { Graph, GraphEdge } from '../../../types/graph';

const g: Graph = {
  nodes: [
    { id: 'group', title: 'Group', docPath: 'x' },
    { id: 'monoid', title: 'Monoid', docPath: 'x' },
    { id: 'abelian_group', title: 'AbGrp', docPath: 'x' },
    { id: 'semigroup', title: 'Semigrp', docPath: 'x' },
  ],
  edges: [
    { from: 'group', to: 'monoid', relation: 'forgets_to', diff: 'a' },
    { from: 'abelian_group', to: 'group', relation: 'embeds_into', diff: 'b' },
    { from: 'monoid', to: 'semigroup', relation: 'forgets_to', diff: 'c' },
  ],
};

describe('computeNeighbors', () => {
  it('includes selected node plus directly connected nodes', () => {
    const n = computeNeighbors(g, 'group');
    expect([...n].sort()).toEqual(['abelian_group', 'group', 'monoid']);
  });
  it('returns empty Set when node not found', () => {
    expect(computeNeighbors(g, 'nope').size).toBe(0);
  });
});

describe('computeVisibleEdges', () => {
  const all: GraphEdge[] = g.edges;
  it('BOTH shows every edge', () => {
    expect(computeVisibleEdges(all, 'BOTH')).toHaveLength(3);
  });
  it('FORGETS filters forgets_to only', () => {
    expect(computeVisibleEdges(all, 'FORGETS').every((e) => e.relation === 'forgets_to')).toBe(true);
  });
  it('EMBEDS filters embeds_into only', () => {
    expect(computeVisibleEdges(all, 'EMBEDS').every((e) => e.relation === 'embeds_into')).toBe(true);
  });
});
```

- [ ] **Step 2: FAIL 확인**

Run: `cd seraph-field-site && npm test -- useGraphInteraction`

- [ ] **Step 3: 구현 (순수 함수 + React 훅)**

```ts
// src/features/graph/useGraphInteraction.ts
import { useCallback, useMemo, useState } from 'react';
import type { Graph, GraphEdge } from '../../types/graph';

export type EdgeFilter = 'BOTH' | 'FORGETS' | 'EMBEDS';

export function computeNeighbors(graph: Graph, selectedId: string): Set<string> {
  const result = new Set<string>();
  const hasNode = graph.nodes.some((n) => n.id === selectedId);
  if (!hasNode) return result;
  result.add(selectedId);
  for (const e of graph.edges) {
    if (e.from === selectedId) result.add(e.to);
    if (e.to === selectedId) result.add(e.from);
  }
  return result;
}

export function computeVisibleEdges(edges: GraphEdge[], filter: EdgeFilter): GraphEdge[] {
  if (filter === 'BOTH') return edges;
  if (filter === 'FORGETS') return edges.filter((e) => e.relation === 'forgets_to');
  return edges.filter((e) => e.relation === 'embeds_into');
}

export function useGraphInteraction(graph: Graph | null) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<EdgeFilter>('BOTH');

  const neighbors = useMemo(
    () => (graph && selectedId ? computeNeighbors(graph, selectedId) : null),
    [graph, selectedId]
  );

  const visibleEdges = useMemo(
    () => (graph ? computeVisibleEdges(graph.edges, filter) : []),
    [graph, filter]
  );

  const clearSelection = useCallback(() => setSelectedId(null), []);

  return {
    selectedId, setSelectedId, clearSelection,
    filter, setFilter,
    neighbors, visibleEdges,
  };
}
```

- [ ] **Step 4: 테스트 재실행**

Run: `cd seraph-field-site && npm test -- useGraphInteraction`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add seraph-field-site/src/features/graph/useGraphInteraction.ts seraph-field-site/src/features/graph/__tests__/useGraphInteraction.test.ts
git commit -m "feat(graph): interaction state hook + pure helpers with tests"
```

---

## Task 9: Cytoscape 스타일 상수 (`graphStyle.ts`)

**Files:**
- Create: `seraph-field-site/src/components/graph/graphStyle.ts`

- [ ] **Step 1: 스타일 시트 작성**

```ts
// src/components/graph/graphStyle.ts
import type { StylesheetStyle } from 'cytoscape';

const NEON_CYAN = '#19b8be';
const NEON_CYAN_BRIGHT = '#00e5ff';
const NEON_GREEN = '#00ff66';
const TEXT_MAIN = '#e0fbfc';

export const graphStylesheet: StylesheetStyle[] = [
  {
    selector: 'node',
    style: {
      shape: 'round-rectangle',
      'background-color': 'rgba(25,184,190,0.06)',
      'border-width': 1.2,
      'border-color': NEON_CYAN,
      label: 'data(title)',
      color: TEXT_MAIN,
      'font-family': '"Share Tech Mono", monospace',
      'font-size': 12,
      'text-valign': 'center',
      'text-halign': 'center',
      'text-transform': 'uppercase',
      'padding': 10,
      width: 'label',
      height: 'label',
    },
  },
  {
    selector: 'node:selected',
    style: {
      'background-color': 'rgba(25,184,190,0.22)',
      'border-color': NEON_CYAN_BRIGHT,
      'border-width': 2,
    },
  },
  {
    selector: 'node.dimmed',
    style: { opacity: 0.25 },
  },
  {
    selector: 'edge',
    style: {
      width: 1.4,
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
      'arrow-scale': 0.9,
    },
  },
  {
    selector: 'edge[relation = "forgets_to"]',
    style: {
      'line-color': NEON_CYAN,
      'target-arrow-color': NEON_CYAN,
    },
  },
  {
    selector: 'edge[relation = "embeds_into"]',
    style: {
      'line-color': NEON_GREEN,
      'target-arrow-color': NEON_GREEN,
      'line-style': 'dashed',
    },
  },
  {
    selector: 'edge.dimmed',
    style: { opacity: 0.15 },
  },
  {
    selector: 'edge.filtered-out',
    style: { display: 'none' },
  },
];

export const canvasBackground = 'rgba(12,18,22,0.95)';
export const canvasBorder = 'rgba(25,184,190,0.35)';
```

- [ ] **Step 2: 타입 체크**

Run: `cd seraph-field-site && npm run lint`
Expected: PASS.

- [ ] **Step 3: 커밋**

```bash
git add seraph-field-site/src/components/graph/graphStyle.ts
git commit -m "feat(graph): Cytoscape stylesheet matching HUD palette"
```

---

## Task 10: `GraphPanel` 컴포넌트

**Files:**
- Create: `seraph-field-site/src/components/graph/GraphPanel.tsx`

- [ ] **Step 1: 컴포넌트 작성**

KaTeX 수식을 diff에 포함할 수 있으므로 `react-markdown` + `remark-math` + `rehype-katex`를 이미 쓰고 있는 `ArchiveMarkdown`의 설정을 최소 버전으로 차용. (무거움을 피하려면 `katex` 자체의 `renderToString`을 써도 되지만 일관성 우선.)

```tsx
// src/components/graph/GraphPanel.tsx
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { Graph, GraphNode } from '../../types/graph';
import { navigateToHashRoute } from '../../lib/routes';

interface Props {
  graph: Graph;
  node: GraphNode;
  onClose: () => void;
}

export function GraphPanel({ graph, node, onClose }: Props) {
  const outgoing = graph.edges.filter((e) => e.from === node.id);
  const incoming = graph.edges.filter((e) => e.to === node.id);
  const neighborCount = new Set([
    ...outgoing.map((e) => e.to),
    ...incoming.map((e) => e.from),
  ]).size;

  return (
    <aside className="bracket-box absolute right-2 top-2 bottom-2 w-[min(45%,360px)] overflow-y-auto p-4 text-sm">
      <button
        className="absolute right-3 top-2 font-mono text-neon-cyan"
        onClick={onClose}
        aria-label="close panel"
      >×</button>
      <div className="font-mono text-[0.68rem] tracking-[0.18em] text-neon-cyan/70 uppercase">
        NODE // {node.id}
      </div>
      <h3 className="font-ui text-2xl uppercase tracking-wider text-white mt-1">{node.title}</h3>
      <p className="text-text-dim text-xs mb-4">
        {neighborCount} neighbor{neighborCount === 1 ? '' : 's'}
      </p>

      {outgoing.length > 0 && (
        <section className="mb-3">
          {outgoing.map((e, i) => (
            <EdgeLine key={`o-${i}`} arrow="→" label={labelFor(e.relation, 'out')} target={e.to} diff={e.diff} diffLabel={e.relation === 'forgets_to' ? 'LOSES' : 'GAINS'} />
          ))}
        </section>
      )}

      {incoming.length > 0 && (
        <section className="mb-3">
          {incoming.map((e, i) => (
            <EdgeLine key={`i-${i}`} arrow="←" label={labelFor(e.relation, 'in')} target={e.from} diff={e.diff} diffLabel={e.relation === 'forgets_to' ? 'LOSES' : 'GAINS'} />
          ))}
        </section>
      )}

      <button
        className="mermaid-toolbar__button"
        onClick={() => navigateToHashRoute({ view: 'archive', slug: node.docPath })}
      >
        READ FULL →
      </button>
    </aside>
  );
}

function labelFor(rel: 'forgets_to' | 'embeds_into', dir: 'out' | 'in'): string {
  if (rel === 'forgets_to') return dir === 'out' ? 'forgets_to' : 'forgets_from';
  return dir === 'out' ? 'embeds_into' : 'embeds_from';
}

function EdgeLine({ arrow, label, target, diff, diffLabel }: {
  arrow: string; label: string; target: string; diff: string; diffLabel: 'LOSES' | 'GAINS';
}) {
  const color = diffLabel === 'LOSES' ? 'text-neon-cyan' : 'text-[#00ff66]';
  return (
    <div className="mb-2">
      <div className={`font-mono text-xs ${color}`}>{arrow} {label}: {target}</div>
      <div className="ml-4 text-xs text-text-main">
        <span className="font-mono text-neon-cyan/70 mr-2">{diffLabel}</span>
        <span className="markdown-body inline">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {diff}
          </ReactMarkdown>
        </span>
      </div>
    </div>
  );
}
```

참고: `slug` (Archive slug) 규칙을 `docPath` 그대로 사용한다고 가정. 기존 Archive 라우팅이 `slug`를 어떻게 매칭하는지 확인 후 불일치면 보정 (Task 13에서 검증).

- [ ] **Step 2: 린트**

Run: `cd seraph-field-site && npm run lint`
Expected: PASS. (props 타입 오류 있으면 즉시 수정)

- [ ] **Step 3: 커밋**

```bash
git add seraph-field-site/src/components/graph/GraphPanel.tsx
git commit -m "feat(graph): GraphPanel with structural diff"
```

---

## Task 11: `GraphFilters` 컴포넌트

**Files:**
- Create: `seraph-field-site/src/components/graph/GraphFilters.tsx`

- [ ] **Step 1: 구현**

```tsx
// src/components/graph/GraphFilters.tsx
import type { EdgeFilter } from '../../features/graph/useGraphInteraction';

interface Props {
  value: EdgeFilter;
  onChange: (next: EdgeFilter) => void;
}

const OPTIONS: { key: EdgeFilter; label: string }[] = [
  { key: 'BOTH', label: 'BOTH' },
  { key: 'FORGETS', label: 'FORGETS' },
  { key: 'EMBEDS', label: 'EMBEDS' },
];

export function GraphFilters({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          className="mermaid-toolbar__button"
          style={{
            background: value === opt.key ? 'rgba(25,184,190,0.22)' : undefined,
            borderColor: value === opt.key ? '#00e5ff' : undefined,
            color: value === opt.key ? '#ffffff' : undefined,
          }}
          onClick={() => onChange(opt.key)}
          aria-pressed={value === opt.key}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 린트**

Run: `cd seraph-field-site && npm run lint`

- [ ] **Step 3: 커밋**

```bash
git add seraph-field-site/src/components/graph/GraphFilters.tsx
git commit -m "feat(graph): GraphFilters toggle component"
```

---

## Task 12: `GraphView` 호스트 컴포넌트

**Files:**
- Create: `seraph-field-site/src/components/graph/GraphView.tsx`

- [ ] **Step 1: 구현**

```tsx
// src/components/graph/GraphView.tsx
import { useEffect, useMemo, useRef } from 'react';
import cytoscape from 'cytoscape';
import type { Core, ElementDefinition } from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { loadGraph } from '../../features/graph/loadGraph';
import { useGraphInteraction } from '../../features/graph/useGraphInteraction';
import { GraphFilters } from './GraphFilters';
import { GraphPanel } from './GraphPanel';
import { graphStylesheet, canvasBackground, canvasBorder } from './graphStyle';

cytoscape.use(dagre);

interface Props {
  graphName: string;
}

export function GraphView({ graphName }: Props) {
  const graph = useMemo(() => loadGraph(graphName), [graphName]);
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const { selectedId, setSelectedId, clearSelection, filter, setFilter, neighbors } =
    useGraphInteraction(graph);

  useEffect(() => {
    if (!graph || !containerRef.current) return;

    const elements: ElementDefinition[] = [
      ...graph.nodes.map((n) => ({ data: { id: n.id, title: n.title } })),
      ...graph.edges.map((e, i) => ({
        data: {
          id: `e${i}`,
          source: e.from,
          target: e.to,
          relation: e.relation,
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: graphStylesheet,
      layout: { name: 'dagre', rankDir: 'TB', padding: 20 } as never,
      wheelSensitivity: 0.2,
    });
    cyRef.current = cy;

    cy.on('tap', 'node', (evt) => setSelectedId(evt.target.id()));
    cy.on('tap', (evt) => {
      if (evt.target === cy) clearSelection();
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [graph, setSelectedId, clearSelection]);

  // 필터 반영
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.edges().forEach((e) => {
      const rel = e.data('relation');
      const show =
        filter === 'BOTH' ||
        (filter === 'FORGETS' && rel === 'forgets_to') ||
        (filter === 'EMBEDS' && rel === 'embeds_into');
      e.toggleClass('filtered-out', !show);
    });
  }, [filter]);

  // 하이라이트 반영
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    if (!neighbors) {
      cy.nodes().removeClass('dimmed');
      cy.edges().removeClass('dimmed');
      cy.nodes().unselect();
      return;
    }
    cy.nodes().forEach((n) => n.toggleClass('dimmed', !neighbors.has(n.id())));
    cy.edges().forEach((e) => {
      const touch = neighbors.has(e.data('source')) && neighbors.has(e.data('target'));
      e.toggleClass('dimmed', !touch);
    });
    cy.nodes().unselect();
    if (selectedId) cy.getElementById(selectedId).select();
  }, [neighbors, selectedId]);

  if (!graph) {
    return (
      <div className="bracket-box m-6 p-8 text-center">
        <div className="font-mono text-neon-cyan tracking-widest">NO GRAPH FOUND</div>
        <a href="#lobby" className="mermaid-toolbar__button mt-4 inline-block">← BACK</a>
      </div>
    );
  }

  const selectedNode = selectedId
    ? graph.nodes.find((n) => n.id === selectedId) ?? null
    : null;

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-ui text-2xl uppercase tracking-wider text-white">
          GRAPH / {graphName}
        </div>
        <GraphFilters value={filter} onChange={setFilter} />
      </div>
      <div
        ref={containerRef}
        className="w-full h-[calc(100%-3rem)] relative"
        style={{ background: canvasBackground, border: `1px solid ${canvasBorder}` }}
      />
      {selectedNode && (
        <GraphPanel graph={graph} node={selectedNode} onClose={clearSelection} />
      )}
      {graph.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-text-dim">
          문서를 아직 태깅하지 않았습니다.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 린트**

Run: `cd seraph-field-site && npm run lint`

- [ ] **Step 3: 커밋**

```bash
git add seraph-field-site/src/components/graph/GraphView.tsx
git commit -m "feat(graph): GraphView host component wiring Cytoscape"
```

---

## Task 13: 라우팅 통합

**Files:**
- Modify: `seraph-field-site/src/types.ts`
- Modify: `seraph-field-site/src/lib/routes.ts`
- Modify: `seraph-field-site/src/App.tsx`

- [ ] **Step 1: `AppView` 확장**

`src/types.ts`에서 `AppView`에 `'graph'` 추가:
```ts
export type AppView = 'lobby' | 'archive' | 'references' | 'search' | 'profile' | 'graph';
```

- [ ] **Step 2: `routes.ts`에 그래프 케이스 추가**

`HashRoute`에 `graphName?: string` 필드 추가. `parseHashRoute`에 다음 블록(다른 `startsWith` 블록들과 동일 형식):
```ts
if (hash.startsWith('graph/')) {
  return {
    view: 'graph',
    graphName: decodeURIComponent(hash.slice('graph/'.length)),
  };
}
```

`buildHash`에도 케이스 추가:
```ts
case 'graph':
  return route.graphName ? `#graph/${encodeURIComponent(route.graphName)}` : '#lobby';
```

- [ ] **Step 3: `App.tsx`에 뷰 분기**

`App.tsx`에서 현재 뷰를 렌더링하는 switch/if 블록을 찾아 `'graph'` 케이스 추가. GraphView는 lazy import로 chunk 분리 활용:

```tsx
import { lazy, Suspense } from 'react';
const GraphView = lazy(() =>
  import('./components/graph/GraphView').then((m) => ({ default: m.GraphView }))
);
```

렌더 지점:
```tsx
{route.view === 'graph' && (
  <Suspense fallback={<div className="p-8 font-mono text-neon-cyan">LOADING GRAPH…</div>}>
    <GraphView graphName={route.graphName ?? ''} />
  </Suspense>
)}
```

- [ ] **Step 4: 빌드 + dev 스모크**

Run: `cd seraph-field-site && npm run build`
Expected: PASS. dist/assets 에 `graph-viewer` chunk 파일 존재 확인.

Run: `cd seraph-field-site && npm run dev` (백그라운드)
브라우저에서 `http://localhost:3000/#graph/algebra` 접속 — 아직 시드 데이터가 없어 `NO GRAPH FOUND` 메시지가 떠야 함.

- [ ] **Step 5: 커밋**

```bash
git add seraph-field-site/src/types.ts seraph-field-site/src/lib/routes.ts seraph-field-site/src/App.tsx
git commit -m "feat(graph): #graph/:name route + lazy-loaded view"
```

---

## Task 14: Lobby 진입 카드

**Files:**
- Create: `seraph-field-site/src/components/lobby/GraphClusterCard.tsx`
- Modify: `seraph-field-site/src/components/lobby/LobbyDesktopLayout.tsx`
- Modify: `seraph-field-site/src/components/lobby/LobbyMobileLayout.tsx`

- [ ] **Step 1: `GraphClusterCard.tsx` 작성**

```tsx
// src/components/lobby/GraphClusterCard.tsx
import { listGraphNames } from '../../features/graph/loadGraph';

export function GraphClusterCard() {
  const names = listGraphNames();
  if (names.length === 0) return null;

  return (
    <section className="collection-cluster">
      <header className="collection-cluster__header">
        <div>
          <p className="collection-cluster__eyebrow">KNOWLEDGE GRAPH</p>
          <h3 className="collection-cluster__title">Structural Atlas</h3>
          <p className="collection-cluster__meta">
            수학적 망각·포함 관계로 연결된 개념 지도. 노드를 골라 구조 diff를 살펴보세요.
          </p>
        </div>
      </header>
      <div className="collection-nav-grid">
        {names.map((name) => (
          <a key={name} href={`#graph/${encodeURIComponent(name)}`} className="collection-nav-card">
            <p className="collection-nav-card__eyebrow">GRAPH</p>
            <span className="collection-nav-card__title">{name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Lobby 레이아웃 2개에 삽입**

`LobbyDesktopLayout.tsx`와 `LobbyMobileLayout.tsx`에서 기존 `collection-hub`/`collection-cluster` 영역을 찾아 `<GraphClusterCard />`를 적절한 순서에 추가. (기존 패턴 그대로 따르면 됨.)

- [ ] **Step 3: 빌드 + 수동 확인**

Run: `cd seraph-field-site && npm run build && npm run dev`
브라우저에서 `http://localhost:3000/#lobby` — 아직 그래프가 0개라 카드가 렌더되지 않아야 함.

- [ ] **Step 4: 커밋**

```bash
git add seraph-field-site/src/components/lobby/GraphClusterCard.tsx seraph-field-site/src/components/lobby/LobbyDesktopLayout.tsx seraph-field-site/src/components/lobby/LobbyMobileLayout.tsx
git commit -m "feat(graph): Lobby cluster card entry point"
```

---

## Task 15: Archive 하단 "이 그래프에 속함" 링크

**Files:**
- Modify: Archive의 문서 상세 렌더 컴포넌트 (이름은 `Archive.tsx` 또는 `ArchiveMarkdown.tsx` — 실제로 프론트매터를 받는 쪽을 확인)

- [ ] **Step 1: 대상 파일 식별**

Run: `cd seraph-field-site && grep -n "graph" src/components/Archive*.tsx` — 기존에 `graph` 필드 접근이 있으면 재사용 가능한 지점. 프론트매터 객체를 받는 컴포넌트를 찾아 수정한다.

- [ ] **Step 2: 하단 링크 삽입**

대상 컴포넌트의 본문 렌더 직후(끝 섹션) 아래 블록 추가:
```tsx
{frontmatter.graph && frontmatter.slug && (
  <aside className="info-panel mt-8">
    <span className="opacity-70">이 문서는 </span>
    <a href={`#graph/${encodeURIComponent(frontmatter.graph)}?node=${encodeURIComponent(frontmatter.slug)}`}>
      {frontmatter.graph}
    </a>
    <span className="opacity-70"> 그래프에 속합니다 →</span>
  </aside>
)}
```

`?node=` 는 Task 12 훅에서 아직 소비하지 않지만 URL 자체는 유효. URL 동기화는 §5 임시 확정이니 미구현 상태로도 무방.

**주의**: 프론트매터 타입에 `graph`·`slug` 옵셔널 필드가 없으면 기존 타입에 추가하거나 `(frontmatter as any)`로 우회하지 말고 타입을 제대로 확장한다.

- [ ] **Step 3: 린트 + 빌드**

Run: `cd seraph-field-site && npm run lint && npm run build`

- [ ] **Step 4: 커밋**

```bash
git add <touched files>
git commit -m "feat(graph): archive doc footer link to belonging graph"
```

---

## Task 16: 시드 데이터 + 수동 검증

**Files:**
- Create: `RAW/THEORY/algebra-seed/group.md`
- Create: `RAW/THEORY/algebra-seed/monoid.md`
- Create: `RAW/THEORY/algebra-seed/semigroup.md`
- Create: `RAW/THEORY/algebra-seed/abelian-group.md`
- Create: `RAW/THEORY/algebra-seed/magma.md`

- [ ] **Step 1: 5개 md 작성 (기존 블로그 프론트매터 규칙 준수)**

`build-content.mjs`의 `validateFrontmatterContract`를 그대로 통과해야 하므로 `title`, `date`, `category`, `tags`, `summary` 필수. 예시 `group.md`:

```markdown
---
title: Group
date: 2026-04-16
category: THEORY
tags: [algebra, group-theory]
summary: 결합법칙·항등원·역원을 가진 대수구조.
graph: algebra
slug: group
forgets_to:
  - to: monoid
    loses: "역원 연산 $(-)^{-1}$"
---

# Group

결합법칙·항등원·역원을 가진 대수구조. 가장 기본적인 비가환 구조.
```

`abelian-group.md`:
```markdown
---
title: Abelian Group
date: 2026-04-16
category: THEORY
tags: [algebra, group-theory]
summary: 교환법칙을 만족하는 군.
graph: algebra
slug: abelian_group
embeds_into:
  - to: group
    gains: "교환법칙 $ab = ba$"
---

# Abelian Group

교환법칙을 추가로 만족하는 군.
```

`monoid.md`:
```markdown
---
title: Monoid
date: 2026-04-16
category: THEORY
tags: [algebra]
summary: 결합법칙과 항등원을 가진 대수구조.
graph: algebra
slug: monoid
forgets_to:
  - to: semigroup
    loses: "항등원 $e$"
---

# Monoid

결합법칙과 항등원을 가진 대수구조.
```

`semigroup.md`:
```markdown
---
title: Semigroup
date: 2026-04-16
category: THEORY
tags: [algebra]
summary: 결합법칙만 가진 대수구조.
graph: algebra
slug: semigroup
forgets_to:
  - to: magma
    loses: "결합법칙 $(ab)c = a(bc)$"
---

# Semigroup

결합법칙만 가진 대수구조.
```

`magma.md`:
```markdown
---
title: Magma
date: 2026-04-16
category: THEORY
tags: [algebra]
summary: 이항연산만 가진 집합.
graph: algebra
slug: magma
---

# Magma

이항연산 하나만 가진 집합. 어떤 대수적 공리도 요구하지 않음.
```

- [ ] **Step 2: 빌드**

Run: `cd seraph-field-site && npm run build`
Expected: PASS. `src/generated/graphs.json`에 `algebra`가 5노드·4엣지로 기록.

- [ ] **Step 3: dev 서버 수동 검증**

Run: `cd seraph-field-site && npm run dev` (백그라운드)

체크리스트:
- [ ] `#/lobby`에 `KNOWLEDGE GRAPH / Structural Atlas` 카드가 렌더되고 `algebra` 링크 존재
- [ ] `#graph/algebra` 진입 시 5개 노드가 dagre 계층 레이아웃으로 top→bottom 표시
- [ ] 망각 엣지는 cyan 실선, 포함 엣지는 green 점선
- [ ] `FORGETS` / `EMBEDS` / `BOTH` 토글 동작
- [ ] 노드 클릭 → 이웃 하이라이트 + 우측 패널에 `LOSES`/`GAINS` diff 표시, KaTeX 수식 렌더
- [ ] 패널의 `READ FULL →` 버튼 → 해당 Archive 문서로 이동
- [ ] 빈 캔버스 클릭 → 하이라이트 해제
- [ ] Archive의 `group` 문서 하단에 "이 문서는 algebra 그래프에 속합니다 →" 링크
- [ ] `#graph/nope` → `NO GRAPH FOUND`
- [ ] 모바일 폭(Chrome DevTools)에서 패널이 하단 영역에 보이는지 — 필요 시 `GraphPanel` 반응형 보정

반응형 보정이 필요하면 `GraphPanel`에 Tailwind 클래스로 `md:right-2 md:top-2 md:bottom-2 md:w-[min(45%,360px)]`로 감싸고 모바일에선 `bottom-0 left-0 right-0 h-[45%] w-full top-auto` 식으로 바꾼다.

- [ ] **Step 4: 검증 실패 케이스 스모크**

`magma.md`의 프론트매터에 `forgets_to: [{ to: "nope", loses: "x" }]` 를 임시로 추가 → `npm run build`가 FAIL하며 구체적 에러 메시지 출력 확인 → 원복.

- [ ] **Step 5: 커밋**

```bash
git add RAW/THEORY/algebra-seed
git commit -m "feat(graph): seed algebra graph with 5 nodes"
```

---

## Task 17: 최종 빌드·테스트·푸시

- [ ] **Step 1: 전체 테스트**

Run: `cd seraph-field-site && npm test`
Expected: 모든 테스트 PASS.

- [ ] **Step 2: 린트 + 빌드**

Run: `cd seraph-field-site && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 3: 설계 문서 포함 상태 확인**

`docs/superpowers/specs/2026-04-16-knowledge-graph-design.md`가 커밋되지 않은 상태라면 함께 스테이징.
`docs/superpowers/plans/2026-04-16-knowledge-graph.md` (이 문서)도.

- [ ] **Step 4: Repo-local git 계정 확인**

Run: `cd c:/Projects/YUKINET && git config user.name && git config user.email`
Expected: `Echidna` / `269758917+EchidnaRezero@users.noreply.github.com` (일치 안 하면 `git config user.name "Echidna"`, `git config user.email "269758917+EchidnaRezero@users.noreply.github.com"`).

- [ ] **Step 5: 푸시**

원격은 SSH `git@github-echidna:EchidnaRezero/SeraphField.git`. CLAUDE.md의 Windows SSH 진단 절차를 따르되, 정상 케이스면:
```bash
GIT_SSH_COMMAND="/c/Windows/System32/OpenSSH/ssh.exe" git push origin main
```
푸시 후 GitHub Actions 워크플로가 성공하는지 브라우저에서 확인.

- [ ] **Step 6: Pages 확인**

배포된 사이트에서 Lobby → GRAPH/algebra 진입해 Task 16의 체크리스트를 다시 한 번 스모크.

---

## Self-Review 결과

**Spec coverage**
- §1 목적·범위 → 전체 Task들이 단일 그래프 + 두 관계 MVP를 만족하고, 스키마는 multi-graph로 열림
- §2 아키텍처 → Task 2(deps/chunk), Task 5·6(빌드), Task 12(뷰어), Task 13(라우팅)
- §3 데이터 모델 → Task 3(타입), Task 4(검증), Task 5(빌더) 대응
- §4 빌드 파이프라인 → Task 5, Task 6
- §5 뷰어 → Task 9~12, Task 13의 lazy import
- §6 사이트 통합 → Task 13(라우트), Task 14(Lobby), Task 15(Archive 하단)
- §7 테스트 전략 → Task 1·4·5·7·8 각각에 테스트 포함, Task 16 수동 체크리스트
- §8 보안 → Task 1(패턴 확장), Task 5의 `validateFrontmatterContract` 재사용

**Placeholder scan**: 검사 완료. Task 15의 "대상 파일 식별" 단계는 의도적으로 탐색이 필요한 작업(파일 구조가 단언 불가)이라 `grep` 명령을 구체적으로 명시. 기타 TBD/TODO 없음.

**Type consistency**: `GraphNode`/`GraphEdge`/`EdgeFilter` 명칭이 Task 3 → 7 → 8 → 10 → 12에서 일관. 빌더 스키마의 `relation` 값(`forgets_to`/`embeds_into`)이 스타일시트 selector와 일치. `diff` 필드 이름 일관.
