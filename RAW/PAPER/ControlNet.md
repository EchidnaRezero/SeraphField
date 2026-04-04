---
title: ControlNet 논문 노트
date: 2026-03-26
category: PAPER
tags:
  - ControlNet
  - Conditional Generation
  - Spatial Control
  - Diffusion
groups:
  - diffusion-papers
  - conditioning-papers
  - control-papers
series: diffusion-paper-foundations
series_title: 확산모형 핵심 논문 읽기
series_order: 7
summary: ControlNet을 pretrained text-to-image prior에 구조 조건 경로를 추가하는 논문으로 읽는 노트.
slug: controlnet
---

# ControlNet 논문 노트

Official paper: [Adding Conditional Control to Text-to-Image Diffusion Models](https://arxiv.org/abs/2302.05543)

## 이 논문이 던지는 질문

ControlNet은 prompt conditioning의 한계를 정면으로 다룬다. 텍스트만으로는 의미를 주기 좋지만, 위치나 형태 같은 구조를 강하게 고정하기는 어렵다.

따라서 논문의 질문은 다음과 같다.

- 이미 강력한 pretrained text-to-image diffusion model이 있는데
- 그 prior를 버리지 않고
- edge, pose, depth 같은 구조 조건을 강하게 반영하게 만들 수 있는가

즉 핵심은 "새 모델을 처음부터 다시 세우는가"가 아니라 "기존 prior를 유지하면서 제어 채널을 추가하는가"다.

## 핵심 아이디어

논문은 구조 조건 전용 branch를 추가하고, pretrained backbone의 의미적 prior는 보존한 채 structural signal만 별도로 주입한다.

이때 중요한 것은 diffusion objective 자체를 새로 설계하는 것이 아니라, conditional operator의 입력을 더 풍부하게 만드는 방식이라는 점이다. 이 구조의 추상적 해석은 [[Latent Variables, Autoencoders, and Conditioning]]과 [[Guidance as Conditional Score Manipulation]]에서 다루고 있다.

## 논문을 읽을 때 중요한 포인트

첫째, ControlNet은 "완전히 다른 생성모형"이라기보다 richer condition space를 가진 text-to-image diffusion model이다.

둘째, pretrained prior를 최대한 보존하는 것이 핵심 설계 원칙이다. 이 점이 practical adoption을 가능하게 했다.

셋째, 구조 조건은 prompt를 대체하는 것이 아니라 prompt에 추가되는 constraint다. 따라서 의미와 구조가 분업된다.

넷째, 이 논문 이후 controllable generation은 단순히 prompt engineering이 아니라, 어떤 structured condition을 operator 안에 넣을 것인가의 문제로 바뀐다.

## 구현 관점에서 남긴 영향

실전 시스템에서는 ControlNet의 영향이 다음처럼 나타난다.

- edge/depth/pose preprocessing 파이프라인
- 구조 조건 전용 feature path
- 기존 text conditioning과 결합된 denoising operator
- 멀티컨트롤 구조

즉 model 호출 전에 구조 신호를 준비하고, sampling loop 안에서는 그것이 conditional operator를 바꾸게 된다.

## 강점과 한계

강점:

- pretrained model을 버리지 않는다.
- 구조 제어가 매우 강하다.
- 다양한 condition modality로 확장 가능하다.

한계:

- condition preprocessing 품질에 민감하다.
- 구조 제약이 지나치면 semantic diversity가 줄 수 있다.
- 추가 경로가 모델 비용과 메모리를 키운다.

그래서 ControlNet의 핵심은 "구조 제어가 된다"보다, "구조 조건을 prior 보존 구조 안에 modular하게 끼워 넣는 설계"에 있다.

## 관련 문서

- [[Latent Variables, Autoencoders, and Conditioning]]
- [[Guidance as Conditional Score Manipulation]]
- [[CFG, ControlNet, and LoRA Demo Walkthrough]]
