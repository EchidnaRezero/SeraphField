이 문서는 한국어 사용자용 안내 문서이며, 원칙적으로 [AGENTS.md](/C:/Projects/YUKINET/AGENTS.md)와 같은 내용을 한국어로 설명합니다.

## RAW 공개 안전 규칙

- `RAW/` 아래 모든 파일은 공개 저장소에 그대로 올라가는 문서로 취급합니다.
- `RAW/**/*.md`에는 개인 식별 정보를 넣지 않습니다.
  - 실명
  - 이메일
  - 전화번호
  - 핸들, 소셜 ID
  - 개인 URL
  - 절대 로컬 경로
  - 비공개 워크스페이스 링크
  - 내부 메모
- 초안이나 원문에 개인 계정명, 작성자명이 들어 있으면 공개용 기본 식별자는 `Echidna`로 바꿉니다.
- 추가 사람 이름, 별칭, 계정 비슷한 표기가 필요하면 `RAW/hbr_charlist_2025_08_08.csv`의 Heaven Burns Red 캐릭터명이나 게임 코드를 사용합니다.
- AI 작성 흔적, 비공개 TODO, 프롬프트 조각은 저장 전에 제거합니다.

## RAW Markdown 형식

frontmatter는 공개 저장소 기준으로 최소한만 유지합니다. 특별한 이유가 없으면 아래 형식을 사용합니다.

```yaml
---
title: 문서 제목
date: 2026-03-21
category: THEORY
tags:
  - TagA
  - TagB
summary: 한 줄 요약
slug: optional-slug
tracked_versions:
  - optional-repo-id
---
```

- `category`는 `THEORY`, `PAPER`, `REPO`, `IMPLEMENT`만 사용합니다.
- `tags`는 쉼표 문자열보다 YAML 배열을 선호합니다.
- `tracked_versions`는 추적 버전 출력에 참여하는 `REPO` 문서에서만 사용합니다.
- frontmatter와 본문에 절대 로컬 경로를 넣지 않습니다.

## RAW 작성 규칙

- 제목, 요약, 라벨은 과하게 대화체로 쓰지 말고 설명적으로 씁니다.
- 문서는 공개 가능한 학습/포트폴리오 저장소 문서로 바로 게시 가능한 상태여야 합니다.

## 링크 규칙

- 내부 링크는 가능하면 Obsidian 스타일을 사용합니다.
  - `[[문서명]]`
  - `[[문서명|표시명]]`
- wikilink로 명확하지 않을 때만 상대 Markdown 링크를 사용합니다.
- 외부 링크는 `https://` 전체 URL을 사용합니다.
- `RAW/`에서는 로컬 드라이브, 비공개 클라우드 문서, 내부 전용 리소스로 링크하지 않습니다.

## 버전 및 인용 규칙

- `PAPER` 문서는 저장소 버전 추적 대신 arXiv나 출판사 페이지 같은 공식 논문 링크를 본문에 넣습니다.
- `REPO` 문서는 `tracked_versions`를 사용할 수 있고, `RAW/_meta/version-registry.json`과 일치해야 합니다.
- 구현 노트나 저장소 노트에서 특정 라이브러리 버전을 본문에 적으면, 버전 레지스트리와 표기를 맞춥니다.

## RAW 저장 전 점검

- 개인 식별 정보가 없는지 확인합니다.
- 링크가 공개용으로 안전한지 확인합니다.
- category, tags, summary, title이 `seraph-field-site/scripts/build-content.mjs`의 파서 규칙과 맞는지 확인합니다.
