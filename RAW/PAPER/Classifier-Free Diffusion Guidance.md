---
title: Classifier-Free Diffusion Guidance 논문 노트
date: 2026-03-26
category: PAPER
tags:
  - Guidance
  - Classifier-Free Guidance
  - Conditional Generation
  - Text-to-Image
groups:
  - diffusion-papers
  - conditioning-papers
series: diffusion-paper-foundations
series_title: 확산모형 핵심 논문 읽기
series_order: 6
summary: classifier-free guidance를 conditional control을 inference-time field 조작으로 바꾸는 논문으로 읽는 노트.
slug: classifier-free-diffusion-guidance
---

# Classifier-Free Diffusion Guidance 논문 노트

Official paper: [Classifier-Free Diffusion Guidance](https://arxiv.org/abs/2207.12598)

## 이 논문이 던지는 질문

이 논문이 중요한 이유는, 텍스트 조건을 더 강하게 반영하는 방법을 별도 classifier 없이 구현하는 실전 표준을 만들었기 때문이다.

질문은 간단하다.

- conditional generation을 더 강하게 제어하고 싶은데
- classifier guidance처럼 외부 classifier를 따로 두지 않고
- diffusion model 내부 정보만으로 같은 효과를 낼 수 있는가

이 질문에 대한 답이 classifier-free guidance다.

## 핵심 아이디어

논문은 학습 시에 일부 조건을 drop해서

- unconditional prediction
- conditional prediction

을 하나의 모델이 모두 학습하게 만든다. 그리고 추론 시점에 두 출력을 선형결합해 guided field를 만든다.

이때 중요한 것은 이것이 단순한 heuristic blending이 아니라, reverse field 자체를 수정하는 연산이라는 점이다. 수학 구조는 [[Guidance as Conditional Score Manipulation]]에 자세히 정리해 두었다.

## 논문을 읽을 때 중요한 포인트

첫째, classifier-free guidance는 training architecture를 크게 바꾸지 않으면서 inference-time control을 강화한다. 그래서 실제 시스템에 넣기 쉽다.

둘째, guidance scale \(w\)는 단순 강도 조절 슬라이더가 아니다. \(w\)가 커질수록 conditional direction 쪽으로 field를 extrapolate하므로, prompt fidelity는 올라가지만 path distortion도 커질 수 있다.

셋째, 이 논문이 실전적으로 큰 영향력을 가진 이유는 "구현이 단순한데 효과가 크다"는 점이다. 이후 거의 모든 텍스트-이미지 diffusion 시스템이 CFG를 기본 장치처럼 사용한다.

넷째, 이 논문은 guidance를 후처리 filter가 아니라 reverse dynamics 수정으로 읽게 만든다. 이 관점은 ControlNet, SDS, image editing 계열을 읽을 때도 그대로 이어진다.

## 구현 관점에서 남긴 영향

실전 코드에서는 보통 다음 패턴으로 나타난다.

- conditional batch와 unconditional batch를 함께 평가
- 두 출력을 CFG scale로 결합
- scheduler step에 guided output을 전달

겉보기에는 linear interpolation 한 줄이지만, 실제로는 그 한 줄이 전체 reverse trajectory를 바꾼다.

## 강점과 한계

강점:

- 외부 classifier가 필요 없다.
- 구현이 단순하다.
- conditional fidelity가 크게 좋아진다.
- 현대 text-to-image 파이프라인의 기본 제어 수단이 되었다.

한계:

- 큰 guidance scale에서 artifact와 oversaturation이 생길 수 있다.
- diversity가 줄어든다.
- 본질적으로 learned field 밖으로 extrapolation하는 것이므로 이론적으로 안정적이라고만 볼 수는 없다.

따라서 CFG는 강력하지만, "조건을 더 세게 먹이는 것" 이상의 의미를 갖는 trajectory manipulation으로 보는 편이 맞다.

## 관련 문서

- [[Guidance as Conditional Score Manipulation]]
- [[ControlNet]]
- [[CFG, ControlNet, and LoRA Demo Walkthrough]]
