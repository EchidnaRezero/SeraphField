# 지식그래프 기능 설계 문서

- **작성일**: 2026-04-16
- **대상 프로젝트**: YUKINET / Seraph Field
- **상태**: 설계 승인 완료, 구현 계획 대기

## 1. 목적과 범위

### 1.1 동기
수학 관련 문서들 사이의 **개념적 일반화·구체화 관계**를 시각화한다. 구체적으로 두 가지 수학적 관계를 그래프 엣지로 다룬다.

- **망각 관계 (forgetful)**: 구조(연산·공리·데이터)를 잊어버리는 사상. 예: `Group → Monoid`는 역원 연산을 잊는다.
- **포함 관계 (inclusion / embedding)**: 조건·공리를 추가해 더 좁은 클래스로 들어가거나, 집합이 구조보존 단사로 더 큰 집합에 포함되는 사상. 예: `AbelianGroup ↪ Group`은 교환법칙 조건이 더해진다. `ℤ ↪ ℝ`은 집합-수준 포함.

두 관계는 용어의 수학적 정의를 엄밀히 따른다. UI에도 "요약" 같은 모호한 표현을 쓰지 않고 `FORGETS / LOSES`, `EMBEDS / GAINS` 같은 정의 그대로의 용어를 노출한다.

### 1.2 범위
- 단일 태그(`graph: <이름>`)로 다중 그래프를 지원하는 확장형 스키마.
- 초기 릴리스의 검증·UI는 두 관계(`forgets_to`, `embeds_into`)만 처리한다. 관계 종류를 늘리려면 스키마 + 빌드 + 스타일 3군데만 손대면 된다.
- 그래프는 기존 블로그 파이프라인과 독립적으로 빌드·렌더. 기존 `posts.json` 빌드나 Archive 라우트는 변경하지 않는다.
- GitHub Actions로 push 시 자동 빌드·배포.
- 홈 화면(Lobby)에 진입 클러스터 카드 추가.

### 1.3 명시적 비범위
- 그래프 작성자 UI(편집기) 없음. 작성은 md 프론트매터 수작업.
- 실시간 협업·다중 사용자 권한 없음. 개인 블로그.
- 3D 시각화 비채택(가독성·번들 비용 대비 정보이득 낮음).

## 2. 아키텍처 개요

```
RAW/
├── THEORY/group.md          (graph 태그 달린 md들이 일반 문서와 혼재)
├── THEORY/monoid.md
└── ...

seraph-field-site/
├── scripts/
│   ├── build-content.mjs    (기존, 변경 없음)
│   └── build-graph.mjs      (신규)
├── src/generated/
│   ├── posts.json           (기존, 변경 없음)
│   └── graphs.json          (신규)
├── src/components/graph/    (신규)
│   ├── GraphView.tsx
│   ├── GraphPanel.tsx
│   ├── GraphFilters.tsx
│   └── graphStyle.ts
├── src/features/graph/      (신규)
│   ├── loadGraph.ts
│   └── useGraphInteraction.ts
└── src/lib/router.ts        (수정: #/graph/:name 라우트)

.github/workflows/deploy-blog.yml   (편집 불필요 - package.json의 build가 체이닝)
```

**데이터 흐름**: 작성자가 md에 `graph:` 프론트매터 → push → CI가 `content:build` → `graph:build` → `vite build` → Pages 배포 → 사용자가 Lobby → 클러스터 카드 → `#/graph/algebra` → Cytoscape 렌더.

**설계 원칙**
- 기존 블로그 파이프라인 무오염.
- 그래프 뷰어는 별도 Vite chunk(`graph-viewer`)로 분리해 지연 로딩.
- 빌드 시 검증 실패하면 즉시 중단(잘못된 데이터가 Pages에 올라가지 않도록).

## 3. 데이터 모델

### 3.1 프론트매터 스키마 (md에 추가되는 필드만)

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `graph` | string | 있으면 그래프 포함 | 그래프 이름 (예: `algebra`) |
| `slug` | string | `graph`와 함께 필수 | 그래프 내 유일 ID (snake_case 권장) |
| `title` | string | 선택 | 노드 라벨. 없으면 기존 문서 `title` 또는 파일명 |
| `forgets_to` | 객체 배열 | 선택 | 망각 관계 엣지 |
| `embeds_into` | 객체 배열 | 선택 | 포함 관계 엣지 |

