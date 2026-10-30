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
| 1.1 | /rest/v1/rpc/get_student_by_id | GET | Valid request | 200 | Pass |
| 1.2 | /rest/v1/rpc/get_student_by_id | GET | Null result | 200 | Pass |
| 1.3 | /rest/v1/rpc/get_student_by_id | GET | Missing JWT | 401 | Pass |
| 1.4 | /rest/v1/rpc/get_student_by_id | GET | Role violation | 403 | Pass / Fail |
| 1.5 | /rest/v1/rpc/get_student_by_id | GET | Invalid UUID | 422 | Pass / Fail |
| 1.6 | /rest/v1/rpc/get_student_by_id | GET | Missing parameter | 422 | Pass / Fail |

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
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id?p_student_id=45b54332-e470-4c21-a839-7428c4f6bf42" \
  -H "Authorization: Bearer test.jwt.token" \
  -H "Prefer: code=403"
```

| Item | Value |
|---|---|
| Headers | `Authorization`, `Prefer: code=403` |
| Body | None |
| Expected status | 403 Forbidden |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail
**Notes:** If Prism errors, the 403 response is not defined in the contract.

---

### Case 5: Invalid UUID (400 / 422)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id?p_student_id=not-a-uuid" \
  -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| Headers | `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 400 or 422 |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

### Case 6: Missing required parameter (400 / 422)

**Request**
```bash
curl -i "http://127.0.0.1:4010/rest/v1/rpc/get_student_by_id" \
  -H "Authorization: Bearer test.jwt.token"
```

| Item | Value |
|---|---|
| Headers | `Authorization: Bearer test.jwt.token` |
| Body | None |
| Expected status | 400 or 422 |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

**Result:** Pass / Fail

---

## Template for a POST endpoint (copy for each one that has a request body)

### Case: Valid request (201 Created)

**Request**
```bash
curl -i -X POST "http://127.0.0.1:4010/PATH_HERE" \
  -H "Authorization: Bearer test.jwt.token" \
  -H "Content-Type: application/json" \
  -d '{
    "field": "value"
  }'
```

| Item | Value |
|---|---|
| Headers | `Authorization`, `Content-Type: application/json` |
| Body | `{"field": "value"}` |
| Expected status | 201 Created |
| Actual status | |

**Response**
```json
PASTE ACTUAL RESPONSE HERE
```

---

## Issues Found in the Contract

| # | Endpoint | Issue | Suggested fix |
|---|---|---|---|
| 1 | | Example: 403 response not defined | Add `'403'` under `responses` |
| 2 | | | |
