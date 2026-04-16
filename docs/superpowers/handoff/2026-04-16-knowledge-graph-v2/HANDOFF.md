# Knowledge Graph v2 — 인계 문서

- **작성일**: 2026-04-16
- **대상 프로젝트**: YUKINET / Seraph Field (정적 수학 블로그, Vite + React, GitHub Pages 배포)
- **상태**: v1 구현 완료 후 설계 방향 전환 결정. v2는 새 세션에서 시작.
- **v1 브랜치**: `feature/knowledge-graph` — 참고용 보존. 필요시 cherry-pick 대상.

---

## 1. TL;DR

v1은 "md 문서 하나 = 그래프 노드 하나"로 설계했는데, 실제 사용 시나리오를 검토하면서 사용자가 **노드와 문서를 분리**하길 원한다는 점이 드러났다. 이 문서는 **v2 새 설계의 출발점**을 제공한다.

핵심 변경
- 노드는 독립 엔티티 (`KNOWLEDGE_GRAPH/nodes/*.yml` 같은 별도 저장소)
- 문서는 `concepts: [group, monoid]` 같은 프론트매터 필드로 노드를 참조
- 노드 클릭 → 문서 1개로 직행하는 게 아니라 그 개념을 다룬 **문서 리스트**를 보여줌
- 그래프RAG·임베딩 친화적 구조 (RDF/JSON-LD로 export 가능한 형태)

시각적/UX 목표는 동봉된 `graph-demo.html`로 확인.

---

## 2. 배경: v1이 뭐였고 왜 바꾸나

v1의 요지 ([prior-v1-design.md](./prior-v1-design.md), [prior-v1-plan.md](./prior-v1-plan.md)):
- `RAW/*.md` 문서에 프론트매터 `graph: algebra`, `slug: group`, `forgets_to:`, `embeds_into:` 추가
- `build-graph.mjs`가 RAW를 스캔해서 `graphs.json` 생성
- `GraphView`(Cytoscape + dagre 계층 레이아웃)가 노드 클릭 시 해당 문서(Archive 라우트)로 이동
- Lobby에 진입 카드

**v1의 한계** (사용자가 세션 중 발견)
1. 한 수학 개념이 여러 각도로 다뤄질 수 있는데(입문, 심화, 응용) 1:1 매핑은 강제가 부자연스러움
2. 한 문서가 여러 개념을 건드림 (예: "Lie group" 문서는 `group` · `manifold` · `topspace` 관련) — v1은 이걸 표현 못 함
3. "스텁 노드" (문서는 없지만 그래프에는 나와야 하는 개념) 불가능
4. Graph-RAG로 확장 시 엔티티/관계/인스턴스(문서)를 분리해서 인덱싱하는 게 표준인데, v1은 이게 섞여 있음
5. 레이아웃도 dagre(계층)가 아니라 force-directed(Obsidian 스타일)가 원래 의도였음

**v1의 살릴 만한 자산** (브랜치 `feature/knowledge-graph`에 그대로 남아 있음)
- Cytoscape.js + cytoscape-dagre 의존성 + Vite chunk 분리 설정
- `src/components/graph/graphStyle.ts` — HUD 팔레트 기반 Cytoscape 스타일
- `src/components/graph/GraphFilters.tsx` — BOTH/FORGETS/EMBEDS 토글
- `src/lib/routes.ts`의 `#graph/:name` 라우팅
- `src/features/graph/useGraphInteraction.ts` — `computeNeighbors`, `computeVisibleEdges` 순수 함수 + 훅
- `scripts/content-validation.mjs`의 **로컬 경로 누출 차단 정규식 확장** — 이건 그래프 기능과 무관하게 유지할 가치 있음, 독립적으로 cherry-pick 권장
- `src/features/graph/loadGraph.ts` — 로더 (v2에서는 data shape만 달라짐)

