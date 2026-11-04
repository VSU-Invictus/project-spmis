## Description
<!-- Describe what this PR changes or adds. -->
<!-- If this includes a breaking contract change, provide a migration note here. -->


## Linked Issues
<!-- Reference the issue(s) this PR addresses (e.g., "Closes #12")[cite: 2]. -->
Closes #

## Type of Change
<!-- Check the appropriate box using [x] -->
- [ ] `feat`: New feature
- [ ] `fix`: Bug fix
- [ ] `docs`: Documentation update
- [ ] `refactor`: Code refactoring without behavior change
- [ ] `test`: Adding or updating tests
- [ ] `contract!`: Breaking API contract change
- [ ] `chore`: Maintenance or tool configuration

## QA Testing Checklist
<!-- REQUIRED: Custom-write the steps QA needs to take to verify this PR -->
- [ ] Step 1: 
- [ ] Step 2: 

## Author Checklist
<!-- You must verify all of the following before requesting a review: -->
- [ ] **Target Branch:** My target branch is `dev` (not `main`).
- [ ] **Issue Linked:** This PR is directly linked to an approved issue.
- [ ] **Conventional Commits:** My commit messages follow the `type(scope): description` format.
- [ ] **No Real Data (Privacy):** I verify there is absolutely NO real student information, secret keys (e.g., `GEMINI_API_KEY`), or raw review content in this code, fixtures, or logs.
- [ ] **Tests Included:** I have included unit, component, or E2E tests for this feature, or explicitly linked to a QA test PR.
- [ ] **Contract Sync:** If I changed a database schema or endpoint, I also updated `contract/openapi.yaml` in this same PR.

## Reviewer Guidelines
<!-- Reviewers: Do not approve based on style alone. Please verify: -->
- **Correctness & Tests:** Does the code meet the Acceptance Criteria and include appropriate tests?
- **Authorization:** Are RLS policies or Edge Function checks enforcing who can do this action?
- **Data Exposure:** Is there any risk of raw review text or PII leaking to the browser or the AI provider?
