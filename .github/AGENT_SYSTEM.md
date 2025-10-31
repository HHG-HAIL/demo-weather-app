# Agent System Documentation

## Overview

This repository uses an automated agent system to manage test creation and assignment. The system follows a workflow-based approach where GitHub issues are created for testing tasks and automatically assigned to the Copilot agent.

## System Components

### 1. Agent Definition (`agents/my-agent.md`)

Defines the behavior of the automation agent:
- Creates new issues when triggered by repository events
- Automatically assigns the Copilot agent to those issues
- Follows instructions from `.github/instructions/`

### 2. Instruction Files (`instructions/`)

Provides templates and rules for different types of testing:

- **`unit-tests.instructions.md`**: Rules for creating unit test issues
- **`smoke-tests.instructions.md`**: Rules for creating smoke test issues
- **`integration-tests.instructions.md`**: Rules for creating integration test issues

Each instruction file defines:
- Issue title format
- Issue body template
- Required labels
- Assignment rules

### 3. Copilot Instructions (`copilot-instructions.md`)

Main instructions for the Copilot workspace that define the overall workflow:

**Key Principles:**
- DO NOT create actual code directly
- DO create GitHub issues with detailed specifications
- DO update orchestration workflow with issue numbers
- DO run the orchestration workflow to assign agents automatically

### 4. Workflows (`workflows/`)

Two main workflows power the system:

#### `create-test-issues.yml`
- Creates GitHub issues based on codebase analysis
- Supports unit, smoke, integration, or all test types
- Can target specific components or process entire codebase
- Optional auto-assignment to @copilot

#### `orchestrate-tests.yml`
- Manages staged execution of test issues
- Handles dependencies between issues
- Processes issues in parallel within stages
- Waits for issue completion before proceeding to next stage

## Workflow Process

### Phase 1: Issue Creation

When you want to add tests to the codebase:

1. **Identify the need** (e.g., "need unit tests for App.js")
2. **Run create-test-issues workflow**:
   - Select test type (unit/smoke/integration)
   - Specify component (or leave blank for all)
   - Choose auto-assign option
3. **Issues are created** with proper templates and labels

### Phase 2: Categorization

After issues are created:

1. **Review issues** to understand dependencies
2. **Group by execution stage**:
   - **Stage 1**: Independent issues (can run in parallel)
   - **Stage 2**: Issues depending on stage 1
   - **Stage 3**: Issues depending on stage 2
   - **Stage 4**: Final stage issues (if needed)

### Phase 3: Orchestration

Execute the orchestration workflow:

1. **Open orchestrate-tests workflow**
2. **Input issue numbers** in JSON array format:
   ```
   stage_1_issues: [19, 20, 21]
   stage_2_issues: [22, 23]
   stage_3_issues: [24]
   stage_4_issues: []
   ```
3. **Run workflow** - it will:
   - Assign @copilot to each issue
   - Wait for issues to be completed
   - Process stages sequentially
   - Provide completion summary

### Phase 4: Agent Execution

The Copilot agent automatically:

1. Receives issue assignment notification
2. Analyzes issue requirements
3. Creates appropriate tests
4. Opens PR with test implementation
5. Closes issue when complete

## Usage Examples

### Example 1: Add Unit Tests for All Components

```yaml
# Step 1: Create issues
Workflow: create-test-issues.yml
Inputs:
  test_type: unit
  component: (empty)
  auto_assign: false

# Step 2: Review created issues
# Assume issues: [101, 102, 103, 104] were created

# Step 3: Orchestrate
Workflow: orchestrate-tests.yml
Inputs:
  stage_1_issues: [101, 102, 103, 104]
  stage_2_issues: []
  stage_3_issues: []
  stage_4_issues: []
```

### Example 2: Comprehensive Testing Pipeline

```yaml
# Step 1: Create all types of tests
Workflow: create-test-issues.yml
Inputs:
  test_type: all
  component: (empty)
  auto_assign: false

# Step 2: Organize by type
# Unit tests: [201, 202, 203] - Can run in parallel
# Smoke tests: [204, 205] - Need unit tests first
# Integration: [206] - Needs everything

# Step 3: Orchestrate in stages
Workflow: orchestrate-tests.yml
Inputs:
  stage_1_issues: [201, 202, 203]
  stage_2_issues: [204, 205]
  stage_3_issues: [206]
  stage_4_issues: []
```

### Example 3: Single Component Testing

```yaml
# Step 1: Create tests for specific component
Workflow: create-test-issues.yml
Inputs:
  test_type: unit
  component: src/App.js
  auto_assign: true  # Auto-assign for immediate processing

# Note: With auto_assign=true, no orchestration needed
# The issue is automatically assigned and processed
```

