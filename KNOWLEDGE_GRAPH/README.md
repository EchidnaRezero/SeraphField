# KNOWLEDGE_GRAPH — 수학 지식그래프

수학 개념 간의 관계를 SQLite 데이터베이스(`math-kg.db`)로 관리하는 디렉토리입니다.

## 디렉토리 구조

```
KNOWLEDGE_GRAPH/
├── math-kg.db          # SQLite 데이터베이스 (seed.mjs로 생성)
├── seed.mjs            # DB 초기화 스크립트
├── README.md           # 이 문서
└── details/
    ├── nodes/          # 노드 상세 설명 마크다운
    └── edges/          # 엣지 상세 설명 마크다운
```

## DB 재생성

```bash
node KNOWLEDGE_GRAPH/seed.mjs
```

`better-sqlite3`가 `seraph-field-site/`에 설치되어 있어야 합니다.

## 스키마

### edge_types
엣지 유형 정의 (strengthen, instance, isomorphism, dual, other).

### tag_groups
태그 그룹 (map, functor, natural).

### tags
개별 태그. `group_id`로 tag_groups 참조.

### nodes
수학 개념 노드. `type`은 definition 또는 instance.

### edges
노드 간 관계. `source → target` 방향. `type`으로 edge_types 참조.

### edge_tags
엣지-태그 다대다 관계.

## 작성 규칙

1. **노드 ID**: PascalCase 또는 약어 사용 (예: `VectorSpace`, `GL_n`, `so3`)
2. **노드 type**: 추상 개념은 `definition`, 구체 객체는 `instance`
3. **category**: `algebra`, `analysis`, `geometry`, `linalg` 중 하나
4. **엣지 방향**: strengthen은 약한 구조 → 강한 구조, instance는 구체 → 추상
5. **태그**: `그룹:이름` 형식 (예: `functor:free`). 새 태그 추가 시 tag_groups에 그룹이 있어야 함
6. **detail**: 엣지의 수학적 설명. 줄바꿈(`\n`)으로 구분
7. **detail_ref**: 상세 마크다운 파일 경로 (`details/nodes/` 또는 `details/edges/` 하위)
