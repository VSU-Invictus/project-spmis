# openAPI - Prism Mock Test Results

## Test Setup

| Item | Value |
|---|---|
| Contract file | `contract/openapi.yaml` |
| Mock server command | `npx @stoplight/prism-cli mock contract/openapi.yaml` |
| Base URL | `http://127.0.0.1:4010` |
| Tools used | curl |
| Tested by | @Zaming, @AzrielKaye, @reeseBan |
| Date | 2026-10-30 |

> Prism returns responses defined in the OpenAPI file. These tests verify the **contract**, not real database behavior.

## Summary

| # | Endpoint | Method | Case | Status | Result |
|---|---|---|---|---|---|
| 1.1 | /rest/v1/rpc/get_student_by_id | GET | Valid request | 200 | **Pass** |
| 1.2 | /rest/v1/rpc/get_student_by_id | GET | Null result | 200 | **Pass** |
| 1.3 | /rest/v1/rpc/get_student_by_id | GET | Missing JWT | 401 | **Pass** |
| 1.4 | /rest/v1/rpc/get_student_by_id | GET | Role violation | 403 | **Pass** |
| 1.5 | /rest/v1/rpc/get_student_by_id | GET | Invalid UUID | 400/422 | **Pass** |
| 2.1 | /rest/v1/rpc/get_own_profile | GET | Valid request | 200 | **Pass** |
| 2.2 | /rest/v1/rpc/get_own_profile | GET | Null result | 200 | **Pass** |
| 2.3 | /rest/v1/rpc/get_own_profile | GET | Missing JWT | 401 | **Pass** |
| 2.4 | /rest/v1/rpc/get_own_profile | GET | Role violation | 403 | **Pass** |
| 2.5 | /rest/v1/rpc/get_own_profile | GET | Invalid request (simulated) | 400/422 | **Pass** |
| 3.1 | /rest/v1/rpc/faculty_profiles | GET | Valid request | 200 | **Pass**|
| 3.2 | /rest/v1/rpc/faculty_profiles | GET | Missing JWT | 401 | **Pass** |
| 3.3 | /rest/v1/rpc/faculty_profiles | GET | Role violation (simulated)| 403 | **Pass** |
| 3.4 | /rest/v1/rpc/faculty_profiles | GET | Invalid request | 400/422 | **Pass** |
| 4.1 | /rest/v1/rpc/faculty_profiles | PATCH | Valid request | 200 | **Pass**|
| 4.2 | /rest/v1/rpc/faculty_profiles | PATCH  | Missing JWT | 401 | **Pass** |
| 4.3 | /rest/v1/rpc/faculty_profiles | PATCH  | Role violation (simulated)| 403 | **Fail** |
| 4.4 | /rest/v1/rpc/faculty_profiles | PATCH  | Invalid Payload | 400/422 | **Pass** |
| 5.1 | /rest/v1/rpc/suggest_review_tags | GET | Valid request | 200 | **Pass**|
| 5.2 | /rest/v1/rpc/suggest_review_tags | GET | Missing JWT | 401 | **Pass** |
| 5.3 | /rest/v1/rpc/suggest_review_tags | GET | Role violation (simulated)| 403 | **Pass** |
| 5.4 | /rest/v1/rpc/suggest_review_tags | GET | Invalid request | 400/422 | **Pass** |
| 6.1 | /rest/v1/rpc/search_students | GET | Valid request | 200 | **Pass**|
| 6.2 | /rest/v1/rpc/search_students | GET | Missing JWT | 401 | **Pass** |
| 6.3 | /rest/v1/rpc/search_students | GET | Role violation (simulated)| 403 | **Pass** |
| 6.4 | /rest/v1/rpc/search_students | GET | Invalid UUID | 400/422 | **Pass** |
| 7.1 | /rest/v1/rpc/student_profiles | POST | Valid request | 201 | **Pass** |
| 7.2 | /rest/v1/rpc/student_profiles | POST | Missing JWT | 401 | **Pass** |
| 7.3 | /rest/v1/rpc/student_profiles | POST | Role violation (simulated)| 403 | **Fail** |
| 7.4 | /rest/v1/rpc/student_profiles | POST | Invalid UUID | 400/422 | **Pass** |
| 8.1 | /rest/v1/student_profiles | PATCH | Valid request | 200 | **Pass** |
| 8.2 | /rest/v1/student_profiles | PATCH | Missing JWT | 401 | **Pass** |
| 8.3 | /rest/v1/student_profiles | PATCH | Role violation (simulated) | 403 | **Fail** |
| 8.4 | /rest/v1/student_profiles | PATCH | Invalid request | 400 | **Pass** |
| 9.1 | /rest/v1/departments | GET | Valid request | 200 | **Pass** |
| 9.2 | /rest/v1/departments | GET | Missing JWT | 401 | **Pass** |
| 9.3 | /rest/v1/departments | GET | Role violation | 403 | **Pass** |
| 9.4 | /rest/v1/departments | GET | Invalid request | 400 | **Pass** |
| 10.1 | /rest/v1/departments | POST | Valid request | 201 | **Pass** |
| 11.1 | /functions/v1/reviews/{id} | PATCH | Valid request | 200 | **Pass** |
| 11.2 | /functions/v1/reviews/{id} | PATCH | Missing JWT Bearer token | 401 | Pending |
| 11.3 | /functions/v1/reviews/{id} | PATCH | Role violation (simulated) | 403 | Pending |
| 11.4 | /functions/v1/reviews/{id} | PATCH | Invalid payload (empty blocks) | 422 | Pending |
| 11.5 | /functions/v1/reviews/{id} | PATCH | Missing request body (empty object) | 422 | Pending |
| 11.6 | /functions/v1/reviews/{id} | PATCH | Invalid review ID in path | 422 | Pending |
| 11.7 | /functions/v1/reviews/{id} | PATCH | Review not found | 404 | Pending |
| 11.8 | /functions/v1/reviews/{id} | PATCH | Conflict (deleted review) | 409 | Pending |
| 12.1 | /functions/v1/reviews/{id}/status | POST | Valid request | 200 | Pending |
| 12.2 | /functions/v1/reviews/{id}/status | POST | Missing JWT Bearer token | 401 | Pending |
| 12.3 | /functions/v1/reviews/{id}/status | POST | Role violation (simulated) | 403 | Pending |
| 12.4 | /functions/v1/reviews/{id}/status | POST | Invalid payload (action not in hide/unhide/delete) | 422 | Pending |
| 12.5 | /functions/v1/reviews/{id}/status | POST | Missing request body (empty object) | 422 | Pending |
| 12.6 | /functions/v1/reviews/{id}/status | POST | Invalid review ID in path | 422 | Pending |
| 12.7 | /functions/v1/reviews/{id}/status | POST | Review not found | 404 | Pending |
| 12.8 | /functions/v1/reviews/{id}/status | POST | Invalid state transition | 409 | Pending |
| 13.1 | /functions/v1/chat | POST | Valid request | 200 | Pending |
| 13.2 | /functions/v1/chat | POST | Missing JWT Bearer token | 401 | Pending |
| 13.3 | /functions/v1/chat | POST | Role violation (simulated) | 403 | Pending |
| 13.4 | /functions/v1/chat | POST | Invalid payload (empty message) | 422 | Pending |
| 13.5 | /functions/v1/chat | POST | Missing request body (empty object) | 422 | Pending |
| 13.6 | /functions/v1/chat | POST | Rate limited | 429 | Pending |
| 14.1 | /functions/v1/approvals | POST | Valid approve | 200 | Pending |
| 14.2 | /functions/v1/approvals | POST | Valid reject | 200 | Pending |
| 14.3 | /functions/v1/approvals | POST | Missing JWT Bearer token | 401 | Pending |
| 14.4 | /functions/v1/approvals | POST | Role violation (simulated) | 403 | Pending |
| 14.5 | /functions/v1/approvals | POST | Invalid payload (reject without reason) | 422 | Pending |
| 14.6 | /functions/v1/approvals | POST | Missing request body (empty object) | 422 | Pending |
| 14.7 | /functions/v1/approvals | POST | Application not found | 404 | Pending |
| 14.8 | /functions/v1/approvals | POST | Application already decided | 409 | Pending |
| 15.1 | /rest/v1/rpc/update_own_profile | POST | Valid request | 200 | Pending |
| 15.2 | /rest/v1/rpc/update_own_profile | POST | Missing JWT Bearer token | 401 | Pending |
| 15.3 | /rest/v1/rpc/update_own_profile | POST | Role violation (simulated) | 403 | Pending |
| 15.4 | /rest/v1/rpc/update_own_profile | POST | Invalid payload (empty full_name) | 400 | Pending |
| 15.5 | /rest/v1/rpc/update_own_profile | POST | Missing request body (empty object) | 400 | Pending |
| 15.6 | /rest/v1/rpc/update_own_profile | POST | Conflict | 409 | Pending |
| 16.1 | /rest/v1/review_details | GET | Valid request | 200 | Pending |
| 16.2 | /rest/v1/review_details | GET | Missing JWT Bearer token | 401 | Pending |
| 16.3 | /rest/v1/review_details | GET | Role violation (simulated) | 403 | Pending |
| 16.4 | /rest/v1/review_details | GET | Invalid UUID | 400 | Pending |
| 16.5 | /rest/v1/review_details | GET | Invalid status filter | 400 | Pending |
---

