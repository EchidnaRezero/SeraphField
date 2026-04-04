---
name: write-math-notation
description: Use when writing mathematical notation in `RAW/**/*.md`, including body math, Mermaid labels, and table cells.
---

# Write Math Notation

Keep `SKILL_KR.md` synchronized whenever the substantive instructions in this file change.

## Use This Skill For

- Checking whether math-bearing Markdown in `RAW/**/*.md` will render correctly
- Catching rendering bugs caused by math delimiters, code formatting, Mermaid labels, or Markdown tables
- Deciding whether a math-like expression should be written in LaTeX, Unicode symbols, or plain words

## Renderer Model

- Body math is rendered through `remark-math` and KaTeX.
- Mermaid labels do not render TeX. They render plain text and Unicode symbols only.
- Markdown table cells are a poor place for LaTeX. Prefer Unicode symbols or move the math out of the table.

## Body Math

Use:

- inline math with `$...$`
- display math with `$$...$$`

Do not:

- wrap math-bearing sentences, headings, or list items in backticks
- put TeX inside inline code spans
- leave unmatched `$`

Avoid mixing math delimiters with fenced code blocks.

## Mermaid Labels

When a Mermaid label needs math-like notation, use Unicode symbols such as `Δ`, `σ`, `∫`, `⊂`, or `→`.

Do not:

- write TeX commands such as `\Delta`, `\sigma`, or `\int` inside Mermaid labels
- spell a standard symbol out as plain words such as `Delta` or `sigma` when the actual symbol is clearer

## Tables

- Do not put LaTeX inside Markdown table cells.
- If a table cell needs math-like notation, use Unicode symbols there instead.
- If the math becomes structurally dense, move it out of the table and use prose, a list, or display math.

## Math Rendering Checklist

- Are all inline formulas written with `$...$`?
- Are all display formulas written with `$$...$$`?
- Are all `$` delimiters matched?
- Are math-bearing lines free of backticks and inline code formatting?
- Are Mermaid labels free of TeX commands?
- Are Markdown table cells free of LaTeX?

## When Bugs Appear

Debug in this order:

1. Decide whether the broken math lives in body text, a Mermaid label, or a Markdown table cell
2. If it is body math, check delimiters, unmatched `$`, and accidental code formatting
3. If it is in Mermaid, replace TeX-like notation with Unicode symbols
4. If it is in a table, move the math out of the cell or rewrite it with Unicode symbols
5. If the syntax is valid but rendering still fails, inspect the site renderer
