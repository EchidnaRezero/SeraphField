---
title: Anima 추론 파이프라인 스케치
date: 2026-03-14
category: IMPLEMENT
tags:
  - Anima
  - Cosmos
  - Inference
summary: Anima 계열 모델을 가정한 추론 파이프라인 메모. 운영 전 코드 블록과 리스트 렌더링 테스트용 샘플 문서.
slug: anima-inference-note
---

# Anima 추론 메모

Anima를 Cosmos Predict2 계열 위에서 동작하는 실험 모델이라고 가정하고, 최소한의 추론 흐름만 스케치한다. 샘플 이동 관점은 [[벡터장]], 관련 논문 쪽 비교는 [[Rectified Flow 메모]]와 연결한다.

## 가정

- 비디오 또는 시퀀스 단위 latent를 입력으로 받는다.
- conditioning은 text, motion hint, camera token 정도로 단순화한다.
- 실제 운영 전에는 tokenizer와 scheduler 구성이 더 복잡해질 수 있다.

## 추론 스케치

```python
latents = prepare_latents(batch, device=device)
cond = encode_condition(prompt, motion_hint)

for step in scheduler.timesteps:
    pred = model(latents, step, cond)
    latents = scheduler.step(pred, latents, step)

frames = decode_latents(latents)
```

## 확인 포인트

- scheduler 교체 시 결과 흔들림
- condition dropout 유무
- long sequence에서 메모리 사용량
