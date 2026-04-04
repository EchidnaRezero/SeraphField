---
title: Score-Based Generative Modeling through SDEs 논문 노트
date: 2026-03-26
category: PAPER
tags:
  - Score-Based Model
  - SDE
  - Probability Flow ODE
  - Continuous Time
groups:
  - diffusion-papers
  - score-based-papers
series: diffusion-paper-foundations
series_title: 확산모형 핵심 논문 읽기
series_order: 3
summary: score-based SDE 논문을 discrete diffusion을 연속시간 확률과정으로 통합한 논문으로 읽는 노트.
slug: score-based-generative-modeling-through-sdes
---

# Score-Based Generative Modeling through SDEs 논문 노트

Official paper: [Score-Based Generative Modeling through Stochastic Differential Equations](https://arxiv.org/abs/2011.13456)

## 이 논문이 던지는 질문

이 논문이 중요한 이유는, discrete diffusion chain을 연속시간 확률과정의 언어로 다시 정리하기 때문이다. 질문은 다음과 같다.

- DDPM류의 아이디어를 continuous-time model로 통합할 수 있는가
- reverse diffusion을 SDE로 쓸 수 있는가
- 같은 marginal path를 deterministic ODE로도 재현할 수 있는가

이 세 질문이 한꺼번에 풀리면서, diffusion sampling은 확률과정과 수치해석의 문제로 재배치된다.

## 무엇을 통합했는가

이 논문 이전에도 score-based model, denoising score matching, diffusion 계열 연구는 있었지만, 각각의 언어가 분리되어 있었다. 이 논문은 다음을 하나의 틀로 묶는다.

- forward noising as SDE
- reverse generation as reverse-time SDE
- score estimation as 핵심 학습 대상
- deterministic sampling as probability flow ODE

따라서 이 논문을 읽고 나면, diffusion 연구의 좌표계 자체가 바뀐다. 더 이상 discrete chain만 보는 것이 아니라 law evolution과 continuous-time dynamics를 함께 보게 된다.

## 핵심 주장

forward SDE가 주어졌을 때 one-time marginal \(p_t\)의 score가 알려지면 reverse-time SDE를 쓸 수 있고, 동시에 같은 marginal family를 갖는 deterministic ODE도 구성할 수 있다.

이 구조의 자세한 연산자 계산은 [[Score Functions, Reverse-Time Dynamics, and Probability Flow ODE]]에 정리해 두었다. 이 논문 노트에서는 그 의미만 강조하면 된다.

핵심은 두 가지다.

1. generative model의 중심 객체가 sample path 자체가 아니라 score field가 된다.
2. stochastic sampling과 deterministic sampling이 같은 density path를 공유할 수 있다.

## 논문을 읽을 때 중요한 장면

첫째, continuous-time parameterization은 discrete schedule의 세부 구현을 넘어서 모델 family를 더 넓게 본다. 즉 VP, VE, sub-VP 같은 설계도 같은 언어로 다룰 수 있다.

둘째, reverse-time SDE의 존재는 diffusion sampling을 확률과정의 언어로 정식화한다. 이때 network가 하는 일은 noise를 막연히 "제거"하는 것이 아니라 score를 근사하는 것이다.

셋째, probability flow ODE는 후속 solver 논문의 문을 연다. 이 한 줄 때문에 sampling은 ODE 적분 문제로도 읽힐 수 있고, 그래서 고차 solver와 adaptive step 이야기가 자연스럽게 나온다.

넷째, predictor-corrector 샘플링 같은 알고리즘 구성도 이 논문에서 체계적으로 정리된다. 즉 모델 해석과 샘플러 설계가 같은 연속시간 틀 안에 들어간다.

## 구현과 연구에 남긴 영향

이 논문 이후 diffusion 구현을 볼 때는 거의 자동으로 다음 구분이 생긴다.

- model output이 score와 어떤 좌표변환 관계에 있는가
- 현재 sampler가 SDE path를 따라가는가, ODE path를 따라가는가
- schedule과 solver를 어떤 continuous variable로 parameterize하는가

ComfyUI나 k-diffusion 계열의 sampler를 읽을 때도 이 관점이 없으면 함수 이름만 보이고 구조는 잘 안 보인다. 반대로 이 논문을 읽고 나면 sampler가 어떤 law evolution을 근사하고 있는지 보이기 시작한다.

## 강점과 한계

강점:

- discrete diffusion을 continuous-time theory로 통합했다.
- score, reverse SDE, probability flow ODE를 하나의 틀로 묶었다.
- solver design과의 연결을 열었다.
- 후속 연구가 사용할 공통 언어를 제공했다.

한계:

- 실제 학습은 여전히 score approximation quality에 크게 의존한다.
- 연속시간 이론이 바로 low-step practical sampler를 주는 것은 아니다.
- 구현에서는 다시 discrete solver choice가 중요해진다.

그래서 이 논문은 최종 실전 recipe라기보다, 이후 연구를 조직하는 이론적 중심축으로 읽는 편이 맞다.

## 관련 문서

- [[Score Functions, Reverse-Time Dynamics, and Probability Flow ODE]]
- [[DPM-Solver]]
- [[Parabolic PDE, Conservation Laws, and Why Diffusion Uses Them]]
- [[Flow Matching for Generative Modeling]]
