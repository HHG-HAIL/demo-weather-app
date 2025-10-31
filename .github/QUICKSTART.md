# Quick Start Guide - Agent System

This guide will help you get started with the automated agent system for test creation and management.

## What is the Agent System?

The agent system automates the creation and assignment of testing tasks through GitHub issues and workflows. Instead of manually writing tests, you:

1. Create issues describing what tests are needed
2. Let the system organize and assign them to Copilot
3. Watch as tests are automatically implemented

## Prerequisites

- Access to the repository's GitHub Actions
- Understanding of the codebase structure
- Basic knowledge of GitHub issues

## Step-by-Step Tutorial

### Tutorial 1: Create Unit Tests for a Single Component

**Goal**: Add unit tests for `src/App.js`

#### Step 1: Navigate to Workflows

1. Go to the repository on GitHub
2. Click the **Actions** tab
3. Find **Create Test Issues** in the left sidebar

#### Step 2: Run the Workflow

1. Click **Create Test Issues**
2. Click **Run workflow** button (top right)
3. Fill in the form:
   ```
   test_type: unit
   component: src/App.js
   auto_assign: true
   ```
4. Click **Run workflow**

#### Step 3: Monitor

The workflow will:
- ✅ Create a new issue: `[Unit Tests] src/App.js`
- ✅ Apply labels: `testing`, `unit-tests`
- ✅ Assign to @copilot (because auto_assign was true)
- ✅ Output the issue number (e.g., #101)

#### Step 4: Wait for Completion

The Copilot agent will:
- Analyze the component
- Create appropriate unit tests
- Open a PR with test implementation
- Close the issue when done

**That's it!** You've automated test creation for a single component.

---

### Tutorial 2: Create Tests for Multiple Components with Orchestration

**Goal**: Add unit tests for all components, then smoke tests

#### Step 1: Create All Unit Test Issues

1. Go to **Actions** → **Create Test Issues**
2. Run workflow with:
   ```
   test_type: unit
   component: (leave empty for all files)
   auto_assign: false  (we'll orchestrate instead)
   ```
3. Note the issue numbers created (e.g., `[101, 102, 103]`)

#### Step 2: Create Smoke Test Issues

1. Run **Create Test Issues** again with:
   ```
   test_type: smoke
   component: (leave empty)
   auto_assign: false
   ```
2. Note these issue numbers too (e.g., `[104, 105]`)

#### Step 3: Plan the Orchestration

Decide the execution stages:
- **Stage 1**: All unit tests can run in parallel → `[101, 102, 103]`
- **Stage 2**: Smoke tests need unit tests done → `[104, 105]`
- **Stage 3**: None needed → `[]`
- **Stage 4**: None needed → `[]`

#### Step 4: Run Orchestration

1. Go to **Actions** → **Orchestrate Test Issues**
2. Click **Run workflow**
3. Fill in:
   ```
   stage_1_issues: [101, 102, 103]
   stage_2_issues: [104, 105]
   stage_3_issues: []
   stage_4_issues: []
   ```
4. Click **Run workflow**

#### Step 5: Watch It Work

The orchestration will:
1. ✅ Assign @copilot to issues 101, 102, 103 (Stage 1)
2. ⏳ Wait for all Stage 1 issues to close
3. ✅ Assign @copilot to issues 104, 105 (Stage 2)
4. ⏳ Wait for Stage 2 issues to close
5. ✅ Complete with summary

**Result**: All tests created in proper dependency order!

---

### Tutorial 3: Comprehensive Testing Pipeline

**Goal**: Add unit, smoke, and integration tests for the entire app

#### Quick Method: Use "all" Test Type

1. Go to **Actions** → **Create Test Issues**
2. Run workflow:
   ```
   test_type: all
   component: (empty)
   auto_assign: false
   ```
3. This creates unit, smoke, AND integration tests for all components!

#### Organize by Type

Let's say it created:
- Unit tests: `[201, 202, 203]`
- Smoke tests: `[204, 205]`
- Integration tests: `[206]`

#### Orchestrate Smart Execution

```
stage_1_issues: [201, 202, 203]     # Unit tests first (parallel)
stage_2_issues: [204, 205]          # Smoke tests second (parallel)
stage_3_issues: [206]               # Integration test last
stage_4_issues: []
```

Run the orchestration workflow with these values.

---

## Common Scenarios

### Scenario: Quick Test for One File

**Fastest approach:**

```yaml
Workflow: create-test-issues.yml
test_type: unit
component: src/Alert.jsx
auto_assign: true  # ← Key: Auto-assign for immediate processing
```

No orchestration needed - issue is immediately assigned and worked on.

---

### Scenario: Add Tests to New Feature

**Approach:**

1. Create integration test issue for the feature
2. Create unit tests for new components
3. Orchestrate with integration test in stage 2

```yaml
# First, create issues:
- Run create-test-issues for unit (component: src/NewFeature.js)
- Run create-test-issues for integration (component: src/NewFeature.js)

# Then orchestrate:
stage_1_issues: [301]  # Unit test
stage_2_issues: [302]  # Integration test (needs unit test done)
stage_3_issues: []
stage_4_issues: []
```

---

### Scenario: Batch Testing After Refactor

**Approach:**

1. Create all test types for affected files
2. Run everything in parallel (if tests are independent)

```yaml
# Create issues for all affected files
Workflow: create-test-issues.yml
test_type: all
component: (empty or specific files)
auto_assign: false

# Orchestrate with everything in stage 1 (all parallel)
stage_1_issues: [401, 402, 403, 404, 405, 406]
stage_2_issues: []
stage_3_issues: []
stage_4_issues: []
```

---

## Tips for Success

### ✅ Do's

- **Start small**: Test with one component before scaling
- **Check results**: Review the first PR from Copilot before creating many issues
- **Use auto-assign**: For urgent single-file tests
- **Use orchestration**: For coordinated multi-file testing
- **Plan stages**: Think about dependencies before orchestrating
- **Monitor progress**: Watch workflow logs to catch issues early

### ❌ Don'ts

- **Don't rush**: Review the first few agent-created tests
- **Don't skip planning**: Random orchestration wastes time
- **Don't create duplicates**: Check existing issues first
- **Don't over-complicate**: Keep stages simple and logical
- **Don't ignore errors**: Check workflow logs if something fails

---

## Troubleshooting

### Problem: Workflow fails immediately

**Check**:
- Repository permissions (Settings → Actions → General)
- Workflow file syntax (should be valid YAML)
- GitHub token permissions

**Solution**: Ensure `issues: write` permission is enabled

---

### Problem: Issues created but not assigned

**Check**:
- Is @copilot a collaborator?
- Did you set `auto_assign: true`?
- Or did you run orchestration workflow?

**Solution**: Manually assign or re-run orchestration

---

### Problem: Orchestration stuck on one issue

**Check**:
- Is the issue actually being worked on by Copilot?
- Has it been more than 30 minutes?

**Solution**: 
- Check issue for activity/PR
- Manually close if stuck
- Restart orchestration workflow

---

## Next Steps

Once you're comfortable with the basics:

1. **Read detailed docs**: Check `.github/AGENT_SYSTEM.md`
2. **Customize templates**: Edit `.github/instructions/*.md`
3. **Adjust timeouts**: Modify workflows for your needs
4. **Add test types**: Extend the system with new test categories

---

## Example Workflow Session

Here's what a real session looks like:

```bash
10:00 AM - Developer: "I need tests for the weather app"
10:01 AM - Run create-test-issues (test_type: all, auto_assign: false)
10:02 AM - Issues created: [101, 102, 103, 104, 105, 106]
10:05 AM - Plan stages:
           Stage 1: [101, 102, 103] - Unit tests (parallel)
           Stage 2: [104, 105] - Smoke tests (parallel)
           Stage 3: [106] - Integration test
10:06 AM - Run orchestrate-tests with above stages
10:07 AM - Stage 1 starts: Issues 101, 102, 103 assigned to @copilot
10:15 AM - Stage 1 complete: All PRs created
10:16 AM - Stage 2 starts: Issues 104, 105 assigned
10:20 AM - Stage 2 complete: PRs created
10:21 AM - Stage 3 starts: Issue 106 assigned
10:25 AM - Stage 3 complete: PR created
10:26 AM - Orchestration complete! ✅
10:30 AM - Developer reviews PRs and merges
```

Total time: ~30 minutes for full test suite!

---

## Resources

- [Agent System Documentation](.github/AGENT_SYSTEM.md)
- [Workflow Reference](.github/workflows/README.md)
- [Copilot Instructions](.github/copilot-instructions.md)
- [Unit Test Instructions](.github/instructions/unit-tests.instructions.md)
- [Smoke Test Instructions](.github/instructions/smoke-tests.instructions.md)
- [Integration Test Instructions](.github/instructions/integration-tests.instructions.md)

---

**Ready to get started?** Go to Actions → Create Test Issues and try your first automated test creation!
