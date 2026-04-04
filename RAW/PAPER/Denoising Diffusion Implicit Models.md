---
title: Denoising Diffusion Implicit Models 논문 노트
date: 2026-03-26
category: PAPER
tags:
  - DDIM
  - Diffusion
  - Implicit Model
  - Sampling
groups:
  - diffusion-papers
  - diffusion-sampling-papers
series: diffusion-paper-foundations
series_title: 확산모형 핵심 논문 읽기
series_order: 2
summary: DDIM를 학습 objective는 유지한 채 reverse trajectory만 재설계하는 논문으로 읽는 노트.
slug: denoising-diffusion-implicit-models
---

# Denoising Diffusion Implicit Models 논문 노트

Official paper: [Denoising Diffusion Implicit Models](https://arxiv.org/abs/2010.02502)

## 이 논문이 던지는 질문

DDIM이 중요한 이유는, diffusion에서 "학습된 denoiser"와 "실제로 샘플링할 때 걷는 경로"가 반드시 같은 객체가 아니라는 점을 처음 분명하게 보여 주기 때문이다.

DDPM을 읽고 나면 자연스럽게 다음 질문이 나온다.

- 학습은 그대로 두고
- sampling 경로만 바꾸어
- 더 적은 stochasticity, 더 적은 step, 더 나은 제어 가능성을 얻을 수 있는가

DDIM은 바로 이 질문에 답하는 논문이다.

## 출발점

이 논문은 DDPM의 training relation을 그대로 사용한다. 즉 \(x_0\), \(x_t\), \(\epsilon\) 사이의 대수적 관계는 유지된다. 중요한 점은 이 관계가 reverse Markov chain을 유일하게 결정하지 않는다는 사실이다.

논문이 보여 주는 것은 다음과 같다.

- 학습된 denoiser가 알려 주는 정보는 그대로 두고
- reverse process family는 더 넓게 선택할 수 있으며
- 그 안에는 deterministic limit도 포함된다

즉 학습 규칙과 sampling path가 완전히 결박돼 있지 않다.

## 무엇이 새로웠는가

DDIM의 핵심 공헌은 "non-Markovian reverse family"를 도입해도 DDPM과 양립하는 학습 구조를 유지할 수 있음을 보인 점이다. 이 말은 실전적으로는 다음 뜻이다.

- denoiser는 그대로 재사용할 수 있다
- sampling noise를 줄이거나 없앨 수 있다
- interpolation, inversion, trajectory control이 더 쉬워진다

특히 deterministic limit는 이후 "sampling을 ODE처럼 이해한다"는 해석으로 이어지기 때문에 중요하다.

## 논문을 읽을 때 봐야 할 포인트

첫째, DDIM은 새로운 training loss를 제안한 논문이 아니다. 실질적 차이는 reverse sampling rule 쪽에 있다.

둘째, deterministic path가 도입되면서 "한 번 학습된 모델"과 "그 모델을 이용하는 수치 경로"가 분리된다. 이 구분이 없으면 DDIM을 단순한 빠른 샘플러 정도로 오해하기 쉽다.

셋째, 이 논문은 아직 solver theory를 전면에 내세우지는 않지만, 이미 sampling을 trajectory design 문제로 바꾸고 있다. DPM-Solver 계열은 바로 이 관점을 더 밀어붙인 결과로 볼 수 있다.

넷째, inversion과 editing 관점에서 DDIM이 자주 언급되는 이유도 여기에 있다. stochasticity가 줄어들수록 한 latent path를 다시 추적하거나 조작하기가 쉬워진다.

## 수학은 어디까지 보면 되는가

DDIM의 깊은 수학은 결국 DDPM의 대수적 관계와 probability flow 관점에 기대고 있다. 따라서 다음 문서를 먼저 보는 편이 좋다.

- [[Variational Objectives and Noise Prediction]]
- [[Score Functions, Reverse-Time Dynamics, and Probability Flow ODE]]

이 논문 노트에서는 한 줄만 기억해도 충분하다. DDIM의 핵심은 "같은 denoiser, 다른 trajectory"다.

## 구현 관점에서 남긴 것

실전 코드에서는 DDIM이 다음 층위에 영향을 남겼다.

- scheduler step rule을 모델과 분리해서 생각하는 습관
- deterministic sampling path의 실용성
- latent inversion/editing 파이프라인의 기초

즉 DDIM은 단순히 더 빠른 샘플러가 아니라, sampler abstraction을 강화한 논문이다.

## 강점과 한계

강점:

- 기존 학습 모델을 재사용한다.
- sampling path 설계를 분리한다.
- deterministic sampling을 제공한다.
- 이후 고속 solver 연구의 발판이 된다.

한계:

- 여전히 discretization error 문제는 남는다.
- 수치해석 이론이 충분히 체계화된 것은 아니다.
- very low step regime에서 최적이라는 보장은 없다.

그래서 DDIM은 끝이 아니라 중간 단계다. 이 논문이 path 재설계의 문을 열고, DPM-Solver가 그 문을 수치해석 쪽으로 더 크게 연다.

## 관련 문서

- [[Denoising Diffusion Probabilistic Models]]
- [[DPM-Solver]]
- [[Score Functions, Reverse-Time Dynamics, and Probability Flow ODE]]
- [[DDPM and DDIM Notebook Walkthrough]]
