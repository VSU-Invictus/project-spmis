# Issue #153 Edge Functions

Issue #153 adds the three Supabase function entry points required by the
contract:

| Function | Contract operations |
|---|---|
| `reviews` | `createReview`, `updateReview`, `setReviewStatus` |
| `chat` | `askChatbot` |
| `approvals` | `decideApplications` |

## Local setup

```bash
supabase start
supabase db reset
supabase functions serve --env-file supabase/.env
```

Set `GEMINI_API_KEY` in the untracked `supabase/.env`. The key is read only by
the Edge Functions and is never placed in an `app/.env*` file.

## Security boundary

Each function creates a request-scoped Supabase client with the caller's
`Authorization` header. The database RPCs derive the actor from `auth.uid()`
and enforce the active faculty/admin role before performing their transaction.
The service-role client is used only for internal student-name lookup and
response assembly; it is never returned to the browser.

## AI privacy boundary

Review text is converted from the constrained rich-text document to plain text,
then student name variants are replaced with `{{STUDENT:<uuid>}}`. Only that
de-identified text is embedded or sent to Gemini. Chat responses are
reverse-substituted after Gemini returns and before the response reaches the
authorized caller.

## Validation

```bash
npm --prefix app run contract:lint
npm --prefix app run typecheck
npm --prefix app test
supabase db lint
deno cache --lock=deno.lock supabase/functions/**/*.test.ts
deno test --cached-only --lock=deno.lock --allow-env --deny-net supabase/functions/**/*.test.ts
```

`supabase db lint` and the Deno tests require the local Supabase/Deno tooling.
The Gemini tests use mocked responses. The test command runs cached-only with
network access denied, so it cannot call the Google API.
