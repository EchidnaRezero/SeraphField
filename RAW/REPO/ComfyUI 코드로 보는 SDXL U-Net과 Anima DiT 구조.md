---
title: ComfyUI 코드로 보는 SDXL U-Net과 Anima DiT 구조
date: 2026-04-02
category: REPO
tags:
  - ComfyUI
  - Architecture
  - SDXL
  - Anima
groups:
  - comfyui-codebase
  - model-architecture
series: comfyui-code-reading
series_title: ComfyUI 코드 읽기
series_order: 7
summary: SDXL U-Net과 Anima DiT를 비교하는 개요 문서. 상세 구조는 각각의 전용 문서로 나눈다.
slug: comfyui-sdxl-unet-and-anima-dit-architecture
tracked_versions:
  - comfyui
---

# ComfyUI 코드로 보는 SDXL U-Net과 Anima DiT 구조

이 문서는 로컬 `ComfyUI` 추적 버전 `0.18.2` 기준으로, SDXL와 Anima의 본체 구조를 비교하는 개요 문서다.

핵심 차이는 단순하다.

- SDXL는 U-Net 중심 구조다
- Anima는 DiT, transformer stack 중심 구조다

즉 둘 다 "이미지 생성 모델"이지만, 안쪽 몸체 철학은 다르다.

## 큰 차이 한눈에 보기

| 항목 | SDXL | Anima |
| --- | --- | --- |
| 본체 철학 | U-Net + attention | DiT, transformer stack |
| 기본 표현 | feature map | patch token |
| 공간 처리 | downsample / upsample + skip | 같은 token 격자에서 반복 |
| 시간 조건 | timestep embedding 주입 | AdaLN modulation |
| 텍스트 조건 | CLIP context + ADM | Qwen/T5 기반 context + adapter |
| 복원 방식 | output blocks + conv out | final layer + unpatchify |

## 왜 문서를 나눴는가

이전 버전은 SDXL 절반, Anima 절반을 한 파일에 몰아넣어 비교와 독해가 동시에 어려웠다. 지금은 역할을 나눴다.

- SDXL 쪽 세부 구조: [[ComfyUI 코드로 보는 SDXL U-Net 구조]]
- Anima 쪽 세부 구조: [[ComfyUI 코드로 보는 Anima DiT 구조]]

즉 이 문서는 길잡이 역할만 맡고, 실제 블록 구조와 내부 흐름은 각각의 전용 문서에서 본다.

## 관련 문서

- [[ComfyUI 코드로 보는 SDXL U-Net 구조]]
- [[ComfyUI 코드로 보는 Anima DiT 구조]]
- [[ComfyUI 로딩과 샘플링 함수의 동작, SDXL와 Anima]]
- [[ComfyUI의 SDXL·Anima 샘플링 경로]]
