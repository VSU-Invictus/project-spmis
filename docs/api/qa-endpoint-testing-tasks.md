# [Milestone 2] QA: Test & Document Endpoints via Prism

**Project:** VSU-Invictus / project-spmis
**Team:** QA
**QA Lead:** @reeseBan
**Members:** @Zaming, @dollyraexe, @reeseBan, @AzrielKaye
**Contract:** `contract/openapi.yaml`
**Output:** `docs/api/<filename>.md` (one file per member's domain scope)

---

## 1. Objective

Run the Prism mock backend from `contract/openapi.yaml`, test every endpoint in each member's domain scope (happy paths plus error/role codes), and document the requests and actual responses in `docs/api/`. Report and resolve any contract mismatches found.

---

## 2. Branching Strategy

One parent QA branch, with one sub-branch per member. Sub-branches are merged into the parent branch through PRs, and the parent branch is merged into `main` once everything is reviewed.

```
main
 └── qa/api-testing/base            <- parent QA branch
      ├── qa/api-testing/zaming
      ├── qa/api-testing/dollyraexe
      ├── qa/api-testing/reeseBan
      └── qa/api-testing/azrielkaye
```

> Git cannot have both `qa/api-testing` and `qa/api-testing/<name>` as branches (ref name conflict), so the parent is named `qa/api-testing/base`.

**Setup commands**

```bash
# Lead creates the parent branch once
git checkout main && git pull origin main
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
4. After all four are merged, the Lead opens a PR: `qa/api-testing/base` -> `main`.

---

## 3. Division of Tasks

> Fill in the domain scopes from the endpoint list Prism prints on startup (or the tags in `openapi.yaml`).

| Member | Sub-branch | Domain Scope | Doc File | Status |
|---|---|---|---|---|
| @Zaming | `qa/api-testing/zaming` | `<Domain 1>` | `docs/api/<domain1>.md` | ⬜ Not started |
| @dollyraexe | `qa/api-testing/dollyraexe` | `<Domain 2>` | `docs/api/<domain2>.md` | ⬜ Not started |
| @AzrielKaye | `qa/api-testing/azrielkaye` | `<Domain 3>` | `docs/api/<domain3>.md` | ⬜ Not started |
| @reeseBan | `qa/api-testing/reeseBan` | `<Domain 4>` | `docs/api/<domain4>.md` | ⬜ Not started |

**Lead responsibilities (@reeseBan, in addition to own scope)**

- Create and protect the parent branch `qa/api-testing/base`
- Assign domain scopes and keep the table above updated
- Review all sub-branch PRs and merge into the parent branch
- Track contract mismatches in section 5 and coordinate fixes
- Open the final PR to `main`

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
| 1 | | | | | | ⬜ |

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
