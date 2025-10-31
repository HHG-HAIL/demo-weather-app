# .github Directory Index

This directory contains the complete agent system infrastructure for automated test creation and management.

## 📚 Documentation

Start here to understand the system:

1. **[QUICKSTART.md](QUICKSTART.md)** ⭐ **START HERE**
   - Step-by-step tutorials
   - Quick examples
   - Common scenarios
   - Troubleshooting tips

2. **[AGENT_SYSTEM.md](AGENT_SYSTEM.md)**
   - Complete system overview
   - Architecture diagrams
   - Best practices
   - Advanced configuration

3. **[workflows/README.md](workflows/README.md)**
   - Workflow-specific documentation
   - Parameter reference
   - Usage examples
   - Tips and tricks

4. **[copilot-instructions.md](copilot-instructions.md)**
   - Main Copilot workspace instructions
   - Workflow process overview
   - Key principles

## 🤖 Agents

Agent definitions that automate tasks:

- **[agents/my-agent.md](agents/my-agent.md)**
  - Lightweight automation helper
  - Creates issues on repository events
  - Automatically assigns Copilot agent

## 📋 Instructions

Templates and rules for different test types:

- **[instructions/unit-tests.instructions.md](instructions/unit-tests.instructions.md)**
  - Unit test issue templates
  - Requirements and format
  
- **[instructions/smoke-tests.instructions.md](instructions/smoke-tests.instructions.md)**
  - Smoke test issue templates
  - Fast execution requirements
  
- **[instructions/integration-tests.instructions.md](instructions/integration-tests.instructions.md)**
  - Integration test templates
  - Multi-module testing guidelines

## ⚙️ Workflows

Automated workflows that power the system:

- **[workflows/create-test-issues.yml](workflows/create-test-issues.yml)**
  - Creates GitHub issues for testing tasks
  - Supports unit, smoke, integration, or all types
  - Can target specific components or entire codebase
  - Optional auto-assignment to Copilot

- **[workflows/orchestrate-tests.yml](workflows/orchestrate-tests.yml)**
  - Manages staged execution of test issues
  - Handles dependencies between issues
  - Processes issues in parallel within stages
  - Waits for completion before proceeding

## 🚀 Quick Reference

### I want to...

| Goal | Action |
|------|--------|
| **Learn the system** | Read [QUICKSTART.md](QUICKSTART.md) |
| **Create tests for one file** | Run `create-test-issues.yml` with `auto_assign: true` |
| **Create tests for all files** | Run `create-test-issues.yml` with `component: (empty)` |
| **Organize test execution** | Run `orchestrate-tests.yml` with staged issues |
| **Understand architecture** | Read [AGENT_SYSTEM.md](AGENT_SYSTEM.md) |
| **Troubleshoot issues** | Check workflow logs and [QUICKSTART.md](QUICKSTART.md) troubleshooting |
| **Customize templates** | Edit files in `instructions/` |
| **Add new test type** | Create new file in `instructions/` and update workflows |

## 📊 System Flow

```
Developer Need
      ↓
Create Test Issues (Workflow)
      ↓
GitHub Issues Created
      ↓
Orchestrate Tests (Workflow)
      ↓
Issues Assigned to @copilot
      ↓
Agent Implements Tests
      ↓
PRs Created & Merged
      ↓
Tests Deployed ✅
```

## 🎯 Example Usage

### Quick Test Creation
```yaml
Workflow: create-test-issues.yml
test_type: unit
component: src/App.js
auto_assign: true
```

### Batch Testing with Orchestration
```yaml
Step 1: create-test-issues.yml
  test_type: all
  component: (empty)
  auto_assign: false

Step 2: orchestrate-tests.yml
  stage_1_issues: [101, 102, 103]
  stage_2_issues: [104, 105]
  stage_3_issues: [106]
  stage_4_issues: []
```

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `copilot-instructions.md` | Main Copilot behavior rules |
| `instructions/*.md` | Issue templates for each test type |
| `agents/my-agent.md` | Agent behavior definition |
| `workflows/*.yml` | Automated workflow definitions |

## 📝 File Structure

```
.github/
├── INDEX.md                          # This file
├── QUICKSTART.md                     # Quick start guide
├── AGENT_SYSTEM.md                   # System documentation
├── copilot-instructions.md           # Copilot rules
├── agents/
│   └── my-agent.md                   # Agent definition
├── instructions/
│   ├── unit-tests.instructions.md    # Unit test templates
│   ├── smoke-tests.instructions.md   # Smoke test templates
│   └── integration-tests.instructions.md  # Integration templates
├── prompts/
│   └── run-tests.prompt.md           # Test execution prompts
└── workflows/
    ├── README.md                     # Workflow documentation
    ├── create-test-issues.yml        # Issue creation workflow
    └── orchestrate-tests.yml         # Orchestration workflow
```

## 💡 Tips

1. **New to the system?** Start with [QUICKSTART.md](QUICKSTART.md)
2. **Need details?** Check [AGENT_SYSTEM.md](AGENT_SYSTEM.md)
3. **Workflow issues?** See [workflows/README.md](workflows/README.md)
4. **Stuck?** Check troubleshooting sections in documentation

## 🔗 Related Files

- **[../README.md](../README.md)** - Project README with agent system overview
- **[../package.json](../package.json)** - Project dependencies and scripts

## 📞 Support

For questions or issues:
1. Check relevant documentation above
2. Review workflow logs in GitHub Actions
3. Check issue templates in `instructions/`
4. Review agent definition in `agents/`

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-31  
**Maintained By**: Agent System
