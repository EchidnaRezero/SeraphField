이 문서는 한국어 사용자용 안내 문서이며, 원칙적으로 [SKILL.md](./SKILL.md)와 같은 내용을 한국어로 설명합니다.

# Publish Site Content Pipeline

`SKILL.md`의 실질적인 지침이 바뀌면 이 문서도 함께 갱신합니다.

## 목표

이 스킬은 내용 자체가 이미 확정된 뒤에 씁니다.

즉 이 스킬은 게시 쪽 파이프라인을 맡습니다.

- 로컬 설정 확인
- 콘텐츠와 사이트 점검
- 저장소 로컬 Git identity 설정
- commit, push
- CI/CD 후속 확인

이 스킬은 세부 작성 규칙을 다시 복붙하지 않고, 기존 작성·점검 스킬을 순서대로 엮는 오케스트레이션 스킬입니다.

## 먼저 로컬 설정 확인

- 프로젝트의 보안 레벨이나 Git 계정 선택을 GitHub 쪽 정보로 추론하지 않습니다.
- 먼저 루트의 gitignored 파일 `local.settings.json`이 있는지 봅니다.
- 이 파일이 있으면 아래 로컬 값을 우선 사용합니다.
  - `securityLevel`
  - `gitAccountKey`
- 파일이 없거나, 값이 비어 있거나, 현재 사용자 지시와 충돌하면 commit이나 push 전에 사용자에게 직접 확인합니다.
- private 값은 추적되는 프로젝트 문서에 쓰지 않습니다.

## 파이프라인

1. 먼저 RAW 내용이 이미 최종 상태인지 확인합니다.
   - 아직 초안 단계면 먼저 `scratch-to-raw-pipeline`을 사용합니다.
2. 가능하면 `local.settings.json`에서 로컬 게시 설정을 읽습니다.
3. 공개 안전 검토와 저장소 규칙 검토를 `AGENTS.md` 기준으로 합니다.
4. `check-site-content`를 적용합니다.
5. 바뀐 콘텐츠에 수식이 있으면 `write-math-notation`도 적용합니다.
6. 바뀐 콘텐츠에 다이어그램이나 다른 시각화 구조가 있으면 `write-diagrams-and-visualizations`도 적용합니다.
7. 아래 순서로 로컬 검증을 실행합니다.
  - `npm run content:build`
  - `npm run lint`
  - `npm test`
  - `npm run build`
8. 이 저장소에서 첫 commit 또는 push 전에는, 선택한 로컬 Git 계정 매핑에 따라 repo-local `user.name`, `user.email`을 설정합니다.
9. 로컬 검증이 다 통과한 뒤에만 commit 합니다.
10. 브랜치를 push 합니다.
11. 저장소에 CI/CD가 설정되어 있으면 push 뒤 workflow 또는 배포 상태를 확인합니다.

## Git 규칙

- Git identity는 repo-local 설정만 씁니다.
- global Git identity는 쓰지 않습니다.
- 로컬 설정 파일에 Git 계정 선택이 들어 있으면 그 값을 출발점으로 씁니다.
- `gitAccountKey`를 실제 계정으로 풀기 위해 사용자의 홈 디렉터리 쪽 로컬 매핑 문서를 읽어야 하면, 그 문서는 로컬에서만 읽고 private 세부값을 저장소 파일에 옮기지 않습니다.

## CI/CD 규칙

- CI/CD 후속 확인은 push 뒤의 검증 단계이지, 프로젝트 설정을 추론하는 곳이 아닙니다.
- `.github/workflows/`가 있으면 push 뒤 관련 workflow 상태를 확인합니다.
- GitHub Pages나 다른 배포 대상을 쓰면 최신 push가 정상 배포로 이어졌는지 확인합니다.
- CI/CD가 없거나 범위 밖이면 그 사실만 짧게 적고 push 단계에서 멈춥니다.

## 저장 전 최종 점검

- 이 스킬을 쓰기 전에 콘텐츠 자체가 이미 확정됐는지 확인합니다.
- 가능하면 `local.settings.json`을 기준으로 썼는지 확인합니다.
- 관련 `AGENTS.md`의 공개 안전과 저장소 규칙을 확인했는지 확인합니다.
- `check-site-content`를 적용했는지 확인합니다.
- 수식이 있으면 `write-math-notation`을 적용했는지 확인합니다.
- 다이어그램이나 다른 시각화 구조가 있으면 `write-diagrams-and-visualizations`을 적용했는지 확인합니다.
- commit 전 로컬 검증이 전부 통과했는지 확인합니다.
- commit 또는 push 전에 repo-local Git identity를 설정했는지 확인합니다.
- push가 끝났는지 확인합니다.
- 필요하면 CI/CD 후속 상태도 확인했는지 확인합니다.
