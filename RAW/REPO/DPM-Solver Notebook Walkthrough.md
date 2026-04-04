---
title: DPM-Solver Notebook Walkthrough
date: 2026-04-02
category: REPO
tags:
  - Notebook
  - DPM-Solver
  - ODE Solver
  - Diffusion
groups:
  - notebook-walkthroughs
  - diffusion-code-reading
  - solver-mapping
series: notebook-generative-model-walkthroughs
series_title: 생성모형 노트북 독해
series_order: 2
summary: notebook이 diffusion sampling을 ODE solver 구현 문제로 어떻게 바꾸는지 정리한 구현 독해 노트.
slug: dpm-solver-notebook-walkthrough
---

# DPM-Solver Notebook Walkthrough

Target repository: `Diffusion-2025-Assignment2-DPMSolver`

이 노트북의 핵심은 diffusion 모델 자체를 새로 만드는 것이 아니라, diffusion이 유도하는 ODE를 어떻게 더 잘 적분할 것인가를 구현 문제로 바꾸는 데 있다.

## 무엇을 구현하는가

이 노트북에서 학생이 실제로 마주하는 구현 대상은 다음과 같다.

- DDIM과 1차 DPM-Solver의 대응
- time reparameterization
- higher-order update rule
- finite-step sampling의 정확도 비교

즉 이 노트북은 generative model 노트북이면서 동시에 수치해석 노트북이기도 하다.

## 왜 이 노트북이 중요한가

이 과제는 sampling을 "그냥 정해진 반복문"이 아니라 ODE approximation으로 보게 만든다. 이 관점이 생기면 이후 sampler 비교가 감각이 아니라 order, step, coordinate의 문제로 보이기 시작한다.

## 코드 골격으로 보면 무엇을 바꾸는가

실제 notebook에서는 보통 아래처럼 "같은 모델 출력"을 두고 update 식만 바꾼다.

```python
# 설명용 축약 스케치
for i, sigma in enumerate(sigmas[:-1]):
    eps = model(x, sigma)

    if solver == "ddim":
        x = ddim_update(x, eps, sigmas[i], sigmas[i + 1])
    elif solver == "dpm1":
        x = dpm_solver_first_order_update(x, eps, sigmas[i], sigmas[i + 1])
    elif solver == "dpm2":
        x_mid = midpoint_predictor(x, eps, sigmas[i], sigmas[i + 1])
        eps_mid = model(x_mid, sigma_mid)
        x = dpm_solver_second_order_update(x, eps, eps_mid, ...)
```

핵심은 모델을 새로 설계하는 것이 아니라, 같은 denoiser 출력에서 더 나은 적분 공식을 만드는 데 있다.

## 코드에서 꼭 확인할 함수

- `sigma`를 `lambda = -log(sigma)` 같은 좌표로 다시 쓰는 부분
- 1차 update와 2차 update가 갈라지는 부분
- mid-point 또는 higher-order correction을 위해 모델을 한 번 더 평가하는 부분
- step 수를 줄였을 때 오차 비교를 기록하는 부분

## 읽는 방법

다음 항목이 코드에서 어디에 들어 있는지 찾으면서 읽는 것이 좋다.

- 어떤 시간좌표를 쓰는가
- 어떤 항을 analytic하게 처리하는가
- 어떤 부분이 higher-order correction인가
- 결과 비교가 어떤 수치적 의미를 갖는가

## 관련 문서

- [[DPM-Solver]]
- [[Score Functions, Reverse-Time Dynamics, and Probability Flow ODE]]
- [[Course-Oriented Inference Pipeline Walkthrough]]
