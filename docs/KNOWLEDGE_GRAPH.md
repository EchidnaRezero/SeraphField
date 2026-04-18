# 지식 그래프 구조 및 사양

수학 개념을 노드-엣지 그래프로 탐색하는 Knowledge Graph 뷰어의 구조, 동작, 데이터 파이프라인, 모바일 대응, 운영 방법을 한 곳에서 설명하는 문서입니다.

## 1. 전체 아키텍처

```
KNOWLEDGE_GRAPH/seed.mjs       ← 데이터 정의 (소스 오브 트루스)
        ↓  node seed.mjs
KNOWLEDGE_GRAPH/math-kg.db     ← SQLite DB (WAL 모드)
        ↓  npm run graph:export
src/generated/graph-data.json  ← 프론트엔드용 JSON (Vite 빌드 타임 번들)
        +
RAW/**/*.md (kg_tags 프론트매터)
        ↓  npm run graph:build
src/generated/kg-docs.json     ← 태그→문서 역인덱스
        ↓  import (static)
loadGraph.ts                   ← 프론트엔드에서 사용
```

런타임 fetch가 없다. 모든 그래프 데이터는 Vite 빌드 시점에 번들된다.

## 2. SQLite 스키마

`KNOWLEDGE_GRAPH/seed.mjs`에서 생성되는 테이블:

| 테이블 | 역할 | PK |
|---|---|---|
| `edge_types` | 엣지 종류 (강화, 쌍대 등) | `id TEXT` |
| `tag_groups` | 태그 그룹 (사상, 함자 등) | `id TEXT` |
| `tags` | 개별 태그 (functor:free 등) | `id TEXT` |
| `nodes` | 수학 개념 노드 | `id TEXT` |
| `edges` | 노드 간 관계 | `id INTEGER AUTOINCREMENT` |
| `edge_tags` | 엣지-태그 다대다 연결 | `(edge_id, tag_id)` |

### 주요 제약
- `nodes.type`: `'definition'` 또는 `'instance'` (CHECK 제약)
- `edges(source, target, type)`: UNIQUE — 같은 쌍이라도 다른 type이면 허용
- 외래키: `edges.source/target → nodes.id`, `edges.type → edge_types.id`, `edge_tags.tag_id → tags.id`

## 3. 데이터 파이프라인

### 3-1. seed.mjs → math-kg.db
`seed.mjs`가 유일한 데이터 소스. DB를 삭제 후 재생성하는 방식이므로 수정은 항상 `seed.mjs`에서 한다.

### 3-2. export.mjs → graph-data.json
`KNOWLEDGE_GRAPH/export.mjs`가 DB를 읽어서 프론트엔드 JSON으로 변환한다.
- `edge_tags`를 조인하여 엣지마다 `tags: string[]` 배열을 생성
- `REVERSE_LABELS` 맵으로 `reverseLabel`을 추가 (현재 `strengthen → "완화"`)
- 출력: `seraph-field-site/src/generated/graph-data.json`

### 3-3. build-graph.mjs → kg-docs.json
`RAW/` 디렉터리의 Markdown 파일에서 `kg_tags` 프론트매터를 읽어 역인덱스를 생성한다.
- 키: 노드 ID 또는 태그 ID
- 값: `[{ path, title, date }]`
- 팝업에서 관련 문서 링크에 사용

## 4. 프론트엔드 타입

`seraph-field-site/src/types/graph.ts`:

```ts
GraphNode     { id, label, type, category, desc }
GraphEdge     { id, source, target, type, tags[], label, detail }
EdgeType      { label, color, dash, reverseLabel }
TagGroup      { label, color }
GraphData     { edgeTypes, tagGroups, nodes[], edges[] }
CategoryPalette { algebra, analysis, geometry, linalg, other }
GraphTweaks   { palette, drift, bgFx, scanlines }
```

## 5. 프론트엔드 컴포넌트 구조