**버려야 할 것**
- `forgets_to` / `embeds_into`를 **문서 프론트매터**에 저장하는 방식
- `slug`를 문서가 자기 그래프 ID로 쓰는 방식
- dagre 레이아웃 (force-directed로 교체)
- GraphPanel의 "구조 diff + READ FULL" UI (v2는 문서 리스트 표시)
- 시드 md (`RAW/THEORY/algebra-seed/*.md`) — 일반 블로그 문서로 원복하거나 삭제

---

## 3. v2 아키텍처 제안

### 3.1 디렉토리 구조

```
KNOWLEDGE_GRAPH/
├── nodes/
│   ├── group.yml
│   ├── monoid.yml
│   ├── manifold.yml
│   └── ...
├── edges.yml                      # (선택) 중앙집중형 엣지 파일
└── graphs/
    └── math.yml                   # 어떤 노드들이 어떤 그래프에 묶이는지 (여러 그래프 지원 시)

RAW/                               # 기존 블로그 문서 (그대로 유지)
└── THEORY/lie-groups.md
    ---
    concepts: [group, manifold, topspace]
    ---

seraph-field-site/
├── scripts/build-graph.mjs        # KNOWLEDGE_GRAPH/ 스캔 + RAW 프론트매터의 concepts 수집
├── src/generated/
│   ├── graphs.json                # 노드 + 엣지 (뷰어가 소비)
│   └── concept-docs.json          # { "group": ["THEORY/group-intro", "THEORY/lie-groups"], ... }
└── src/components/graph/          # v1의 컴포넌트 구조 재활용 가능
```

### 3.2 노드 파일 형식 예

```yaml
# KNOWLEDGE_GRAPH/nodes/group.yml
id: group
title: Group
description: |
  결합법칙·항등원·역원을 가진 대수구조. 가장 기본적인 비가환 구조.
kind: structure                   # structure | concrete | schema 등 (옵션)
aliases: [군, 群]                 # 검색·태그 매칭용
forgets_to:
  - to: monoid
    loses: "역원 연산 $(-)^{-1}$"
embeds_into: []
```

또는 엣지를 중앙집중 (`edges.yml`) — 편집자 선호에 따라 결정.

### 3.3 문서 연결

```yaml
# RAW/THEORY/lie-groups.md
---
title: Lie Groups 개론
date: 2026-05-10
category: THEORY
tags: [lie-theory, geometry]
concepts: [group, manifold, topspace]     # 노드 ID 참조
---
```

### 3.4 빌드 파이프라인

`build-graph.mjs`가 수행:
1. `KNOWLEDGE_GRAPH/nodes/*.yml` 파싱 → 노드 풀 구성
2. 엣지 (분산 or 중앙) 파싱 + v1의 검증 규칙 재사용 (미존재 ref, 자기참조, 중복, empty diff 등)
3. `RAW/**/*.md` 스캔, `concepts` 필드 수집 → `concept → [docPath]` 역인덱스 생성
4. 출력: `graphs.json` (뷰어용), `concept-docs.json` (클릭 시 문서 리스트)
5. 누락된 concept 참조 (문서에서 참조했으나 노드가 없음)는 **경고**만 내고 빌드 계속 (스텁 허용 정책) — 정책은 논의 필요

### 3.5 뷰어 UX (v1과 다른 부분)

**노드 클릭**:
- 이웃 하이라이트 (v1과 동일)
- 사이드 패널 또는 하단 시트에 **"이 개념을 다루는 문서"** 리스트 표시
- 각 항목은 Archive 라우트로 링크
- 노드 자체의 정의(노드 yml의 `description`)가 패널 상단에 노출

**엣지 클릭**:
- v1 최종본처럼 엣지와 두 끝점만 남기고 dim
- 엣지 중점 위에 `LOSES` / `GAINS` 툴팁만 간단히 (FORGET/EMBED 헤드는 제거됨, 노드 이름은 그래프에 이미 보이므로 중복)

