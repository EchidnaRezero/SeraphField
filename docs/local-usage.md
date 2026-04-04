# 로컬 사용법

이 문서는 로컬에서 사이트를 띄우고, 내용이 깨지지 않는지 확인하고, 배포 전에 무엇을 돌릴지 정리합니다.

## 가장 자주 쓰는 순서

1. `seraph-field-site`로 이동합니다.
2. 개발 서버를 띄워 화면을 확인합니다.
3. 내용이나 코드를 바꿨다면 검증과 빌드를 돌립니다.

## 처음 실행

Windows `cmd` 기준:

```cmd
cd seraph-field-site
npm install
npm run dev
```

## 내용만 바꿨을 때

쉽게 말하면, Markdown 원본이 사이트에 들어갈 수 있는지 먼저 확인하면 됩니다.

```cmd
cd seraph-field-site
node scripts/build-content.mjs
```

이 명령은 `RAW/**/*.md`를 읽어 사이트에서 쓰는 JSON을 다시 만듭니다.

## 코드도 같이 바꿨을 때

쉽게 말하면, 타입 검사와 테스트, 빌드까지 같이 통과하는지 봅니다.

```cmd
cd seraph-field-site
npm run lint
npm test
npm run build
```

## 배포 전 최소 확인

- 콘텐츠가 바뀌었으면 `node scripts/build-content.mjs`
- UI 코드가 바뀌었으면 `npm run lint`, `npm test`, `npm run build`
- 결과 화면은 로컬 개발 서버나 빌드 결과로 다시 확인

문서 저장 위치와 게시 흐름은 [content-pipeline.md](./content-pipeline.md)에서 따로 봅니다.
