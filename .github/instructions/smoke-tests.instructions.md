---
applyTo: "**/*.js, **/*.ts, **/*.jsx, **/*.tsx"
---
description: Create GitHub issues for smoke test tasks.

# Smoke Test Issue Creation

**When asked to generate/create smoke tests: Create a GitHub issue and assign to @copilot immediately.**

## Issue Title Format
`[Smoke Tests] <page or component name>`

## Issue Body Template
```markdown
## Description
Create smoke tests for `<page/component/route>` to verify it loads without crashing.

## Requirements
- Framework: Vitest + Testing Library or Playwright
- Verify: App renders, no console errors, key UI elements visible
- Fast execution: < 5 seconds total
- Location: `tests/smoke/`

## Critical Routes/Components
- List the pages/components to test
```

## Labels
- `testing`
- `smoke-tests`

## Assignment
**Assign to: @copilot**

That's it. Just create the issue.