**레이아웃**:
- dagre 대신 **fcose (force-directed)** — `cytoscape-fcose` 익스텐션 추가
- Obsidian 스타일: 작은 원형 노드 + 노드 밖 하단에 라벨
- 드래그 / 줌 / 팬

### 3.6 필터·토글 (데모에서 결정된 것들)

- `BOTH` / `FORGETS` / `EMBEDS` (v1과 동일)
- **Hide isolated nodes** — 현재 필터에서 가시 엣지 0개인 노드 숨김
- **Show transitive closure** — 체크 시 직접 엣지 + 추이 폐포 shortcut 엣지를 **점선 + 얇게** 함께 표시. off면 데이터에 저장된 엣지만
- **Color by component** — 체크 시 현재 가시 그래프의 약연결 컴포넌트별로 팔레트 색 부여. 노드 카테고리별 색은 **사용하지 않음** (사용자 결정: 한 그래프에 수학 전반을 모을 예정이라 분야 색 구분이 부자연스럽다)

### 3.7 우측 설정 패널

기본 상태는 숨김. 화면 우측 가장자리에 얇은 cyan 손잡이만 보이고, 마우스를 갖다대면 슬라이드 인. Forces 슬라이더(Repulsion, Edge length, Gravity), Display 토글, Re-layout 버튼이 들어감. 상시 노출은 레이아웃 방해라고 판단됨.

---

## 4. 시각적 참고: `graph-demo.html`

같은 폴더의 `graph-demo.html`을 브라우저에서 열면 v2가 목표하는 **전체 UX**의 living prototype을 확인할 수 있다. 인터넷 연결 필요 — cytoscape + fcose를 CDN에서 로드.

데모에 구현된 것:
- 17개 수학 객체(Set, Magma, Semigroup, ..., Banach, Hilbert, ℤ, C[0,1]) + 약 24개 엣지
- fcose force-directed 레이아웃
- 노드 클릭 → 이웃 하이라이트 + 나머지 dim
- 엣지 클릭 → 엣지와 양 끝만 남기고 dim + 엣지 중점 위 `LOSES`/`GAINS` 툴팁
- 우측 hover 패널: Forces(Repulsion/Edge length/Gravity 슬라이더), Display 필터 버튼, Hide isolated, Show transitive closure, Color by component, Re-layout
- HUD 팔레트 (사이트 index.css와 일관): 배경 #0e1012, 노드 기본 #19b8be, forget 엣지 cyan 실선, embed 엣지 green 점선

**중요**: 데모 노드에 `diff`(loses/gains)가 들어가 있지만, 이건 **노드가 곧 문서가 아니라 독립 엔티티**라는 v2 철학을 시각적으로 보이기 위해 임시로 넣은 것이다. v2 실제 구현에서는 엣지 `loses`/`gains`는 남기되, **노드 클릭 시 패널은 "문서 리스트"를 보여줘야** 한다 — 데모에는 아직 그 부분이 구현돼 있지 않다.

또 데모의 노드 카테고리 색(foundation=회색, alg=cyan, top=pink, concrete=yellow)은 **v2에 적용하지 않음** (사용자 결정 — 색은 Color by component 토글로만 씀).

---

## 5. 세션 중 확정된 설계 결정 (다시 브레인스토밍하지 말 것)

