# Seraph Field

`RAW/**/*.md`를 콘텐츠 원본으로 두고, `seraph-field-site`에서 정적 JSON을 생성해 GitHub Pages로 배포하는 개인 기술 블로그.

배포 주소:

- [https://echidnarezero.github.io/SeraphField/](https://echidnarezero.github.io/SeraphField/)

## 구성

- `RAW/`
  - 공개용 Markdown 원본
- `seraph-field-site/`
  - React + Vite 기반 정적 사이트
- `.github/workflows/deploy-blog.yml`
  - GitHub Pages 배포 워크플로

## 기술 스택

- Runtime/Tooling: `Node.js 24`
- Frontend: `React 19`, `TypeScript`, `Vite 8`
- Styling/UI: `Tailwind CSS 4`, `Motion`, `Lucide React`
- Content: `gray-matter`, `react-markdown`, `remark-math`, `rehype-katex`, `react-syntax-highlighter`
- Testing: `Vitest`
- Deploy: `GitHub Pages`, `GitHub Actions`

## 사용법

Windows 기준:

권장 버전:

- `Node.js 24`

1. `seraph-field-site`로 이동
2. `npm install`
3. `npm run dev`

빌드:

1. `seraph-field-site`로 이동
2. `npm run build`
3. 결과물은 `seraph-field-site/dist/`에 생성

테스트와 타입 검사는 `seraph-field-site`에서 실행한다.

- `npm test`
- `npm run lint`

## 문서

- [docs/README.md](./docs/README.md)
  - 운영 설명서 목록
- [docs/local-usage.md](./docs/local-usage.md)
  - 로컬 실행, 검증, 빌드 순서
- [docs/content-pipeline.md](./docs/content-pipeline.md)
  - `SCRATCH/`, `DRAFT/`, `RAW/` 흐름
- [docs/site-architecture.md](./docs/site-architecture.md)
  - 현재 사이트 구조와 데이터 흐름
- [docs/search.md](./docs/search.md)
  - 검색 모듈과 검색 범위
- [docs/skills-map.md](./docs/skills-map.md)
  - 프로젝트 스킬 구조와 관계
- [SITE_SPEC.md](./SITE_SPEC.md)
  - 과거 구조 메모와 변경 지점 기록
- [AGENTS.md](./AGENTS.md)
  - 저장소 작업 규칙과 RAW 작성 제약
- `skills/write-raw-content-common/SKILL.md`
  - `RAW/**/*.md` 공통 작성 규칙과 초안 분해 기준
- `skills/write-raw-content-theory/SKILL.md`
- `skills/write-raw-content-paper/SKILL.md`
- `skills/write-raw-content-repo/SKILL.md`
- `skills/write-raw-content-implement/SKILL.md`
  - 카테고리별 세부 작성 규칙
