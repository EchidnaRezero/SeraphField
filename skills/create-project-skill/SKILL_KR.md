이 문서는 한국어 사용자용 안내 문서이며, 원칙적으로 [SKILL.md](./SKILL.md)와 같은 내용을 한국어로 설명합니다.

# Create Project Skill

`SKILL.md`의 실질적인 지침이 바뀌면 이 문서도 함께 갱신합니다.

## 목적

이 저장소의 규칙에 맞는 프로젝트 전용 skill을 `skills/` 아래에 만드는 데 사용합니다.

## 이 저장소에서 skill을 만드는 위치

- 프로젝트 전용 skill은 `skills/` 아래에 둡니다.
- 폴더 이름은 소문자, 숫자, 하이픈만 사용합니다.
- 이름은 언제 쓰는지 바로 보이도록 짧은 동사형을 우선합니다.

좋은 예:

- `write-raw-content-common`
- `write-raw-content-theory`
- `write-raw-content-paper`
- `write-raw-content-repo`
- `write-raw-content-implement`
- `check-site-content`
- `check-site-ui-code`
- `create-project-skill`

## frontmatter 규칙

필수 필드만 사용합니다.

- `name`
- `description`

`description`은 짧은 트리거 문장 한 줄로 씁니다.

이 프로젝트에서는 사람용 `SKILL_KR.md`도 함께 만들고, 의미가 바뀌면 같이 갱신합니다.

## 프로젝트 적합성 규칙

skill이 `RAW/**/*.md`와 관련되면 아래 규칙과 맞아야 합니다.

- `AGENTS.md`
- `skills/write-raw-content-common/SKILL.md`
- 카테고리 전용 규칙이 있으면 해당 하위 skill
- 사이트 콘텐츠 점검이면 `skills/check-site-content/SKILL.md`
- 사이트 UI 코드 점검이면 `skills/check-site-ui-code/SKILL.md`

## 스킬 독립성

- 다른 프로젝트 skill을 직접 위임하거나 호출할 수 있는 skill은 `scratch-to-raw-pipeline`, `publish-site-content-pipeline` 두 개만 둡니다.
- 그 외 모든 프로젝트 skill은 자기완결형으로 유지하고, 다른 프로젝트 skill을 쓰라, 적용하라, 따르라, 이동하라 같은 지시형 문장을 쓰지 않습니다.
- 프로젝트 skill은 저장소 전역 보안 사항과 추적/공개 문서 정보 규칙에 한해서만 `AGENTS.md`를 명시적으로 언급할 수 있습니다.

## 최종 점검

완료 전에 아래를 확인합니다.

- 폴더 이름이 트리거하기 쉬운가
- `description`이 짧고 직접적인가
- `SKILL_KR.md`가 있고 영어본과 의미가 맞는가
- 링크가 현재 프로젝트 경로를 가리키는가
