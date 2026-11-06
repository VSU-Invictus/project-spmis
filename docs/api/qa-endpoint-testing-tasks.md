# [Milestone 2] QA: Test & Document Endpoints via Prism

**Project:** VSU-Invictus / project-spmis
**Team:** QA
**QA Lead:** @reeseBan
**Members:** @Zaming, @dollyraexe, @reeseBan, @AzrielKaye
**Contract:** `contract/openapi.yaml`
**Output:** `docs/api/faculty-admin-api-tests.md`

---

## 1. Objective

Run the Prism mock backend from `contract/openapi.yaml`, test every endpoint in each member's domain scope (happy paths plus error/role codes), and document the requests and actual responses in `docs/api/faculy-admin-api-tests.md`. Report and resolve any contract mismatches found.

---

## 2. Branching Strategy

One parent QA branch, with one sub-branch per member. Sub-branches are merged into the parent branch through PRs, and the parent branch is merged into `feat/open-api` once everything is reviewed.

```
feat/open-api
 └── qa/api-testing/base            <- parent QA branch
      ├── qa/api-testing/Zaming
      ├── qa/api-testing/dollyraexe
      ├── qa/api-testing/reeseBan
      └── qa/api-testing/AzrielKaye
```

> Git cannot have both `qa/api-testing` and `qa/api-testing/<name>` as branches (ref name conflict), so the parent is named `qa/api-testing/base`.

**Setup commands**

```bash
# Lead creates the parent branch once
git checkout dev && git pull origin dev
git checkout -b qa/api-testing/base
git push -u origin qa/api-testing/base

# Each member creates their own sub-branch off the parent
git fetch origin
git checkout -b qa/api-testing/<yourname> origin/qa/api-testing/base
git push -u origin qa/api-testing/<yourname>
```

**PR flow**

1. Member commits their doc on their sub-branch.
2. Member opens a PR: `qa/api-testing/<name>` -> `qa/api-testing/base`.
3. QA Lead (or another member) reviews against the checklist in section 6.
4. After all four are merged, the Lead opens a PR: `qa/api-testing/base` -> `feat/open-api`.

---

## 3. Division of Tasks

> Fill in the domain scopes from the endpoint list Prism prints on startup (or the tags in `openapi.yaml`).

| Member | Sub-branch | Domain Scope | Doc File | Status |
|---|---|---|---|---|
| @Zaming | `qa/api-testing/Zaming` | `GET` `/rest/v1/rpc/get_student_by_id` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished |
| @Zaming | `qa/api-testing/Zaming` | `GET` `/rest/v1/rpc/get_own_profile` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished |
| @Zaming | `qa/api-testing/Zaming` | `GET` `/rest/v1/faculty_profiles` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished |
| @Zaming | `qa/api-testing/Zaming` | `PATCH` `/rest/v1/faculty_profiles` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished |
| @Zaming | `qa/api-testing/Zaming` | `GET` `/rest/v1/rpc/suggest_review_tags` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished |
| @Zaming | `qa/api-testing/Zaming` | `GET` `/rest/v1/rpc/search_students` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished |
| @Zaming | `qa/api-testing/Zaming` | `POST` `/rest/v1/student_profiles` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished |
| @AzrielKaye | `qa/api-testing/AzrielKaye` | `PATCH` `/rest/v1/student_profiles` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished|
| @AzrielKaye | `qa/api-testing/AzrielKaye` | `GET` `/rest/v1/departments` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished|
| @AzrielKaye | `qa/api-testing/AzrielKaye` | `POST` `/rest/v1/departments` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished|
| @AzrielKaye | `qa/api-testing/AzrielKaye` | `PATCH` `/rest/v1/departments` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished|
| @AzrielKaye | `qa/api-testing/AzrielKaye` | `DELETE` `/rest/v1/departments` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished|
| @AzrielKaye | `qa/api-testing/AzrielKaye` | `GET` `/rest/v1/programs` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished|
| @AzrielKaye | `qa/api-testing/AzrielKaye` | `POST` `/rest/v1/programs` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished|
| @dollyraexe | `qa/api-testing/AzrielKaye` | `PATCH` `/rest/v1/programs` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished|
| @dollyraexe | `qa/api-testing/AzrielKaye` | `DELETE` `/rest/v1/programs` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished|
| @dollyraexe | `qa/api-testing/AzrielKaye` | `GET` `/rest/v1/review_revisions` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished|
| @dollyraexw | `qa/api-testing/AzrielKaye` | `GET` `/rest/v1/approval_queue_items` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished|
| @dollyraexe | `qa/api-testing/AzrielKaye` | `POST` `/rest/v1/approval_queue_items` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished|
| @dollyraexe | `qa/api-testing/AzrielKaye` | `GET` `/rest/v1/audit_log_entries` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished|
| @dollyraexe | `qa/api-testing/AzrielKaye` | `POST` `/functions/v1/reviews` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished|
| @reeseBan | `qa/api-testing/reeseBan` | `PATCH` `/functions/v1/reviews/{id}` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished |
| @reeseBan | `qa/api-testing/reeseBan` | `POST` `/functions/v1/reviews/{id}/status` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished |
| @reeseBan | `qa/api-testing/reeseBan` | `POST` `/functions/v1/chat` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished |
| @reeseBan | `qa/api-testing/reeseBan` | `POST` `/functions/v1/approvals` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished |
| @reeseBan | `qa/api-testing/reeseBan` | `POST` `/rest/v1/rpc/update_own_profile` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished |
| @reeseBan | `qa/api-testing/reeseBan` | `GET` `/rest/v1/review_details` | `docs/api/faculty-admin-api-tests.md` | ✅ Finished |

