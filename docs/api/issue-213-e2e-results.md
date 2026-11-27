# Issue #213 — Manual faculty self-registration E2E

## Execution context

- Date: 2026-11-27 (Asia/Manila).
- Scenario: E2E-PENDING-01, followed by admin approval and active faculty access.
- Environment: disposable local Supabase, Mode B, Docker, frontend at `http://localhost:5173`.
- Testing branch: `test/213-onboarding-e2e`, combining `origin/feat/m4-frontend` and `fix/213-faculty-onboarding` in an isolated worktree (merge `fda0e7f`).
- Integration prerequisite: a candidate `FacultyOnboardingForm` was connected to `PendingVerificationPage` in the testing checkout. These frontend changes are not part of the backend branch or evidence that the frontend milestone already integrates the new endpoints.
- The operator signed in through Google in the browser. No password, token, OAuth credential, or account email is recorded here.
- Faculty name used for application data: `Synthetic E2E Faculty`. Department: seeded `Example Computing`.
- An independent synthetic local admin was provisioned through Studio's supported Auth UI and linked to an active admin profile solely as test setup. The applicant's profile and application were not manually created or activated in Studio.

## Manual test and observed results

| Step | Action | Expected | Observed |
| --- | --- | --- | --- |
| 1 | Open signup and complete Google OAuth with an account without a local faculty profile. | Authenticated user can complete onboarding. | Complete faculty registration form appeared. |
| 2 | Enter the synthetic faculty name, choose Example Computing, and submit for approval. | Backend creates a pending profile and faculty-account application. | Account Pending Verification appeared; the named profile was visible in local Studio. |
| 3 | Reload the pending page. | Pending status persists; the registration form does not reappear. | Operator confirmed persistence. |
| 4 | Visit `/faculty/students`, `/faculty/chat`, and `/admin/applications` as the pending applicant. | Protected routes redirect to pending verification. | Operator confirmed all three redirects. These are route-guard observations; database/API permission assertions are covered separately by pgTAP and integration tests. |
| 5 | Sign in through the UI as the synthetic admin and open the Faculty Accounts queue. | New applicant is visible as pending with the selected department. | One Synthetic E2E Faculty entry appeared with Example Computing and Pending status. |
| 6 | Select only that applicant and approve through the admin UI; sign in again through Google as the applicant. | Account becomes active and routes to the faculty portal. | Faculty dashboard welcomed Synthetic E2E Faculty. |
| 7 | Open `/faculty/students` as the approved applicant. | Faculty can read the synthetic student roster. | TEST-001 / Example Student One and TEST-002 / Example Student Two loaded; page reported two results. |

## Result and limits

**PASS — manual self-registration → pending restrictions → admin approval → active faculty student access in the isolated integration checkout.**

The result is based on the operator's browser execution, supplied screenshots, and reported route redirects. It is not an automated Playwright result. It does not establish that unmodified `dev` or the frontend milestone already has the candidate onboarding form. Frontend integration must be coordinated separately before claiming the same behavior in a deployed application.

The initial local OAuth provider-disabled configuration was corrected by loading the existing server-side OAuth environment values and restarting the local stack; the public Auth settings then reported Google enabled. This required no production configuration changes.

Screenshots supplied during the run contain an account email and are not committed. Any PR evidence images must redact personal account details. Test identities remain local and are not seeded or deployed by this document.

## Reproduction

1. Combine the frontend milestone and backend issue branch in an isolated testing checkout and connect the candidate onboarding form.
2. Configure Mode B with public local Auth keys in the ignored frontend environment file, and load server-only OAuth values for the local stack. Enable the Google provider and its local callback configuration.
3. Start local Supabase, the Edge Functions, and Vite. Use existing approved synthetic departments and student fixtures.
4. Follow the seven steps above with a fresh Google identity in the local database and a separate synthetic admin session. Do not manually create, activate, or approve the applicant through Studio or SQL.
5. Keep credentials and personal account details out of committed fixtures, logs, and screenshots. Use a local reset when the test identities are no longer needed.