## GET /rest/v1/rpc/get_student_by_id

**Summary:** Get one student visible to the caller
**Roles:** Faculty, Admin
**Request body:** None.

### Case 1: Valid request (200 OK)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id?p_student_id=45b54332-e470-4c21-a839-7428c4f6bf42" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id?p_student_id=45b54332-e470-4c21-a839-7428c4f6bf42` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 200 OK |
| Actual status | 200 OK |

**Response**
```json
{
"id":"45b54332-e470-4c21-a839-7428c4f6bf42",
"student_id_number":"27-1-12345",
"last_name":"Santos",
"first_name":"Maria",
"middle_name":null,
"program_id":"8ef76d5f-e6b2-49aa-a627-171dee1b8b65",
"registration_source":"admin_direct",
"created_at":"2026-10-26T00:00:00Z",
"updated_at":"2026-10-26T00:00:00Z"
}
```

**Result:** Pass

---

### Case 2: Null result (200 OK)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id?p_student_id=45b54332-e470-4c21-a839-7428c4f6bf42" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Prefer: example=notVisible"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token`, `Prefer: example=NAME_OF_NULL_EXAMPLE` |
| Body | Null |
| Expected status | 200 OK |
| Actual status | 200 OK |

**Response**
```json
null
```

**Result:** Pass

---

### Case 3: Missing JWT Bearer token (401 Unauthorized)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id?p_student_id=45b54332-e470-4c21-a839-7428c4f6bf42"
```

| Item | Value |
|---|---|
| Headers | None (no Authorization) |
| Body | None |
| Expected status | 401 Unauthorized |
| Actual status | 401 Unauthorized |

**Response**
```json
{
"code":"PGRST301",
"message":"JWT is invalid or expired.",
"details":null,
"hint":null
}
```

**Result:** Pass

---

### Case 4: Role violation (403 Forbidden)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id?p_student_id=45b54332-e470-4c21-a839-7428c4f6bf42" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Prefer: code=403"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token`, `Prefer: code=403` |
| Body | None |
| Expected status | 403 Forbidden |
| Actual status | 403 Forbidden |

**Response**
```json
{
"code":"FORBIDDEN",
"message":"You are not allowed to perform this action.",
"details":null,
"hint":null
}
```

**Result:** Pass

---

### Case 5: Invalid UUID (400 / 422)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id?p_student_id=not-a-uuid" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 400 or 422 |
| Actual status | 400 Bad Request |

**Response**
```json
{
"code":"22P02",
"message":"Invalid input syntax for a column value.",
"details":null,
"hint":"Correct the request."
}
```

**Result:** Pass

---

## GET /rest/v1/rpc/get_own_profile

**Summary:** Get the authenticated user's own faculty profile
**Roles:** Auth, Faculty, Admin
**Request body:** None.

### Case 1: Valid request (200 OK)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_own_profile" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/rpc/get_own_profile` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 200 OK |
| Actual status | 200 OK |

**Response**
```json
{
"id":"e48adc9e-1b79-4b92-9848-aa12b25d63d7",
"email":"alex.reyes@example.edu",
"full_name":"Alex Reyes",
"department_id":"5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb",
"role":"faculty",
"status":"pending",
"created_at":"2026-10-26T00:00:00Z",
"updated_at":"2026-10-26T00:00:00Z"
}
```

**Result:** Pass

---

### Case 2: Null result (200 OK)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_own_profile" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Prefer: example=notEnrolled"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Prefer: example=NAME_OF_NULL_EXAMPLE` |
| Body | None |
| Expected status | 200 OK |
| Actual status | 200 OK |

**Response**
```json
null
```

**Result:** Pass

---

### Case 3: Missing JWT Bearer token (401 Unauthorized)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_own_profile"
```

| Item | Value |
|---|---|
| Headers | None (no Authorization) |
| Body | None |
| Expected status | 401 Unauthorized |
| Actual status | 401 Unauthorized |

**Response**
```json
{
"code":"PGRST301",
"message":"JWT is invalid or expired.",
"details":null,
"hint":null
}
```

**Result:** Pass

---

### Case 4: Role violation (403 Forbidden)

**Request**
```bash
curl -i curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_own_profile" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Prefer: code=403"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token`, `Prefer: code=403` |
| Body | None |
| Expected status | 403 Forbidden |
| Actual status | 403 Forbidden |

**Response**
```json
{
"code":"FORBIDDEN",
"message":"You are not allowed to perform this action.",
"details":null,
"hint":null
}
```

**Result:** Pass

---

### Case 5:  Simulated validation error  (400 / 422)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_own_profile" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Prefer: code=400"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Prefer: code=400` |
| Body | None |
| Expected status | 400 or 422 |
| Actual status | 400 bad request |

