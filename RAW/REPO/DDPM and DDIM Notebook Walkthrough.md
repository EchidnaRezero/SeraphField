---
title: DDPM·DDIM Notebook Walkthrough
date: 2026-04-02
category: REPO
tags:
  - Notebook
  - DDPM
  - DDIM
  - Diffusion
groups:
  - notebook-walkthroughs
  - diffusion-code-reading
series: notebook-generative-model-walkthroughs
series_title: 생성모형 노트북 독해
series_order: 1
summary: toy dataset notebook이 DDPM과 DDIM의 차이를 어떻게 드러내는지 정리한 구현 독해 노트.
slug: ddpm-and-ddim-notebook-walkthrough
---

# DDPM·DDIM Notebook Walkthrough

Target repository: `Diffusion-2025-Assignment1-DDPM-DDIM`

이 노트북의 장점은 diffusion 문제를 image-scale 소프트웨어 공학 대신 수학적 핵심만 남긴 toy setting으로 드러낸다는 점이다.

## 무엇을 구현하는가

핵심 구현 대상은 다음과 같다.

- noising relation \(x_t=\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\epsilon\)
- noisy sample로부터 denoiser를 학습하는 과정
- DDPM식 stochastic reverse path
- DDIM식 deterministic reverse path

## 왜 이 노트북이 중요한가

Toy dataset 위에서는 DDPM과 DDIM의 차이가 "이미지가 더 좋다/나쁘다"가 아니라 경로의 차이로 보인다. 따라서 학습된 denoiser와 reverse trajectory가 서로 다른 객체라는 점을 시각적으로 이해하기 좋다.

## 코드 골격으로 보면 차이는 어디에 있는가

forward noising과 reverse update를 분리해서 보면 구조가 잘 보인다.

```python
# forward corruption
eps = torch.randn_like(x0)
xt = sqrt(alpha_bar_t) * x0 + sqrt(1 - alpha_bar_t) * eps

# reverse sampling
for t in reversed(range(T)):
    eps_hat = model(xt, t)

    if sampler == "ddpm":
        xt = ddpm_reverse_step(xt, eps_hat, t, add_noise=True)
    elif sampler == "ddim":
        xt = ddim_reverse_step(xt, eps_hat, t, add_noise=False)
```

즉 같은 denoiser를 두고도 reverse path를 stochastic하게 둘지, deterministic하게 둘지가 DDPM과 DDIM의 핵심 차이다.

## 읽는 방법

이 노트북은 다음 질문으로 읽는 것이 좋다.

1. 어느 셀이 forward corruption law를 정의하는가
2. 어느 셀이 같은 denoiser를 두고 reverse update만 바꾸는가

이것이 곧 [[Denoising Diffusion Probabilistic Models]]와 [[Denoising Diffusion Implicit Models]]의 구현판 대응이다.

## 관련 문서

- [[Denoising Diffusion Probabilistic Models]]
- [[Denoising Diffusion Implicit Models]]
- [[Variational Objectives and Noise Prediction]]
