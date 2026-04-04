---
title: Flow Matching·Rectified Flow Notebook Walkthrough
date: 2026-04-02
category: REPO
tags:
  - Notebook
  - Flow Matching
  - Rectified Flow
  - Transport
groups:
  - notebook-walkthroughs
  - flow-code-reading
series: notebook-generative-model-walkthroughs
series_title: 생성모형 노트북 독해
series_order: 3
summary: notebook이 vector field, path choice, rectification을 어떻게 직접 구현하게 만드는지 정리한 구현 독해 노트.
slug: flow-matching-and-rectified-flow-notebook-walkthrough
---

# Flow Matching·Rectified Flow Notebook Walkthrough

Target repository: `Diffusion-2025-Assignment3-Flow`

이 노트북은 diffusion 언어에서 transport 언어로 넘어가는 구현 관문이다. 핵심은 "새 objective를 한 번 짜 본다" 정도가 아니라, 실제로 field와 trajectory를 어떤 코드 객체로 다뤄야 하는지 배우는 데 있다.

## 무엇을 구현하는가

README가 강조하듯 과제의 축은 다음과 같다.

- Flow Matching: 노이즈 변수 대신 displacement 또는 velocity field를 예측
- Rectified Flow: trajectory geometry를 더 직선에 가깝게 만드는 관점

따라서 노트북은 다음 질문으로 읽어야 한다.

- path family는 어디서 정의되는가
- target vector field는 어디서 계산되는가
- learned field는 어떤 형태로 parameterize되는가
- sampling trajectory는 어떻게 시각화되는가

## 왜 이 노트북이 중요한가

Flow 계열은 image-scale 코드보다 toy visualization이 훨씬 교육적이다. 실제로 trajectory를 그려 볼 수 있어야, 복잡한 transport와 rectified transport의 차이가 눈에 들어온다.

## 코드 골격으로 보면 무엇을 예측하는가

이 과제의 핵심은 노이즈가 아니라 vector field를 직접 다루는 데 있다.

```python
# 설명용 축약 스케치
t = torch.rand(batch_size, 1)
xt = (1 - t) * x0 + t * x1
target_velocity = x1 - x0

pred_velocity = model(xt, t)
loss = ((pred_velocity - target_velocity) ** 2).mean()

for step in range(num_steps):
    v = model(x, t_grid[step])
    x = x + dt * v
```

Rectified Flow까지 들어가면 같은 endpoint를 두고도 더 곧은 trajectory를 만들기 위해 path family 자체를 바꾸는 쪽으로 읽게 된다.

## 관련 문서

- [[Flow Matching for Generative Modeling]]
- [[Rectified Flow]]
- [[Vector Fields, Continuity Equation, and Rectification]]
