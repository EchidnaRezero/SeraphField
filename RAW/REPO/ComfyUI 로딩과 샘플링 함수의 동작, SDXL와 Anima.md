---
title: ComfyUI 로딩과 샘플링 함수의 동작, SDXL와 Anima
date: 2026-04-02
category: REPO
tags:
  - ComfyUI
  - Loading
  - Sampling
  - SDXL
  - Anima
groups:
  - comfyui-codebase
  - sampling-pipeline
series: comfyui-code-reading
series_title: ComfyUI 코드 읽기
series_order: 3
summary: SDXL와 Anima를 로딩 단계와 Euler 샘플링 단계로 나눠 읽기 위한 개요 문서.
slug: comfyui-loading-and-sampling-functions-sdxl-and-anima
tracked_versions:
  - comfyui
---

# ComfyUI 로딩과 샘플링 함수의 동작, SDXL와 Anima

이 문서는 로컬 `ComfyUI` 추적 버전 `0.18.2` 기준으로, SDXL와 Anima를 읽을 때 필요한 입구만 정리한 개요 문서다.

이전에는 로딩 구조, 모델 판별, 텍스트 조건, Euler 샘플링 비교를 한 문서에 모두 넣어서 길고 무거웠다. 지금은 역할을 나눴다.

## 이 문서에서 보려는 질문

겉으로는 같은 `CheckpointLoaderSimple`, 같은 `KSampler`, 같은 `Euler`가 보이는데, SDXL와 Anima는 어디서부터 다른 모델이 되는가?

이 질문은 실제로 두 갈래로 나뉜다.

- 로딩 단계에서 무엇이 결정되는가
- 같은 Euler 껍데기 안에서 무엇이 다르게 해석되는가

## 왜 문서를 나눴는가

한 문서 안에 아래 주제가 함께 들어 있으면 독해가 흐려진다.

- 체크포인트 로딩과 모델 판별
- 텍스트 인코더와 조건 경로
- sigma 시간표와 입력 정규화
- `sample_euler()`의 실제 update 해석

그래서 지금은 아래처럼 나눴다.

## 1. 로딩과 모델 판별

이쪽은 "체크포인트를 읽는 순간 어떤 본체와 어떤 sampling 의미가 정해지는가"를 다룬다.

- [[ComfyUI 체크포인트 로딩과 모델 판별, SDXL와 Anima]]

핵심 포인트:

- `load_checkpoint_guess_config()`가 단순 로더가 아니라 모델 판별기 역할도 한다
- SDXL는 U-Net + diffusion 계열로 이어진다
- Anima는 DiT + flow 계열로 이어진다

## 2. Euler 샘플링 비교

이쪽은 "같은 Euler라는 이름 뒤에서 어떤 시간좌표와 어떤 출력 해석이 달라지는가"를 다룬다.

- [[ComfyUI Euler 샘플링 비교, SDXL와 Anima]]

핵심 포인트:

- SDXL는 diffusion sigma와 denoising 해석을 쓴다
- Anima는 flow sigma와 transport 쪽 해석을 쓴다
- 같은 `sample_euler()`라도 실제로 적분하는 장의 의미는 다르다

## 함께 읽으면 좋은 문서

- [[ComfyUI의 SDXL·Anima 샘플링 경로]]
- [[ComfyUI 샘플러와 solver 함수 대응]]
- [[ComfyUI 코드로 보는 SDXL U-Net 구조]]
- [[ComfyUI 코드로 보는 Anima DiT 구조]]

## 한 문장 요약

SDXL와 Anima를 읽을 때는 "로딩에서 모델 의미가 갈라지고, 샘플링에서 같은 껍데기 안의 해석이 갈라진다"라고 나눠 보는 편이 가장 잘 보인다.
