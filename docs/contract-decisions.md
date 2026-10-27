# SPMIS Contract Decision Log

This log records API decisions that require agreement across the frontend and backend teams. The OpenAPI contract remains the source of truth after a decision is approved.

## Requirements confirmed by the README

### Review mutations use Edge Functions

Review creation, editing, and lifecycle changes use `/functions/v1/reviews` endpoints rather than direct PostgREST writes. These operations must keep de-identification and the review-embedding lifecycle atomic.

## Proposed API decisions for team review

These choices describe the draft; they are not approvals by the PM, backend lead,
or frontend team. No corresponding database views/functions exist yet.

### Review lifecycle requests use actions

The review-status endpoint accepts `hide`, `unhide`, or `delete`. It does not accept an arbitrary target status. This preserves the terminal nature of deleted reviews and allows invalid transitions to return `409 Conflict`.

The response is an ID/status acknowledgement. Deleting a review never returns its
content. Editing a deleted review also returns `409`.

### Student review-aware search uses a PostgREST RPC

Structured student search crosses students, reviews, tags, review owners, and owner departments. The contract exposes `GET /rest/v1/rpc/search_students` so the database can implement the joined search while applying RLS to the visible review corpus.

### Existing tag suggestions

The README and composer require suggestions without restricting free-form tags.
The proposed `GET /rest/v1/rpc/suggest_review_tags` supplies distinct normalized
tags from accessible active reviews only. It accepts a case-insensitive prefix
and returns rows shaped as `{ tag }` in lexical order. Hidden/deleted reviews
never contribute, even for their owner; no usage counts or author information
are returned. This RPC must be implemented and tested in the backend phase.

### Application submissions use typed payloads

Student-registration, program-proposal, and department-proposal submissions have separate payload schemas. A program proposal may include `program_id` to identify an edit request.

Queue responses are also discriminated by application type, including faculty
account payloads. Existing program/department edit IDs must be omitted for new
proposals, rather than set to null. Department edit support follows README §6 but
needs confirmation because the sitemap only mentions adding departments.

### Safe review read shape

`GET /rest/v1/review_details` is a proposed read-only, security-invoker view. It
joins normalized tags and a safe author name/department projection; it never
selects de-identified text or embeddings. The frontend cannot obtain that shape
from the base reviews table without joins. Review revisions additionally need
rich-document and tag snapshots, which are additions to the schema sketch.

The attribution projection needs its own permissions design: a security-invoker
view applies the caller's grants and underlying row policies. Joining directly
to private faculty profiles that the caller cannot read can suppress other
authors' reviews or their attribution. Use a separately permissioned projection
containing only the author identity/name and department required for attribution;
do not grant broad private-profile access to make the join work. Its database
implementation remains a backend task. Test with two different faculty identities
that active reviews retain author names/departments, own hidden reviews remain
readable, and other users' hidden/deleted content and private emails stay blocked.

### Review document and limits

Review create/edit requests send a `body_document` with paragraphs, bold/italic
text, lists and line breaks. The backend extracts `body_text`, validates the
allowed structure and escapes literal text on rendering. The existing mockup's
500-word limit applies to both creation and editing: extract plain text with
whitespace between blocks/list items, trim it, split on whitespace and count
nonempty tokens. Exactly 500 words passes; 501 words returns 422 with
REVIEW_WORD_LIMIT. OpenAPI's x-max-words documents this rule; the backend must
enforce it across the entire document. Proposed additional limits:
10,000 extracted review characters; 30 normalized tags of up to 50 characters;
chat message 2,000 characters, up to 20 history turns; 100 decisions per batch.
These numerical limits are draft implementation choices for review.

The additional numerical limits are proposals; the 500-word rule is taken from
the current mockup validation and must not be silently replaced by a character limit.

### License metadata

OpenAPI metadata uses All Rights Reserved and links to the README's existing
ownership/licensing terms. This does not introduce a separate educational license
or grant additional rights.

### Profile updates and enrollment

