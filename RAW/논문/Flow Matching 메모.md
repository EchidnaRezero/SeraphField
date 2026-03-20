---
title: Flow Matching 빠른 메모
date: 2026-03-17
category: PAPER
tags:
  - Flow Matching
  - CNF
  - Generative Model
summary: 조건부 확률 경로를 직접 맞추는 Flow Matching 논문의 핵심만 렌더링 테스트용으로 정리한 문서.
slug: flow-matching-note
---

# Flow Matching

Flow Matching은 연속 시간 [[벡터장]]을 직접 학습해 샘플을 운반하는 접근이다. 렌더링 테스트 목적상 핵심 문장과 수식, 태그만 최소로 넣는다.

## 핵심 관찰

학습 목표는 시간 $t$에서의 속도장 $v_\theta(x,t)$가 목표 경로의 벡터장과 가까워지게 하는 것이다.

$$
\mathcal{L}(\theta)
=
\mathbb{E}_{t,x_0,x_1}\left[\left\|v_\theta(x_t,t)-u_t(x_t \mid x_0,x_1)\right\|^2\right]
$$

여기서 $u_t$는 선택한 확률 경로가 유도하는 타깃 벡터장이다. 이때 조건부 경로 해석은 [[조건부 확률]] 관점으로 읽을 수 있다.

## 메모

- score matching처럼 노이즈 복원에만 묶이지 않는다.
- ODE 기반 생성 모델과 자연스럽게 연결된다.
- Rectified Flow와 비교할 때 경로 설계 자유도가 크다.
- 비교용 문서: [[Rectified Flow 메모]]
- 아카이브 링크: [arXiv:2210.02747](https://arxiv.org/abs/2210.02747)
