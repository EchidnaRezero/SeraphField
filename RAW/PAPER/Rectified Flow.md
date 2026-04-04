---
title: Rectified Flow 논문 노트
date: 2026-03-26
category: PAPER
tags:
  - Rectified Flow
  - Transport
  - Flow
  - Sampling
groups:
  - flow-papers
  - flow-matching-papers
series: flow-paper-foundations
series_title: 플로우 계열 핵심 논문 읽기
series_order: 2
summary: Rectified Flow를 endpoint correctness보다 trajectory geometry를 전면에 세우는 논문으로 읽는 노트.
slug: rectified-flow
---

# Rectified Flow 논문 노트

Official paper: [Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow](https://arxiv.org/abs/2209.03003)

## 이 논문이 던지는 질문

Rectified Flow가 중요한 이유는, 생성모델의 난이도가 endpoint transport만으로 결정되지 않는다는 점을 분명하게 보여 주기 때문이다.

질문은 다음과 같다.

- source와 target을 제대로 잇는 field라면 충분한가
- 아니면 그 field가 만드는 trajectory의 기하 자체가 샘플링 난이도를 좌우하는가

Rectified Flow는 두 번째가 맞다고 주장한다.

## 핵심 아이디어

논문은 더 곧은 path, 덜 휘는 trajectory를 선호하는 방향으로 transport를 다시 정리한다. 핵심은 다음과 같다.

- 같은 시작점과 끝점을 갖는 transport도 매우 다른 곡선을 만들 수 있다
- 곡선이 많이 휘면 finite-step solver가 따라가기 어렵다
- 더 straight한 path는 적은 step에서도 근사가 잘 된다

즉 path geometry를 학습 목표에 넣는 것이다.

이 구조의 수학적 배경은 [[Vector Fields, Continuity Equation, and Rectification]]에 정리해 두었다.

## 무엇이 새로웠는가

Flow Matching이 "어떤 field를 직접 학습할까"를 묻는 논문이라면, Rectified Flow는 "그 field가 만드는 궤적은 어떤 기하를 가져야 좋은가"를 묻는 논문이다.

이 차이는 중요하다. endpoint correctness만 보면 두 field가 동등할 수 있지만, 실제 sampling cost와 low-step quality는 크게 다를 수 있다.

## 논문을 읽을 때 중요한 포인트

첫째, 이 논문은 transport quality를 endpoint match만으로 평가하지 않는다.

둘째, straightness는 aesthetic property가 아니라 numerical property다. 적분기가 따라가기 쉬운 경로인가가 핵심이다.

셋째, 이 논문을 읽고 나면 "좋은 생성경로"가 무엇인지의 기준이 바뀐다. 단지 최종분포가 맞는가가 아니라, intermediate trajectory가 solver-friendly한가도 중요해진다.

넷째, flow 계열 모델이 low-step에서 강한 이유를 이해할 때 이 논문 관점이 특히 유용하다.

## 구현에 남긴 영향

Rectified Flow 계열의 영향은 다음처럼 나타난다.

- trajectory straightening을 의식한 path 설계
- low-step sampling의 실용성 강화
- field learning과 solver design 사이의 결합 강화

즉 이 논문은 학습 objective와 샘플링 efficiency를 geometry를 통해 묶어 준다.

## 강점과 한계

강점:

- low-step practical benefit를 path geometry와 연결했다.
- field 자체뿐 아니라 path family를 설계 대상으로 끌어왔다.
- flow 계열 모델의 수치적 장점을 이론적으로 설명하는 관점을 제공했다.

한계:

- straightness를 어떻게 정의하고 측정할지는 여전히 설계 선택의 문제다.
- endpoint correctness와 path simplicity 사이의 trade-off가 있다.
- 모든 task에서 가장 straight한 path가 최적인지는 별도 문제다.

그래서 Rectified Flow는 "한 가지 알고리즘"이라기보다, 생성경로 자체를 최적화 대상으로 본다는 선언에 더 가깝다.

## 관련 문서

- [[Flow Matching for Generative Modeling]]
- [[Vector Fields, Continuity Equation, and Rectification]]
- [[Flow Matching and Rectified Flow Notebook Walkthrough]]