**Lead responsibilities (@reeseBan, in addition to own scope)**

- Create and protect the parent branch `qa/api-testing/base`
- Assign domain scopes and keep the table above updated
- Review all sub-branch PRs and merge into the parent branch
- Track contract mismatches in section 5 and coordinate fixes
- Open the final PR to `feat/open-api`

---

## 4. Tasks Per Member

- [ ] Create your sub-branch (section 2)
- [ ] Start Prism locally: `npx @stoplight/prism-cli mock contract/openapi.yaml` (use `-p <port>` if the port is taken)
- [ ] List every endpoint in your scope
- [ ] For each endpoint, test and record:
  - [ ] Valid request: `200 OK` / `201 Created`
  - [ ] Missing JWT Bearer token: `401 Unauthorized`
  - [ ] Role violation: `Prefer: code=403`
  - [ ] Invalid payload: `400` / `422`
- [ ] Write `docs/api/<filename>.md` with exact URLs, headers, sample request bodies, simulated status codes, and the actual JSON responses returned by Prism
- [ ] Re-run all curl commands from your doc to confirm they are reproducible
- [ ] Log any contract mismatches (section 5)
- [ ] Open a PR into `qa/api-testing/base`

---

## 5. Contract Mismatch Log

| # | Endpoint | Expected (contract) | Actual (Prism) | Reported by | Issue/PR | Resolved |
|---|---|---|---|---|---|---|
| 4.3 | `PATCH` `/rest/v1/faculty_profiles` | `403 Forbidden` | `200 OK` | @Zaming | `#137/#139` | ✅ Resolved |
| 7.3 | `POST` `/rest/v1/student_profiles` | `403 Forbidden` | `400 Bad request` | @Zaming | `#137/#139` | ✅ Resolved |
| 8.3 | `PATCH` `/rest/v1/student_profiles` | `403 Forbidden` | `400 Bad request` | @AzrielKaye | `#137/#139` | ✅ Resolved |
| 8.5 | `PATCH` `/rest/v1/student_profiles` | `409 Conflict` | `400 Bad request` | @AzrielKaye | `#137/#139` | ✅ Resolved |
| 10.3 | `POST` `/rest/v1/departments` | `403 Forbidden` | `400 Bad request` | @AzrielKaye | `#137/#139` | ✅ Resolved |
| 10.5 | `POST` `/rest/v1/departments` | `409 Conflict` | `400 Bad request` | @AzrielKaye | `#137/#139` | ✅ Resolved |
| 11.3 | `PATCH` `/rest/v1/departments` | `403 Forbidden` | `400 Bad request` | @AzrielKaye | `#137/#139` | ✅ Resolved |
| 11.5 | `POST` `/rest/v1/departments` | `409 Conflict` | `400 Bad request` | @AzrielKaye | `#137/#139` | ✅ Resolved |
| 14.3 | `POST` `/rest/v1/programs` | `403 Forbidden` | `400 Bad request` | @AzrielKaye | `#137/#139` | ✅ Resolved |
| 14.5 | `POST` `/rest/v1/programs` | `409 Conflict` | `400 Bad request` | @AzrielKaye | `#137/#139` | ✅ Resolved |
| 15.3 | `PATCH` `/rest/v1/programs` | `403 Forbidden` | `400 Bad request` | @dollyraexe | `#137/#139` | ✅ Resolved |
| 15.4 | `PATCH` `/rest/v1/programs` | `400 or 422` | `401 Unauthorized` | @dollyraexe | `#137/#139` | ✅ Resolved |
| 15.5 | `PATCH` `/rest/v1/programs` | `409 Conflict` | `400 Bad request` | @dollyraexe | `#137/#139` | ✅ Resolved |
| 17.3 | `GET` `/rest/v1/review_revisions` | `403 Forbidden` | `400 Bad request` | @dollyraexe | `#137/#139` | ✅ Resolved |
| 18.3 | `GET` `/rest/v1/approval_queue_items` | `403 Forbidden` | `400 Bad request` | @dollyraexe | `#137/#139` | ✅ Resolved |
| 19.1 | `POST` `/rest/v1/approval_queue_items` | `201 Created` | `400 Bad request` | @dollyraexe | `#137/#139` | ✅ Resolved |
| 20.3 | `GET` `/rest/v1/audit_log_entries` | `403 Forbidden` | `400 Bad request` | @dollyraexe | `#137/#139` | ✅ Resolved |
| 21.3 | `POST` `/functions/v1/reviews` | `403 Forbidden` | `201 Created` | @dollyraexe | `#137/#139` | ✅ Resolved |


---

## 6. Acceptance Criteria / Review Checklist

- [ ] `docs/api/<filename>.md` is committed
- [ ] Every endpoint in scope has all four test types documented
- [ ] Curl commands are reproducible (copy-paste runnable)
- [ ] JSON outputs are real Prism responses (not hand-edited)
- [ ] Contract mismatches are reported and resolved
- [ ] PR targets `qa/api-testing/base`

---

## 7. Suggested Doc Template (per endpoint)

````markdown
## METHOD /path

**Description:** ...
**Auth:** Bearer JWT

### Test 1: Valid request (200/201)
**Request**
```bash
curl -i -X METHOD http://127.0.0.1:4010/path \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{...}'
```
**Status:** 200 OK
**Response**
```json
{ ... }
```

### Test 2: Missing token (401)
### Test 3: Forbidden (Prefer: code=403)
### Test 4: Invalid payload (400/422)
````