### 3.2 엣지 객체 형식
```yaml
forgets_to:
  - to: monoid
    loses: "역원 연산 $(-)^{-1}$"
embeds_into:
  - to: group
    gains: "교환법칙 $ab = ba$"
```
- `to`: 같은 `graph` 내 다른 문서의 `slug`.
- `loses` / `gains`: 짧은 한 줄. KaTeX 수식 허용(기존 `rehype-katex` 파이프라인 재사용).
- 비대칭 키(`loses` for 망각, `gains` for 포함)로 관계 방향 혼동을 원천 차단.

### 3.3 검증 규칙

빌드 시 아래 규칙 위반 하나라도 있으면 exit(1), 상세 에러 메시지 출력, 배포 중단.

1. `graph` 필드 있으면 `slug` 필수.
2. 같은 `graph` 내 `slug` 중복 금지.
3. `forgets_to[*].to` / `embeds_into[*].to`는 같은 `graph` 안에 존재하는 slug여야 한다. 다른 그래프 참조, 미존재 참조 금지.
4. 자기 자신 참조 금지 (`slug === to`).
5. `loses` / `gains`는 비어있지 않은 문자열.
6. 같은 `(from, to, relation)` 엣지 중복 금지.

### 3.4 산출 파일 `src/generated/graphs.json`
```json
{
  "algebra": {
    "nodes": [
      { "id": "group", "title": "Group", "docPath": "THEORY/group" }
    ],
    "edges": [
      { "from": "group", "to": "monoid", "relation": "forgets_to", "diff": "역원 연산 $(-)^{-1}$" }
    ]
  }
}
```
- `relation` 한 키로 통합해 뷰어가 루프 한 번으로 처리.
- `diff`는 `loses` 또는 `gains` 중 존재한 값.
- `docPath`로 Archive 라우트 링크를 구성.

## 4. 빌드 파이프라인

### 4.1 `scripts/build-graph.mjs`

기존 `build-content.mjs` 패턴을 따라 단일 파일, gray-matter + glob 사용.

동작 순서:
1. `RAW/**/*.md` 스캔.
2. `graph` 필드 있는 파일만 필터.
3. 그래프 이름별 그룹핑.
4. §3.3 검증 규칙 전체 적용. 위반 시 상세 에러 메시지와 함께 exit(1).
5. `nodes` · `edges` 배열로 변환, `src/generated/graphs.json` 기록.
6. 그래프별 노드·엣지 개수를 stdout에 요약(CI 로그용).

### 4.2 `package.json`
```json
{
  "scripts": {
    "graph:build": "node scripts/build-graph.mjs",
    "build": "npm run content:build && npm run graph:build && vite build"
  }
}
```

### 4.3 GitHub Actions
기존 `deploy-blog.yml`의 빌드 단계는 이미 `npm run build`를 호출하므로 추가 편집 없음. `npm run build`가 체이닝되어 있으므로 실제로는 사용자가 별도로 워크플로를 손대지 않아도 된다.

`npm test` 단계가 없다면 추가한다(§7 참고).

### 4.4 에러 처리
- 로컬: `npm run build` 즉시 실패 + 위반 목록.
- CI: 배포 중단, Pages엔 이전 버전 유지.

### 4.5 산출물 크기
초기엔 `graphs.json` 단일 파일. 그래프 수가 많아지거나 노드가 수백 개 단위로 증가하면 `src/generated/graphs/<name>.json`으로 분할해 code-split하는 구조로 확장 가능.

## 5. 뷰어 컴포넌트

> **참고**: 이 섹션은 임시 확정이다. 실제 그래프 크기와 사용감을 보고 구현 단계에서 조정할 수 있다. 특히 레이아웃 알고리즘, 모바일 패널 형태, 하이라이트 규칙, URL 동기화 여부가 변동 후보다.

### 5.1 기술 선택
- **Cytoscape.js** + `cytoscape-dagre` 레이아웃 익스텐션.
- 합쳐 약 200KB. Vite의 `manualChunks`에서 별도 `graph-viewer` chunk로 분리해 지연 로딩.
- 2D 전용. 3D는 §1.3의 이유로 비채택.

### 5.2 컴포넌트 구조
- `GraphView.tsx` — `#/graph/:name` 라우트 진입 시 `graphs.json` 로드, Cytoscape 인스턴스 생성·해제, 상호작용 훅 연결.
- `GraphFilters.tsx` — 상단 HUD 바의 토글 3개: `FORGETS` / `EMBEDS` / `BOTH` (기본). `.mermaid-toolbar__button` 스타일 재사용.
- `GraphPanel.tsx` — 우측 사이드 패널. 화면폭 <768px에서는 하단 드로어로 전환. 선택된 노드의 구조 diff + "READ FULL →" 버튼.
- `graphStyle.ts` — Cytoscape 스타일시트(HUD 팔레트 상수 분리).

