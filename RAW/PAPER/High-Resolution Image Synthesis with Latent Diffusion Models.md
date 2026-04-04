---
title: High-Resolution Image Synthesis with Latent Diffusion Models 논문 노트
date: 2026-03-26
category: PAPER
tags:
  - Latent Diffusion
  - Autoencoder
  - Text-to-Image
  - Conditioning
groups:
  - diffusion-papers
  - latent-model-papers
series: diffusion-paper-foundations
series_title: 확산모형 핵심 논문 읽기
series_order: 5
summary: latent diffusion을 representation learning과 latent-space generative dynamics의 분해로 읽는 논문 노트.
slug: high-resolution-image-synthesis-with-latent-diffusion-models
---

# High-Resolution Image Synthesis with Latent Diffusion Models 논문 노트

Official paper: [High-Resolution Image Synthesis with Latent Diffusion Models](https://arxiv.org/abs/2112.10752)

## 이 논문이 던지는 질문

이 논문이 중요한 이유는, diffusion을 "어떻게 학습할까"보다 "어느 공간에서 학습할까"라는 질문으로 옮기기 때문이다.

논문의 중심 질문은 다음이다.

- 픽셀 공간 diffusion의 계산비용이 너무 크다면
- image space 자체가 아니라 더 작은 latent space 위에서
- 생성동역학을 학습할 수 있는가

즉 이 논문은 샘플링 규칙 이전에 상태공간 선택 자체를 바꾼다.

## 기본 구조

논문은 모델을 두 층으로 분해한다.

1. representation layer:
   encoder \(E\)와 decoder \(D\)를 학습해 이미지 공간과 latent space 사이를 연결
2. generative layer:
   latent \(z=E(x)\) 위에서 diffusion model을 학습

이 분해의 효과는 명확하다. 고차원 픽셀 공간에서 매 step 전체를 다루는 대신, 더 압축된 의미공간에서 diffusion dynamics를 수행한다.

이 구조의 측도론적 해석은 [[Latent Variables, Autoencoders, and Conditioning]]에 정리해 두었다.

## 이 논문이 실제로 바꾼 것

첫째, 고해상도 image synthesis의 계산 가능성을 실질적으로 끌어올렸다. 이는 단순한 speed-up이 아니라 "현실적인 텍스트-이미지 diffusion 시스템의 기본 아키텍처"를 만든 변화였다.

둘째, latent space가 단순 압축공간이 아니라 generative dynamics가 일어나는 주된 state space가 되었다. 이후 Stable Diffusion 계열이 거의 모두 이 선택을 따르게 된다.

셋째, conditioning 구조로 cross-attention을 표준화했다. prompt conditioning이 latent dynamics를 바꾸는 연산이라는 관점이 실전 시스템 차원에서 정착한 것도 이 논문의 영향이 크다.

## 논문을 읽을 때 핵심 포인트

첫째, 이 논문은 autoencoder와 diffusion을 그냥 이어 붙인 것이 아니다. representation learning과 generative modeling의 역할 분담을 명확히 나눠 놓는다.

둘째, latent diffusion의 성공 조건은 단순히 차원이 줄어드는 것이 아니다. decoder가 생성에 필요한 의미구조를 충분히 보존해야 한다. 따라서 autoencoder 품질이 곧 생성모형의 상한을 만든다.

셋째, text conditioning은 image space를 직접 조작하는 것이 아니라 latent dynamics 안으로 들어간다. 이 관점이 ControlNet, LoRA, adapter류 구조를 읽을 때 중요하다.

넷째, 논문은 "더 작은 공간에서 diffusion을 하자"라는 주장만 하는 것이 아니라, 그 선택이 실제 이미지 품질과 비용 사이에서 좋은 절충임을 보여 준다.

## 구현에 남긴 영향

오늘날 text-to-image 구현에서 다음 구조가 거의 기본처럼 보이는 이유가 이 논문이다.

- text encoder
- VAE encoder/decoder
- latent UNet 또는 transformer backbone
- cross-attention conditioning
- latent scheduler loop

즉 현대 diffusion 파이프라인을 코드로 읽을 때, 실제 sampling이 latent tensor에서 돌고 마지막 decode만 image space에서 일어나는 구조는 거의 전부 LDM의 영향권에 있다.

## 강점과 한계

강점:

- 계산량과 품질 사이의 실용적 균형을 제시했다.
- latent-space generative modeling의 표준 구조를 만들었다.
- conditioning architecture를 실전 수준에서 정착시켰다.

한계:

- autoencoder bottleneck이 정보 손실을 일으킬 수 있다.
- latent space geometry가 항상 downstream generation에 최적인 것은 아니다.
- VAE 품질이 전체 시스템의 ceiling을 만들 수 있다.

이 한계들은 이후 더 좋은 autoencoder, transformer backbone, rectified flow/consistency 계열 연구와도 연결된다.

## 관련 문서

- [[Latent Variables, Autoencoders, and Conditioning]]
- [[ControlNet]]
- [[CFG, ControlNet, and LoRA Demo Walkthrough]]