**Response**
```json
{
  "code":"22P02",
  "message":"Invalid input syntax for a column value.",
  "details":null,
  "hint":"Correct the request."
  }
```

**Result:** Pass (simulated; endpoint takes no input)

---

## GET /rest/v1/rpc/faculty_profile

**Summary:** List faculty profiles visible to the caller
**Roles:** Faculty, Admin
**Request body:** None.

### Case 1: Valid request (200 OK)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/faculty_profiles?department_id=eq.580ED6ef-AEb9-3d4D-8c2d-ec8B451DBd8b&order=created_at.asc%2Cid.asc" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/faculty_profiles?department_id=eq.580ED6ef-AEb9-3d4D-8c2d-ec8B451DBd8b&order=created_at.asc%2Cid.asc` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 200 OK |
| Actual status | 200 OK |

**Response**
```json
[
  {
  "id":"e48adc9e-1b79-4b92-9848-aa12b25d63d7",
  "email":"alex.reyes@example.edu",
  "full_name":"Alex Reyes",
  "department_id":"5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb",
  "role":"faculty",
  "status":"active",
  "created_at":"2026-10-26T00:00:00Z",
  "updated_at":"2026-10-26T00:00:00Z"
  }
]
```

**Result:** Pass

---

### Case 2: Missing JWT Bearer token (401 Unauthorized)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/faculty_profiles?department_id=eq.580ED6ef-AEb9-3d4D-8c2d-ec8B451DBd8b&order=created_at.asc%2Cid.asc"
```

| Item | Value |
|---|---|
| Headers | None (no Authorization) |
| Body | None |
| Expected status | 401 Unauthorized |
| Actual status | 401 Unauthorized |

**Response**
```json
{
"code":"PGRST301",
"message":"JWT is invalid or expired.",
"details":null,
"hint":null
}
```

**Result:** Pass

---

### Case 3: Role violation (403 Forbidden)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/faculty_profiles?__code=403" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 403 Forbidden |
| Actual status | 403 Forbidden |

**Response**
```json
{
"code":"FORBIDDEN",
"message":"You are not allowed to perform this action.",
"details":null,
"hint":null
}
```

**Result:** Pass
**Notes:** Simulated with `?__code=403`. `Prefer: code=403` can’t be used here.

---

### Case 4: Invalid request (400 / 422)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/faculty_profiles?order=invalid_value" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 400 or 422 |
| Actual status | 400 Bad Request |

**Validation Headers**
```json
[
  {
  "location":["request","query","order"],
  "severity":"Error",
  "code":"enum",
  "message":"Request query parameter order must be equal to one of the allowed values: created_at.desc,id.asc, created_at.asc,id.asc, full_name.asc,id.asc"
  }
]
```

**Response**
```json
{
"code":"22P02",
"message":"Invalid input syntax for a column value.",
"details":null,
"hint":"Correct the request."
}
```

**Result:** Pass

---

## PATCH /rest/v1/faculty_profiles

**Summary:** Update a faculty profile allowed by the caller's role
**Roles:** Admin
**Request body:** Required JSON object. All fields are optional, but at least one of `email`, `full_name`, `department_id`, `role` or `status` must be present. Unknown fields are not allowed.

### Case 1: Valid request (200 OK)

**Request**
```bash
curl -i -X PATCH "http://127.0.0.1:4010/rest/v1/faculty_profiles?id=eq.dAF67EA5-Fea3-43de-83fa-a2CD8945DdFA" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: return=representation" -d "{\"status\":\"active\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/faculty_profiles?id=eq.dAF67EA5-Fea3-43de-83fa-a2CD8945DdFA` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Prefer: return=representation` `Content-Type: application/json` |
| Body | `{"status":"active"}` |
| Expected status | 200 OK |
| Actual status | 200 OK |

**Response**
```json
[
  {
  "id":"e48adc9e-1b79-4b92-9848-aa12b25d63d7",
  "email":"alex.reyes@example.edu",
  "full_name":"Alex Reyes",
  "department_id":"5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb",
  "role":"faculty",
  "status":"active",
  "created_at":"2026-10-26T00:00:00Z",
  "updated_at":"2026-10-26T00:00:00Z"
  }
]
```

**Result:** Pass

---

### Case 2: Missing JWT Bearer token (401 Unauthorized)

**Request**
```bash
curl -i -X PATCH "http://127.0.0.1:4010/rest/v1/faculty_profiles?id=eq.dAF67EA5-Fea3-43de-83fa-a2CD8945DdFA" -H "apikey: test-key" -H "Content-Type: application/json" -H "Prefer: return=representation" -d "{\"status\":\"active\"}"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Content-Type: application/json` `Prefer: return=representation` |
| Body | `{"status":"active"}` |
| Expected status | 401 Unauthorized |
| Actual status | 401 Unauthorized |

**Response**
```json
{
"code":"PGRST301",
"message":"JWT is invalid or expired.",
"details":null,
"hint":null
}
```

**Result:** Pass

---

### Case 3: Role Violation (403, simulated)

**Request**
```bash
curl -i -X PATCH "http://127.0.0.1:4010/rest/v1/faculty_profiles?id=eq.dAF67EA5-Fea3-43de-83fa-a2CD8945DdFA&__code=403" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: return=representation" -d "{\"status\":\"active\"}"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: return=representation` |
| Body | `{"status":"active"}` |
| Expected status | 403 Forbidden |
| Actual status | 200 OK |


**Result:** Fail (cannot simulate). `Prefer: code=403` is rejected because the contract fixes `Prefer` to a constant, and `?__code=403` was ignored by this Prism version.

---

### Case 4: Invalid Payload (400, real validation)

**Request**
```bash
curl -i -X PATCH "http://127.0.0.1:4010/rest/v1/faculty_profiles?id=eq.dAF67EA5-Fea3-43de-83fa-a2CD8945DdFA" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: return=representation" -d "{\"status\":\"suspended\"}"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: return=representation` |
| Body | `{"status":"suspended"}` |
| Expected status | 400 Bad request |
| Actual status | 400 Bad request |

**Response**
```json
{
"code":"22P02",
"message":"Invalid input syntax for a column value.",
"details":null,
"hint":"Correct the request."
}
```

**Result:** Pass

---

## GET /rest/v1/rpc/suggest_review_tags

**Summary:** Suggest existing tags for the review composer
**Roles:** Faculty
**Request body:** None.

### Case 1: Valid request (200 OK)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/suggest_review_tags?prefix=re&order=tag.asc" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/rpc/suggest_review_tags?prefix=re&order=tag.asc` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 200 OK |
| Actual status | 200 OK |

**Response**
```json
[
  {"tag":"research"},
  {"tag":"resilience"}
]
```

**Result:** Pass

---

### Case 2: Missing JWT Bearer token (401 Unauthorized)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/suggest_review_tags?prefix=re&order=tag.asc" -H "apikey: test-key"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` |
| Body | None |
| Expected status | 401 Unauthorized |
| Actual status | 401 Unauthorized |

**Response**
```json
{
"code":"PGRST301",
"message":"JWT is invalid or expired.",
"details":null,
"hint":null
}
```

**Result:** Pass

---

### Case 3: Role violation (403 Forbidden, simulated)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/suggest_review_tags?prefix=re&order=tag.asc&__code=403" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 403 Forbidden |
| Actual status | 403 Forbidden |

**Response**
```json
{
"code":"FORBIDDEN",
"message":"You are not allowed to perform this action.",
"details":null,
"hint":null
}
```

**Result:** Pass

---

### Case 4: Invalid request (400 / 422)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/suggest_review_tags?prefix=re&order=invalid_value" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 400 or 422 |
| Actual status | 400 Bad Request |

**Validation header**
```json
 [
  {"location":["request","query","order"],
  "severity":"Error",
  "code":"enum",
  "message":"Request query parameter order must be equal to one of the allowed values: tag.asc"
  }
]
```
**Response**
```json
{
"code":"22P02",
"message":"Invalid input syntax for a column value.",
"details":null,
"hint":"Correct the request."
}
```

**Result:** Pass

---

## GET /rest/v1/rpc/search_students

**Summary:** Search students through review-aware filters
**Roles:** Faculty
**Request body:** None.

### Case 1: Valid request (200 OK)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/search_students?program_id=8ce85743-2e9a-52c2-391a-0a42c9787972&owner_id=d96991c4-f61a-f9c7-2f5f-7f6bd8799d49&owner_department_id=6ecae807-d397-2a76-5eb2-121284fcc550&tag=atqui&order=created_at.desc%2Cid.asc" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/rpc/search_students?program_id=8ce85743-2e9a-52c2-391a-0a42c9787972&owner_id=d96991c4-f61a-f9c7-2f5f-7f6bd8799d49&owner_department_id=6ecae807-d397-2a76-5eb2-121284fcc550&tag=atqui&order=created_at.desc%2Cid.asc` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 200 OK |
| Actual status | 200 OK |

**Response**
```json
[
  {
  "id":"45b54332-e470-4c21-a839-7428c4f6bf42",
  "student_id_number":"27-1-12345",
  "last_name":"Santos",
  "first_name":"Maria",
  "middle_name":null,
  "program_id":"8ef76d5f-e6b2-49aa-a627-171dee1b8b65",
  "registration_source":"admin_direct",
  "created_at":"2026-10-26T00:00:00Z",
  "updated_at":"2026-10-26T00:00:00Z",
  "program_name":"string",
  "visible_review_tags":["string"]
  }
]
```

**Result:** Pass

---

### Case 2: Missing JWT Bearer token (401 Unauthorized)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/search_students?program_id=8ce85743-2e9a-52c2-391a-0a42c9787972&owner_id=d96991c4-f61a-f9c7-2f5f-7f6bd8799d49&owner_department_id=6ecae807-d397-2a76-5eb2-121284fcc550&tag=atqui&order=created_at.desc%2Cid.asc" -H "apikey: test-key"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` |
| Body | None |
| Expected status | 401 Unauthorized |
| Actual status | 401 Unauthorized |

**Response**
```json
{
"code":"PGRST301",
"message":"JWT is invalid or expired.",
"details":null,
"hint":null
}
```

**Result:** Pass

---

### Case 3: Role violation (403 Forbidden, simulated)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/search_students?program_id=8ce85743-2e9a-52c2-391a-0a42c9787972&owner_id=d96991c4-f61a-f9c7-2f5f-7f6bd8799d49&owner_department_id=6ecae807-d397-2a76-5eb2-121284fcc550&tag=atqui&order=created_at.desc%2Cid.asc&__code=403" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 403 Forbidden |
| Actual status | 403 Forbidden |

**Response**
```json
{
"code":"FORBIDDEN",
"message":"You are not allowed to perform this action.",
"details":null,
"hint":null
}
```

**Result:** Pass

---

### Case 4: Invalid UUID (400 / 422)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/search_students?program_id=not-a-uuid&owner_id=d96991c4-f61a-f9c7-2f5f-7f6bd8799d49&owner_department_id=6ecae807-d397-2a76-5eb2-121284fcc550&tag=atqui&order=created_at.desc%2Cid.asc" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 400 or 422 |
| Actual status | 400 Bad Request |

**Validation header**
```json
[
  {
  "location":["request","query","program_id"],
  "severity":"Error",
  "code":"format",
  "message":"Request query parameter program_id must match format \"uuid\""
  }
]
```
**Response**
```json
{
"code":"22P02",
"message":"Invalid input syntax for a column value.",
"details":null,
"hint":"Correct the request."
}
```

**Result:** Pass

---

## POST /rest/v1/rpc/student_profiles

**Summary:** Directly add a student
**Roles:** Admin
**Request body:** None.

### Case 1: Valid request (201 Created)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/rest/v1/student_profiles" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: return=representation" -d "{\"student_id_number\":\"27-1-12345\",\"first_name\":\"Maria\",\"last_name\":\"Santos\",\"program_id\":\"8ef76d5f-e6b2-49aa-a627-171dee1b8b65\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/student_profiles` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: return=representation` |
| Body | `{"student_id_number":"27-1-12345","first_name":"Maria","last_name":"Santos","program_id":"8ef76d5f-e6b2-49aa-a627-171dee1b8b65"}` |
| Expected status | 201 Created |
| Actual status | 201 Created |

**Response**
```json
[
  {
  "id":"45b54332-e470-4c21-a839-7428c4f6bf42",
  "student_id_number":"27-1-12345",
  "last_name":"Santos",
  "first_name":"Maria",
  "middle_name":null,
  "program_id":"8ef76d5f-e6b2-49aa-a627-171dee1b8b65",
  "registration_source":"admin_direct",
  "created_at":"2026-10-26T00:00:00Z",
  "updated_at":"2026-10-26T00:00:00Z"
  }
]
```

**Result:** Pass

---

### Case 2: Missing JWT Bearer token (401 Unauthorized)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/rest/v1/student_profiles" -H "apikey: test-key" -H "Content-Type: application/json" -H "Prefer: return=representation" -d "{\"student_id_number\":\"27-1-12345\",\"first_name\":\"Maria\",\"last_name\":\"Santos\",\"program_id\":\"8ef76d5f-e6b2-49aa-a627-171dee1b8b65\"}"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Content-Type: application/json` `Prefer: return=representation` |
| Body | `{"student_id_number":"27-1-12345","first_name":"Maria","last_name":"Santos","program_id":"8ef76d5f-e6b2-49aa-a627-171dee1b8b65"}` |
| Expected status | 401 Unauthorized |
| Actual status | 401 Unauthorized |

**Response**
```json
{
"code":"PGRST301",
"message":"JWT is invalid or expired.",
"details":null,
"hint":null
}
```

**Result:** Pass

---

### Case 3: Role violation (403 Forbidden, simulated)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/rest/v1/student_profiles" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: code=403" -d "{\"student_id_number\":\"27-1-12345\",\"first_name\":\"Maria\",\"last_name\":\"Santos\",\"program_id\":\"8ef76d5f-e6b2-49aa-a627-171dee1b8b65\"}"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: code=403` |
| Body | `{"student_id_number":"27-1-12345","first_name":"Maria","last_name":"Santos","program_id":"8ef76d5f-e6b2-49aa-a627-171dee1b8b65"}` |
| Expected status | 403 Forbidden |
| Actual status | 400 Bad request |


**Result:** Fail (cannot simulate). `Prefer: code=403` and `?__code=403` both get 400 Bad request.

---

### Case 4: Invalid UUID (400 / 422)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/rest/v1/student_profiles" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: return=representation" -d "{\"student_id_number\":\"27-1-12345\",\"first_name\":\"Maria\",\"last_name\":\"Santos\",\"program_id\":\"not-a-uuid\"}"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: return=representation` |
| Body | `{"student_id_number":"27-1-12345","first_name":"Maria","last_name":"Santos","program_id":"8ef76d5f-e6b2-49aa-a627-171dee1b8b65"}` |
| Expected status | 400 or 422 |
| Actual status | 400 Bad Request |

**Validation header**
```json
[
  {
  "location":["request","body","program_id"],
  "severity":"Error",
  "code":"format",
  "message":"Request body property program_id must match format \"uuid\""
  }
]
```
**Response**
```json
{
"code":"22P02",
"message":"Invalid input syntax for a column value.",
"details":null,
"hint":"Correct the request."
}
```

**Result:** Pass

---

## PATCH /rest/v1/student_profiles

**Summary:** Update a student
**Roles:** Admin
**Request body:** Required JSON body containing `student_id_number`, `first_name`, `last_name`, and `program_id`.

### Case 1: Valid request (200 OK)

**Request**
```bash
curl -i -X PATCH "http://127.0.0.1:4010/rest/v1/student_profiles?id=eq.6ba1bfDE-243f-7fd9-24e6-dE4Dedd3B2c6" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: return=representation" -d @body.json
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/student_profiles?id=eq.6ba1bfDE-243f-7fd9-24e6-dE4Dedd3B2c6` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | `{"student_id_number":"27-1-12345","first_name":"Maria","last_name":"Santos","program_id":"8ef76d5f-e6b2-49aa-a627-171dee1b8b65"}` |
| Expected status | 200 OK |
| Actual status | 200 OK |

**Response**
```json
{
"id":"45b54332-e470-4c21-a839-7428c4f6bf42",
"student_id_number":"27-1-12345",
"last_name":"Santos",
"first_name":"Maria",
"middle_name":null,
"program_id":"8ef76d5f-e6b2-49aa-a627-171dee1b8b65",
"registration_source":"admin_direct",
"created_at":"2026-10-26T00:00:00Z",
"updated_at":"2026-10-26T00:00:00Z"
}
```

**Result:** Pass

---

### Case 2: Missing JWT Bearer token (401 Unauthorized)

**Request**
```bash
curl -i -X PATCH "http://127.0.0.1:4010/rest/v1/student_profiles?id=eq.6ba1bfDE-243f-7fd9-24e6-dE4Dedd3B2c6" -d @body.json
```

| Item | Value |
|---|---|
| Headers | None (no authorization) |
| Body | `{"student_id_number":"27-1-12345","first_name":"Maria","last_name":"Santos","program_id":"8ef76d5f-e6b2-49aa-a627-171dee1b8b65"}` |
| Expected status | 401 Unauthorized |
| Actual status | 401 Unauthorized |

**Response**
```json
{
"code":"PGRST301",
"message":"JWT is invalid or expired.",
"details":null,"hint":null
}
```

**Result:** Pass

---

### Case 3: Role violation (403 Forbidden, simulated)

**Request**
```bash
curl -i -X PATCH "http://127.0.0.1:4010/rest/v1/student_profiles?id=eq.6ba1bfDE-243f-7fd9-24e6-dE4Dedd3B2c6" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: code=403" -d @body.json"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: code=403` |
| Body | `{"student_id_number":"27-1-12345","first_name":"Maria","last_name":"Santos","program_id":"8ef76d5f-e6b2-49aa-a627-171dee1b8b65"}` |
| Expected status | 403 Forbidden |
| Actual status | 400 Bad request |


**Result:** Fail (cannot simulate). `Prefer: code=403` and `?__code=403` both get 400 Bad request.

---

### Case 4: Invalid request (400 / 422)

**Request**
```bash
curl -i -X PATCH "http://127.0.0.1:4010/rest/v1/student_profiles?id=eq.6ba1bfDE-243f-7fd9-24e6-dE4Dedd3B2c6" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: return=representation" -d "{}"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: return=representation` |
| Body | None |
| Expected status | 400 or 422 |
| Actual status | 400 Bad Request |

**Validation header**
```json
[
  {
  "location":["request","body","program_id"],
  "severity":"Error",
  "code":"format",
  "message":"Request body property program_id must match format \"uuid\""
  }
]
```

**Response**
```json
{
"code":"22P02",
"message":"Invalid input syntax for a column value.",
"details":null,
"hint":"Correct the request."
}
```

**Result:** Pass

---

## GET rest/v1/departments

**Summary:** List departments
**Roles:** Faculty, Admin
**Request body:** None

### Case 1: Valid request (200 OK)

**Request**
```bash
curl -i -X GET "http://127.0.0.1:4010/rest/v1/departments?name=ilike.qCZaH%5Em&status=eq.approved&order=name.asc%2Cid.asc" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/departments?name=ilike.qCZaH%5Em&status=eq.approved&order=name.asc%2Cid.asc` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 200 OK |
| Actual status | 200 OK |

**Response**
```json
{
  "id":"5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb",
  "name":"Computer Science",
  "status":"approved",
  "proposed_by":null,
  "created_at":"2026-10-26T00:00:00Z",
  "updated_at":"2026-10-26T00:00:00Z"
}
```

**Result:** Pass

---

### Case 2: Missing JWT Bearer token (401 Unauthorized)

**Request**
```bash
curl -i -X GET "http://127.0.0.1:4010/rest/v1/departments?name=ilike.qCZaH%5Em&status=eq.approved&order=name.asc%2Cid.asc"
```

| Item | Value |
|---|---|
| Headers | None (no authorization) |
| Body | None |
| Expected status | 401 Unauthorized |
| Actual status | 401 Unauthorized |

**Response**
```json
{
"code":"PGRST301",
"message":"JWT is invalid or expired.",
"details":null,"hint":null
}
```

**Result:** Pass

---

### Case 3: Role violation (403 Forbidden)

**Request**
```bash
curl -i -X GET "http://127.0.0.1:4010/rest/v1/departments?name=ilike.qCZaH%5Em&status=eq.approved&order=name.asc%2Cid.asc&__code=403" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 403 Forbidden |
| Actual status | 403 Forbidden |

**Response**
```json
{
"code":"FORBIDDEN",
"message":"You are not allowed to perform this action.",
"details":null,
"hint":null
}
```

**Result:** Pass

---

### Case 4: Invalid request (400 / 422)

**Request**
```bash
curl -i -X GET "http://127.0.0.1:4010/rest/v1/departments?name=ilike.qCZaH%5Em&status=eq.approved&order=name.asc%2Cid.asc&__code=400" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 400 or 422 |
| Actual status | 400 Bad Request |

**Response**
```json
{
"code":"22P02",
"message":"Invalid input syntax for a column value.",
"details":null,
"hint":"Correct the request."
}
```

**Result:** Pass

---

## POST /rest/v1/departments

**Summary:** Directly add a department
**Roles:** Admin
**Request body:** Required JSON body containing `name`.

### Case 1: Valid request (200 OK)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/rest/v1/departments?__code=201" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: return=representation" -d @body.json
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/departments?__code=201` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: return=representation` |
| Body | `{ "name": "Computer Science" }` |
| Expected status | 200 OK |
| Actual status | 200 OK |

**Response**
```json
{
  "id":"5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb",
  "name":"Computer Science",
  "status":"approved",
  "proposed_by":null,
  "created_at":"2026-10-26T00:00:00Z",
  "updated_at":"2026-10-26T00:00:00Z"
}
```

**Result:** Pass

---

## PATCH /functions/v1/reviews/{id}

**Summary:** Update an owned review (operationId updateReview)
**Roles:** Faculty (verified owner)
**Request body:** Required JSON object (see each case).

### Case 1: Valid request (200 OK)

**Request**
```bash
curl -i -X PATCH "http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -d "{\"body_document\":{\"blocks\":[{\"type\":\"paragraph\",\"content\":[{\"text\":\"Demonstrated strong leadership.\",\"bold\":true}]}]},\"tags\":[\"leadership\"]}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` |
| Body | `{"body_document":{"blocks":[{"type":"paragraph","content":[{"text":"Demonstrated strong leadership.","bold":true}]}]},"tags":["leadership"]}` |
| Expected status | 200 OK |
| Actual status | |

**Response**
```json
{
  "id":"67015de8-1ce8-4ac4-8634-384bf5fb3821",
  "student_id":"45b54332-e470-4c21-a839-7428c4f6bf42",
  "owner_id":"e48adc9e-1b79-4b92-9848-aa12b25d63d7",
  "author_name":"Alex Reyes",
  "author_department_name":"Computer Science",
  "body_text":"Demonstrated strong leadership.",
  "body_document":{"blocks":[{"type":"paragraph","content":[{"text":"Demonstrated strong leadership.","bold":true}]}]},
  "status":"active",
  "tags":["leadership"],
  "attachments":[],
  "created_at":"2026-10-26T00:00:00Z",
  "updated_at":"2026-10-26T00:00:00Z"
}
```

**Result:** Pass 

---

### Case 2: Missing JWT Bearer token (401 Unauthorized)

**Request**
```bash
curl -i -X PATCH "http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821" -H "Content-Type: application/json" -d "{\"body_document\":{\"blocks\":[{\"type\":\"paragraph\",\"content\":[{\"text\":\"Demonstrated strong leadership.\",\"bold\":true}]}]},\"tags\":[\"leadership\"]}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821` |
| Headers | `Content-Type: application/json` |
| Body | `{"body_document":{"blocks":[{"type":"paragraph","content":[{"text":"Demonstrated strong leadership.","bold":true}]}]},"tags":["leadership"]}` |
| Expected status | 401 Unauthorized |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 3: Role violation (simulated) (403 Forbidden)

**Request**
```bash
curl -i -X PATCH "http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: code=403" -d "{\"body_document\":{\"blocks\":[{\"type\":\"paragraph\",\"content\":[{\"text\":\"Demonstrated strong leadership.\",\"bold\":true}]}]},\"tags\":[\"leadership\"]}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: code=403` |
| Body | `{"body_document":{"blocks":[{"type":"paragraph","content":[{"text":"Demonstrated strong leadership.","bold":true}]}]},"tags":["leadership"]}` |
| Expected status | 403 Forbidden |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail
**Notes:** Simulated with `Prefer: code=403`. If Prism rejects it, record it as Fail (cannot simulate) and add it to Issues Found.

---

### Case 4: Invalid payload (empty blocks) (422 Unprocessable Entity)

**Request**
```bash
curl -i -X PATCH "http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -d "{\"body_document\":{\"blocks\":[]}}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` |
| Body | `{"body_document":{"blocks":[]}}` |
| Expected status | 422 Unprocessable Entity |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 5: Missing request body (empty object) (422 Unprocessable Entity)

**Request**
```bash
curl -i -X PATCH "http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -d "{}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` |
| Body | `{}` |
| Expected status | 422 Unprocessable Entity |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 6: Invalid review ID in path (422 Unprocessable Entity)

**Request**
```bash
curl -i -X PATCH "http://127.0.0.1:4010/functions/v1/reviews/not-a-uuid" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -d "{\"body_document\":{\"blocks\":[{\"type\":\"paragraph\",\"content\":[{\"text\":\"Demonstrated strong leadership.\",\"bold\":true}]}]},\"tags\":[\"leadership\"]}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/reviews/not-a-uuid` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` |
| Body | `{"body_document":{"blocks":[{"type":"paragraph","content":[{"text":"Demonstrated strong leadership.","bold":true}]}]},"tags":["leadership"]}` |
| Expected status | 422 Unprocessable Entity |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 7: Review not found (404 Not Found)

**Request**
```bash
curl -i -X PATCH "http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: code=404" -d "{\"body_document\":{\"blocks\":[{\"type\":\"paragraph\",\"content\":[{\"text\":\"Demonstrated strong leadership.\",\"bold\":true}]}]},\"tags\":[\"leadership\"]}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: code=404` |
| Body | `{"body_document":{"blocks":[{"type":"paragraph","content":[{"text":"Demonstrated strong leadership.","bold":true}]}]},"tags":["leadership"]}` |
| Expected status | 404 Not Found |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail
**Notes:** Simulated with `Prefer: code=404`.

---

### Case 8: Conflict (deleted review) (409 Conflict)

**Request**
```bash
curl -i -X PATCH "http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: code=409" -d "{\"body_document\":{\"blocks\":[{\"type\":\"paragraph\",\"content\":[{\"text\":\"Demonstrated strong leadership.\",\"bold\":true}]}]},\"tags\":[\"leadership\"]}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: code=409` |
| Body | `{"body_document":{"blocks":[{"type":"paragraph","content":[{"text":"Demonstrated strong leadership.","bold":true}]}]},"tags":["leadership"]}` |
| Expected status | 409 Conflict |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail
**Notes:** Simulated with `Prefer: code=409`.

---

## POST /functions/v1/reviews/{id}/status

**Summary:** Hide, unhide, or delete an owned review (operationId setReviewStatus)
**Roles:** Faculty (verified owner)
**Request body:** Required JSON object (see each case).

### Case 1: Valid request (200 OK)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821/status" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -d "{\"action\":\"hide\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821/status` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` |
| Body | `{"action":"hide"}` |
| Expected status | 200 OK |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 2: Missing JWT Bearer token (401 Unauthorized)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821/status" -H "Content-Type: application/json" -d "{\"action\":\"hide\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821/status` |
| Headers | `Content-Type: application/json` |
| Body | `{"action":"hide"}` |
| Expected status | 401 Unauthorized |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 3: Role violation (simulated) (403 Forbidden)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821/status" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: code=403" -d "{\"action\":\"hide\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821/status` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: code=403` |
| Body | `{"action":"hide"}` |
| Expected status | 403 Forbidden |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail
**Notes:** Simulated with `Prefer: code=403`. If Prism rejects it, record it as Fail (cannot simulate) and add it to Issues Found.

---

### Case 4: Invalid payload (action not in hide/unhide/delete) (422 Unprocessable Entity)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821/status" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -d "{\"action\":\"archive\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821/status` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` |
| Body | `{"action":"archive"}` |
| Expected status | 422 Unprocessable Entity |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 5: Missing request body (empty object) (422 Unprocessable Entity)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821/status" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -d "{}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821/status` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` |
| Body | `{}` |
| Expected status | 422 Unprocessable Entity |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 6: Invalid review ID in path (422 Unprocessable Entity)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/reviews/not-a-uuid/status" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -d "{\"action\":\"hide\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/reviews/not-a-uuid/status` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` |
| Body | `{"action":"hide"}` |
| Expected status | 422 Unprocessable Entity |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 7: Review not found (404 Not Found)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821/status" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: code=404" -d "{\"action\":\"hide\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821/status` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: code=404` |
| Body | `{"action":"hide"}` |
| Expected status | 404 Not Found |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail
**Notes:** Simulated with `Prefer: code=404`.

---

### Case 8: Invalid state transition (409 Conflict)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821/status" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: code=409" -d "{\"action\":\"hide\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/reviews/67015de8-1ce8-4ac4-8634-384bf5fb3821/status` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: code=409` |
| Body | `{"action":"hide"}` |
| Expected status | 409 Conflict |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail
**Notes:** Simulated with `Prefer: code=409`.

---

## POST /functions/v1/chat

**Summary:** Ask the AI Chat Assistant across visible reviews (operationId askChatbot)
**Roles:** Faculty, Admin
**Request body:** Required JSON object (see each case).

### Case 1: Valid request (200 OK)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/chat" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -d "{\"message\":\"Which students demonstrate strong research and teamwork skills?\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/chat` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` |
| Body | `{"message":"Which students demonstrate strong research and teamwork skills?"}` |
| Expected status | 200 OK |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 2: Missing JWT Bearer token (401 Unauthorized)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/chat" -H "Content-Type: application/json" -d "{\"message\":\"Which students demonstrate strong research and teamwork skills?\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/chat` |
| Headers | `Content-Type: application/json` |
| Body | `{"message":"Which students demonstrate strong research and teamwork skills?"}` |
| Expected status | 401 Unauthorized |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 3: Role violation (simulated) (403 Forbidden)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/chat" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: code=403" -d "{\"message\":\"Which students demonstrate strong research and teamwork skills?\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/chat` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: code=403` |
| Body | `{"message":"Which students demonstrate strong research and teamwork skills?"}` |
| Expected status | 403 Forbidden |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail
**Notes:** Simulated with `Prefer: code=403`. If Prism rejects it, record it as Fail (cannot simulate) and add it to Issues Found.

---

### Case 4: Invalid payload (empty message) (422 Unprocessable Entity)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/chat" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -d "{\"message\":\"\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/chat` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` |
| Body | `{"message":""}` |
| Expected status | 422 Unprocessable Entity |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 5: Missing request body (empty object) (422 Unprocessable Entity)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/chat" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -d "{}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/chat` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` |
| Body | `{}` |
| Expected status | 422 Unprocessable Entity |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 6: Rate limited (429 Too Many Requests)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/chat" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: code=429" -d "{\"message\":\"Which students demonstrate strong research and teamwork skills?\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/chat` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: code=429` |
| Body | `{"message":"Which students demonstrate strong research and teamwork skills?"}` |
| Expected status | 429 Too Many Requests |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail
**Notes:** Simulated with `Prefer: code=429`.

---

## POST /functions/v1/approvals

**Summary:** Bulk approve or reject applications (operationId decideApplications)
**Roles:** Admin
**Request body:** Required JSON object (see each case).

### Case 1: Valid approve (200 OK)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/approvals" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -d "{\"application_ids\":[\"32272463-1823-4774-a574-558101103e9a\"],\"decision\":\"approve\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/approvals` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` |
| Body | `{"application_ids":["32272463-1823-4774-a574-558101103e9a"],"decision":"approve"}` |
| Expected status | 200 OK |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 2: Valid reject (200 OK)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/approvals" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: example=rejected" -d "{\"application_ids\":[\"32272463-1823-4774-a574-558101103e9a\"],\"decision\":\"reject\",\"reason\":\"The submitted student record could not be physically verified.\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/approvals` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: example=rejected` |
| Body | `{"application_ids":["32272463-1823-4774-a574-558101103e9a"],"decision":"reject","reason":"The submitted student record could not be physically verified."}` |
| Expected status | 200 OK |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail
**Notes:** `Prefer: example=rejected` selects the named rejected example.

---

### Case 3: Missing JWT Bearer token (401 Unauthorized)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/approvals" -H "Content-Type: application/json" -d "{\"application_ids\":[\"32272463-1823-4774-a574-558101103e9a\"],\"decision\":\"approve\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/approvals` |
| Headers | `Content-Type: application/json` |
| Body | `{"application_ids":["32272463-1823-4774-a574-558101103e9a"],"decision":"approve"}` |
| Expected status | 401 Unauthorized |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 4: Role violation (simulated) (403 Forbidden)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/approvals" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: code=403" -d "{\"application_ids\":[\"32272463-1823-4774-a574-558101103e9a\"],\"decision\":\"approve\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/approvals` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: code=403` |
| Body | `{"application_ids":["32272463-1823-4774-a574-558101103e9a"],"decision":"approve"}` |
| Expected status | 403 Forbidden |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail
**Notes:** Simulated with `Prefer: code=403`. If Prism rejects it, record it as Fail (cannot simulate) and add it to Issues Found.

---

### Case 5: Invalid payload (reject without reason) (422 Unprocessable Entity)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/approvals" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -d "{\"application_ids\":[\"32272463-1823-4774-a574-558101103e9a\"],\"decision\":\"reject\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/approvals` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` |
| Body | `{"application_ids":["32272463-1823-4774-a574-558101103e9a"],"decision":"reject"}` |
| Expected status | 422 Unprocessable Entity |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 6: Missing request body (empty object) (422 Unprocessable Entity)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/approvals" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -d "{}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/approvals` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` |
| Body | `{}` |
| Expected status | 422 Unprocessable Entity |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 7: Application not found (404 Not Found)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/approvals" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: code=404" -d "{\"application_ids\":[\"32272463-1823-4774-a574-558101103e9a\"],\"decision\":\"approve\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/approvals` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: code=404` |
| Body | `{"application_ids":["32272463-1823-4774-a574-558101103e9a"],"decision":"approve"}` |
| Expected status | 404 Not Found |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail
**Notes:** Simulated with `Prefer: code=404`.

---

### Case 8: Application already decided (409 Conflict)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/functions/v1/approvals" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: code=409" -d "{\"application_ids\":[\"32272463-1823-4774-a574-558101103e9a\"],\"decision\":\"approve\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/functions/v1/approvals` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: code=409` |
| Body | `{"application_ids":["32272463-1823-4774-a574-558101103e9a"],"decision":"approve"}` |
| Expected status | 409 Conflict |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail
**Notes:** Simulated with `Prefer: code=409`.

---

## POST /rest/v1/rpc/update_own_profile

**Summary:** Update the current verified faculty member name (operationId updateOwnProfile)
**Roles:** Faculty (verified)
**Request body:** Required JSON object (see each case).

### Case 1: Valid request (200 OK)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/rest/v1/rpc/update_own_profile" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -d "{\"full_name\":\"Alex Reyes\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/rpc/update_own_profile` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` |
| Body | `{"full_name":"Alex Reyes"}` |
| Expected status | 200 OK |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 2: Missing JWT Bearer token (401 Unauthorized)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/rest/v1/rpc/update_own_profile" -H "Content-Type: application/json" -d "{\"full_name\":\"Alex Reyes\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/rpc/update_own_profile` |
| Headers | `Content-Type: application/json` |
| Body | `{"full_name":"Alex Reyes"}` |
| Expected status | 401 Unauthorized |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 3: Role violation (simulated) (403 Forbidden)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/rest/v1/rpc/update_own_profile" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: code=403" -d "{\"full_name\":\"Alex Reyes\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/rpc/update_own_profile` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: code=403` |
| Body | `{"full_name":"Alex Reyes"}` |
| Expected status | 403 Forbidden |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail
**Notes:** Simulated with `Prefer: code=403`. If Prism rejects it, record it as Fail (cannot simulate) and add it to Issues Found.

---

### Case 4: Invalid payload (empty full_name) (400 Bad Request)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/rest/v1/rpc/update_own_profile" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -d "{\"full_name\":\"\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/rpc/update_own_profile` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` |
| Body | `{"full_name":""}` |
| Expected status | 400 Bad Request |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 5: Missing request body (empty object) (400 Bad Request)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/rest/v1/rpc/update_own_profile" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -d "{}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/rpc/update_own_profile` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` |
| Body | `{}` |
| Expected status | 400 Bad Request |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 6: Conflict (409 Conflict)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/rest/v1/rpc/update_own_profile" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Content-Type: application/json" -H "Prefer: code=409" -d "{\"full_name\":\"Alex Reyes\"}"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/rpc/update_own_profile` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` `Content-Type: application/json` `Prefer: code=409` |
| Body | `{"full_name":"Alex Reyes"}` |
| Expected status | 409 Conflict |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail
**Notes:** Simulated with `Prefer: code=409`.

---

## GET /rest/v1/review_details

**Summary:** List attributed reviews with rich text and normalized tags (operationId listStudentReviews)
**Roles:** Faculty
**Request body:** None.

### Case 1: Valid request (200 OK)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/review_details?student_id=eq.45b54332-e470-4c21-a839-7428c4f6bf42" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/review_details?student_id=eq.45b54332-e470-4c21-a839-7428c4f6bf42` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 200 OK |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 2: Missing JWT Bearer token (401 Unauthorized)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/review_details?student_id=eq.45b54332-e470-4c21-a839-7428c4f6bf42"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/review_details?student_id=eq.45b54332-e470-4c21-a839-7428c4f6bf42` |
| Headers | None (no Authorization) |
| Body | None |
| Expected status | 401 Unauthorized |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 3: Role violation (simulated) (403 Forbidden)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/review_details?student_id=eq.45b54332-e470-4c21-a839-7428c4f6bf42&__code=403" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/review_details?student_id=eq.45b54332-e470-4c21-a839-7428c4f6bf42&__code=403` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 403 Forbidden |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail
**Notes:** Simulated with `__code=403`. `Prefer: code=403` is not used because this operation's `Prefer` header is fixed to `count=exact`.

---

### Case 4: Invalid UUID (400 Bad Request)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/review_details?student_id=eq.not-a-uuid" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/review_details?student_id=eq.not-a-uuid` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 400 Bad Request |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 5: Invalid status filter (400 Bad Request)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/review_details?student_id=eq.45b54332-e470-4c21-a839-7428c4f6bf42&status=eq.deleted" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| URL | `http://127.0.0.1:4010/rest/v1/review_details?student_id=eq.45b54332-e470-4c21-a839-7428c4f6bf42&status=eq.deleted` |
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 400 Bad Request |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail
**Notes:** `status` only allows `eq.active` and `eq.hidden`.

---

## Issues Found in the Contract

| # | Endpoint | Issue | Suggested fix |
|---|---|---|---| 
| 4.3 | `PATCH /rest/v1/faculty_profiles` | `Prefer` is restricted to a constant, so a 403 cannot be simulated with `Prefer: code=403` | Allow additional `Prefer` values (enum or pattern) so Prism can simulate status codes |
| 7.3 |`POST /rest/v1/student_profiles` | `Prefer` is restricted to a constant, so `Prefer: code=403` returns 400 and 403 cannot be simulated | Allow additional `Prefer` values (enum or pattern), or document another way to simulate error responses |
| 8.3 |`PATCH /rest/v1/student_profiles` | `Prefer` is restricted to a constant, so `Prefer: code=403` returns 400 and 403 cannot be simulated | Allow additional `Prefer` values (enum or pattern), or document another way to simulate error responses |