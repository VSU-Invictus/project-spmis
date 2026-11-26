# Milestone 5 Playwright E2E Test Cases

These scenarios define the browser-level acceptance flows to automate in Milestone 5. They exercise the user-visible application against a disposable local Supabase stack; they are not substitutes for the Prism contract suite or database/RLS tests.

## Execution contract

- Start the app and local Supabase stack using the repository's documented development commands. Apply migrations and fixtures with `npx supabase db reset`.
- Use isolated, uniquely named test accounts and records for each run. Provision a pending faculty account, an admin, and active faculty accounts through the supported registration/auth flows. Never depend on shared production data or commit credentials.
- Sign in through the UI for each role; do not inject privileged tokens into the browser. Seed/setup helpers may create prerequisite records through test-only setup, but all behavior under test must use the UI.
- Prefer accessible roles, labels, and names in Playwright locators. Assert user-visible success/error states and persisted state after navigation or reload, not implementation details or transient toast text alone.
- Clean up records created by the run, or use a unique test namespace so the suite is repeatable. Capture traces/screenshots on failure without recording secrets or student personal data.

## Role and coverage matrix

| Role | Core coverage |
|---|---|
| Pending Faculty | Self-registration, pending status, and access restrictions until approved |
| Admin | Review/approve faculty applications; manage taxonomy and students; verify audit history |
| Active Faculty | Search/mining of students and reviews; author, edit, hide, and unhide owned reviews; ask the chatbot and recover from rate limiting |

## E2E-PENDING-01 — Faculty self-registration and pending access

**Preconditions:** A unique email address is available; an approved department exists.

1. Open the faculty registration screen and submit a valid name, email, password, and department.
2. Verify registration succeeds and the application enters the pending state (including the expected confirmation or pending-approval screen).
3. Sign in as the new account if the flow permits it. Verify the account is identified as pending and cannot access active-faculty actions such as student mining, review authoring, or chat.
4. Verify the account cannot access admin-only pages or actions.

**Pass criteria:** One pending faculty application/profile is created; no active-faculty capability is granted before an admin decision; the UI presents a clear pending state rather than a false success for restricted actions.

## E2E-ADMIN-01 — Admin approves a pending faculty application

**Preconditions:** E2E-PENDING-01 has created a pending account; an admin account can sign in.

1. Sign in as Admin and open the faculty/application approval queue.
2. Locate the new applicant by its unique email, inspect the displayed submission, and approve it.
3. Verify the queue item is no longer pending and is shown as approved.
4. Sign out and sign in as the applicant. Reload the page and verify the account now has Active Faculty access, including student search.

**Pass criteria:** The decision is persisted and reflected on reload; only the selected account changes status; the newly approved faculty can perform an authorized faculty action.

## E2E-FACULTY-01 — Active Faculty mines student and review information

**Preconditions:** An active faculty account and a student fixture with at least one active, visible review are available.

1. Sign in as Active Faculty and open the student directory/search.
2. Search by a unique student fixture identifier and verify the matching result and profile details are displayed.
3. Open the student detail/mining view and verify only authorized student/review information is rendered.
4. Search for a student with no matching visible reviews and verify the UI shows an empty state without exposing hidden or deleted review content.

**Pass criteria:** Search results correspond to the query; visible active-review content can be used in the faculty workflow; hidden/deleted content is not shown to a non-owner.

## E2E-FACULTY-02 — Author, edit, and hide an owned review

**Preconditions:** Active Faculty is approved; a searchable student is available.

1. Open the student profile, start a review, and submit valid review text within the 500-word limit. Add tags if supported by the form.
2. Verify the new review appears in the author's view and is visible in the expected active-review context.
3. Edit the review text and tags, save, reload, and verify the updated content persists. Where revision history is exposed, verify the prior version is retained.
4. Hide the review and verify it is removed from normal mining/search results while remaining identifiable as hidden to its author.
5. If the UI supports unhide, unhide it and verify it returns to active results. Otherwise, verify the hidden state remains after reload.

**Pass criteria:** Create/edit/status transitions persist; ownership controls the edit/hide actions; hidden reviews are not surfaced to other faculty or chatbot retrieval.

## E2E-FACULTY-03 — UI validation and server-side bypass defenses

**Preconditions:** Active Faculty is signed in; a valid student is available.

1. Submit an empty review and a review over 500 words through the UI. Verify the form prevents each invalid submission and associates a useful validation message with the review field.
2. In the API-level validation test (separate from this UI case), send the same invalid body directly to the Edge Function and verify the server rejects it with `422`. Do not treat the browser validation as server validation.

**Pass criteria:** Invalid UI submissions do not create reviews; server validation is independently covered by the Lesson 4.4 Postman demo and API tests.

## E2E-CHAT-01 — Chat query, rate limit, and retry

**Preconditions:** Active Faculty can see one or more active reviews; the test environment can deterministically produce a `429` (for example, through an API mock/intercept scoped to this test).

1. Ask a grounded question about available review information and verify an assistant response is rendered.
2. Trigger a `429` response for the next query. Verify a clear rate-limit message appears, the composer remains usable, and no success-shaped answer is shown for the failed request.
3. Release the deterministic throttle/mock and retry. Verify a successful response is rendered and the prior failed attempt did not corrupt conversation history.

**Pass criteria:** Successful responses are usable; `429` is surfaced as a recoverable error; retry succeeds without duplicate or stale responses.

## E2E-ADMIN-02 — Taxonomy CRUD

**Preconditions:** Admin is signed in; a unique department and program name can be created.

1. Create a department and verify it appears in the taxonomy list after reload.
2. Rename the department and verify the updated name persists.
3. Create a program under the department, verify it appears, then update it and verify persistence.
4. Delete the program and department if no dependent records remain. Verify each disappears from the list and the UI presents a clear conflict if deletion is correctly blocked by dependencies.
5. As Faculty, verify admin-only taxonomy mutations are unavailable/forbidden while approved taxonomy reads remain available.

**Pass criteria:** Admin CRUD changes persist; validation/conflict states are understandable; faculty cannot mutate admin taxonomy.

## E2E-ADMIN-03 — Student CRUD and audit verification

**Preconditions:** Admin is signed in; an approved program exists; the test uses unique student identifiers.

1. Create a student with a unique student ID number, name, and program.
2. Search for the student and verify the saved fields.
3. Update a non-key student field and verify the update persists after reload.
4. If deletion is supported by the product workflow, delete the test student; otherwise record the intended lifecycle action and verify the record remains unchanged.
5. Open the admin audit log and filter for the test student's entity/action. Verify create and update events are present with the Admin actor and timestamps.
6. Verify audit event metadata is content-free and does not expose review text, credentials, or unnecessary student personal data.

**Pass criteria:** Student changes persist; audit events accurately reflect the actions; audit data does not contain protected content.

## E2E-ADMIN-04 — Reject requires a reason

**Preconditions:** A pending application exists; Admin is signed in.

1. Attempt to reject the application without a reason. Verify UI validation blocks submission and explains the required field.
2. Supply a nonblank reason and submit. Verify the item is rejected and the reason is visible in the appropriate admin/application detail.

**Pass criteria:** A blank-reason rejection is not persisted; the valid rejection and reason persist together.
