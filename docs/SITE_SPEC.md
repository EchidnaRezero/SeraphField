# Seraph Field 구조 및 사양

사이트 구조, 콘텐츠 빌드 구조, 검색 구조, 라우팅, 렌더링, 수정 지점을 한 곳에서 확인하는 운영 사양입니다.

## 1. 디렉터리 구조

```mermaid
flowchart TD
    ROOT["project root"]
    RAW["RAW/"]
    DRAFT["DRAFT/"]
    SCRATCH["SCRATCH/"]
    BLOG["seraph-field-site/"]
    TEST["seraph-field-site/tests/"]
    SEARCH_TEST["seraph-field-site/tests/search/"]
    DOC["docs/SITE_SPEC.md"]

    ROOT --> RAW
    ROOT --> DRAFT
    ROOT --> SCRATCH
    ROOT --> BLOG
    ROOT --> TEST
    TEST --> SEARCH_TEST
    ROOT --> DOC

    BLOG --> SRC["src/"]
    BLOG --> FEATURES["src/features/"]
    BLOG --> SCRIPTS["scripts/"]
    BLOG --> DIST["dist/"]
```

- `SCRATCH/`는 Git으로 추적하지 않는 private 거친 초안 폴더입니다.
- `DRAFT/`는 Git으로 추적하는 작업중 문서 폴더입니다.
- `RAW/`는 사이트 빌드 입력으로 쓰는 최종 공개 원본 폴더입니다.

## 2. 콘텐츠와 사이트 파이프라인

```mermaid
flowchart LR
    RAW["RAW/**/*.md"] --> BUILD["scripts/build-content.mjs"]
    META["RAW/_meta/version-registry.json"] --> BUILD
    BUILD --> VALIDATE["scripts/content-validation.mjs"]
    VALIDATE --> POSTS["src/generated/posts.json"]
    VALIDATE --> INDEX["src/generated/search-index.json"]
    POSTS --> DATA["src/data/content.ts"]
    INDEX --> DATA
    DATA --> UI["React UI"]
    UI --> DIST["dist/"]
```

- `scripts/content-validation.mjs`에서 콘텐츠 검증을 먼저 수행합니다.
- `src/generated/`, `dist/`는 수동으로 수정하지 않습니다.

## 3. 핵심 코드 구조

```mermaid
flowchart TD
    APP["src/App.tsx"]
    CONTENT["src/data/content.ts"]

    subgraph UI["UI"]
        LOBBY["Lobby.tsx"]
        ARCHIVE["Archive.tsx"]
        MARKDOWN["ArchiveMarkdown.tsx"]
        TOC["ArchiveToc.tsx"]
        SEARCH_UI["SearchResults.tsx"]
    end

    subgraph SEARCH["search feature"]
        QUERY["features/search/query.ts"]
        MATCH["features/search/match.ts"]
        RANK["features/search/rank.ts"]
        SELECTORS["features/search/selectors.ts"]
    end

    subgraph LIB["other lib"]
        ROUTES["routes.ts"]
        ARCHIVE_LIB["archive.ts"]
        LOBBY_SETTINGS["lobbySettings.ts"]
    end

    subgraph BUILD["build"]
        VALIDATE["scripts/content-validation.mjs"]
        BUILD_CONTENT["scripts/build-content.mjs"]
    end

    TESTS["seraph-field-site/tests/search/*.test.ts"]

    APP --> LOBBY
    APP --> ARCHIVE
    APP --> SEARCH_UI
    APP --> CONTENT
    APP --> ROUTES
    LOBBY --> LOBBY_SETTINGS
    ARCHIVE --> MARKDOWN
    ARCHIVE --> TOC
    ARCHIVE --> ARCHIVE_LIB
    ARCHIVE --> CONTENT
    SEARCH_UI --> SELECTORS
    ARCHIVE --> SELECTORS
    QUERY --> SELECTORS
    MATCH --> RANK
    RANK --> SELECTORS
    BUILD_CONTENT --> VALIDATE
    BUILD_CONTENT --> CONTENT
    TESTS --> SELECTORS
    TESTS --> ARCHIVE_LIB
    TESTS --> VALIDATE
```

- 화면 전환은 `App.tsx`
- 콘텐츠 공급은 `src/data/content.ts`
- 문서 렌더링은 `Archive.tsx`, `ArchiveMarkdown.tsx`, `ArchiveToc.tsx`
- 검색 규칙은 `src/features/search/`
- 콘텐츠 빌드와 검증은 `scripts/`

## 4. 라우팅

해시 라우팅만 사용합니다.

- `#lobby`
- `#archive`
- `#archive/<slug>`
- `#search`
- `#search/<query>`
- `#references`
- `#profile`

## 5. 검색 구조

기본 검색은 아래 항목을 함께 봅니다.

- 제목
- 요약
- 본문 평문 인덱스
- 태그
- 그룹
- 시리즈