```
KnowledgeGraph.tsx          ← 루트 오케스트레이터 (전체 상태 관리)
├── GraphSidebar.tsx        ← 데스크톱 좌측 패널 (필터/검색/통계)
├── GraphMobileControls.tsx ← 모바일 버튼 분산 배치 (S:좌하단, F:우하단, ⚙:우상단)
├── GraphView.tsx           ← Cytoscape.js 렌더링 (fcose 레이아웃)
├── GraphPopup.tsx          ← 노드/엣지 클릭 팝업 (HUD 스타일)
├── GraphTweaksPanel.tsx    ← 팔레트/효과 설정 패널
├── GraphBackground.tsx     ← 배경 파티클/그리드 애니메이션
├── graphStyle.ts           ← Cytoscape 스타일시트 + 팔레트 프리셋
└── graph.css               ← HUD 프레임, 레이아웃, 배경 레이어
```

### 핵심 로직 (`src/features/graph/`)

| 파일 | 역할 |
|---|---|
| `loadGraph.ts` | JSON 정적 import. `loadGraphData()`, `loadKgDocs()` 내보냄 |
| `graphComputation.ts` | 순수 함수: `computeVisibleEdges`, `computeNeighbors`, `computeComponents` |

### 필터 시스템 (`GraphFilters`)

```ts
{
  edgeTypes: Set<string>,    // 활성화된 엣지 타입
  nodeTypes: Set<string>,    // 'definition' | 'instance'
  activeTags: Set<string>,   // 활성 태그 (비어있으면 전체 표시)
}
```

필터 적용 순서: 엣지 타입 → 양쪽 노드 타입 체크 → 태그 필터 (태그가 하나라도 선택되면 해당 태그를 가진 엣지만 표시).

### 선택/하이라이트

- 노드 클릭: 해당 노드 `selected`, 이웃 노드 `neighbor`, 나머지 `dimmed`
- 엣지 클릭: 해당 엣지 + 양쪽 노드 하이라이트, 나머지 `dimmed`
- 배경 클릭: 선택 해제

## 6. 시각 디자인

디자인 철학은 `docs/design-notes.html` 참조. 핵심 요약:

### 노드 스타일
- 어두운 구체 (`#0A1E26` @ 85%) + 카테고리색 border + underlay 글로우
- definition: 30px, border 1.4px
- instance: 18px, border 1.1px, 더 투명

### 엣지 스타일
- 기본: 1.1px, opacity 0.42, unbundled-bezier
- 병렬 엣지: dashed `[6,4]`
- `isomorphism`, `dual`: 양방향 화살표 (하드코딩된 셀렉터)

### 팔레트 프리셋
`graphStyle.ts`의 `CATEGORY_PALETTES`에 5개 프리셋: `sibyl` (기본), `cyan-aurora`, `starrail`, `reverse1999`, `arknights`. CSS 커스텀 프로퍼티 (`--cat-algebra` 등)와 동기화.

### 배경 레이어
- quantum gradient (시안 중앙 발광)
- quantum grid (40px 2D 평면 격자, 중앙→가장자리 페이드)
- floor grid (80px 2D 평면 격자, 중앙→가장자리 페이드)
- atmosphere (vignette + fog)
- ambient particles (canvas 기반, `GraphBackground.tsx`)
- vignette (가장자리 어둡게)

## 7. 모바일 대응

### 레이아웃 분기
`KnowledgeGraph.tsx`에서 `window.innerWidth < 1024`이면 모바일 레이아웃 사용.

### 데스크톱 vs 모바일

| 항목 | 데스크톱 | 모바일 |
|---|---|---|
| 필터/검색 | `GraphSidebar` (좌측 고정 패널) | `GraphMobileControls` (버튼 분산 배치) |
| 설정 | 상단바 BG_FX/TWEAKS 버튼 | ⚙ 아이콘 (우상단) |
| Tweaks | `GraphTweaksPanel` (별도 패널) | `GraphMobileControls` 내 tweaks 탭 |
| 상단바 | BACK + DRIFT/BG_FX/TWEAKS | BACK + DRIFT |

