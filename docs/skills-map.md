# 스킬 분류표

## 분류 기준

| 종류 | 뜻 |
| --- | --- |
| 파이프라인 | 여러 단계를 한 작업 흐름으로 묶는 스킬 |
| RAW 분류 | `RAW/**/*.md`의 역할을 가르고 섞인 초안을 나누는 스킬 |
| 카테고리 작성 | 특정 `RAW` 카테고리의 문서 모양과 근거 방식을 정하는 스킬 |
| 문서 유틸리티 | 사이트 콘텐츠나 프로젝트 문서에서 생기는 좁은 문서 기술 문제를 다루는 스킬 |
| 사이트 코드 점검 | `seraph-field-site` UI 코드 검증을 다루는 스킬 |
| 메타 | 프로젝트용 스킬 자체를 만드는 스킬 |

## 1. 파이프라인

| 스킬 | 종류 | 언제 쓰는가 | 여기서 끝나는 범위 |
| --- | --- | --- | --- |
| `scratch-to-raw-pipeline` | 파이프라인 | 거친 초안이나 메모를 `SCRATCH`, `DRAFT`, `RAW` 중 어디에 둘지 판단하고 게시용 `RAW`로 정리할 때 | 초안 단계 판단, 문서 분리, 최종 `RAW`로 가는 흐름 |
| `publish-site-content-pipeline` | 파이프라인 | 이미 완성된 `RAW` 콘텐츠를 로컬 검증, Git publish, CI/CD 확인까지 보낼 때 | 게시 직전 검증, Git identity, push, 배포 확인 |

## 2. RAW 작성

### 2-1. RAW 분류

| 스킬 | 종류 | 언제 쓰는가 | 여기서 끝나는 범위 |
| --- | --- | --- | --- |
| `write-raw-content-common` | RAW 분류 | 섞인 초안을 `THEORY`, `PAPER`, `REPO`, `IMPLEMENT`로 나누고 문서를 분리할 때 | 카테고리 선택과 문서 분리 |

### 2-2. 카테고리 작성

| 스킬 | 종류 | 언제 쓰는가 | 여기서 끝나는 범위 |
| --- | --- | --- | --- |
| `write-raw-content-theory` | 카테고리 작성 | 수학과 스타일의 이론 문서를 쓸 때 | THEORY 문서 구조, 설명 방식, 예시 방식 |
| `write-raw-content-paper` | 카테고리 작성 | 특정 논문 중심의 리뷰나 분석 문서를 쓸 때 | PAPER 문서 구조와 근거 방식 |
| `write-raw-content-repo` | 카테고리 작성 | 외부 저장소와 남이 쓴 코드를 읽고 분석할 때 | REPO 문서 구조와 근거 방식 |
| `write-raw-content-implement` | 카테고리 작성 | 사용자가 직접 구현하고 실행한 작업을 기록할 때 | IMPLEMENT 문서 구조와 근거 방식 |

## 3. 문서 유틸리티

| 스킬 | 종류 | 언제 쓰는가 | 여기서 끝나는 범위 |
| --- | --- | --- | --- |
| `check-site-content` | 문서 유틸리티 | `RAW/**/*.md`가 frontmatter, Markdown, Mermaid, TOC, build 규칙을 지키는지 볼 때 | 사이트 콘텐츠 계약과 렌더링 안전성 점검 |
| `check-project-docs` | 문서 유틸리티 | `README.md`, `docs/**/*.md`, `AGENTS*.md`, `SKILL*.md` 같은 프로젝트 문서를 저장 전 검수할 때 | 그룹별 문서 검수, 중복/안전/일관성 점검 |
| `write-math-notation` | 문서 유틸리티 | 본문 수식, Mermaid 라벨, 표 셀 수학 표기를 안정적으로 쓸 때 | 수식 구분자, 표기 선택, 렌더링 제약 |
| `write-diagrams-and-visualizations` | 문서 유틸리티 | `RAW` 문서나 `docs/**/*.md`, `README.md`에서 Mermaid나 다이어그램 구조를 읽기 쉽게 만들 때 | 화살표 의미, 다이어그램 분리, Mermaid 블록 형식 |

## 4. 사이트 코드 점검

| 스킬 | 종류 | 언제 쓰는가 | 여기서 끝나는 범위 |
| --- | --- | --- | --- |
| `check-site-ui-code` | 사이트 코드 점검 | `seraph-field-site`의 UI 코드 변경 뒤 `lint`, `test`, `build`를 고를 때 | UI 코드 검증과 실패 분류 |

## 5. 메타

| 스킬 | 종류 | 언제 쓰는가 | 여기서 끝나는 범위 |
| --- | --- | --- | --- |
| `create-project-skill` | 메타 | 이 저장소 안의 새 스킬을 만들거나 기존 스킬을 다듬을 때 | 스킬 폴더명, frontmatter, 프로젝트 적합성 점검 |

## 현재 기준에서 기억할 점

- 현재는 `THEORY`만 비교적 기준이 많이 정리돼 있고, `PAPER`, `REPO`, `IMPLEMENT` 스킬은 아직 미완성 상태로 봅니다.
- `check-site-content`, `check-project-docs`, `write-math-notation`, `write-diagrams-and-visualizations`는 모두 `문서 유틸리티`로 두고, 각자 좁은 기술 범위를 맡습니다.
