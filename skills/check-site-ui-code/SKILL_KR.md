이 문서는 한국어 사용자용 안내 문서이며, 원칙적으로 [SKILL.md](/C:/Projects/YUKINET/skills/check-site-ui-code/SKILL.md)와 같은 내용을 한국어로 설명합니다.

# Check Site UI Code

`SKILL.md`의 실질적인 지침이 바뀌면 이 문서도 함께 갱신합니다.

## 이 스킬을 쓰는 경우

- `seraph-field-site` 아래의 React 컴포넌트, 훅, 스타일, 라우팅, generated content 소비 코드를 바꿨을 때
- UI 코드 변경 후 어떤 검증 명령을 돌려야 할지 정할 때
- 사이트 UI 변경 뒤 `lint`, `build`, `test` 실패 원인을 볼 때

## 기본 점검

변경 종류에 맞춰 아래 점검을 실행합니다.

- `npm run lint`
  - 현재 이 프로젝트에서는 `tsc --noEmit` 기반 타입체크입니다
- `npm run build`
  - 콘텐츠 생성과 Vite 프로덕션 빌드를 함께 확인합니다
- `npm test`
  - 동작, 파싱 로직, 유틸리티 변경이 있고 기존 테스트가 관련될 때 사용합니다

## 변경 유형별 최소 기준

- 컴포넌트, 훅, 라우트, 스타일 변경
  - `npm run lint`
  - `npm run build`
- 콘텐츠 파싱, 아카이브 렌더링, 링크 해석, 검색, generated data 흐름 변경
  - `npm run lint`
  - `npm run build`
  - 관련 테스트가 있거나 위험이 작지 않으면 `npm test`
- UI 문구만 바뀐 경우
  - 보통 `npm run lint`로 충분하지만, JSX 구조나 콘텐츠 생성에 닿으면 `npm run build`도 같이 봅니다

## 실패를 볼 순서

1. `npm run lint`의 타입 오류
2. `npm run build`에서 드러난 콘텐츠 생성 실패
3. Vite/React 빌드 실패
4. `npm test` 실패

## 최종 점검

- 바뀐 UI 코드가 의도한 동작과 맞는지 확인합니다
- 변경 유형에 맞는 최소 점검을 실행했는지 확인합니다
- 생략한 점검이 있으면 최종 보고에 이유를 남깁니다
