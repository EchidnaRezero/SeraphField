이 문서는 한국어 사용자용 안내 문서이며, 원칙적으로 [AGENTS.md](./AGENTS.md)와 같은 내용을 한국어로 설명합니다.

## 로컬 프로젝트 설정

- 프로젝트 루트에 gitignored된 `local.settings.json`이 이미 있으면, 거기에 적힌 보안 레벨과 Git 계정 선택을 사용자가 예전에 정한 프로젝트 설정으로 취급합니다.
- 그 파일이 없거나, 비어 있거나, 현재 사용자 지시와 충돌할 때만 다시 확인합니다.

## Git 추적 공개 문서의 안전 규칙

- `DRAFT/**/*.md`, `RAW/**/*.md` 같은 Git 추적 공개 문서는 공개 저장소에 그대로 올라가는 문서로 취급합니다.
- 이런 Git 추적 공개 문서에는 개인 식별 정보를 넣지 않습니다.
  - 실명
  - 이메일
  - 전화번호
  - 핸들, 소셜 ID
  - 개인 URL
  - 절대 로컬 경로
  - 비공개 워크스페이스 링크
  - 내부 메모
- 추적 문서에서 프로젝트 루트 바깥 경로를 꼭 적어야 하면, 기계마다 달라지는 절대 경로 대신 `<project-root>/...`, `<user-home>/...`처럼 일반화한 표기를 씁니다.
- 초안이나 원문에 개인 계정명, 작성자명이 들어 있으면 공개용 기본 식별자는 `Echidna`로 바꿉니다.
- 추가 사람 이름, 별칭, 계정 비슷한 표기가 필요하면 `RAW/hbr_charlist_2025_08_08.csv`의 Heaven Burns Red 캐릭터명이나 게임 코드를 사용합니다.
- AI 작성 흔적, 비공개 TODO, 프롬프트 조각은 Git 추적 공개 문서로 저장하기 전에 제거합니다.
- `README.md`의 공식 GitHub Pages 배포 주소는 공개용 기준 주소이므로 그대로 적어도 됩니다.

## RAW 작성과 검토

- `RAW` 문서는 공개 가능한 학습/포트폴리오 저장소 문서로 바로 게시 가능한 상태여야 합니다.
- 제목, 요약, 라벨은 과하게 대화체로 쓰지 말고 설명적으로 씁니다.
- 세부 작성 규칙은 여기서 다시 길게 적지 말고, 상황에 맞는 로컬 스킬로 위임합니다.
- `SCRATCH/`나 `DRAFT/`에서 `RAW`로 옮기는 흐름은 [skills/scratch-to-raw-pipeline/SKILL.md](./skills/scratch-to-raw-pipeline/SKILL.md)를 봅니다.
- RAW frontmatter, parser-safe metadata, heading과 TOC 규칙, 사이트 콘텐츠 검토는 [skills/check-site-content/SKILL.md](./skills/check-site-content/SKILL.md)를 봅니다.
- Mermaid와 다른 다이어그램/시각화의 공통 규칙과 적절한 세부 스킬 선택은 [skills/write-diagrams-and-visualizations/SKILL.md](./skills/write-diagrams-and-visualizations/SKILL.md)를 봅니다.
- 수식 표기와 수식 렌더링 규칙은 [skills/write-math-notation/SKILL.md](./skills/write-math-notation/SKILL.md)를 봅니다.
- `RAW`가 완성된 뒤 커밋, 푸시, CI/CD 확인은 [skills/publish-site-content-pipeline/SKILL.md](./skills/publish-site-content-pipeline/SKILL.md)를 봅니다.
