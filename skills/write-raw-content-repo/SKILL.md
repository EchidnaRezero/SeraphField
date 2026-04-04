---
name: write-raw-content-repo
description: Use when writing code-reading `RAW/REPO/**/*.md` notes.
---

# Write REPO Content

Write `RAW/REPO/**/*.md` as code-reading notes grounded in real repositories.
Keep `SKILL_KR.md` synchronized whenever the substantive instructions in this file change.

## Focus

- Start from actual files, functions, classes, nodes, scripts, or options.
- Explain where decisions are made in code and how the path flows.
- Keep math short and link to `THEORY` when the math becomes the main subject.
- This category is for analyzing external code, not for documenting your own implementation work.

## Preferred Structure

- repository/version scope
- entry path or file layout
- important branch points
- key functions, classes, or nodes
- what the code implies for the behavior

## Evidence Rules

- Ground claims in the local checked-out code under `test/`.
- Name concrete files, functions, classes, nodes, scripts, or flags when they support the point.
- Use `tracked_versions` only when the document should participate in repository version output.