## Best Practices

### 1. Issue Organization

- **Keep issues focused**: One component/feature per issue
- **Clear descriptions**: Use templates to ensure consistency
- **Proper labeling**: Use standard labels (testing, unit-tests, etc.)
- **Track dependencies**: Document which tests depend on others

### 2. Orchestration Strategy

- **Maximize parallelism**: Group independent tasks in stage 1
- **Minimize stages**: Fewer stages = faster completion
- **Consider complexity**: Complex tests may need their own stage
- **Monitor timeouts**: Adjust if tests take longer than 30 minutes

### 3. Agent Interaction

- **Trust the agent**: Let @copilot work without micromanagement
- **Review PRs**: Check agent-created PRs before merging
- **Provide feedback**: Comment on issues if adjustments needed
- **Iterate**: Create follow-up issues for refinements

### 4. Workflow Efficiency

- **Start small**: Test with one component before scaling
- **Batch similar tasks**: Create all unit tests together
- **Use auto-assign**: For urgent or simple tasks
- **Manual assignment**: When you need control over timing

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Developer Action                      │
│  "I need tests for the weather app components"          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│             create-test-issues.yml                       │
│  • Analyzes codebase                                     │
│  • Creates issues from templates                         │
│  • Applies labels                                        │
│  • Optionally assigns @copilot                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              GitHub Issues Created                       │
│  #101 [Unit Tests] App.js                                │
│  #102 [Unit Tests] Alert.jsx                             │
│  #103 [Unit Tests] MapComponent.js                       │
│  #104 [Smoke Tests] App                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│        Developer Categorizes by Stage                    │
│  Stage 1: [101, 102, 103] - Independent                 │
│  Stage 2: [104] - Needs unit tests                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           orchestrate-tests.yml                          │
│  Stage 1: Process [101, 102, 103] in parallel           │
│    └→ Assign @copilot to each                           │
│    └→ Wait for completion                               │
│  Stage 2: Process [104] after stage 1                   │
│    └→ Assign @copilot                                   │
│    └→ Wait for completion                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              @copilot Agent Works                        │
│  • Analyzes issue requirements                           │
│  • Creates test files                                    │
│  • Opens PR with implementation                          │
│  • Closes issue on completion                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            Tests Implemented ✓                           │
│  • PRs ready for review                                  │
│  • Issues closed                                         │
│  • Test coverage increased                               │
└─────────────────────────────────────────────────────────┘
```

## Configuration

### Modifying Templates

To change how issues are created, edit the instruction files:

```bash
.github/instructions/unit-tests.instructions.md
.github/instructions/smoke-tests.instructions.md
.github/instructions/integration-tests.instructions.md
```

### Adjusting Timeouts

Edit `orchestrate-tests.yml` and change `maxWaitTime`:

```javascript
const maxWaitTime = 30 * 60 * 1000; // 30 minutes → adjust as needed
```

### Adding New Test Types

1. Create new instruction file in `.github/instructions/`
2. Update `create-test-issues.yml` to include new type
3. Add new option to `test_type` input
4. Implement issue creation logic

## Troubleshooting

### Issues Not Being Created

**Symptom**: Workflow runs but no issues appear

**Solutions**:
- Check workflow permissions (Settings → Actions → General)
- Verify GITHUB_TOKEN has `issues: write` permission
- Review workflow logs for errors

### Copilot Not Assigned

**Symptom**: Issues created but @copilot not assigned

**Solutions**:
- Ensure @copilot is a collaborator
- Check repository permissions
- Use manual assignment if auto-assignment fails

### Orchestration Stuck

**Symptom**: Workflow waits indefinitely for issue

**Solutions**:
- Check if issue is actually being worked on
- Manually close issue if it's stuck
- Increase timeout if needed
- Cancel and restart workflow

### Stage Dependencies Not Working

**Symptom**: Stages run out of order

**Solutions**:
- Verify JSON array format: `[1, 2, 3]` not `1, 2, 3`
- Check workflow syntax
- Ensure `needs:` relationships are correct

## Support

For issues or questions about the agent system:

1. Check workflow logs in Actions tab
2. Review this documentation
3. Check `.github/workflows/README.md` for workflow-specific help
4. Review instruction files for template details

## Future Enhancements

Potential improvements to the system:

- [ ] Add support for more test types (e2e, performance)
- [ ] Implement priority-based orchestration
- [ ] Add automatic retry on failure
- [ ] Create dashboard for tracking test coverage
- [ ] Integrate with CI/CD pipeline
- [ ] Add notification system for completion
- [ ] Support for parallel stage execution
- [ ] Dynamic timeout based on test complexity
