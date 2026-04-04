---
name: publish-site-content-pipeline
description: Use when taking finalized RAW content through local checks, git publish steps, and CI/CD follow-up.
---

# Publish Site Content Pipeline

Keep `SKILL_KR.md` synchronized whenever the substantive instructions in this file change.

## Goal

Use this skill after the content itself is already finalized.

This skill covers the publish-side pipeline:

- local settings lookup
- content and site checks
- repo-local git identity setup
- commit and push
- CI/CD follow-up

This skill should orchestrate existing content-writing and checking skills instead of duplicating them.

## Local Settings First

- Do not infer the project's security level or Git account choice from GitHub.
- First look for a gitignored root file named `local.settings.json`.
- If it exists, prefer its local values for:
  - `securityLevel`
  - `gitAccountKey`
- If the file does not exist, is incomplete, or conflicts with the user's current instruction, ask the user directly before commit or push.
- Do not write private values into tracked project documents.

## Pipeline

1. Confirm the RAW content is already finalized.
   - If the draft is not finalized yet, use `scratch-to-raw-pipeline` first.
2. Load local publish settings from `local.settings.json` when available.
3. Apply `check-site-content`.
4. If the changed content includes math, also apply `write-math-notation`.
5. Run local verification in this order:
   - `npm run content:build`
   - `npm run lint`
   - `npm test`
   - `npm run build`
6. Before the first commit or push for this repository, set repo-local `user.name` and `user.email` from the chosen local Git account mapping.
7. Commit only after the local checks pass.
8. Push the branch.
9. If the repository has CI/CD configured, check the resulting workflow or deploy status after push.

## Git Rule

- Use repo-local Git identity only.
- Do not use global Git identity.
- If the local settings file gives the Git account choice, use that as the starting point.
- If the mapping document in the user's home directory is needed to resolve `gitAccountKey`, read it locally and do not copy its private details into repository files.

## CI/CD Rule

- Treat CI/CD follow-up as a local verification step after push, not as a place to infer project settings.
- If `.github/workflows/` exists, check the relevant workflow status after push.
- If the repository uses GitHub Pages or another deploy target, confirm whether the latest push produced a successful deploy.
- If CI/CD is missing or intentionally out of scope, state that briefly and stop after push.

## Final Check

- confirm the content itself was already finalized before using this skill
- confirm `local.settings.json` was used when available
- confirm `check-site-content` was applied
- confirm `write-math-notation` was applied when math is present
- confirm all local checks passed before commit
- confirm repo-local Git identity was set before commit or push
- confirm push completed
- confirm CI/CD follow-up was checked when applicable
