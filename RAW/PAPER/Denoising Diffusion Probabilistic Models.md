---
title: Denoising Diffusion Probabilistic Models 논문 노트
date: 2026-03-26
category: PAPER
tags:
  - DDPM
  - Diffusion
  - Variational Inference
  - Generative Modeling
groups:
  - diffusion-papers
  - diffusion-foundations
series: diffusion-paper-foundations
series_title: 확산모형 핵심 논문 읽기
series_order: 1
summary: DDPM를 discrete-time latent-variable model로 읽으면서 forward chain, reverse posterior approximation, noise prediction training의 구조를 정리한 논문 노트.
slug: denoising-diffusion-probabilistic-models
---

# Denoising Diffusion Probabilistic Models 논문 노트

Official paper: [Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2006.11239)

## 이 논문이 던지는 질문

이 논문이 중요한 이유는, 현대 diffusion 모델의 표준 문법이 여기서 거의 완성되기 때문이다. 논문의 질문은 단순히 "노이즈를 넣었다가 빼면 이미지가 나오나?"가 아니다.

더 정확한 질문은 다음과 같다.

- 데이터에 대해 고정된 noising chain을 먼저 만들고
- 그 chain이 유도하는 reverse posterior를 neural network로 근사하는 방식으로
- tractable한 generative model을 세울 수 있는가

즉 DDPM은 heuristic denoising 절차가 아니라, 고정된 forward process와 학습되는 reverse process를 갖는 latent-variable model로 읽어야 한다.

## 문제 설정

데이터 \(x_0\sim q_{\mathrm{data}}\)에 대해 forward chain

$$
q(x_{1:T}\mid x_0)=\prod_{t=1}^T q(x_t\mid x_{t-1})
$$

를 두고, 각 전이를 작은 Gaussian perturbation으로 잡는다. 이 설계의 핵심은 두 가지다.

1. 충분히 긴 시간이 지나면 \(x_T\)가 거의 isotropic Gaussian이 된다.
2. 각 시점의 posterior \(q(x_{t-1}\mid x_t,x_0)\)는 Gaussian 계산으로 닫힌형을 갖는다.

이 덕분에 학습 문제는 "복잡한 reverse 분포 전체"가 아니라 "각 시점의 Gaussian reverse kernel"을 맞추는 문제로 바뀐다.

논문이 실제로 세우는 reverse model은

$$
p_\theta(x_{0:T})=p(x_T)\prod_{t=1}^T p_\theta(x_{t-1}\mid x_t)
$$

형태다. 따라서 모델의 핵심 책임은 각 step에서 다음 denoising move를 잘 예측하는 것이다.

## 이 논문이 실제로 해낸 것

가장 중요한 공헌은 다음 세 층을 한 번에 연결한 점이다.

1. 고정된 forward Markov chain
2. ELBO 기반의 probabilistic training objective
3. 실전에서는 noise prediction MSE처럼 보이는 단순한 학습식

즉 "실전에서는 \(\epsilon\)-prediction MSE만 쓴다"는 사실이 확률모형 바깥의 요령이 아니라, Gaussian 구조가 있는 variational inference의 결과라는 점을 보여 준다.

여기서 수학 유도 자체는 [[Variational Objectives and Noise Prediction]]에 정리해 두었다. 이 문서에서는 논문 독해에 필요한 포인트만 남기면 충분하다.

## 논문을 읽을 때 핵심 포인트

첫째, forward chain은 학습 대상이 아니다. \(\beta_t\) schedule과 Gaussian noising rule은 미리 정해진다. 즉 모델이 배우는 것은 noising rule이 아니라 reverse approximation이다.

둘째, 각 step의 posterior가 Gaussian이기 때문에 reverse kernel도 Gaussian family 안에서 parameterize하는 것이 자연스럽다. 이 선택 덕분에 문제는 mean prediction으로 축약된다.

셋째, \(x_t\)를 직접 샘플링할 때

$$
x_t=\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\epsilon
$$

같은 closed form을 사용하므로, 학습에서 전체 forward chain을 매번 다 굴릴 필요가 없다. 이것이 DDPM이 계산 가능해지는 실질적 이유 중 하나다.

넷째, 논문은 discrete-time chain을 다루지만, 이후 연구가 거의 모두 이 논문에서 만들어 둔 구조를 바탕으로 출발한다. DDIM은 reverse trajectory를 바꾸고, score-SDE는 이를 연속시간으로 재해석하며, DPM-Solver는 sampling을 ODE 적분 문제로 읽는다.

## 구현 관점에서 남긴 것

오늘날 diffusion 코드에서 거의 기본처럼 보이는 것들 상당수가 여기서 온다.

- timestep embedding을 넣은 denoiser
- \(\epsilon\)-prediction training
- schedule에 따른 noisy sample 직접 생성
- reverse loop를 따라가는 iterative sampling

ComfyUI, diffusers, sd-scripts 계열을 읽어도 결국 "현재 step의 latent와 time을 넣고, model output을 scheduler가 다음 latent로 바꾼다"는 구조가 반복된다. 이 구조의 원형이 DDPM이다.

## 이 논문의 강점과 한계

강점은 명확하다.

- 확률모형으로 해석 가능한 형태를 제시했다.
- 학습 objective가 tractable하다.
- generative quality가 매우 높다.
- 이후 거의 모든 diffusion 연구의 공통 출발점을 만들었다.

한계도 분명하다.

- sampling step 수가 크다.
- discrete-time chain이라 solver 관점이 직접 드러나지 않는다.
- inference path와 training objective의 분리가 아직 약하다.

이 한계 때문에 DDIM, score-SDE, DPM-Solver 같은 후속 논문이 자연스럽게 이어진다.

## 이 논문 이후에 보게 되는 질문

DDPM을 읽고 나면 다음 질문들이 자동으로 생긴다.

- reverse chain은 정말 이 형태여야만 하는가
- 같은 학습된 denoiser로 더 빠른 path를 만들 수 있는가
- continuous-time으로 옮기면 더 좋은 수치해석적 해석이 나오는가
- 학습 대상을 noise 대신 field로 직접 바꾸면 어떤 이점이 있는가

이 질문들의 계보가 이후 diffusion literature의 큰 흐름을 만든다.

## 관련 문서

- [[Variational Objectives and Noise Prediction]]
- [[Denoising Diffusion Implicit Models]]
- [[Score-Based Generative Modeling through SDEs]]
- [[DDPM and DDIM Notebook Walkthrough]]
