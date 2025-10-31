# GitHub Workflows Documentation

This directory contains automated workflows for managing test issue creation and orchestration.

## Overview

The workflow system enables automated creation and assignment of test-related issues to the Copilot agent, following the instructions defined in `.github/instructions/`.

## Available Workflows

### 1. Create Test Issues (`create-test-issues.yml`)

**Purpose**: Automatically create GitHub issues for testing tasks based on the codebase.

**Trigger**: Manual workflow dispatch

**Inputs**:
- `test_type`: Type of test to create (unit, smoke, integration, or all)
- `component`: Specific component/file to test (optional - leave empty for all files)
- `auto_assign`: Whether to automatically assign issues to @copilot (true/false)

**Usage**:
1. Go to Actions → Create Test Issues
2. Click "Run workflow"
3. Select test type and component
4. Choose whether to auto-assign to @copilot
5. The workflow will create issues with appropriate labels and templates

**Output**: List of created issue numbers

### 2. Orchestrate Test Issues (`orchestrate-tests.yml`)

**Purpose**: Manage staged execution of test issues with dependency handling.

**Trigger**: Manual workflow dispatch

**Inputs**:
- `stage_1_issues`: JSON array of issue numbers that can run in parallel (e.g., `[1, 2, 3]`)
- `stage_2_issues`: JSON array of issues that depend on stage 1 (e.g., `[4, 5]`)
- `stage_3_issues`: JSON array of issues that depend on stage 2 (e.g., `[6]`)
- `stage_4_issues`: JSON array of issues that depend on stage 3 (e.g., `[7]` or `[]`)

**Behavior**:
- Each stage waits for the previous stage to complete
- Issues within a stage are processed in parallel (max 10 concurrent)
- Automatically assigns @copilot to each issue
- Waits up to 30 minutes for each issue to be closed
- Provides a summary of all stage results

**Usage**:
1. Create issues first (manually or using `create-test-issues.yml`)
2. Categorize issues by dependency:
   - Stage 1: Independent issues (can run in parallel)
   - Stage 2: Issues that need stage 1 complete
   - Stage 3: Issues that need stage 2 complete
   - Stage 4: Final integration or dependent issues
3. Go to Actions → Orchestrate Test Issues
4. Click "Run workflow"
5. Replace placeholders with actual issue numbers in JSON array format
6. The workflow will process issues in stages

**Example**:
```
stage_1_issues: [101, 102, 103]  # Unit tests for components
stage_2_issues: [104, 105]        # Smoke tests
stage_3_issues: [106]             # Integration tests
stage_4_issues: []                # None needed
```

## Workflow Process

### Typical Workflow:

1. **Issue Creation**
   ```
   Run: create-test-issues.yml
   → Creates issues with proper templates and labels
   → Outputs: [101, 102, 103, 104, 105]
   ```

2. **Manual Categorization**
   - Review created issues
   - Determine dependencies
   - Group by stage (parallel vs sequential)

3. **Orchestration**
   ```
   Run: orchestrate-tests.yml
   → Assigns @copilot to issues
   → Waits for completion
   → Processes in stages
   ```

4. **Agent Execution**
   - @copilot automatically works on assigned issues
   - Creates PRs with test implementations
   - Closes issues when complete

## Issue Templates

Issues are created following templates from `.github/instructions/`:

### Unit Tests
- **Title**: `[Unit Tests] <file-path>`
- **Labels**: `testing`, `unit-tests`
- **Requirements**: Vitest/Jest, ≥80% coverage, AAA pattern

### Smoke Tests
- **Title**: `[Smoke Tests] <component>`
- **Labels**: `testing`, `smoke-tests`
- **Requirements**: Fast execution (<5s), no crashes

### Integration Tests
- **Title**: `[Integration Tests] <feature>`
- **Labels**: `testing`, `integration-tests`
- **Requirements**: Multi-module validation, API mocking

## Tips

1. **Start Small**: Create issues for a single component first to test the workflow
2. **Check Dependencies**: Understand which tests need others to complete first
3. **Monitor Progress**: Watch the orchestration workflow logs for status
4. **Parallel Execution**: Maximize parallelism in stage 1 for faster completion
5. **Timeout Handling**: If issues take longer than 30 minutes, increase timeout in workflow

## Troubleshooting

**Issue: Workflow fails to assign @copilot**
- Ensure @copilot has access to the repository
- Check repository permissions

**Issue: Stage doesn't start**
- Verify JSON array format is correct: `[1, 2, 3]`
- Ensure previous stage completed (check workflow logs)

**Issue: Timeout errors**
- Increase `maxWaitTime` in workflow file
- Check if issue is actually being worked on

## Example Commands

### Create unit tests for all components:
```
Workflow: create-test-issues.yml
test_type: unit
component: (empty)
auto_assign: true
```

### Create integration test for App.js:
```
Workflow: create-test-issues.yml
test_type: integration
component: src/App.js
auto_assign: false
```

### Orchestrate previously created issues:
```
Workflow: orchestrate-tests.yml
stage_1_issues: [19, 20, 21]
stage_2_issues: [22]
stage_3_issues: []
stage_4_issues: []
```

## Architecture

```
User → create-test-issues.yml → GitHub Issues
                                      ↓
User → orchestrate-tests.yml → Assign @copilot
                                      ↓
                               @copilot agent → Work on issue
                                      ↓
                                Create PR → Close issue
                                      ↓
                          Next stage starts automatically
```

## References

- Instructions: `.github/instructions/`
- Copilot workspace: `.github/copilot-instructions.md`
- Agent definition: `.github/agents/my-agent.md`