1. **관계 타입 2개 고정**: `forgets_to`, `embeds_into`. 수학적 정의 엄수 — 용어를 느슨하게 쓰지 않는다. UI에도 `FORGETS / LOSES`, `EMBEDS / GAINS` 같은 정의에 충실한 표현만 노출.
2. **엣지 diff**: `loses` (forget 방향) / `gains` (embed 방향) 비대칭 키. KaTeX 수식 지원(`$...$`). 짧은 한 줄 권장.
3. **시각 팔레트**: 사이트 index.css의 HUD 팔레트 그대로. 노드 단색 cyan, 관계 엣지는 cyan 실선(forget) vs green 점선(embed). 노드 카테고리 색 구분 안 함.
4. **레이아웃**: force-directed(fcose). dagre 아님.
5. **엣지 툴팁은 최소 정보**: `LOSES <text>` 또는 `GAINS <text>` 한 줄만. 소스·타겟 노드명은 화면에 이미 보이므로 툴팁에 중복 금지.
6. **추이적 연결은 옵션**: 기본 데이터는 transitive reduction(직접 관계만). 보고 싶을 때 토글로 transitive closure 오버레이.
7. **고립점 처리**: 필터로 엣지 사라진 노드는 토글로 숨길 수 있음 (기본 유지).
8. **우측 패널**: 호버 슬라이드 인 (상시 노출 X).
9. **다중 그래프 스키마는 열어두되 초기엔 단일 그래프** 만 운용 — `graph: math` 하나가 기본 예상 사용 패턴.
10. **그래프 DB**: 초기엔 YAML/JSON in repo → 빌드 시 JSON 산출물. 나중에 규모 커지면 RDF Turtle로 export 함수 추가 고려.
11. **보안 (로컬 경로 유출 차단)**: v1에서 `content-validation.mjs`의 정규식을 Unix/env/forward-slash까지 커버하도록 확장했고, 이건 v2에서도 유지. 이 validator를 `build-graph.mjs`에서도 재사용 (노드 yml 포함).

---

## 6. 열린 결정 (새 세션에서 사용자와 협의할 것)

1. 엣지 저장: 각 노드 yml 내부 (distributed) vs 중앙 `edges.yml` (centralized)?
   - v1은 distributed였고 사용자는 "작성 locality" 이유로 선호했었음. v2에서도 유지 가능.
2. 문서 → 개념 참조 필드명: `concepts` vs `math_concepts` vs `entities`?
3. 스텁 노드 정책: 문서에서 참조된 개념에 대응 노드가 없을 때 → 경고만 / 빌드 실패 / 자동 스텁 생성?
4. 노드 페이지 URL 구조: `#node/group` 같은 개별 노드 상세 페이지를 둘지, 아니면 그래프 내 패널에서만 처리할지?
5. 검색과의 연계: 기존 검색 인덱스에 노드 description/aliases를 포함시킬지?
6. Archive 문서 상세 → 해당 문서가 참조하는 개념 노드로 가는 링크도 추가할지? (v1에서 "이 그래프에 속합니다" 링크가 있었는데 의미가 달라짐)

---

## 7. 새 세션을 위한 제안 워크플로

1. 이 HANDOFF.md + `graph-demo.html` 읽기
2. 필요시 `prior-v1-design.md`, `prior-v1-plan.md`에서 살릴 부분 확인
3. `feature/knowledge-graph` 브랜치의 실제 코드(특히 `graphStyle.ts`, `useGraphInteraction.ts`, `content-validation.mjs` 확장분) 구경
4. **열린 결정(§6)** 사용자와 협의 → v2 spec 작성 (`docs/superpowers/specs/YYYY-MM-DD-knowledge-graph-v2-design.md`)
5. Plan 작성 → subagent-driven execution
6. 시드 데이터: 실제 노드 10개 정도 + 그중 2~3개 노드를 참조하는 문서 2개 정도로 "스텁 노드 + 멀티-문서 매핑" 둘 다 테스트

---

## 8. 관련 파일

- [graph-demo.html](./graph-demo.html) — 비주얼 프로토타입
- [prior-v1-design.md](./prior-v1-design.md) — v1 설계 문서
- [prior-v1-plan.md](./prior-v1-plan.md) — v1 구현 플랜
- v1 브랜치: `feature/knowledge-graph` (병합 전, 참고용)
- 사이트 팔레트 정의: [seraph-field-site/src/index.css](../../../seraph-field-site/src/index.css) (`@theme` 블록)
