---
title: CFG·ControlNet·LoRA Demo Walkthrough
date: 2026-04-02
category: REPO
tags:
  - Demo
  - CFG
  - ControlNet
  - LoRA
  - Conditional Generation
groups:
  - conditioning-demo-repos
  - diffusion-code-reading
summary: demo repository가 conditional generation 이론을 실제 inference control로 어떻게 바꾸는지 정리한 구현 독해 노트.
slug: cfg-controlnet-and-lora-demo-walkthrough
---

# CFG·ControlNet·LoRA Demo Walkthrough

Target repository: `Diffusion-2025-Demo`

이 저장소는 conditional generation 이론을 사용자가 직접 만질 수 있는 inference control로 바꾸는 데모다. 중요한 점은 notebook이 라이브러리를 쓴다는 사실보다, 세 가지 서로 다른 개입 방식이 한 번에 드러난다는 점이다.

## 세 가지 제어 방식

이 저장소의 핵심 주제는 다음 셋이다.

- classifier-free guidance: reverse field의 affine 조작
- ControlNet: 구조 조건을 추가한 conditional operator
- LoRA: 파라미터 공간에서의 저랭크 수정

즉 세 방법은 각각

- 추론 시점 field 조작
- 조건공간 확장
- 파라미터 적응

에 해당한다.

## 왜 중요한가

이 데모는 같은 diffusion 계열이라도 "어디를 건드리느냐"가 다르면 수학적 의미도 달라진다는 점을 보여 준다. 논문 노트에서 분리해서 읽은 개념이 실제 notebook에서는 각기 다른 조작점으로 등장한다.

## 대표 제어 골격

세 방법은 코드에서 개입 위치가 다르다.

```python
# CFG: 모델 출력 결합
eps_uncond = model(latents, t, null_cond)
eps_cond = model(latents, t, text_cond)
eps_guided = eps_uncond + scale * (eps_cond - eps_uncond)

# ControlNet: 구조 조건을 추가 입력으로 넣음
eps = model(latents, t, text_cond, control_hint=edge_map)

# LoRA: 사전학습 가중치 위에 저랭크 수정치를 더함
weight = base_weight + lora_up @ lora_down * alpha
```

즉 CFG는 field 조작, ControlNet은 조건 경로 확장, LoRA는 파라미터 수정이라는 식으로 구분해서 보면 정리가 빠르다.

## 읽는 방법

코드를 볼 때는 다음을 확인하면 좋다.

- guidance는 모델 호출 전후 어느 지점에서 들어가는가
- ControlNet은 조건 입력을 어떤 경로로 추가하는가
- LoRA는 weight 수정으로 어떤 모듈에 작용하는가

## 관련 문서

- [[Classifier-Free Diffusion Guidance]]
- [[ControlNet]]
- [[Latent Variables, Autoencoders, and Conditioning]]
