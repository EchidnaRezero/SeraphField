---
name: check-site-content
description: Use when checking site content under `RAW/**/*.md`.
---

# Check Site Content

Keep `SKILL_KR.md` synchronized whenever the substantive instructions in this file change.

## Use This Skill For

- Checking whether `RAW/**/*.md` is ready to ship as site content
- Catching content problems that break parser rules, public-safety rules, or site rendering rules
- Investigating site-content issues such as bad frontmatter, broken tables, Mermaid blocks, missing TOC entries, or plain-text task lists

## Content Contract

Treat this skill as the content-side check for the site.
Use it when a task changes `RAW/**/*.md` and you need to confirm:

- frontmatter and metadata satisfy the project contract
- public-safe content rules are still satisfied
- Markdown features match the site's renderer behavior
- `content:build` should be run or its failure should be debugged

## Renderer Model

The archive page currently renders Markdown through these layers:

- `react-markdown`
- `remark-gfm`
- `remark-math`
- `rehype-katex`
- custom Mermaid rendering for fenced `mermaid` code blocks
- custom syntax highlighting for selected fenced code languages

Treat the site's parser and renderer behavior as the source of truth, not generic Markdown expectations.

## Build Contract

When content changes, check the rules enforced by:

- `seraph-field-site/scripts/content-validation.mjs`
- `seraph-field-site/scripts/build-content.mjs`

This includes:

- required frontmatter fields
- valid `category`
- `tracked_versions` only for `REPO`
- body starting with a single `#` heading
- no absolute local paths in public content

## Supported Authoring Features

### GFM

The site supports common GitHub Flavored Markdown features through `remark-gfm`.

Use these normally:

- pipe tables
- task lists
- strikethrough
- autolink literals
- footnotes

Prefer GFM syntax over raw HTML tables.

### Math

- Body math should use `$...$` for inline math and `$$...$$` for display math.
- Keep `$` delimiters balanced.
- Do not put TeX inside inline code spans.
- Mermaid labels do not render TeX commands.
- Markdown table cells should avoid LaTeX; use Unicode symbols or move the math out of the table.

### Mermaid

The site supports Mermaid only through fenced code blocks whose language is exactly `mermaid`.
- Keep one arrow meaning per diagram.
- If both a transitive chain and a direct edge are needed, prefer separate diagrams.
- Keep box labels and edge labels short enough to stay readable in the rendered page.

## Heading And TOC Rules

The site TOC is built from `##` headings.

Follow these rules:

- Use a single `#` title at the top of the document body
- Use `##` for sections that should appear in the TOC
- Use `###` only for local substructure inside a section
- Do not rely on `###` or deeper headings to appear in the TOC

If a section must be navigable from the archive TOC, make it a `##` heading.

## Code Fence Rules

Prefer fenced code blocks with an explicit language label.

Known first-class languages in the site renderer include:

- `bash`
- `shell`
- `sh`
- `javascript`
- `js`
- `json`
- `markdown`
- `md`
- `python`
- `py`
- `typescript`
- `ts`
- `tsx`
- `mermaid`
- `text`

If a language is not in this set, the block may still render, but styling may be less reliable.

## Prefer Markdown Over Raw HTML

Prefer standard Markdown or GFM features over raw HTML whenever possible.

Avoid raw HTML constructs such as:

- `<table>`
- `<details>`
- custom inline HTML layout wrappers

Use raw HTML only when there is no equivalent supported Markdown form and the user specifically wants it.

## Rendering Risk Checklist

Before saving a document that uses richer Markdown, check these points:

- Does the frontmatter still satisfy the parser contract?
- If the document contains diagrams, do the Mermaid blocks use supported syntax and readable labels?
- Are all tables written in GFM table syntax instead of ad hoc spacing?
- Are TOC-worthy sections written as `##` headings?
- Are task lists written with GFM checkbox syntax?
- If the document contains math, do the delimiters, table cells, and Mermaid labels follow the site's rendering limits?
- Is raw HTML avoided unless truly necessary?

## When Rendering Bugs Appear

Debug in this order:

1. Check whether the source uses supported Markdown syntax
2. Check whether the frontmatter and content contract still pass
3. Check whether the problem is authoring, not rendering
4. Check `seraph-field-site/src/components/ArchiveMarkdown.tsx`
5. Check `seraph-field-site/src/index.css`
6. If syntax is valid but the document shape still feels wrong, rewrite the document so its headings, metadata, and structure match its actual content role

Do not "fix" rendering issues by silently rewriting content into a different document type when the real problem is unsupported syntax.
