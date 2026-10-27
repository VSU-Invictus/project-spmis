# SPMIS Contract Decision Log

This log records API decisions that require agreement across the frontend and backend teams. The OpenAPI contract remains the source of truth after a decision is approved.

## Issue #3 scope

The contract contains the 18 explicitly named operations, eight department/program
CRUD operations and one supporting review-history read: 27 operations in total.
Student browsing uses searchStudents. Faculty enrollment, admin profile
creation/removal, student removal and a separate directory read are outside this
PR. Their broader project requirements remain in the project README; removing
them from this PR does not change those requirements.

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

### Profile updates

`POST /rest/v1/rpc/update_own_profile` accepts only full_name and derives the
subject from the JWT. The table PATCH is admin-only. RLS controls rows;
column permissions/guarded functions or triggers enforce protected fields.
Faculty profile creation and removal are outside this issue's operation scope.

### Pending access

Pending users may read their own profile through getOwnProfile and their own
faculty_account application history through listApprovalQueueItems, including
rejection reasons. RLS must require both submitted_by=auth.uid() and
type=faculty_account for pending queue callers, regardless of client filters.
No other person's applications or non-faculty application types are visible.
This status-reading exception supports the required application outcome flow;
it grants no directory access or other faculty feature access.

### Counts, filters and native errors

Table queries use PostgREST operators and explicit filters, not a generic search
parameter. Count requests use Prefer: count=exact and Content-Range; pages can
return 200 or 206. The student-search RPC has nullable optional arguments with defaults;
limit/offset/order are result modifiers. Native table validation is documented
as 400, uniqueness/foreign keys as 409. Edge validation uses 422. Inaccessible
rows can be filtered out rather than returning 403; an empty update is not proof
of success. Public apikey plus the user's bearer token are required.

### Bulk decisions, removal and audit

Approval batches are all-or-nothing; any already-decided item rejects the batch.
Faculty approval may redirect a proposed department using department_assignments.
Removal rejects referenced program/department records rather
than cascading into reviews or audit history. Application decisions also create
persistent in-app outcome notifications. Notification read/acknowledgement
operations are outside Issue #3.

The audit actor_role snapshot is a proposed database addition required by the
mockup's role filter. Historical audit entries must not change when a user's
current role changes.

### Chat context

Chat is stateless: the request includes earlier user/assistant turns. Every turn
is untrusted and grants no data access. The backend must de-identify prompts and
history as well as retrieved reviews before calling the provider. Hidden/deleted
content cannot be re-authorized by replaying client history.

## Review considerations within Issue #3

### Review attachment metadata

Issue #3 requires attachment metadata in visible review reads. The internal
ReviewAttachment schema includes the Storage object key; public responses use
the separate closed ReviewAttachmentMetadata schema without that key. Metadata
visibility follows the parent review, including owner-only hidden content and
invisibility after deletion. The embedding and attachment database entities are
schema references, not client write endpoints.

Upload, signed-download and attachment-removal operations are outside this
issue. Including metadata does not add or approve those Storage workflows.

### Admin review access conflict

README §1 says admins never access review content, whereas §6 allows admin mining
and other wording discusses shared review visibility. This is not resolved by
OpenAPI tags. The draft preserves explicitly required admin search/chat mining
but excludes raw review/history reads pending the PM's decision. The final role
policy must be consistent across mining, direct reads and RLS.

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

Each operation named by Issue #3 now has its own operation ID. The read contract is:

| Operation | Method and path | Result |
| --- | --- | --- |
| `getStudentById` | `GET /rest/v1/rpc/get_student_by_id?p_student_id=<uuid>` | One visible StudentProfile object or null |
| `getOwnProfile` | `GET /rest/v1/rpc/get_own_profile` | Own FacultyProfile object or null |
| `searchStudents` | `GET /rest/v1/rpc/search_students` | Student browsing/search results with optional filters and pagination |
| `listFaculty` | `GET /rest/v1/faculty_profiles` | Array of profiles allowed by the caller's role and RLS |
| `listStudentReviews` | `GET /rest/v1/review_details` with `student_id=eq.<uuid>` | Array of visible reviews and attachment metadata |
| `listTags` | `GET /rest/v1/rpc/suggest_review_tags` | Distinct accessible active-review tags |

The dedicated detail RPCs are proposed STABLE, SECURITY INVOKER SQL functions returning scalar
jsonb, so their responses are objects/null rather than table-result arrays. `getStudentById`
accepts one required UUID argument without a PostgREST eq. prefix; it is available only to verified
faculty/admins and returns null for missing or inaccessible rows. `getOwnProfile` accepts no
arguments, derives the identity exclusively from auth.uid(), and permits pending users to read
their own status. A profile not yet provisioned returns null and grants no access.
Both functions must enforce the caller's grants/RLS and perform no writes. Their signatures and
response shapes must be implemented and tested in the backend phase and reviewed with this PR.

No exception for combined operation IDs is needed. The other issue-named operations use
`createStudentDirect`, `updateStudent`, `updateFacultyByAdmin`, `updateOwnProfile`,
`submitApplication`, `listApprovalQueueItems`, `listAuditLogs`, and the five required review,
chat and approval Edge Function IDs exactly as specified.

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