### 5.3 레이아웃
- 기본: dagre, 방향 `TB` (망각 엣지 기준 top→bottom).
- 포함 엣지는 레이아웃 계산에서 제외, 렌더 시에만 덧그림.
- 노드 드래그·줌·팬 활성.

### 5.4 스타일 매핑 (HUD 팔레트)
`src/index.css`의 CSS 변수와 동일 팔레트를 Cytoscape 스타일시트에 상수로 전개.

- **캔버스 배경**: `rgba(12,18,22,0.95)` (페이지 배경 `#0e1012`보다 한 단계 밝게) + cyan 틴트 보더 글로우.
- **노드**: 둥근 사각형. `background-color: rgba(25,184,190,0.06)`, `border: 1.2px #19b8be`, 라벨은 Share Tech Mono·대문자·`#e0fbfc`.
- **선택 노드**: `background-color: rgba(25,184,190,0.22)`, `border: 2px #00e5ff`.
- **dimmed**: `opacity: 0.25` (노드), `0.15` (엣지).
- **망각 엣지**: `#19b8be` 실선, 화살표 동색.
- **포함 엣지**: `#00ff66` 점선(`dashed`), 화살표 동색.

### 5.5 상호작용 (`useGraphInteraction.ts`)
- 노드 클릭: 해당 노드 selected, 직접 연결된 이웃 외 전부 `.dimmed`, 패널에 diff 표시.
- 빈 배경 클릭: 하이라이트 해제, 패널 닫힘.
- 필터 변경: 해당 relation 엣지만 표시, 나머지는 `display: none`.
- URL 동기화: 선택 노드가 있으면 `#/graph/algebra?node=group`. 공유·북마크 가능. (구현 단계 재검토 대상)

### 5.6 사이드 패널 표시 내용
```
NODE // GROUP
Group
algebra · 2 neighbors

→ forgets_to: monoid
   LOSES  역원 연산 (-)⁻¹
← embeds_into: abelian_group   (이 노드로 들어오는 포함)
   GAINS  교환법칙 ab = ba

[READ FULL →]
```
문서 본문 요약은 넣지 않는다. 구조 diff + 제목 + 본문 링크만.

### 5.7 빈 상태 / 에러
- `:name` 그래프가 `graphs.json`에 없을 때: "NO GRAPH FOUND" HUD 메시지 + 뒤로 버튼.
- 그래프는 존재하나 노드가 0개: "문서를 아직 태깅하지 않았습니다" 안내.

### 5.8 모바일
- 사이드 패널 → 하단 드로어.
- 필터 토글 상단 고정.
- 핀치 줌·한 손가락 팬 활성. 노드 탭 = 클릭.

## 6. 사이트 통합

### 6.1 Lobby 진입점
Lobby에 전용 클러스터 카드 한 개 추가. 기존 `collection-cluster` 스타일 그대로 사용.

- eyebrow: `KNOWLEDGE GRAPH`
- 제목: `Structural Atlas`
- 본문: 짧은 설명 + 현재 등록된 그래프 이름 목록(각각 `#/graph/<name>` 링크 카드).
- 등록된 그래프가 0개면 이 클러스터는 **렌더하지 않는다**.

`LobbyDesktopLayout.tsx`와 `LobbyMobileLayout.tsx` 양쪽에 동일 컴포넌트를 꽂되 기존 반응형 규칙을 따른다.

### 6.2 라우팅
`src/lib/router.ts`의 해시 라우터에 `#/graph/:name` 케이스 추가. 뷰 전환 패턴은 기존 5개 뷰와 동일.

### 6.3 Archive 하단 연결
문서 상세(Archive 뷰)에서 현재 문서가 `graph`에 속하면 본문 하단에 "이 문서는 `algebra` 그래프에 있습니다 →" 링크를 표시한다. 해당 그래프로 이동하며, 가능하면 쿼리스트링으로 현재 노드가 자동 선택되도록 한다(`?node=<slug>`).

### 6.4 검색
그래프 문서들은 여전히 일반 블로그 문서이므로 Archive · SearchResults에 자동 노출된다. 변경 불필요.

