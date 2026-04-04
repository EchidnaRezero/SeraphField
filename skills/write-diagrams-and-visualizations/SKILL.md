---
name: write-diagrams-and-visualizations
description: Use when writing diagrams or Mermaid blocks in Markdown.
---

# Write Diagrams And Visualizations

Keep `SKILL_KR.md` synchronized whenever the substantive instructions in this file change.

## Use This Skill For

Apply this skill when using flowcharts, Mermaid, or other diagram-like structures in Markdown.
This skill is for diagram structure and Mermaid authoring only.

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
- If a Mermaid label would need a real formula, dense caveat, or a long sentence, move that content into nearby prose or display math and keep the diagram label short.
- Keep edge-label text shorter than the box text whenever possible. If the edge reason becomes long enough to dominate spacing, explain that transition below the diagram instead of inside the edge label.

## Scope Boundary

- Use this skill for diagram shape, arrow meaning, Mermaid block form, and label length.
- Do not use this skill as a general table-formatting guide or a general image-placement guide.
- If a diagram needs dense formulas, long caveats, or paragraph-sized labels, move that material into nearby prose and keep the diagram structural.
