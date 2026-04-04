---
name: create-project-skill
description: Use when creating or revising project-specific skills under `skills/`.
---

# Create Project Skill

Keep `SKILL_KR.md` synchronized whenever the substantive instructions in this file change.

## Goal

Create repository-local skills that fit this project's conventions and are easy to trigger by name and task.

## Create Skills In This Repository

- Place project-specific skills under `skills/`.
- Use lowercase letters, digits, and hyphens only for folder names.
- Prefer short verb-led names that reveal when the skill should be used.

Good examples:

- `write-raw-content-common`
- `write-raw-content-theory`
- `write-raw-content-paper`
- `write-raw-content-repo`
- `write-raw-content-implement`
- `check-site-content`
- `check-site-ui-code`
- `create-project-skill`

## Write Frontmatter This Way

Use only the required fields:

- `name`
- `description`

Write `description` as one short trigger sentence.

Create a matching `SKILL_KR.md` for human readers in this project and keep it aligned when the skill meaning changes.

## Project Fit Rules

When the skill touches `RAW/**/*.md`, make sure it agrees with:

- `AGENTS.md`
- `skills/write-raw-content-common/SKILL.md`
- the relevant category skill when the content is category-specific
- `skills/check-site-content/SKILL.md` when the skill concerns site content checks
- `skills/check-site-ui-code/SKILL.md` when the skill concerns site UI code checks

## Skill Independence

- Only `scratch-to-raw-pipeline` and `publish-site-content-pipeline` may orchestrate other project skills.
- All other project skills must remain self-contained and must not instruct the reader to use, apply, follow, or move to another project skill.
- Project skills may explicitly refer to `AGENTS.md` only for repository-wide security and tracked/public document information rules.

## Final Check

Before finishing a project skill:

- confirm the folder name is trigger-friendly
- confirm the `description` is short and direct
- confirm `SKILL_KR.md` exists and matches the English meaning
- confirm links point to the current project paths