`POST /rest/v1/rpc/update_own_profile` accepts only full_name and derives the
subject from the JWT. The table PATCH is admin-only. RLS controls rows;
column permissions/guarded functions or triggers enforce protected fields.

`POST /functions/v1/registration` is proposed to complete Google-OAuth enrollment
with a name, existing department or inline department proposal, and mandatory
Terms acceptance. The function supplies identity/email from the JWT and creates
the pending profile/application/audit and Terms acceptance records atomically.
Terms acceptance needs a backend record not yet present in the schema sketch.
The Admin create-profile operation requires an existing auth.users UUID; it does
not provision Auth accounts. The handling of pending department proposals must
also reconcile the sketch's non-null faculty department_id constraint.

### Pending access

The draft allows pending users to read their own profile and their own
faculty_account application history through listApprovalQueueItems, including rejection
reasons. RLS must require both submitted_by=auth.uid() and type=faculty_account
for pending callers. A client filter cannot expand that scope. No other person's
applications or non-faculty application types are visible to them.

This narrow onboarding-status exception supports the README's requirement that
submitters receive a rejection reason. Reading approved department choices is a
separate proposed exception for onboarding that still requires team review.
Under that draft proposal, server policies limit pending callers to approved
department rows regardless of filters; they cannot read pending/rejected entries
or mutate the list. This is not an approved expansion of pending-user access.
No other faculty feature is available while pending.

### Faculty rejection and resubmission

Registration follows the README's terminal application lifecycle:

- First enrollment creates a pending application.
- A pending application blocks duplicates with 409 ENROLLMENT_PENDING.
- After rejection, corrected input creates a new application_id for the same
  faculty_id; the rejected record, decision reason and audit trail are retained.
- An active faculty/admin profile returns 409 ALREADY_ACTIVE and cannot use
  registration to reset its status or role.

Concurrent requests must not create more than one pending faculty-account
application for the same identity. The database implementation must serialize or
uniquely constrain those submissions. Pending users display their decision/reason
from listApprovalQueueItems, then resubmit through completeFacultyRegistration.

### Counts, filters and native errors

Table queries use PostgREST operators and explicit filters, not a generic search
parameter. Count requests use Prefer: count=exact and Content-Range; pages can
return 200 or 206. The RPC has nullable optional search arguments with defaults;
limit/offset/order are result modifiers. Native table validation is documented
as 400, uniqueness/foreign keys as 409. Edge validation uses 422. Inaccessible
rows can be filtered out rather than returning 403; an empty update is not proof
of success. Public apikey plus the user's bearer token are required.

### Bulk decisions, removal and audit

Approval batches are all-or-nothing; any already-decided item rejects the batch.
Faculty approval may redirect a proposed department using department_assignments.
Removal rejects referenced faculty/student/program/department records rather
than cascading into reviews or audit history. Application decisions also create
persistent in-app outcome notifications. Notification read/acknowledgement
operations remain unspecified if the indicator needs unread state.

The audit actor_role snapshot is a proposed database addition required by the
mockup's role filter. Historical audit entries must not change when a user's
current role changes.

### Chat context

Chat is stateless: the request includes earlier user/assistant turns. Every turn
is untrusted and grants no data access. The backend must de-identify prompts and
history as well as retrieved reviews before calling the provider. Hidden/deleted
content cannot be re-authorized by replaying client history.

## Decisions required before the contract is final

### Admin Add Faculty versus Auth identity provisioning

The mockup's Add Faculty form accepts name, email, department and role, but
createFacultyProfile requires the UUID of an existing Supabase Auth identity.
No identity-selection or provisioning flow is specified. This operation creates
only the application profile; it cannot create a valid Auth identity from an
invented UUID or an email string.

Norman must decide whether Add Faculty selects an existing identity through a
controlled workflow, or whether a separate approved provisioning operation is
needed. Until then the current create-profile operation is limited to existing
identities, and the mockup's email-only add flow is not covered end-to-end.

### AI review summary

The student-detail mockup and README require an AI-generated summary of visible reviews, but the README's required Edge Function table does not name a summary operation.

Decision needed:

