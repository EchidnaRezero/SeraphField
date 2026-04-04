---
name: write-raw-content-common
description: Use when applying shared RAW content rules across THEORY, PAPER, REPO, and IMPLEMENT.
---

# Write RAW Content

Write `RAW/**/*.md` as final public repository content.
Keep `SKILL_KR.md` synchronized whenever the substantive instructions in this file change.

## Role

Use this as the base skill for all `RAW/**/*.md` work.
This skill covers:

- how to classify and split mixed draft material across the four RAW categories

For public-safe writing, frontmatter, links, version labels, and final parser-safe metadata, follow `AGENTS.md`.

After deciding the split, also use the matching category skill:

- `write-raw-content-theory`
- `write-raw-content-paper`
- `write-raw-content-repo`
- `write-raw-content-implement`

Use `check-site-content` when content checks involve frontmatter, `content:build`, tables, Mermaid, or TOC behavior.
Use `write-math-notation` when content checks involve mathematical notation or math rendering.

## Classify Mixed RAW Drafts By Dominant Purpose

Do not force one mixed draft into one final category.
A raw source may contain several valid document roles. Classify each section by its dominant purpose, then split when needed.

Use these category rules:

- `THEORY`
  - target: theory-first content
  - examples: the Radon-Nikodym theorem, Itô integral, diffusion viewed as a stochastic process
- `PAPER`
  - target: review or analysis of a specific paper
  - examples: review of "Attention Is All You Need", review of DDPM, review of a GPT-4 paper
- `REPO`
  - target: analysis of external repositories or code written by others
  - examples: HuggingFace Transformers structure analysis, ComfyUI workflow behavior analysis
- `IMPLEMENT`
  - target: the user's own code, experiments, research, or practice work
  - examples: the user's own diffusion training code, rectified-flow experiment code, direct Transformer-block implementation in PyTorch

## Split Mixed Content By Role

- `THEORY` vs `PAPER`
  - if the content reviews a specific paper, use `PAPER`
  - if the same topic is explained without centering a specific paper, use `THEORY`
- `REPO` vs `IMPLEMENT`
  - if code appears and the central job is analyzing third-party code, use `REPO`
  - if code appears and the central job is the user's own implementation or experiment, use `IMPLEMENT`
- `THEORY` vs code categories
  - if the central job is explaining theory itself, use `THEORY`
  - if the central job is explaining code structure or implementation work, use `REPO` or `IMPLEMENT`
- if a draft mixes multiple roles, split those parts into separate category documents and link them instead of keeping the mixed explanation in one file

## Evidence Rules

- Apply the evidence rules from the chosen category skill.
- If two sections require different evidence types, split them instead of mixing them.
- If a claim cannot be tied to an appropriate source, remove it or mark it as an inference.

## Final Check Before Saving

- confirm the draft has been split by content role where needed
- confirm the chosen category matches the document's dominant purpose
- confirm `AGENTS.md` has been applied for public-safe formatting and metadata
- confirm the relevant category skill has been applied
- confirm `check-site-content` has been applied when content checks or renderer-sensitive syntax matter
- confirm `write-math-notation` has been applied when the document contains math
- confirm the Markdown is safe to publish unchanged
