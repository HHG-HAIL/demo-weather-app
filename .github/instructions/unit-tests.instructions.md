---
applyTo: "**/*.js, **/*.ts, **/*.jsx, **/*.tsx"
---
description: Create GitHub issues for unit test tasks and assign to Copilot agent immediately.

# Unit Test Issue Creation

**When asked to generate/create unit tests: Create a GitHub issue.**

## Issue Title Format
`[Unit Tests] <file or component name>`

## Issue Body Template
```markdown
## Description
Create unit tests for `<file-path>`.

## Requirements
- Framework: Vitest or Jest
- Coverage: ≥80%
- Include: Happy path, edge cases, error handling
- Mock external dependencies
- Use AAA pattern (Arrange-Act-Assert)

## Test File Location
`tests/**/*.test.ts` or `__tests__/**/*.test.ts`
```

## Labels
- `testing`
- `unit-tests`

## Assignment
**Assign to: @copilot**

That's it. Just create the issue

