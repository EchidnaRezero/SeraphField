---
name: check-project-docs
description: Use when reviewing project documents before save or commit, or when the user explicitly asks for document review.
---

# Check Project Docs

Keep `SKILL_KR.md` synchronized whenever the substantive instructions in this file change.

## Goal

Review project-facing documents and report only the issues that matter before save, commit, or publish.

Prioritize:

- duplicated or overlapping content
- unnecessary text that should not be written at all, such as remarks about already removed content or prose that only states what is already obvious from the document itself
- document-self-description, such as sentences that explain the document itself instead of its content
- information that `AGENTS.md` says should not appear in tracked or public-facing documents
- cross-file inconsistency
- English/Korean drift
- unclear responsibility boundaries between documents

## Default Review Scope

Use this skill for documents such as:

- `README.md`
- `docs/**/*.md`
- `AGENTS.md`
- `AGENTS_KR.md`
- `skills/**/SKILL.md`
- `skills/**/SKILL_KR.md`

Treat Git-tracked public-facing Markdown as public repository content.

## Review Mode

- Findings first
- Ordered by severity
- Use exact file references
- Keep overviews short
- Judge first whether the issue would actually affect behavior, rendering, math output, parsing, or user understanding rather than being a wording nitpick or strained interpretation, and do not report it when that impact is not meaningful.

## Subagent Split

Always split the review by checklist group and let subagents review one or more whole groups against the same document set.
Give each subagent only the target files and checklist groups, ask for findings with file references, and merge overlapping findings before the final report.
If subagents cannot be used in the current environment, stop and report that the review is blocked instead of silently continuing as a single-agent review.

## Grouped Checklist

### Group 1. Structure And Scope

Check:

- whether the document says what belongs in that document and not in another one
- whether one document is trying to do two jobs at once
- whether a table, flowchart, or heading structure already shows something that prose repeats
- whether the document contains sentences about itself, such as "this document is..." or "this section explains..."
- whether section order matches the real reading flow

### Group 2. Duplication And Drift

Check:

- whether the same rule or explanation appears twice in one document
- whether two documents repeat the same content with only light wording changes
- whether one file summarizes another file badly or with stale wording
- whether a map, checklist, or summary contradicts the current source files

### Group 3. `AGENTS.md` Information Rules

Check:

- whether tracked or public-facing files contain information that `AGENTS.md` says should not be written there
- whether public-facing files contain personal identifiers, local-only paths, private notes, prompt fragments, or AI authorship traces
- whether tracked documents expose account-like labels that should be replaced under project rules
- whether the document writes external local paths or private account data without clear approval

### Group 4. Format And Rendering

Check:

- whether Markdown structure matches the document's intended use
- whether tables, headings, code fences, and Mermaid blocks use consistent syntax
- whether `RAW/**/*.md` content still matches site-facing parser and renderer limits
- whether document formatting choices create readability problems even when technically valid

### Group 5. Cross-File Consistency

Check:

- whether English and Korean pairs still mean the same thing
- whether file names, skill names, and path references still point to current project paths
- whether category names, workflow names, and terminology stay consistent across documents
- whether one document claims a scope boundary that another document breaks

## Exceptions

- Do not report it as inconsistency just because `PAPER`, `REPO`, or `IMPLEMENT` already has a skill file while another document says those categories are not yet fixed like `THEORY`. In the current project state, those category documents are still sparse, so the skills exist earlier than the real authoring standard.
- Do not report it as drift just because `AGENTS.md` says English files are the AI-facing source and `_KR` files match the meaning, while `AGENTS_KR.md` omits that point for the human reader.

## Final Report Contract

Write the final report in this order:

1. findings
2. open questions or assumptions

For each finding:

- state whether it is a conflict, duplication, drift, or scope problem
- explain the user impact in plain language first
- then state the technical reason
- include exact file references
- say briefly why the issue is not covered by an exception when that could be ambiguous
