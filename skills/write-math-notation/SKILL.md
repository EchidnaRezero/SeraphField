---
name: write-math-notation
description: Use when writing mathematical notation in `RAW/**/*.md`, especially body math and Markdown table cells.
---

# Write Math Notation

Keep `SKILL_KR.md` synchronized whenever the substantive instructions in this file change.

## Use This Skill For

- Checking whether math-bearing Markdown in `RAW/**/*.md` will render correctly
- Catching rendering bugs caused by math delimiters, code formatting, or Markdown tables
- Deciding whether a body or table expression should be written in LaTeX, Unicode symbols, or plain words

## Renderer Model

- Body math is rendered through `remark-math` and KaTeX.
- Mermaid labels do not render TeX.
- If a Mermaid label needs math-like notation, use plain words or Unicode symbols such as `Δ`, `σ`, `∫`, `⊂`, and `→`.
- Do not write TeX commands such as `\Delta`, `\sigma`, or `\int` inside Mermaid labels.
- If a standard symbol is clearer than a spelled-out placeholder such as `Delta` or `sigma`, use the symbol.
- For shared diagram-structure choices, also use `write-diagrams-and-visualizations`.
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

## Tables

- Do not put LaTeX inside Markdown table cells.
- If a table cell needs math-like notation, use Unicode symbols there instead.
- If the math becomes structurally dense, move it out of the table and use prose, a list, or display math.

## Math Rendering Checklist

- Are all inline formulas written with `$...$`?
- Are all display formulas written with `$$...$$`?
- Are all `$` delimiters matched?
- Are math-bearing lines free of backticks and inline code formatting?
- If the document contains diagrams, has `write-diagrams-and-visualizations` been applied?
- Are Markdown table cells free of LaTeX?

## When Bugs Appear

Debug in this order:

1. Decide whether the broken math lives in body text, a Mermaid label, or a Markdown table cell
2. If it is body math, check delimiters, unmatched `$`, and accidental code formatting
3. If it is in Mermaid, remove TeX commands and rewrite the label with Unicode symbols or plain words
4. If it is in a table, move the math out of the cell or rewrite it with Unicode symbols
5. If the Mermaid structure itself is the problem, move to `write-diagrams-and-visualizations`
6. If the syntax is valid but rendering still fails, inspect the site renderer