### 모바일 버튼 배치
- **좌상단**: BACK + DRIFT
- **좌하단**: S (검색) — 패널이 버튼 바로 위에서 열림
- **우하단**: F (필터) — 패널이 버튼 바로 위에서 열림
- **우상단**: ⚙ (설정) — 패널이 버튼 바로 아래에서 열림
- 한 번에 하나의 패널만 열림

## 8. Drift 애니메이션

`GraphView.tsx`의 `startDrift()`. 각 노드에 미세한 랜덤 속도를 부여하고 50ms 간격으로 위치를 갱신한다. 속도 상한 `intensity = 0.12`. 상단바 DRIFT 버튼으로 토글.

## 9. 운영 가이드

### 노드 추가

`KNOWLEDGE_GRAPH/seed.mjs`의 `nodes` 배열에 추가:

```js
{ id: "UniqueId", label: "표시 이름", type: "definition",
  category: "algebra", desc: "설명 텍스트" }
```

- `type`: `"definition"` (주요 개념, 큰 노드) 또는 `"instance"` (구체적 예시, 작은 노드)
- `category`: `algebra` | `analysis` | `geometry` | `linalg` | `other` — 팔레트 색상 결정

### 엣지 추가

`KNOWLEDGE_GRAPH/seed.mjs`의 `edges` 배열에 추가:

```js
{ source: "NodeA", target: "NodeB", type: "strengthen",
  tags: ["functor:free"], label: null, detail: "팝업 설명" }
```

- `(source, target, type)` 조합이 유일해야 함
- 같은 노드 쌍에 다른 type의 엣지 가능 (병렬 엣지로 표시)

### 엣지 타입 추가

`seed.mjs`에서:
```js
insertEdgeType.run('mytype', '표시 레이블', '#hex색상', null);
```
- 마지막 인자: dash 패턴 (`"6,4"`) 또는 `null`
- 양방향 화살표가 필요하면 `graphStyle.ts`의 `buildGraphStylesheet`에 셀렉터 추가
- `export.mjs`의 `REVERSE_LABELS`에 역방향 레이블 추가 (필요시)

### 태그 추가

```js
// 새 그룹 (필요시)
insertTagGroup.run('groupid', '그룹 레이블', '#color');
// 태그
insertTag.run('groupid:tagname', 'groupid', 'tagname');
```
- 엣지의 `tags` 배열에 태그 ID를 넣으면 자동으로 필터/팝업에 반영

### 문서 연결

`RAW/` 디렉터리의 Markdown 파일 프론트매터에 `kg_tags`를 추가하면 팝업에서 관련 문서로 연결된다:

```yaml
---
title: "문서 제목"
kg_tags: ["NodeId", "functor:free"]
---
```

### 빌드 명령어

```bash
node KNOWLEDGE_GRAPH/seed.mjs              # DB 재생성
cd seraph-field-site
npm run graph:export                       # DB → graph-data.json
npm run graph:build                        # RAW/*.md → kg-docs.json
npm run dev                                # dev 서버 (content:build 포함)
```

**중요**: `graph:export`는 자동 빌드 체인에 포함되지 않는다. DB를 수정한 후 반드시 수동으로 실행해야 한다.

### 카테고리 팔레트 추가

`graphStyle.ts`의 `CATEGORY_PALETTES`에 새 프리셋 추가:

```ts
'my-palette': {
  algebra: '#색상', analysis: '#색상', geometry: '#색상',
  linalg: '#색상', other: '#색상',
},
```

## 10. 테스트

`seraph-field-site/tests/graphComputation.test.ts`에 순수 함수 단위 테스트:
- `computeNeighbors` — 이웃 노드 계산
- `computeVisibleEdges` — 필터 적용
- `computeComponents` — 연결 요소 분리

```bash
cd seraph-field-site && npx vitest run tests/graphComputation.test.ts
```
