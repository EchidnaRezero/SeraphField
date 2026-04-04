---
title: Flow Matching for Generative Modeling 논문 노트
date: 2026-03-26
category: PAPER
tags:
  - Flow Matching
  - Continuous Normalizing Flow
  - ODE
  - Generative Modeling
groups:
  - flow-papers
  - flow-matching-papers
series: flow-paper-foundations
series_title: 플로우 계열 핵심 논문 읽기
series_order: 1
summary: Flow Matching을 conditional path가 유도하는 target velocity를 직접 회귀하는 논문으로 읽는 노트.
slug: flow-matching-for-generative-modeling
---

# Flow Matching for Generative Modeling 논문 노트

Official paper: [Flow Matching for Generative Modeling](https://arxiv.org/abs/2210.02747)

## 이 논문이 던지는 질문

이 논문이 중요한 이유는, 생성문제를 reverse denoising 대신 transport field 학습 문제로 다시 조직하기 때문이다.

질문은 다음과 같다.

- 꼭 noise variable을 맞춰야만 generative dynamics를 학습할 수 있는가
- source distribution과 target distribution을 잇는 path를 먼저 정하고
- 그 path를 만드는 velocity field를 직접 학습하는 방식은 가능한가

Flow Matching은 여기에 대해 "가능하고, 오히려 더 직접적일 수 있다"고 답한다.

## 핵심 아이디어

논문은 endpoint pair를 잇는 conditional path family를 먼저 정한다. 그 path가 주어지면 각 시점마다 target conditional velocity가 생기고, network는 이 velocity를 직접 회귀한다.

즉 DDPM류에서 학습 대상이 noising scheme에 의해 간접적으로 정해진 noise target이라면, Flow Matching에서는 학습 대상이 transport law 자체다.

이 구조의 수학은 [[Vector Fields, Continuity Equation, and Rectification]]에서 더 자세히 다루고 있다.

## 무엇이 새로웠는가

첫째, path design이 objective 밖의 구현 디테일이 아니라 학습문제 내부로 들어온다.

둘째, score-based diffusion처럼 reverse-time stochastic interpretation에 기대지 않고, 처음부터 deterministic field learning 문제로 쓸 수 있다.

셋째, continuous normalizing flow 계열과 diffusion 계열 사이의 거리를 크게 줄였다. 둘이 사실상 "시간에 따라 분포를 이동시키는 field 학습"이라는 같은 문법 안에서 보이기 시작한다.

## 논문을 읽을 때 중요한 포인트

첫째, 이 논문은 모델이 따라갈 path family를 어떻게 선택하느냐가 매우 중요하다. path를 먼저 정하면 target velocity가 정해지기 때문이다.

둘째, conditional velocity를 unconditional field의 조건부 평균으로 읽는 관점이 중요하다. 이 점 때문에 \(L^2\) regression 구조가 자연스럽게 나온다.

셋째, noise prediction에서 transport field prediction으로 학습 대상이 바뀌면서, trajectory geometry가 처음부터 중심 주제가 된다. 이 점이 Rectified Flow로 이어진다.

## 구현에 남긴 영향

실전 구현에서는 Flow Matching이 다음 관점을 강화했다.

- scheduler가 단순한 noise schedule이 아니라 path parameterization이 된다
- model output이 denoiser가 아니라 velocity field처럼 읽힌다
- sampling은 ODE integration이 된다

Anima, FLUX, flow 계열 모델을 읽을 때 기존 DDPM 문법만으로는 어색했던 부분들이 이 논문 이후 훨씬 잘 정리된다.

## 강점과 한계

강점:

- 학습 대상이 직접적이다.
- continuous-time field learning으로 해석이 깔끔하다.
- geometry와 path design을 핵심 주제로 끌어온다.

한계:

- 좋은 path family 선택이 성능에 직접 영향을 준다.
- theory가 깔끔한 만큼 path design freedom도 커져서 설계 선택이 많다.
- discrete implementation에서는 다시 solver quality가 중요하다.

따라서 Flow Matching은 "diffusion을 대체하는 단일 논문"이라기보다, 생성동역학을 더 직접적인 vector field 학습으로 다시 쓰는 방향 전환으로 읽는 것이 좋다.

## 관련 문서

- [[Vector Fields, Continuity Equation, and Rectification]]
- [[Rectified Flow]]
- [[Flow Matching and Rectified Flow Notebook Walkthrough]]
