## Guidance file variants
- AI-facing guidance such as `AGENTS.md` and `SKILL.md` should be written in English.
- To help Korean-speaking users understand the same guidance, create matching `_KR` files with the same meaning.
- Because the English and `_KR` files should say the same thing, don't need to read `_KR` files for AI work unless the task is to sync them.

## RAW content safety
- Treat every file under `RAW/` as public repository content.
- Do not add personal identifiers to `RAW/**/*.md`: real names, emails, phone numbers, handles, social IDs, personal URLs, local file paths, private workspace links, or internal-only notes.
- If a draft or source text contains a personal account or author label, replace the public-facing default identity with `Echidna`.
- If additional people, aliases, or account-like placeholders are needed, replace them with Heaven Burns Red character names or game codes from `RAW/hbr_charlist_2025_08_08.csv`.
- Remove stray AI-authorship traces, private TODOs, and prompt fragments before saving Markdown into `RAW/`.

## RAW markdown format
- Keep frontmatter public-safe and minimal.
- Use this frontmatter shape unless there is a clear reason not to:

```yaml
---
title: 문서 제목
date: 2026-03-21
category: THEORY
tags:
  - TagA
  - TagB
summary: 한 줄 요약
slug: optional-slug
tracked_versions:
  - optional-repo-id
---
```

- Valid `category` values are only `THEORY`, `PAPER`, `REPO`, `IMPLEMENT`.
- Prefer `tags` as a YAML array, not a comma-separated string.
- Use `tracked_versions` only for `REPO` documents that should participate in tracked repository version output.
- Do not put absolute local paths in frontmatter or body.

## RAW writing rules
- Keep summaries, labels, and headings descriptive rather than chatty.
- Keep content publishable as-is in a public study/portfolio repository.

## Link rules
- Prefer internal links in Obsidian style: `[[문서명]]` or `[[문서명|표시명]]`.
- Use relative Markdown links only when a wikilink cannot express the target clearly.
- Use full `https://` URLs for external links.
- Do not link to local drives, private cloud docs, or internal-only resources from `RAW/`.

## Version and citation rules
- `PAPER` documents should link to official paper sources such as arXiv or publisher pages in the body instead of using repository version tracking.
- `REPO` documents may use `tracked_versions` and should align with entries in `RAW/_meta/version-registry.json`.
- If a repository or implementation note names a specific library version, keep that label consistent with the version registry.

## Before saving RAW markdown
- Check that the file contains no personal identifiers.
- Check that links are public and intentional.
- Check that category, tags, summary, and title follow the parser rules used by `seraph-field-site/scripts/build-content.mjs`.
