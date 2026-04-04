이 문서는 한국어 사용자용 안내 문서이며, 원칙적으로 [SKILL.md](/C:/Projects/YUKINET/skills/write-math-notation/SKILL.md)와 같은 내용을 한국어로 설명합니다.

# Write Math Notation

`SKILL.md`의 실질적인 지침이 바뀌면 이 문서도 함께 갱신합니다.

## 이 스킬을 쓰는 경우

- `RAW/**/*.md` 안의 수식이 제대로 렌더링되는지 점검할 때
- 수식 구분자, 코드 포맷, Markdown 표 셀 때문에 수식 렌더링이 깨질 때
- 본문이나 표 안 표현을 LaTeX로 쓸지, 유니코드 기호로 쓸지, 그냥 말로 풀어 쓸지 정할 때

## 렌더링 모델

- 본문 수식은 `remark-math`와 KaTeX로 렌더링합니다.
- Mermaid 라벨은 TeX를 렌더링하지 않습니다.
- Mermaid 라벨에 수학 비슷한 표기가 필요하면 `Δ`, `σ`, `∫`, `⊂`, `→` 같은 유니코드 기호나 plain words를 씁니다.
- Mermaid 라벨 안에는 `\Delta`, `\sigma`, `\int` 같은 TeX 명령을 쓰지 않습니다.
- `Delta`, `sigma`처럼 풀어 쓴 말보다 실제 기호가 더 분명하면 그 기호를 씁니다.
- 공통 다이어그램 구조 선택 규칙은 `write-diagrams-and-visualizations`을 같이 봅니다.
- Markdown 표 셀은 LaTeX를 넣기에 좋은 자리가 아닙니다. 유니코드 기호를 쓰거나 수식을 표 밖으로 빼는 편이 낫습니다.

## 본문 수식

사용:

- 인라인 수식: `$...$`
- 블록 수식: `$$...$$`

쓰지 않는 것:

- 수식이 들어간 문장, 제목, 목록 항목을 백틱으로 감싸기
- TeX를 inline code 안에 넣기
- 짝이 맞지 않는 `$` 남기기

수식 구분자와 fenced code block을 섞어 쓰지 않습니다.

## 표

- Markdown 표 셀 안에는 LaTeX를 넣지 않습니다.
- 표 셀 안에서 수식 비슷한 표기가 필요하면 유니코드 기호를 씁니다.
- 수식이 구조적으로 복잡해지면 표 밖으로 빼고 prose, 리스트, 블록 수식으로 다시 씁니다.

## 수식 렌더링 점검표

- 인라인 수식이 모두 `$...$`인가?
- 블록 수식이 모두 `$$...$$`인가?
- `$` 짝이 모두 맞는가?
- 수식이 들어간 줄이 백틱이나 inline code로 감싸져 있지 않은가?
- 문서에 다이어그램이 있다면 `write-diagrams-and-visualizations`을 적용했는가?
- Markdown 표 셀 안에 LaTeX가 없는가?

## 렌더링 버그가 나면 보는 순서

1. 깨진 수식이 본문인지, Mermaid 라벨인지, Markdown 표 셀인지 먼저 구분합니다.
2. 본문 수식이면 구분자, `$` 짝, 코드 포맷 문제를 먼저 봅니다.
3. Mermaid 라벨이면 TeX 명령을 빼고 유니코드 기호나 plain words로 다시 씁니다.
4. 표 안 수식이면 표 밖으로 빼거나 유니코드 기호로 다시 씁니다.
5. Mermaid 구조 자체가 문제면 `write-diagrams-and-visualizations`으로 이동합니다.
6. 문법이 맞는데도 계속 깨지면 사이트 렌더러를 확인합니다.
