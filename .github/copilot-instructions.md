
# Copilot Workspace Instructions

This workspace uses multiple Copilot instruction files to guide GitHub issue creation for tasks. These files are located in `.github/instructions/` and are automatically applied based on file patterns and context.

**IMPORTANT:** When asked to generate tests or create features:
1. **DO NOT** create actual code
2. **DO NOT** assign issues to Copilot manually
3. **DO** create GitHub issues with detailed specifications
4. **DO** update `.github/workflows/orchestrate-tests.yml` with issue numbers
5. **DO** run the orchestration workflow to assign agents automatically

## Workflow

1. **Create Issues** - Generate detailed GitHub issues for each task
2. **Categorize** - Determine which issues can run in parallel vs sequentially
3. **Update Workflow** - Modify `.github/workflows/orchestrate-tests.yml` replacing:
   - `REPLACE_STAGE_1_ISSUES` with issues that can run in parallel (e.g., `[19, 20, 21]`)
   - `REPLACE_STAGE_2_ISSUES` with issues that need stage 1 done (e.g., `[23, 24]`)
   - `REPLACE_STAGE_3_ISSUES` with issues that need stage 2 done (e.g., `[22]`)
   - `REPLACE_STAGE_4_ISSUES` with final issues or `[]` if none
4. **Run Workflow** - Execute the orchestration workflow to assign agents and wait for completion

## Available Instruction Files

- **Unit tests:** `.github/instructions/unit-tests.instructions.md`
- **Smoke tests:** `.github/instructions/smoke-tests.instructions.md`
- **Integration tests:** `.github/instructions/integration-tests.instructions.md`

## Prompt Examples

- "Generate unit tests for `src/utils/math.ts`" → Creates issues + updates workflow + orchestrates
- "Create smoke tests for the Home page" → Creates issues + updates workflow + orchestrates
- "Add integration tests for the login flow" → Creates issues + updates workflow + orchestrates

Refer to the `.github/instructions/` folder for all available instruction files.
