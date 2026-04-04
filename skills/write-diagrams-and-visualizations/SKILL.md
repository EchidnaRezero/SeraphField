---
name: write-diagrams-and-visualizations
description: Use when writing diagrams, tables, graphs, or other visual structures in Markdown. This skill defines shared visualization rules and tells you which specialized skill to consult for details.
---

# Write Diagrams And Visualizations

Keep `SKILL_KR.md` synchronized whenever the substantive instructions in this file change.

## Use This Skill For

Apply this skill when using flowcharts, tables, graphs, Mermaid, images, or other visual tools in Markdown.
It defines the shared rules and tells you which specialized skill to consult for the detailed rules of each case.

## Common Diagram Contract

- Within one diagram, arrows should carry only one meaning.
  Example: in the overall picture of a math-heavy THEORY note, the arrows should be either inclusion maps or forgetful maps, not a mixture of both.
- If no separate rule already fixes the arrow meaning, choose one meaning first and state below the diagram what the arrows mean; if more than one arrow meaning is needed, draw separate diagrams instead of mixing those meanings in one diagram.
- Do not draw both a transitive chain such as `A -> B -> C` and a direct `A -> C` arrow in the same diagram without the user's approval.
- If both a transitive chain and a direct edge seem necessary, stop and check whether the real problem is the relation design between the underlying targets or just the diagrammatic expression.
- Even when the user approves it, prefer separating the transitive-chain view and the direct-relation view into different diagram blocks.
- If the structure becomes hard to read, split the diagram into separate diagrams instead of compressing everything into one.
  When diagrams are split, make the connection easy to follow by either explaining the link below the diagrams or starting the new diagram from an appropriate block that already appeared in the earlier one.

## Shared Mermaid Writing Rules

- Write Mermaid only as fenced code blocks whose language is exactly `mermaid`.
- Do not use indented Mermaid text, raw HTML wrappers around Mermaid text, or alternate Mermaid-like syntaxes outside fenced `mermaid` blocks.

## Which Specialized Skill To Use

- For site-facing Mermaid checks and `RAW/**/*.md` content rendering rules, use `check-site-content`.
- For math-like text inside Mermaid labels or other diagram-adjacent notation choices, use `write-math-notation`.
- For THEORY-note overall pictures, branch points, document roadmaps, and proof-roadmap diagrams, use `write-raw-content-theory`.
- Use this skill itself for shared diagram judgment and for project-document diagrams in `README.md` and `docs/**/*.md`.