## 7. 테스트 전략

### 7.1 빌드 스크립트 단위 테스트 `scripts/__tests__/build-graph.test.mjs`
- 임시 디렉토리에 가짜 md 픽스처 생성, `build-graph.mjs`의 순수 함수 호출.
- 커버:
  - 정상: 여러 그래프, 여러 엣지 타입 혼합 → 기대 JSON.
  - §3.3 규칙 1~6 각각에 대한 실패 시나리오 + 에러 메시지 내용 검증.
  - `graph` 없는 md는 무시.
  - `(from, to, relation)` 중복 엣지 에러.

### 7.2 데이터 로더 `src/features/graph/__tests__/loadGraph.test.ts`
- 정상 `graphs.json` 파싱.
- 존재하지 않는 그래프 이름 요청 → null 반환(throw 아님).

### 7.3 상호작용 훅 `src/features/graph/__tests__/useGraphInteraction.test.ts`
- 노드 선택 → 이웃 slug 집합 계산.
- 필터 변경 → 가시 엣지 집합 계산.
- Cytoscape 인스턴스 없이 훅을 순수 상태머신으로 설계해 headless 테스트 가능하게.

### 7.4 컴포넌트 렌더 테스트 `GraphView.test.tsx`
- 빈 그래프·미존재 그래프에서 빈 상태 메시지 렌더(스모크).
- Cytoscape 초기화는 JSDOM에서 불안정 → 수동 검증에 의존.

### 7.5 수동 검증 체크리스트
- 시드 데이터 5~6 노드(algebra)로 빌드.
- dev 서버에서 필터 토글, 노드 선택, 패널 diff 표시, 모바일 드로어 전환, Archive 하단 링크 동작 확인.
- 빈 그래프 URL, 존재하지 않는 그래프 URL 동작 확인.
- 검증 실패 케이스(일부러 잘못된 `to` 슬러그) 빌드 실패 확인.

### 7.6 CI
- 기존 워크플로에 `npm test` 단계가 없다면 추가.
- `build-graph`의 검증 실패가 빌드 단계에서 이미 중단시키므로 이중 안전망.

## 8. 보안 레벨

- 레벨: **Low** (개인 블로그, 공개 정적 사이트).
- 주요 위협: 로컬 경로·사용자명·환경변수 같은 **프라이버시 유출**이 RAW의 md를 통해 Pages로 새어 나가는 것.

### 8.1 로컬 경로 / 환경 정보 유출 차단
`seraph-field-site/scripts/content-validation.mjs`의 `validateFrontmatterContract`가 이미 `C:\` 패턴과 `file://` URL을 차단한다. 현재 패턴은 다음의 빈틈이 있으므로 **이번 작업에 포함해 확장**한다.

- Forward-slash 드라이브 경로 (`C:/Users/...`)
- Unix 절대경로 (`/Users/...`, `/home/...`)
- 홈 디렉토리 · 환경변수 (`~/`, `$HOME`, `%USERPROFILE%`, `%APPDATA%`)

확장 후 패턴 예시:
```js
const localPathPattern =
  /(?:[A-Za-z]:[\\/]|file:\/\/|~\/|\$HOME\b|%USERPROFILE%|%APPDATA%|\/Users\/|\/home\/)/i;
```

`build-graph.mjs`는 그래프 md를 개별적으로 파싱하므로, **이 로컬 경로 검사 함수(또는 `validateFrontmatterContract` 전체)를 `build-graph.mjs`에서도 재사용한다**. 이렇게 하면 그래프 전용 필드(`loses`, `gains`, `title` 등)에 들어간 경로도 동일 규칙으로 차단된다.

### 8.2 그 외 체크 항목
- KaTeX 수식 렌더링 XSS: 기존 `rehype-katex` 파이프라인을 그대로 쓰므로 신규 위험 없음.
- `graphs.json`은 공개 정적 자산 → 비밀 정보 기재 금지(작성 가이드에 명시).
- 사용자 입력 미수용 순수 정적 렌더 → 추가 보안 설계 불필요.

## 9. 향후 확장 가능성 (비범위)

- 관계 타입 추가(예: `dual_of`, `adjoint_of`) — 스키마는 비대칭 키 패턴 유지.
- 그래프 간 연결(예: algebra·topology 교차 링크) — 별도 설계 필요.
- n-hop 하이라이트 옵션.
- 사이트 내 검색어로 그래프 노드 필터.
- `graphs.json` 파일 분할 + lazy load.
