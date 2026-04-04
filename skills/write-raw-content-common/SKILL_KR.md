이 문서는 한국어 사용자용 안내 문서이며, 원칙적으로 [SKILL.md](/C:/Projects/YUKINET/skills/write-raw-content-common/SKILL.md)와 같은 내용을 한국어로 설명합니다.

# Write RAW Content

`SKILL.md`의 실질적인 지침이 바뀌면 이 문서도 함께 갱신합니다.

## 역할

이 스킬은 `RAW/**/*.md` 작업의 공통 기준입니다.
즉 이 문서는:

- 섞여 있는 초안을 네 가지 RAW 카테고리로 분류하고 나누는 기준

을 다룹니다.

공개 안전, frontmatter, 링크, 버전 표기, 파서 호환 메타데이터는 `AGENTS.md`를 기준으로 따릅니다.

실제 카테고리별 작성 규칙은 분리 후 해당 하위 스킬을 함께 봅니다.

- `write-raw-content-theory`
- `write-raw-content-paper`
- `write-raw-content-repo`
- `write-raw-content-implement`

frontmatter, `content:build`, 표, Mermaid, TOC 같은 콘텐츠 점검이 중요하면 `check-site-content`도 같이 봅니다.
수식 표기나 수식 렌더링 점검이 중요하면 `write-math-notation`도 같이 봅니다.

## 섞인 RAW 초안을 주된 목적 기준으로 분류하기

하나의 초안이 여러 역할을 섞고 있으면, 억지로 한 카테고리에 몰아넣지 않습니다.
초안은 초안이고, 최종 문서는 각 섹션의 주된 목적에 따라 분류한 뒤 필요하면 나눕니다.

카테고리 기준은 아래와 같습니다.

- `THEORY`
  - 대상: 이론 중심 내용
  - 예시: 라돈-니코딤 정리, 이토 적분, 확률과정으로서의 diffusion 해석
- `PAPER`
  - 대상: 특정 논문 리뷰 및 분석
  - 예시: "Attention is All You Need" 리뷰, DDPM 논문 리뷰, GPT-4 논문 리뷰
- `REPO`
  - 대상: 외부 리포지토리와 남이 짠 코드 분석
  - 예시: HuggingFace Transformers 라이브러리 구조 분석, ComfyUI 워크플로우 동작 방식 설명
- `IMPLEMENT`
  - 대상: 사용자가 직접 작성한 코드, 실습, 연구, 실험
  - 예시: 직접 구현한 Diffusion 학습 코드, Rectified Flow를 적용한 실험 코드, PyTorch로 Transformer 블록 직접 구현

## 헷갈릴 때 내용 분리 기준

- `THEORY` vs `PAPER`
  - 특정 논문 자체를 리뷰하면 `PAPER`
  - 같은 내용을 특정 논문 중심 없이 일반 이론으로 설명하면 `THEORY`
- `REPO` vs `IMPLEMENT`
  - 코드가 있고, 남이 짠 코드를 분석하면 `REPO`
  - 코드가 있고, 사용자가 직접 구현하거나 실험한 작업이면 `IMPLEMENT`
- `THEORY` vs 코드 카테고리
  - 중심이 이론 설명이면 `THEORY`
  - 중심이 코드 구조 설명이나 구현 작업이면 `REPO` 또는 `IMPLEMENT`
- 초안 안에 여러 역할이 섞이면 역할별로 문서를 분리하고, 한 문서에 다 넣지 말고 서로 링크합니다

## 근거 규칙

- 선택한 카테고리의 하위 skill에 있는 근거 규칙을 적용합니다.
- 서로 다른 근거 방식이 필요한 섹션은 한 문서에 섞지 말고 먼저 분리합니다.
- 적절한 근거를 붙일 수 없는 내용은 지우거나 추론이라고 분리합니다.

## 저장 전 최종 점검

- 초안이 필요한 만큼 역할별로 분리됐는지 확인합니다.
- 선택한 카테고리가 문서의 주된 목적과 맞는지 확인합니다.
- 공개 안전, 형식, 메타데이터는 `AGENTS.md` 기준을 적용했는지 확인합니다.
- 해당 카테고리 하위 skill 기준을 적용했는지 확인합니다.
- 콘텐츠 점검이나 렌더링 민감 문법이 중요했다면 `check-site-content`를 적용했는지 확인합니다.
- 문서에 수식이 있다면 `write-math-notation`을 적용했는지 확인합니다.
- 문서가 그대로 공개 저장소에 올라가도 되는지 확인합니다.
