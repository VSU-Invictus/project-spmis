# openAPI - Prism Mock Test Results

## Test Setup

| Item | Value |
|---|---|
| Contract file | `contract/openapi.yaml` |
| Mock server command | `npx @stoplight/prism-cli mock contract/openapi.yaml` |
| Base URL | `http://127.0.0.1:4010` |
| Tools used | curl |
| Tested by | @Zaming |
| Date | 2026-10-30 |

> Prism returns responses defined in the OpenAPI file. These tests verify the **contract**, not real database behavior.

## Summary

| # | Endpoint | Method | Case | Status | Result |
|---|---|---|---|---|---|
| 1.1 | /rest/v1/rpc/get_student_by_id | GET | Valid request | 200 | **Pass** |
| 1.2 | /rest/v1/rpc/get_student_by_id | GET | Null result | 200 | **Pass** |
| 1.3 | /rest/v1/rpc/get_student_by_id | GET | Missing JWT | 401 | **Pass** |
| 1.4 | /rest/v1/rpc/get_student_by_id | GET | Role violation | 403 | **Pass** |
| 1.5 | /rest/v1/rpc/get_student_by_id | GET | Invalid UUID | 422 | **Pass** |
| 1.6 | /rest/v1/rpc/get_student_by_id | GET | Missing parameter | 422 | **Pass** |
| 2.1 | /rest/v1/rpc/get_own_profile | GET | Valid request | 200 | **Pass** |
| 2.2 | /rest/v1/rpc/get_own_profile | GET | Null result | 200 | **Pass** |
| 2.3 | /rest/v1/rpc/get_own_profile | GET | Missing JWT | 401 | **Pass** |
| 2.4 | /rest/v1/rpc/get_own_profile | GET | Role violation | 403 | Pass/Fail |
| 2.5 | /rest/v1/rpc/get_own_profile | GET | Invalid UUID | 422 | Pass/Fail |
| 2.6 | /rest/v1/rpc/get_own_profile | GET | Missing parameter | 422 | Pass/Fail |

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
>curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id?p_student_id=45b54332-e470-4c21-a839-7428c4f6bf42" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Prefer: example=notVisible"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization`, `Prefer: example=NAME_OF_NULL_EXAMPLE` |
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
"details":null,"hint":null
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
| Headers | `apikey: test-key` `Authorization`, `Prefer: code=403` |
| Body | None |
| Expected status | 403 Forbidden |
| Actual status | 403 Forbidden |

**Response**
```json
{
"code":"FORBIDDEN",
"message":"You are not allowed to perform this action.",
"details":null,"hint":null
}
```

**Result:** Pass

---

### Case 5: Invalid UUID (400 / 422)

**Request**
```bash
>curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id?p_student_id=not-a-uuid" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 400 or 422 |
| Actual status | 400 |

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

### Case 6: Missing required parameter (400 / 422)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 400 or 422 |
| Actual status | 400 Bad request |

**Validation header**
```
sl-violations: [{"location":["request","query"],"severity":"Error","code":"required","message":"Request query must have required property 'p_student_id'"}]
```

**Response**
```json
{
  "code": "22P02",
  "message": "Invalid input syntax for a column value.",
  "details": null,
  "hint": "Correct the request."
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
>curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_own_profile" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
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
>curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_own_profile" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Prefer: example=notEnrolled"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization`, `Prefer: example=NAME_OF_NULL_EXAMPLE` |
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
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id?p_student_id=45b54332-e470-4c21-a839-7428c4f6bf42" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token" -H "Prefer: code=403"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization`, `Prefer: code=403` |
| Body | None |
| Expected status | 403 Forbidden |
| Actual status | 403 Forbidden |

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

### Case 5: Invalid UUID (400 / 422)

**Request**
```bash
>curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id?p_student_id=not-a-uuid" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 400 or 422 |
| Actual status | 400 |

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

### Case 6: Missing required parameter (400 / 422)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id" -H "apikey: test-key" -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| Headers | `apikey: test-key` `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 400 or 422 |
| Actual status | 400 Bad request |

**Validation header**
```
sl-violations: [{"location":["request","query"],"severity":"Error","code":"required","message":"Request query must have required property 'p_student_id'"}]
```

**Response**
```json
{
  "code": "22P02",
  "message": "Invalid input syntax for a column value.",
  "details": null,
  "hint": "Correct the request."
}
```

**Result:** Pass

---

## Issues Found in the Contract

| # | Endpoint | Issue | Suggested fix |
|---|---|---|---|
| 1 | | Example: 403 response not defined | Add `'403'` under `responses` |
| 2 | | | |
