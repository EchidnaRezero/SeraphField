---
name: scratch-to-raw-pipeline
description: Use when turning an initial draft into final publishable `RAW/**/*.md` content.
---

# Scratch To RAW Pipeline

Keep `SKILL_KR.md` synchronized whenever the substantive instructions in this file change.

## Goal

Use this skill to move from a rough draft or source note to final public-facing `RAW/**/*.md` documents for the site.

This skill is an orchestration skill.
It should coordinate the existing RAW-writing and checking skills instead of duplicating their detailed rules.

## Storage Stages

- Use three storage stages:
  - `SCRATCH/**/*.md` for rough private drafts that should not be tracked by Git
  - `DRAFT/**/*.md` for tracked work-in-progress drafts that are already public-safe and may be committed, pushed, and backed up in the public repository, but are not yet site-published content
  - `RAW/**/*.md` for final content that is ready for site publication
- Do not treat `docs/` as the default draft area.
- Use `docs/` for human-facing project documents and keep old reference material there only when it is intentionally documentation or archive material.
- If an older draft still lives under `docs/`, migrate or rewrite it into `SCRATCH/` or `DRAFT/` before running the normal draft-to-RAW flow.
- It is valid to move a previously published `RAW` document back into `DRAFT/` when revising it before a later republish.

## Pipeline

1. Read the draft and identify what kind of source it is.
   - rough markdown draft
   - mixed study note
   - theory note
   - paper review draft
   - external code reading draft
   - implementation or experiment note
2. Decide whether the current source belongs in `SCRATCH/`, `DRAFT/`, or is already ready to become `RAW/`.
3. Before anything enters `DRAFT/`, apply the relevant `AGENTS.md` rules for public-safety, frontmatter discipline, links, and parser-safe repository rules.
4. Decide whether the draft should stay as one document or be split into multiple final documents.
5. Choose the RAW category for each final document.
   - If the content is clearly a mathematics-style theory note, use `write-raw-content-theory`.
   - For `PAPER`, `REPO`, and `IMPLEMENT`, the project does not yet have equally fixed category standards here, so follow the user's direction.
6. Apply `write-raw-content-common` to the final document set.
7. If the document contains mathematical notation, also use `write-math-notation`.
8. If the document contains diagrams or other visual structures, also use `write-diagrams-and-visualizations`.
9. Before finishing, use `check-site-content`.

## Split Rule

- Do not force one mixed draft into one final RAW document.
- If the draft contains multiple roles, split it into multiple documents by dominant role and link them.
- If one role is only a short supporting piece and does not deserve its own document, keep the main document focused and move only if the mixed part starts to dominate.

## Category Rule

- `THEORY`
  - Use the current fixed project standard in `write-raw-content-theory`.
- `PAPER`
  - Follow the user's instruction for now.
- `REPO`
  - Follow the user's instruction for now.
- `IMPLEMENT`
  - Follow the user's instruction for now.

## Output Rule

- Keep rough private material in `SCRATCH/` until it is ready for tracked drafting.
- Move content into `DRAFT/` only after it passes the `AGENTS.md` public-safety rules for repository tracking.
- Keep tracked but unpublished working drafts in `DRAFT/`.
- Save final documents directly under the proper `RAW/` category path.
- Write final content only, not before-and-after commentary.
- Keep the result publishable as-is in the repository.

## Final Check

- confirm `AGENTS.md` was applied
- confirm mixed drafts were split when needed
- confirm the final category decision is explicit
- confirm `write-raw-content-common` was applied
- confirm `write-raw-content-theory` was applied when the note is clearly theory
- confirm `write-math-notation` was applied when the document contains math
- confirm `write-diagrams-and-visualizations` was applied when the document contains diagrams or other visual structures
- confirm `check-site-content` was applied before finishing
