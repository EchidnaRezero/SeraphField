---
name: check-site-ui-code
description: Use when checking UI code changes in `seraph-field-site`.
---

# Check Site UI Code

Check React, TypeScript, and site-viewer code changes under `seraph-field-site`.
Keep `SKILL_KR.md` synchronized whenever the substantive instructions in this file change.

## Use This Skill For

- changes to React components, hooks, styles, routing, or generated-content consumers in `seraph-field-site`
- deciding which verification commands should be run after UI code changes
- debugging failures from `lint`, `build`, or `test` after site UI edits

## Primary Checks

Run the checks that match the change:

- `npm run lint`
  - current project meaning: TypeScript type check with `tsc --noEmit`
- `npm run build`
  - verifies content generation plus Vite production build
- `npm test`
  - use when behavior, parsing logic, or utilities changed in ways that existing tests cover

## Minimum Expectation By Change Type

- component, hook, route, or styling change
  - run `npm run lint`
  - run `npm run build`
- change to content parsing, archive rendering, link resolution, search, or generated data flow
  - run `npm run lint`
  - run `npm run build`
  - run `npm test` when relevant tests exist or behavior risk is non-trivial
- pure wording change in UI strings only
  - usually `npm run lint` is enough unless the change touches JSX structure or content generation

## Failure Triage

Check failures in this order:

1. Type errors from `npm run lint`
2. content-generation failures surfaced during `npm run build`
3. Vite/React build failures
4. test failures from `npm test`

## Final Check

- confirm the changed UI code matches the intended behavior
- confirm the minimum checks for the change type were run or intentionally skipped
- confirm any skipped check is explained in the final report
