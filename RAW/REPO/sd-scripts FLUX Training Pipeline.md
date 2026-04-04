---
title: sd-scripts FLUX 학습 파이프라인
date: 2026-04-02
category: REPO
tags:
  - sd-scripts
  - FLUX
  - Training
  - Fine-Tuning
groups:
  - sd-scripts-codebase
  - training-pipelines
summary: 로컬 sd-scripts FLUX 학습 코드가 objective, 데이터셋, 캐시 전략, 샘플 생성 경로를 어떻게 분리하는지 정리한 코드 노트.
slug: sd-scripts-flux-training-pipeline
tracked_versions:
  - sd-scripts
---

# sd-scripts FLUX 학습 파이프라인

이 문서는 로컬 `sd-scripts` 추적 버전 `0.10.2`를 기준으로 정리했다. 이 코드베이스의 가치는 toy notebook처럼 수식을 직접 보여 주는 데 있지 않고, 실제 학습 시스템이 objective 바깥의 무엇을 관리해야 하는지를 드러내는 데 있다.

## 상위 orchestration

`flux_train.py`는 곧바로 optimization loop로 들어가지 않는다. 먼저 다음을 처리한다.

- 인자 검증
- dataset blueprint 생성
- latent/text output 캐시 전략 설정
- accelerator와 dtype 준비
- 모델 및 보조 컴포넌트 로드

즉 실제 생성모델 학습은 objective와 optimizer만으로 이루어지지 않는다. 데이터 경로, 메모리 경로, preview 경로가 모두 알고리즘 시스템의 일부다.

## 학습 루프 골격

코드 흐름만 남기면 대략 아래처럼 읽힌다.

```python
# 설명용 축약 스케치
args = parser.parse_args()
dataset_group = config_util.generate_dataset_group_by_blueprint(...)
accelerator = train_util.prepare_accelerator(args)
model, ae, text_encoder = flux_utils.load_flux_model(...)

for step, batch in enumerate(train_dataloader):
    latents = cache_or_encode_latents(batch["images"])
    cond = encode_prompts(batch["captions"])
    noise = torch.randn_like(latents)
    noisy_latents = noise_scheduler.add_noise(latents, noise, timesteps)
    pred = model(noisy_latents, timesteps, cond)
    loss = training_loss(pred, noise, ...)
    accelerator.backward(loss)
    optimizer.step()
```

핵심은 FLUX 자체보다도, 실제 학습 레포가 캐시 전략과 preview 경로를 포함한 운영 시스템으로 짜여 있다는 점이다.

## 수학 객체와 학습 시스템의 분리

이 코드베이스는 다음을 분리해 놓는다.

- 학습되는 모델
- 데이터셋 구성
- 캐시 정책
- sample image 생성 경로

논문 노트에서 본 denoiser나 field가 실제 프로젝트에서는 어떤 운영 단위로 쪼개지는지를 보기 좋다.

## `flux_train_utils.py`가 중요한 이유

이 모듈은 prompt loading, latent noise 준비, prompt encoding, denoising, image saving을 명시적으로 드러낸다. 즉 학습 레포 안에도 작은 inference stack이 들어 있으며, 이것이 [[Course-Oriented Inference Pipeline Walkthrough]]와 직접 연결된다.

## 관련 문서

- [[Course-Oriented Inference Pipeline Walkthrough]]
- [[Flow Matching for Generative Modeling]]
- [[ComfyUI SDXL and Anima Sampling Paths]]
