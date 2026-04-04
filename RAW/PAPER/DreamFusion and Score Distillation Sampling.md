---
title: DreamFusion and Score Distillation Sampling 논문 노트
date: 2026-03-26
category: PAPER
tags:
  - DreamFusion
  - Score Distillation Sampling
  - Text-to-3D
  - Distillation
groups:
  - diffusion-papers
  - distillation-papers
  - 3d-generation-papers
series: diffusion-paper-foundations
series_title: 확산모형 핵심 논문 읽기
series_order: 8
summary: DreamFusion을 pretrained diffusion prior를 3D optimization 문제의 teacher signal로 쓰는 논문으로 읽는 노트.
slug: dreamfusion-and-score-distillation-sampling
---

# DreamFusion and Score Distillation Sampling 논문 노트

Official paper: [DreamFusion: Text-to-3D using 2D Diffusion](https://arxiv.org/abs/2209.14988)

## 이 논문이 던지는 질문

이 논문이 중요한 이유는 diffusion model의 역할 자체를 바꾸기 때문이다. 여기서 diffusion model은 최종 이미지를 직접 샘플링하는 기계가 아니라, 다른 표현공간을 지도하는 prior로 쓰인다.

질문은 다음과 같다.

- 직접 3D generative model을 학습하지 않고
- pretrained 2D text-to-image diffusion model만으로
- text-aligned 3D representation을 만들 수 있는가

DreamFusion은 이 질문에 "가능하다. 다만 diffusion을 샘플러가 아니라 teacher gradient로 써야 한다"고 답한다.

## 핵심 아이디어

3D representation의 파라미터를 \(\phi\), renderer를 \(R_\phi\)라 하자. 그러면 각 view에서 렌더링된 2D image는 diffusion prior가 이해할 수 있는 객체가 된다.

논문은 이 2D image에 대해 diffusion model이 주는 score-like signal을 이용하고, 그 gradient를 renderer를 통해 다시 \(\phi\)로 역전파한다. 즉 2D prior가 3D parameter optimization을 간접적으로 이끈다.

이때 중심에 있는 개념이 SDS다. 자세한 score/guidance 수학은 [[Guidance as Conditional Score Manipulation]] 쪽을 보는 편이 낫고, 여기서는 논문 구조만 잡으면 충분하다.

## 무엇이 새로웠는가

첫째, diffusion model을 direct generator가 아니라 optimization prior로 재해석했다.

둘째, 2D pretrained model의 지식을 3D representation으로 옮기는 practical route를 열었다.

셋째, 텍스트-이미지 diffusion의 영향권을 image synthesis 바깥으로 넓혔다.

즉 DreamFusion은 diffusion을 "무엇을 샘플링하나"의 문제에서 "어떤 공간을 지도하나"의 문제로 이동시킨다.

## 논문을 읽을 때 중요한 포인트

첫째, 이 논문에서 diffusion model은 최종 출력을 직접 생성하지 않는다. 최적화 방향을 제공하는 teacher다.

둘째, renderer가 핵심 중간층이다. 3D representation 자체는 diffusion model의 native input이 아니므로, 2D image로 렌더링한 뒤 그 공간에서 prior를 적용해야 한다.

셋째, guidance와 score 해석을 모르면 SDS를 제대로 읽기 어렵다. 따라서 이 논문은 앞선 guidance 문헌들을 재활용하는 응용 논문으로 보는 편이 맞다.

넷째, 이 구조는 강력하지만 불안정성도 함께 가져온다. diffusion prior는 원래 3D-consistent teacher가 아니기 때문이다.

## 구현에 남긴 영향

DreamFusion 이후 실전 파이프라인에서 자주 보이는 구조는 다음과 같다.

- parameterized 3D representation
- differentiable renderer
- pretrained diffusion prior
- SDS-like optimization loop

즉 샘플링 루프 대신 optimization 루프가 중심이 된다.

## 강점과 한계

강점:

- 3D diffusion model이 없어도 strong 2D prior를 활용할 수 있다.
- pretrained model 재사용성이 높다.
- diffusion의 활용 범위를 크게 넓혔다.

한계:

- multi-view consistency가 원천적으로 완벽하지 않다.
- optimization instability와 artifact가 발생하기 쉽다.
- SDS gradient가 실제 likelihood gradient와 정확히 같다고 보기는 어렵다.

그래서 DreamFusion은 완성된 최종 해법이라기보다, diffusion prior transfer의 강력한 proof of concept으로 보는 편이 좋다.

## 관련 문서

- [[Classifier-Free Diffusion Guidance]]
- [[Guidance as Conditional Score Manipulation]]
- [[Course-Oriented Inference Pipeline Walkthrough]]
