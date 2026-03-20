# YUKINET

`RAW/**/*.md`를 콘텐츠 원본으로 두고, `seraph-field-site`에서 정적 JSON을 생성해 GitHub Pages로 배포하는 개인 기술 블로그/포트폴리오 저장소다.

## 구성

- `RAW/`
  - 공개용 Markdown 원본
- `seraph-field-site/`
  - React + Vite 기반 정적 사이트
- `.github/workflows/deploy-blog.yml`
  - GitHub Pages 배포 워크플로

## 사용법

Windows 기준:

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

- [SITE_SPEC.md](./SITE_SPEC.md)
  - 현재 구조, 데이터 흐름, 변경 지점 정리
- [AGENTS.md](./AGENTS.md)
  - 저장소 작업 규칙과 RAW 작성 제약
- `skills/seraph-field-raw-authoring/SKILL.md`
  - `RAW/**/*.md` 작성/수정용 로컬 워크플로
