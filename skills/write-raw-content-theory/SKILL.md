---
name: write-raw-content-theory
description: Use when writing math-style theory notes for `RAW/THEORY/**/*.md`.
---

# Write THEORY Content

Write `RAW/THEORY/**/*.md` as theory notes in a mathematics-department style.
Keep `SKILL_KR.md` synchronized whenever the substantive instructions in this file change.

## Main Subjects

- The usual subjects are mathematics, physics, AI, CS, and other theory-first domains.
- Even when the topic comes from physics, AI, or CS, explain it from a mathematics-department viewpoint.
- Focus on the mathematical concepts, structures, assumptions, derivations, and statements behind the topic.
- Do not explain code here. Move code reading or implementation details to `REPO` or `IMPLEMENT` and link there.

## Required Document Spine

- Assume a second-year mathematics student as the reader, with basic set theory, analysis, and linear algebra.
- Unless there is a strong reason not to, write a THEORY note in this order:
  1. overall picture
  2. branch points between nearby classes or objects
  3. document roadmap
  4. numbered main sections
  5. local definition followed by a plain-language reading
  6. example blocks
- Treat [example-brownian-motion.md](/C:/Projects/YUKINET/skills/write-raw-content-theory/example-brownian-motion.md) as the model for this spine and pacing.
- If you believe a different structure fits the topic better, propose that variation to the user first and proceed only after confirmation.
- Unless the section is the global overview itself, do not front-load later technical terms without explanation. If a later term must be mentioned early, describe it first in plain words and keep the term name brief.

## Math Explanation Guidelines

- For math-heavy notes, follow `DRAFT/수학지침.md`.
- State assumptions, prerequisites, and logical status explicitly.
- When needed, fix an ambient setting and place sets, spaces, structures, and maps inside it. The overall-picture diagram should then be drawn from the objects and maps in that ambient setting, using inclusion maps or forgetful maps as appropriate.
- State the domain and codomain of every map.
- Use standard mathematical notation by default. If there is no widely used standard notation, do not force an ad hoc symbolic shorthand unless the user explicitly asks for one.
- For Markdown math syntax and rendering details, also use `write-math-notation`.

## Overall Picture

- Put the overall picture before local details.
- Use the overall picture to show the mathematical universe, nearby classes, and where the main object sits.
- In the overall-picture diagram, assign lower numbers to higher-level objects and larger numbers as you move downward to more specific classes or objects.
- Keep the diagram itself doing most of the work. Do not restate in prose what is already obvious from the diagram.
- In the boxes, use mathematical object names. On the arrows, write short purpose-oriented phrases only when they add information.
- For a global overview diagram, use only mathematically valid inclusion maps or forgetful maps, use only one of those map types within the diagram, and if both viewpoints are mathematically valid and both matter, draw separate diagrams instead of mixing them in one diagram.
- If the same map type already gives a transitive chain such as `A -> B -> C`, do not draw the `A -> C` map again unless that direct relation itself is mathematically important for the note.
- Do not write “the set/class of all ...” unless that universal-looking collection is mathematically well-defined when stated as “the collection of all X” in the current setup. When needed, state the ambient conditions or restrictions explicitly and write the collection relative to those conditions.
- If the topic does not admit a mathematically honest overall picture built from inclusion maps or forgetful maps, omit both the overall-picture and branch-point sections and go directly to the document roadmap.

## Branch Points

- After the overall picture, add a branch-point section that explains where the nearby classes split.
- Match the branch-point items to the boxes in the overview diagram, and reuse those overview numbers instead of repeating long names.
- For each item, keep the pattern tight:
  - line 1: among the parent class, what extra condition defines this class
  - line 2: an example that stays in the parent class but does not belong here
- When possible, phrase the first line from the parent class downward, such as “among `(2)`, ...”.
- Keep the examples concrete and short.

## Document Roadmap

- After the branch-point section, add a roadmap that shows why the later sections appear in this order.
- Use the roadmap to connect the main object to the later topics or constructions.
- Put mathematical terms in the boxes and short purpose-or-limit phrases on the arrows.
- Let the roadmap answer why the next section is needed, not merely what the next section is called.
- The overview-diagram numbers are for the branch-point section.
- Number the roadmap boxes separately, and reuse those roadmap numbers in later section titles so the reader can see where the current section sits in the roadmap.
- After the roadmap, the note should move into mathematically rigorous local sections.
- Those local sections should advance the note through definitions, examples, propositions, proofs, calculations, or derivations as needed.
- When a rigorous local section would become too hard to follow on its own, add a separate local explanation subsection after it instead of diluting the formal part itself.
- If a proof idea becomes long enough that its global flow is hard to follow in prose, draw a separate proof-roadmap diagram before the detailed proof.

## Definition And Explanation

- Treat this as a repeating local rule, not an introduction-only rule.
- Whenever the note introduces a new mathematical definition that matters for the next discussion, follow it with a local explanation section that reads the definition in plain language.
- In that explanation section, go condition by condition.
- For each condition, cover:
  - what it says
  - why it is there
  - what kind of object slips in if it is removed
- If there is more than one reason, purpose, or failure mode, split them into labeled items such as `a.` and `b.`.
- Use intuitive or concrete wording first, but keep the corresponding mathematical term or formula visible when it matters.
- If a term is not basic second-year undergraduate mathematics vocabulary, explain it in plain words first, name the term briefly, and leave the full formal treatment to the local section where it is defined or used in detail.

## Example Blocks

- When a local explanation needs a concrete situation, put that situation into its own example block instead of crowding the main paragraph.
- Use one example per block.
- Let the main prose stay short, and let the block carry the concrete setup, formulas, or small finite examples.
- When helpful, use finite sets, explicit elements, simple graphs, or small formulas.
- If a visual example is clearer than text, a generated image is acceptable.
- If the most concrete example is code, move that example to `REPO` or `IMPLEMENT` and link there instead of explaining the code here.