필요하면 범위를 따로 좁힐 수 있습니다.

- `title:...`
- `body:...`
- `title-body:...`
- `group:...`
- `series:...`
- `#Flow Matching`
- `#tag1 and #tag2`
- `#tag1 or #tag2`

- 태그 검색은 `#`로 시작하면 태그 스코프로 해석합니다.
- 태그 검색에서 `and` 또는 `or`가 없으면 입력 전체를 한 태그로 봅니다.
- 태그 검색에서 여러 태그를 찾을 때만 `and`, `or`로 나눕니다.

```mermaid
flowchart LR
    QUERY["query.ts"] --> SELECTORS["selectors.ts"]
    MATCH["match.ts"] --> RANK["rank.ts"]
    RANK --> SELECTORS
    SELECTORS --> UI["SearchResults.tsx / Archive.tsx"]
```

현재 점수는 대략 아래 우선순위를 따릅니다.

- 제목 일치
- 그룹 일치
- 시리즈 일치
- 태그 일치
- 요약 일치
- 본문 일치

## 6. 문서 렌더링 규칙

- Markdown의 첫 `h1`은 화면 헤더와 중복되므로 숨깁니다.
- `##`는 TOC 대상입니다.
- `post://slug` 내부 링크는 `#archive/<slug>`로 연결합니다.
- 외부 링크는 새 탭으로 엽니다.
- 수식은 `remark-math`와 `rehype-katex`를 통해 렌더링합니다.
- Mermaid는 fenced `mermaid` 코드 블록만 지원합니다.

## 7. 반응형 레이아웃

- `Lobby.tsx`
  - 데스크톱은 좌측 HUD + 우측 패널
  - 모바일은 가로 스크롤 카테고리 메뉴 + 하단 스택 패널
- `Archive.tsx`
  - 데스크톱은 문서 목록 / 본문 / TOC 3열
  - 모바일은 상하 스택
- `SearchResults.tsx`, `ReferenceLog.tsx`, `ProfilePage.tsx`
  - 좁은 화면에서 세로 흐름으로 재배치
- `ReferenceLog.tsx`
  - 데스크톱은 표형
  - 모바일은 카드형

## 8. 리포지토리 버전 추적

```mermaid
flowchart TD
    REG["version-registry.json"] --> BUILD["build-content.mjs"]
    MD["REPO 문서"] --> BUILD
    BUILD --> POSTS["posts.json versions[]"]
    POSTS --> TRACKED["trackedRepositories"]
    TRACKED --> LOBBY["Lobby 우측 목록"]
    TRACKED --> TABLE["ReferenceLog"]
```

- `REPO` 카테고리 문서의 버전 정보만 집계합니다.

## 9. 배포와 검증

최종 게시 기준 흐름은 아래 순서를 따릅니다.

1. 먼저 바뀐 범위를 구분합니다.
   - 콘텐츠만 바뀌었는지
   - UI 코드도 함께 바뀌었는지
2. 공통으로 `npm run content:build`를 실행해 `RAW/**/*.md`를 JSON으로 다시 생성합니다.
3. 최종 게시 전 검증으로 `npm run lint`, `npm test`, `npm run build`를 순서대로 실행합니다.
4. 첫 커밋이나 첫 푸시 전에는 `local.settings.json`의 선택을 기준으로 repo-local Git identity를 설정합니다.
5. 브랜치를 push한 뒤 GitHub Actions와 GitHub Pages 배포 결과를 확인합니다.

- `vite.config.ts`는 GitHub Pages 호환을 위해 `base: './'`를 사용합니다.
- 배포 절차의 상세 기준은 `skills/publish-site-content-pipeline/SKILL.md`를 기준으로 봅니다.

## 10. 수정 지점

- 사이트 이름/설명 변경: `src/config/siteMeta.ts`
- 프로필 정보 변경: `src/config/siteProfile.ts`
- 카테고리 변경: `src/config/categories.ts`
- 검색 문법/검색 범위/점수 변경: `src/features/search/`
- 검색 테스트 추가/갱신: `seraph-field-site/tests/search/*.test.ts`
- 해시 규칙 변경: `src/lib/routes.ts`
- 아카이브 TOC/필터링 규칙 변경: `src/lib/archive.ts`
- 로비 UI 설정 기본값 변경: `src/lib/lobbySettings.ts`
- Markdown/수식/코드 블록 렌더링 변경: `src/components/ArchiveMarkdown.tsx`
- TOC 화면 구조 변경: `src/components/ArchiveToc.tsx`
- 콘텐츠 집계 변경: `src/data/content.ts`
- 콘텐츠 입력 검증 규칙 변경: `scripts/content-validation.mjs`
- 콘텐츠 빌드 규칙 변경: `scripts/build-content.mjs`
- 검색 관련 테스트는 `seraph-field-site/tests/search/` 아래에 모읍니다.
- 테스트 기준 갱신: `seraph-field-site/tests/*.test.ts`, `npm test`