- Add a dedicated summary operation, such as `POST /functions/v1/students/{id}/summary`; or
- Include summary generation in another explicitly approved operation.

The selected design must preserve caller-specific visibility, especially the rule that a summary containing an owner's hidden review must never be returned to another user.

### Review attachments

Issue #3 requires visible review reads to include attachment metadata. The internal `ReviewAttachment`
schema records the database entity including its Storage object key. Public review responses reference
a separate closed `ReviewAttachmentMetadata` schema that excludes the object key entirely, including
from generated response types and examples. This avoids relying on writeOnly annotations to redact
the internal field.
Upload, signed-download and removal operations are still not specified.

Decision needed:

- Define the v1 upload, signed-download and removal operations; or
- Explicitly defer attachment mutations and downloads from the Milestone 2 API contract while
  retaining the required metadata schema.

Any approved design must enforce the parent review's visibility and deletion rules independently in Supabase Storage.

### Admin review access conflict

README §1 says admins never access review content, whereas §6 allows admin mining
and other wording discusses shared review visibility. This is not resolved by
OpenAPI tags. The draft preserves explicitly required admin search/chat mining
but excludes raw review/history reads pending the PM's decision. The final role
policy must be consistent across mining, summary, direct reads and RLS.

### Supabase gateway errors

The shared four-field Error is the application/PostgREST shape. Supabase Auth or
API gateway failures may have another shape before an Edge Function runs. The
future typed client must normalize those into the shared error handling path.
Normalizing a body must retain its original HTTP status.

## Validation boundaries

### Optional defaults in generated types

Type generation and freshness checking both pass `--default-non-nullable=false`.
This keeps optional fields with defaults optional in TypeScript, including
rich-text bold/italic flags and first-message chat history. Backend defaults
remain documented in the YAML; a default does not require callers to supply a
value. Generator options must stay identical in both commands.

### Issue 3 operation mapping

The operation IDs now match Issue #3 wherever a requested operation has its own method/path.
The following table records all eight names that previously differed:

| Issue #3 name | Current operation or query | Previous operation ID |
| --- | --- | --- |
| `getStudentById` | `listStudentProfiles` with `id=eq.<uuid>`; returns a zero-or-one-element array | `listStudentProfiles` |
| `createStudentDirect` | `createStudentDirect` | `createStudent` |
| `listStudentReviews` | `listStudentReviews` with `student_id=eq.<uuid>` | `listReviews` |
| `listTags` | `listTags`, using the existing tag-suggestion RPC and optional prefix | `suggestReviewTags` |
| `getOwnProfile` | `listFaculty` with `id=eq.<JWT subject>`; server policies restrict non-admin callers to their own row | `listFacultyProfiles` |
| `listFaculty` | `listFaculty`, admin directory listing | `listFacultyProfiles` |
| `updateFacultyByAdmin` | `updateFacultyByAdmin` | `updateFacultyProfile` |
| `listApprovalQueueItems` | `listApprovalQueueItems` | `listApplications` |

Reviewer decision remains required for the two combined reads: `getStudentById` and `getOwnProfile`
do not have separate operation IDs in this draft. OpenAPI permits only one GET operation per path;
query filters cannot define a second operation on the same table path. Reviewers must accept the
combined reads or agree on dedicated view/RPC endpoints before Issue #3 is considered fully resolved.
No acceptance of these mappings is implied by this document.

Review reads include visible attachment metadata; history is read through `listReviewRevisions`
with `review_id=eq.<uuid>`. `listTags` returns distinct tags only from accessible active reviews.
`ReviewEmbedding` and the full `ReviewAttachment` entity remain internal and are not referenced
by any client operation. Public OAuth operations are handled by Supabase Auth SDK, so none of the
declared application operations is public or needs `security: []`.

Contract lint checks OpenAPI structure and references. Type generation checks
that the document produces TypeScript. Neither proves backend behavior, RLS,
atomic database transactions, Storage visibility, or AI de-identification.

The current contract:check validates lint and generated-type freshness only.
Live PostgREST drift comparison must be implemented once migrations/backend
exist; the command explicitly reports that it is not checking live drift.
