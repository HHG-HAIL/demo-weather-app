---
applyTo: "**/*.js, **/*.ts, **/*.jsx, **/*.tsx"
---
description: Create GitHub issues for integration test tasks.

# Integration Test Issue Creation

**When asked to generate/create integration tests: Create a GitHub issue and assign to @copilot immediately.**

## Issue Title Format
`[Integration Tests] <feature or flow name>`

## Issue Body Template
```markdown
## Description
Create integration tests for `<feature/flow>` to validate multi-module interactions.

## Requirements
- Framework: Vitest or Playwright
- Mock external APIs (use MSW for HTTP)
- Test both success and failure paths
- Use AAA pattern (Arrange-Act-Assert)
- Location: `tests/integration/`

## Flow to Test
- Brief description of the user flow or system interaction

## Modules Involved
- List components/modules that interact
```

## Labels
- `testing`
- `integration-tests`

## Assignment
**Assign to: @copilot**

That's it. Just create the issue.

