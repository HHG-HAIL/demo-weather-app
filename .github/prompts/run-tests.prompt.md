Prompt instructions file:
Analyze the project structure and all instruction files in `.github/instructions/` and `.github/copilot-instructions.md`. 

STEPS:
1. **Create GitHub issues** for all required tests (unit, integration, smoke, etc.) based on project files and test standards. Each issue must include a clear title, detailed description, requirements, and acceptance criteria.

2. **Categorize issues** by dependency:
   - Stage 1: Independent issues that can run in parallel (e.g., unit tests for different files)
   - Stage 2: Issues that depend on Stage 1 being merged (e.g., integration tests)
   - Stage 3: Issues that depend on Stage 2 being merged (e.g., smoke tests)
   - Stage 4: Final issues or none

3. **Update workflow file** `.github/workflows/orchestrate-tests.yml`:
   - Replace `REPLACE_STAGE_1_ISSUES` with array of stage 1 issue numbers (e.g., `[19, 20, 21]`)
   - Replace `REPLACE_STAGE_2_ISSUES` with array of stage 2 issue numbers (e.g., `[23, 24]`)
   - Replace `REPLACE_STAGE_3_ISSUES` with array of stage 3 issue numbers (e.g., `[22]`)
   - Replace `REPLACE_STAGE_4_ISSUES` with array of stage 4 issue numbers or `[]` if none

4. **Commit and push** the updated workflow file

5. **Instruct user** to run the workflow: "Go to Actions → 'Copilot Task Orchestration' → Run workflow"

Do NOT assign issues to @copilot manually. Do NOT generate or run test code directly. The orchestration workflow handles agent assignment automatically.