---
title: sd-scripts FLUX 학습 파이프라인 메모
date: 2026-03-15
category: REPO
tags:
  - sd-scripts
  - FLUX
  - Training
summary: 테스트 폴더의 sd-scripts 레퍼런스를 바탕으로 학습 진입점 구조만 아주 짧게 정리한 샘플 문서.
slug: sd-scripts-flux-note
tracked_versions:
  - sd-scripts
---

# sd-scripts FLUX 메모

`sd-scripts`는 학습 스크립트가 비교적 잘게 분리되어 있어서, 데이터셋 준비와 모델 래퍼 흐름을 보기 좋다. 이 문서는 이론 쪽의 [[벡터장]] 문서를 전제로 읽는 정도로만 연결해 둔다.

## 눈에 띄는 지점

- `library/flux_models.py`
- `library/flux_train_utils.py`
- `tests/test_flux_train*.py`

## 메모

학습 진입점은 대체로 설정 파싱, 모델 로드, 데이터셋 구성, optimizer/scheduler 초기화 순으로 흘러간다.

```python
model = load_flux_backbone(config)
dataset = build_dataset(config)
trainer = FluxTrainer(model=model, dataset=dataset, config=config)
trainer.train()
```

렌더링 목적상 코드 폰트와 코드 블록 테두리가 제대로 보이는지만 확인하면 된다.
