---
title: DPM-Solver 논문 노트
date: 2026-03-26
category: PAPER
tags:
  - DPM-Solver
  - ODE Solver
  - Fast Sampling
  - Diffusion
groups:
  - diffusion-papers
  - diffusion-sampling-papers
  - solver-papers
series: diffusion-paper-foundations
series_title: 확산모형 핵심 논문 읽기
series_order: 4
summary: DPM-Solver를 probability flow ODE에 특화된 고차 적분기 설계 논문으로 읽는 노트.
slug: dpm-solver
---

# DPM-Solver 논문 노트

Official paper: [DPM-Solver: A Fast ODE Solver for Diffusion Probabilistic Model Sampling in Around 10 Steps](https://arxiv.org/abs/2206.00927)

## 이 논문이 던지는 질문

이 논문이 중요한 이유는, diffusion sampling을 노골적으로 수치해석 문제로 다시 쓰기 때문이다.

논문의 질문은 다음과 같다.

- probability flow ODE 관점이 맞다면
- generic low-order step rule 대신
- diffusion dynamics의 구조를 반영한 solver를 설계해서
- very low step regime에서도 정확도를 높일 수 있는가

즉 이 논문은 "빠른 sampler 하나"를 제안하는 논문이 아니라, diffusion inference를 solver design 문제로 재분류하는 논문이다.

## 출발점

DPM-Solver의 출발점은 score-SDE 논문이 남긴 probability flow ODE 해석이다. 이 ODE의 구조와 연산자 관점은 [[Score Functions, Reverse-Time Dynamics, and Probability Flow ODE]]에 정리해 두었다.

이 논문이 실제로 하는 일은 그 ODE를 그대로 Euler나 Heun으로 적분하는 대신, diffusion 특유의 반선형 구조를 이용해 더 좋은 근사를 만드는 것이다.

## 핵심 아이디어

논문은 시간좌표를 재매개화하고, 방정식을 semilinear form으로 정리한 뒤

- 선형 부분은 가능한 한 해석적으로 처리하고
- 비선형 부분만 고차 근사

한다.

수치해석 언어로 말하면 diffusion ODE에 맞춘 exponential-integrator 계열로 읽을 수 있다. 이 점이 generic Runge-Kutta와 다른 핵심이다.

## 논문을 읽을 때 볼 포인트

첫째, 이 논문은 model architecture를 바꾸지 않는다. 학습된 denoiser는 그대로 두고, inference rule만 바꾼다.

둘째, "좌표계 선택"이 중요하다. 그냥 \(t\)를 쓰는 대신 log-SNR 계열 좌표에서 식을 다시 쓰는 이유가 solver stability와 approximation quality에 직접 연결된다.

셋째, order 개념이 전면으로 등장한다. 1차, 2차, 3차 solver를 구분하고, local truncation error를 줄이는 것이 샘플 품질에 직접 영향을 준다.

넷째, DDIM과의 관계를 보는 것이 중요하다. 구현 관점에서 보면 1차 DPM-Solver는 DDIM을 수치해석 hierarchy 안에 다시 놓는 효과가 있다. 즉 DDIM이 더 이상 별개의 trick이 아니라 ODE solver family의 첫 단계처럼 보인다.

## 구현에 남긴 영향

실전 프레임워크에서 DPM-Solver 계열이 강한 이유는 다음과 같다.

- 적은 step 수에서 품질 저하를 덜 만든다
- ODE 기반 sampler abstraction과 잘 맞는다
- scheduler와 model output 해석을 수치적분 계층과 연결해 준다

ComfyUI, k-diffusion, diffusers 계열에서 DPM-Solver나 DPM++ 계열이 계속 등장하는 이유도 여기에 있다.

## 강점과 한계

강점:

- low-step regime를 실질적으로 개선했다.
- solver order와 reparameterization의 중요성을 diffusion 문맥에서 분명히 했다.
- sampling을 수치해석 이론과 직접 연결했다.

한계:

- 여전히 model error가 크면 solver만 좋아져도 한계가 있다.
- 실제 구현에서는 sigma schedule, model output parameterization, guidance 같은 다른 요인과 얽힌다.
- generic theorem보다 diffusion-specific assumptions에 의존하는 부분이 있다.

그래서 DPM-Solver는 "모든 걸 해결한 논문"이 아니라, diffusion sampling을 solver-centric하게 보는 관점을 확립한 논문으로 읽는 편이 더 정확하다.

## 관련 문서

- [[Score Functions, Reverse-Time Dynamics, and Probability Flow ODE]]
- [[Denoising Diffusion Implicit Models]]
- [[DPM-Solver Notebook Walkthrough]]
