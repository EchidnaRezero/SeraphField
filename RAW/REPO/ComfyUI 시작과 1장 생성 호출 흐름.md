---
title: ComfyUI 시작과 1장 생성 호출 흐름
date: 2026-04-02
category: REPO
tags:
  - ComfyUI
  - Runtime
  - Execution
  - SDXL
  - Anima
groups:
  - comfyui-codebase
  - runtime-pipeline
series: comfyui-code-reading
series_title: ComfyUI 코드 읽기
series_order: 1
summary: ComfyUI 서버 부팅부터 프롬프트 1회가 이미지 1장으로 끝날 때까지의 호출 흐름을 정리한 코드 노트.
slug: comfyui-startup-and-single-image-flow
tracked_versions:
  - comfyui
---

# ComfyUI 시작과 1장 생성 호출 흐름

## 범위

이 문서는 로컬 `ComfyUI` 추적 버전 `0.18.2`에서 확인한 호출 흐름을 정리한다.

- 시작 경로: 서버 부팅, 라우트 등록, 프롬프트 큐 작업 스레드
- 실행 경로: 프롬프트 요청 1회가 이미지 1장으로 끝날 때까지의 흐름
- 모델별 초점: SDXL, Anima

## 공통 요청 생명주기

```mermaid
flowchart TD
    A["python main.py"] --> B["start_comfyui()<br/>main.py"]
    B --> C["PromptServer()"]
    B --> D["nodes.init_extra_nodes()"]
    B --> E["add_routes()"]
    B --> F["prompt_worker 작업 스레드"]
    E --> G["POST /prompt<br/>server.py"]
    G --> H["trigger_on_prompt()"]
    H --> I["validate_prompt()<br/>execution.py"]
    I --> J["prompt_queue.put(...)"]
    J --> K["prompt_worker(): q.get()"]
    K --> L["PromptExecutor.execute()"]
    L --> M["execute_async()"]
    M --> N["ExecutionList가 준비된 노드를 단계별 선택"]
    N --> O["get_input_data()"]
    O --> P["get_output_data()"]
    P --> Q["노드 FUNCTION 호출"]
    Q --> R["출력 캐시 저장 / UI 이벤트 전송"]
```

## SDXL: 시작부터 이미지 1장까지

```mermaid
flowchart TD
    A["PromptExecutor.execute_async()"] --> B["CheckpointLoaderSimple.load_checkpoint()"]
    B --> C["comfy.sd.load_checkpoint_guess_config()"]
    C --> D["load_state_dict_guess_config()"]
    D --> E["supported_models.SDXL"]
    E --> F["MODEL + CLIP + VAE 준비"]
    A --> G["CLIPTextEncode.encode()<br/>긍정 프롬프트"]
    A --> H["CLIPTextEncode.encode()<br/>부정 프롬프트"]
    A --> I["EmptyLatentImage.generate()"]
    F --> J["KSampler.sample()"]
    G --> J
    H --> J
    I --> J
    J --> K["common_ksampler()"]
    K --> L["comfy.sample.prepare_noise()"]
    K --> M["comfy.sample.fix_empty_latent_channels()"]
    K --> N["comfy.sample.sample()"]
    N --> O["comfy.samplers.KSampler"]
    O --> P["calculate_sigmas()<br/>scheduler + model_sampling"]
    P --> Q["CFGGuider.sample()"]
    Q --> R["model.apply_model() 반복 호출<br/>UNet 디노이징 단계"]
    R --> S["샘플링 완료 latent"]
    S --> T["VAEDecode.decode()"]
    T --> U["vae.decode()"]
    U --> V["SaveImage.save_images()"]
    V --> W["output/에 PNG 저장"]
```

## Anima: 시작부터 이미지 1장까지

```mermaid
flowchart TD
    A["PromptExecutor.execute_async()"] --> B["CheckpointLoaderSimple.load_checkpoint()"]
    B --> C["comfy.sd.load_checkpoint_guess_config()"]
    C --> D["load_state_dict_guess_config()"]
    D --> E["supported_models.Anima"]
    E --> F["model_base.Anima(model_type=FLOW)"]
    F --> G["ModelSamplingDiscreteFlow"]
    F --> H["AnimaTokenizer + anima.te()"]
    A --> I["CLIPTextEncode.encode()<br/>Anima 텍스트 인코더 사용"]
    A --> J["EmptyLatentImage.generate()"]
    G --> K["KSampler.sample()"]
    I --> K
    J --> K
    K --> L["common_ksampler()"]
    L --> M["comfy.sample.prepare_noise()"]
    L --> N["comfy.sample.sample()"]
    N --> O["comfy.samplers.KSampler"]
    O --> P["calculate_sigmas()<br/>ModelSamplingDiscreteFlow 기준"]
    P --> Q["CFGGuider.sample()"]
    Q --> R["model.apply_model() 반복 호출<br/>flow 방식 샘플링 단계"]
    R --> S["샘플링 완료 latent"]
    S --> T["VAEDecode.decode()"]
    T --> U["vae.decode()"]
    U --> V["SaveImage.save_images()"]
    V --> W["output/에 PNG 저장"]
```

## SDXL과 Anima가 갈라지는 지점

```mermaid
flowchart LR
    A["CheckpointLoaderSimple"] --> B["load_checkpoint_guess_config"]
    B --> C{"감지된 모델 타입"}
    C --> D["SDXL"]
    C --> E["Anima"]
    D --> F["supported_models.SDXL"]
    D --> G["기본 SDXL 텍스트 인코더"]
    D --> H["model_sampling: EPS 또는 V-prediction 계열"]
    E --> I["supported_models.Anima"]
    E --> J["AnimaTokenizer + anima.te()"]
    E --> K["model_sampling: ModelSamplingDiscreteFlow"]
    H --> L["KSampler가 diffusion 방식 sigma 스케줄 사용"]
    K --> M["KSampler가 flow 방식 sigma 스케줄 사용"]
```

## 읽는 순서

- `main.py`: 서버를 시작하고 프롬프트 작업 스레드를 켠다.
- `server.py`: `/prompt` 요청을 받아 검증한 뒤 큐에 넣는다.
- `execution.py`: 그래프 의존성을 풀고 각 노드 함수를 호출한다.
- `nodes.py`: 기본 로더, 텍스트 인코드, latent, sampler, VAE decode, save 노드가 들어 있다.
- `comfy/sd.py`: 체크포인트 구조를 감지하고 모델, 텍스트 인코더, VAE 객체를 만든다.
- `comfy/model_base.py`: 모델 타입과 그에 맞는 샘플링 동작을 정한다.
- `comfy/model_sampling.py`: 모델 계열마다 쓰는 sigma/time 동작을 정의한다.
