# Seraph Field

`RAW/**/*.md`를 콘텐츠 원본으로 두고, `seraph-field-site`에서 정적 JSON을 생성해 GitHub Pages로 배포하는 개인 기술 블로그.

배포 주소:

- [https://echidnarezero.github.io/SeraphField/](https://echidnarezero.github.io/SeraphField/)

## 구성

- `콘텐츠`
  - `SCRATCH/` -> Git으로 추적하지 않는 private 초안
  - `DRAFT/` -> Git으로 추적하는 작업중 원본
  - `RAW/` -> 사이트에 게시하는 최종 공개 원본
- `KNOWLEDGE_GRAPH/`
  - SQLite 기반 수학 지식 그래프 데이터 관리 (seed, export)
- `seraph-field-site/`
  - React + Vite 기반 정적 사이트
- `scripts/`
  - 콘텐츠 빌드와 검증 스크립트
- `docs/`
  - 사이트 구조와 프로젝트 설명 문서
- `skills/`
  - 프로젝트 작업용 로컬 스킬
- `.github/workflows/deploy-blog.yml`
  - GitHub Pages 배포 워크플로

## 기술 스택

- Runtime/Tooling: `Node.js 24`
- Frontend: `React 19`, `TypeScript`, `Vite 8`
- Styling/UI: `Tailwind CSS 4`, `Motion`, `Lucide React`
- Knowledge Graph: `Cytoscape.js`, `cytoscape-fcose`, `better-sqlite3`
- Content: `gray-matter`, `react-markdown`, `remark-math`, `rehype-katex`, `react-syntax-highlighter`
- Testing: `Vitest`
- Deploy: `GitHub Pages`, `GitHub Actions`

## 사용법

Windows 기준:

1. `cd seraph-field-site`
2. `npm install`
3. `npm run dev`

내용 Markdown만 추가하거나 수정했을 때:

1. `cd seraph-field-site`
2. `npm run content:build`

사이트 코드를 수정했을 때:

1. `cd seraph-field-site`
2. `npm run lint`
3. `npm test`
4. `npm run build`

## 콘텐츠 파이프라인

콘텐츠 원본은 `SCRATCH/`, `DRAFT/`, `RAW/`로 나눠 관리합니다.

```mermaid
flowchart LR
    SCRATCH["SCRATCH/"] -->|"공개 안전 확인 후"| DRAFT["DRAFT/"]
    DRAFT -->|"최종 정리 후"| RAW["RAW/"]
    RAW -->|"content build"| SITE["seraph-field-site"]
```
