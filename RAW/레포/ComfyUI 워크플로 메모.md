---
title: ComfyUI 워크플로 메모
date: 2026-03-20
category: REPO
tags:
  - ComfyUI
  - Workflow
  - Node Graph
summary: ComfyUI 레포 구조와 워크플로 노드 흐름을 렌더링 테스트용으로 아주 짧게 정리한 문서.
slug: comfyui-workflow-note
tracked_versions:
  - comfyui
---

# ComfyUI 워크플로 메모

ComfyUI는 노드 그래프 기반 UI라서, 추론 파이프라인을 시각적으로 분해해 보기 좋다. 구현 메모를 볼 때는 이론 문서의 [[벡터장]]이나 샘플링 관련 문서와 같이 보면 흐름을 잡기 쉽다.

## 빠른 포인트

- 노드 단위로 sampler, checkpoint, conditioning 흐름이 분리된다.
- 커스텀 노드를 추가해 실험 파이프라인을 빠르게 바꿀 수 있다.
- 시각적 워크플로를 그대로 기록해 재현성 메모로 쓰기 좋다.

## 메모

- 구현 테스트와 데모 파이프라인 검증에 적합
- 실제 코드 레벨 추적은 `sd-scripts`보다 덜 직접적
- UI 기반 실험 기록용 레포로 가치가 큼
