# Faculty / Admin API - Prism Mock Test Results

## Test Setup

| Item | Value |
|---|---|
| Contract file | `contract/openapi.yaml` |
| Mock server command | `npx @stoplight/prism-cli mock contract/openapi.yaml` |
| Base URL | `http://127.0.0.1:4010` |
| Tools used | curl |
| Tested by | @dollyraexe |
| Date | 2026-10-30 |

> Prism returns responses defined in the OpenAPI file. These tests verify the **contract**, not real database behavior.

## Summary

| # | Endpoint | Method | Case | Expected | Result |
|---|---|---|---|---|---|
| 1 | /rest/v1/rpc/get_student_by_id | GET | Valid request | 200 | Pass |
| 2 | /rest/v1/rpc/get_student_by_id | GET | Null result | 200 | Pass |
| 3 | /rest/v1/rpc/get_student_by_id | GET | Missing JWT | 401 | Pending |
| 4 | /rest/v1/rpc/get_student_by_id | GET | Role violation | 403 | Pending |
| 5 | /rest/v1/rpc/get_student_by_id | GET | Invalid UUID | 400 / 422 | Pending |
| 6 | /rest/v1/rpc/get_student_by_id | GET | Missing parameter | 400 / 422 | Pending |

---

## GET /rest/v1/rpc/get_student_by_id

**Summary:** Get one student visible to the caller
**Roles:** Faculty, Admin
**Request body:** None. Input is the query parameter `p_student_id` (UUID, required).

### Case 1: Valid request (200 OK)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id?p_student_id=45b54332-e470-4c21-a839-7428c4f6bf42" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

**Response (200 OK)**
```json
{"id":"45b54332-e470-4c21-a839-7428c4f6bf42","student_id_number":"27-1-12345","last_name":"Santos","first_name":"Maria","middle_name":null,"program_id":"8ef76d5f-e6b2-49aa-a627-171dee1b8b65","registration_source":"admin_direct","created_at":"2026-10-26T00:00:00Z","updated_at":"2026-10-26T00:00:00Z"}
```

**Summary:** A request with a valid UUID, `apikey` and Bearer token returned 200 with a single student object. The fields (`id`, `student_id_number`, names, `program_id`, `registration_source`, timestamps) match the schema in the contract.

**Result:** Pass

---

### Case 2: Null result (200 OK)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id?p_student_id=45b54332-e470-4c21-a839-7428c4f6bf42" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Prefer: example=notVisible"
```

**Response (200 OK)**
```json
null
```

**Summary:** Using `Prefer: example=notVisible` selects the contract's null example. The endpoint returns 200 with `null` when the student does not exist or is not visible to the caller, so the two situations cannot be told apart. This matches the contract's design.

**Result:** Pass

---

### Case 3: Missing JWT Bearer token (401 Unauthorized)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id?p_student_id=45b54332-e470-4c21-a839-7428c4f6bf42"
```

**Expected response (401)**
```json
{"code":"PGRST301","message":"JWT is invalid or expired.","details":null,"hint":null}
```

**Summary:** Checks that a request with no `Authorization` header is rejected with 401 and the `PGRST301` error body. If Prism returns 200 instead, the operation has no `security` defined in the contract and this should be reported to the contract owner.

**Result:** Pending (record actual status from the curl output)

---

### Case 4: Role violation (403 Forbidden)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id?p_student_id=45b54332-e470-4c21-a839-7428c4f6bf42" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Prefer: code=403"
```

**Expected response (403)**
```json
{"code":"FORBIDDEN","message":"You are not allowed to perform this action.","details":null,"hint":null}
```

**Summary:** `Prefer: code=403` forces Prism to return the documented 403 response, confirming the contract defines the forbidden case for callers whose role is not Faculty or Admin. If Prism errors, the 403 response is missing from the contract.

**Result:** Pending (record actual status from the curl output)

---

### Case 5: Invalid UUID (400 / 422)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id?p_student_id=not-a-uuid" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

**Summary:** Sends a malformed `p_student_id`. Prism validates the query parameter against the `format: uuid` schema and should reject it with 422 (or 400 if the contract defines it that way) instead of returning the example.

**Result:** Pending (record actual status and body)

---

### Case 6: Missing required parameter (400 / 422)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

**Summary:** Omits the required `p_student_id`. Prism should reject the request with 422 (or 400), confirming the parameter is marked `required: true` in the contract.

**Result:** Pending (record actual status and body)

---

## Issues Found in the Contract

| # | Endpoint | Issue | Suggested fix |
|---|---|---|---|
| 1 | /rest/v1/rpc/get_student_by_id | None recorded yet. Update after Cases 3-6 are run. | - |
