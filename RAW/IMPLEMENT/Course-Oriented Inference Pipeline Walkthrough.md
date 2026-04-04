---
title: 강의 흐름으로 보는 Inference Pipeline
date: 2026-03-26
category: IMPLEMENT
tags:
  - Inference
  - Sampling
  - Conditioning
  - Scheduler
groups:
  - inference-pipeline
  - sampling-implementation
  - conditioning-implementation
summary: diffusion과 flow 개념들이 현대적인 latent 샘플링 루프의 어느 단계에 놓이는지 구현 관점에서 정리한 note.
slug: course-oriented-inference-pipeline-walkthrough
---

# 강의 흐름으로 보는 Inference Pipeline

이 문서는 실험 보고서가 아니라, diffusion과 flow의 주요 개념이 실제 샘플링 루프의 어디에 놓이는지 구현 관점에서 정리한 노트다.

## 기본 골격

```python
latents = prepare_latents(shape, seed)
cond = encode_condition(prompt, extra_condition=None)

for step in scheduler.timesteps:
    model_output = model(latents, step, cond)
    latents = scheduler.step(model_output, latents, step)

image = vae.decode(latents)
```

## 각 줄의 수학적 의미

### `prepare_latents`

이 단계는 출발 상태를 정한다. DDPM, DDIM 문맥에서는 가우시안 노이즈가 출발점이고, flow 문맥에서는 prior 분포에서 data 분포로 운반될 원천 상태가 출발점이다.

### `encode_condition`

이 단계에서 조건 \(c\)가 만들어진다. 프롬프트, depth, edge, pose 같은 정보가 모두 여기에 들어간다. 수학적으로 보면 이후의 reverse field나 velocity field가 \(c\)에 의존하게 된다.

### `model(latents, step, cond)`

이 줄은 학습된 장(field)을 평가하는 부분이다. 모델 출력은 설정에 따라 다음 중 하나로 해석될 수 있다.

- 예측 노이즈
- denoised 추정치
- score와 관련된 양
- velocity field

따라서 이 한 줄은 [[Variational Objectives and Noise Prediction]], [[Score Functions, Reverse-Time Dynamics, and Probability Flow ODE]], [[Vector Fields, Continuity Equation, and Rectification]]와 모두 연결된다.

### `scheduler.step(...)`

이 줄은 수치적분기다. 모델이 준 출력을 다음 latent 상태로 바꾸는 역할을 한다. DDIM, DPM-Solver, multistep sampler의 차이는 대부분 여기에 있다.

### `vae.decode`

이 줄은 latent diffusion의 분해 지점을 드러낸다. generative dynamics는 latent space에서 일어나고, 마지막에만 decoder를 통해 이미지 공간으로 돌아온다.

## 왜 이 노트가 필요한가

강의 주제는 개별적으로 배우면 서로 떨어져 보이기 쉽다. 하지만 실제 코드에서는 대개 하나의 루프 안에서 만난다.

- denoising 이론은 `model_output`의 의미를 정한다.
- 연속시간 이론은 trajectory의 해석을 정한다.
- solver 이론은 update rule을 정한다.
- conditioning 이론은 조건 \(c\)에 대한 의존 방식을 정한다.
- latent diffusion은 trajectory가 어떤 공간에서 일어나는지 정한다.

## 관련 문서

- [[Denoising Diffusion Probabilistic Models]]
- [[DPM-Solver]]
- [[ComfyUI SDXL and Anima Sampling Paths]]
