---
name: seraph-field-raw-authoring
description: Create or revise public-facing Markdown under `RAW/` for the Seraph Field project. Use when adding, editing, sanitizing, or restructuring study notes that feed the site content pipeline, especially when frontmatter, internal links, tags, repository version metadata, or privacy-safe alias replacement must follow project rules.
---

# Seraph Field RAW Authoring

Write `RAW/**/*.md` as public repository content.

## Apply this workflow
1. Read the target Markdown and keep only content that can be published in a public GitHub repository.
2. Normalize frontmatter to the project schema.
3. Normalize headings, links, tags, and repository version metadata.
4. Sanitize personal identifiers before saving.

## Use this frontmatter schema
Use this shape unless the task clearly requires fewer fields:

```yaml
---
title: 문서 제목
date: 2026-03-20
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

Follow these constraints:
- Use only `THEORY`, `PAPER`, `REPO`, `IMPLEMENT` for `category`.
- Prefer `tags` as a YAML array.
- Use `tracked_versions` only for documents that should appear in tracked repository outputs. In practice that should normally be `REPO` documents.
- Keep `date` in `YYYY-MM-DD`.
- Do not place absolute local paths in frontmatter or body.

## Write body content this way
- Start with a single `# 제목`.
- Use `##` headings for sections that should appear in the site TOC.
- Keep prose publishable as-is; remove private notes, chat fragments, and AI prompt residue.
- Keep examples and labels concise and technical.

## Apply these link rules
- Prefer Obsidian links: `[[문서명]]` or `[[문서명|표시명]]`.
- Use relative Markdown links only when a wikilink is ambiguous.
- Use full `https://` URLs for external references.
- Do not link to local drives, private docs, or internal-only systems.

## Apply these privacy rules
- Never write real names, emails, phone numbers, account IDs, personal URLs, private workspace links, or local file paths into `RAW/`.
- Use `AoiErika` as the default public-facing account or author label.
- If additional person-like or account-like placeholders are needed, use Heaven Burns Red character names or game codes from `RAW/hbr_charlist_2025_08_08.csv`.
- Do not invent realistic personal emails. Use neutral placeholders such as `aoi.erika@example.invalid` only when an email-shaped sample is unavoidable.
- Replace personal identifiers from source material instead of paraphrasing around them.

## Apply these substitution rules
- Prefer `AoiErika` for the main owner, maintainer, or author identity.
- For secondary aliases, pick values from `RAW/hbr_charlist_2025_08_08.csv`.
  - Prefer `캐릭터명(K)` for readable public aliases.
  - Prefer `게임코드` for compact code-like placeholders.
- Keep replacements consistent within the same document.

## Apply these citation and version rules
- For `PAPER` documents, link to official paper sources such as arXiv or publisher pages in the body. Do not use repository version tracking just to cite a paper.
- For `REPO` documents, keep `tracked_versions` aligned with `RAW/_meta/version-registry.json`.
- If a repository version is mentioned in prose, keep it consistent with the registry entry.

## Run this final check before saving
- Remove personal identifiers and private-only context.
- Confirm frontmatter keys match the parser expectations in `seraph-field-site/scripts/build-content.mjs`.
- Confirm internal links resolve by title, file name, slug, or relative path.
- Confirm the Markdown is safe to push to a public repository unchanged.
