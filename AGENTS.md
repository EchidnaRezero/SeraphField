## Guidance file variants
- AI-facing guidance such as `AGENTS.md` and `SKILL.md` should be written in English.
- To help Korean-speaking users understand the same guidance, create matching `_KR` files with the same meaning.
- Because the English and `_KR` files should say the same thing, don't need to read `_KR` files for AI work unless the task is to sync them.

## Document categories
- Split repository documents into two groups and keep the boundary explicit.
- Project documents describe repository rules, workflows, structure, or tooling.
  - Typical examples: `AGENTS.md`, `AGENTS_KR.md`, `README.md`, `docs/**/*.md`, `skills/**/SKILL.md`, `skills/**/SKILL_KR.md`
- Content documents are publishable study or portfolio content about the subject matter itself.
  - Typical examples: `DRAFT/**/*.md`, `RAW/THEORY/**/*.md`, `RAW/PAPER/**/*.md`, `RAW/REPO/**/*.md`, `RAW/IMPLEMENT/**/*.md`
- Do not explain project workflow rules inside content documents unless a public-facing content rule specifically requires it.
- Do not treat project-document guidance as if it were part of the subject-matter content.

## Local project settings
- If the project root already has a gitignored `local.settings.json`, treat its recorded security level and Git account choice as the user's prior project-level decision.
- Ask the user again only when that file is missing, incomplete, or conflicts with the current instruction.

## Tracked public content safety
- Treat every Git-tracked public-facing content file such as `DRAFT/**/*.md` and `RAW/**/*.md` as public repository content.
- Do not add personal identifiers to Git-tracked public-facing content such as `DRAFT/**/*.md` or `RAW/**/*.md`: real names, emails, phone numbers, handles, social IDs, personal URLs, local file paths, private workspace links, or internal-only notes.
- If a tracked document must refer to a path above the project root, use generalized placeholders such as `<project-root>/...` or `<user-home>/...` instead of machine-specific absolute paths.
- If a draft or source text contains a personal account or author label, replace the public-facing default identity with `Echidna`.
- If additional people, aliases, or account-like placeholders are needed, replace them with Heaven Burns Red character names or game codes from `RAW/hbr_charlist_2025_08_08.csv`.
- Remove stray AI-authorship traces, private TODOs, and prompt fragments before saving Git-tracked public-facing Markdown.
- The official GitHub Pages deploy URL in `README.md` is public-facing by design and may be written there as the canonical deploy address.

## RAW content authoring
- Keep RAW content publishable as-is in a public study/portfolio repository.
- Keep summaries, labels, and headings descriptive rather than chatty.
- Delegate detailed RAW work to the relevant local skill instead of restating its rules here.
- Use `skills/scratch-to-raw-pipeline/SKILL.md` when moving content from `SCRATCH/` or `DRAFT/` into `RAW/`.
- Use `skills/check-site-content/SKILL.md` for frontmatter, parser-safe metadata, heading and TOC rules, and site-facing content checks.
- Use `skills/write-diagrams-and-visualizations/SKILL.md` for shared diagram/visualization guidance and for choosing the right specialized diagram rule set.
- Use `skills/write-math-notation/SKILL.md` for mathematical notation and math-rendering rules.
- Use `skills/publish-site-content-pipeline/SKILL.md` after RAW content is finalized and the task includes commit, push, or CI/CD follow-up.
