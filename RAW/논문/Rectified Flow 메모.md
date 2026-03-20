---
title: Rectified Flow 빠른 메모
date: 2026-03-16
category: PAPER
tags:
  - Rectified Flow
  - ODE
  - Sampling
summary: 직선 경로를 따르는 Rectified Flow 아이디어를 간단히 테스트하기 위한 샘플 문서.
slug: rectified-flow-note
---

# Rectified Flow

Rectified Flow는 복잡한 경로 대신 비교적 단순한 이동 경로를 두고, 그 위에서 샘플을 빠르게 운반하는 쪽에 초점을 둔다. 속도장 자체는 [[벡터장]] 문맥으로 읽으면 된다.

## 직선 경로

가장 단순한 경우 중간 상태를 아래처럼 둘 수 있다.

$$
x_t = (1-t)x_0 + tx_1
$$

이때 모델은 이 경로를 따라가는 속도장을 학습한다. 브리지 해석은 [[조건부 확률]] 또는 [[Flow Matching 메모|Flow Matching]] 쪽과 함께 보면 비교가 쉽다.

## 메모

- 샘플링 스텝 수를 줄이기 쉬운 편이다.
- 구현 감각은 Flow Matching과 닿아 있지만 경로 해석은 더 직관적이다.
- 후속 실험에서는 sampler 안정성과 guidance 적용성을 같이 봐야 한다.
- 아카이브 링크: [arXiv:2209.03003](https://arxiv.org/abs/2209.03003)
