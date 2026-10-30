# Faculty / Admin API - Prism Mock Test Results

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
| 1 |  |  |  |  |  |
| 2 |  |  |  |  |  |
| 3 |  |  |  |  |  |
| 4 |  |  |  |  |  |
| 5 |  |  |  |  |  |
| 6 |  |  |  |  |  |

---

## GET 



### Case 1: Valid request (200 OK)

**Request**
```bash

```

| Item | Value |
|---|---|
| URL |  |
| Headers |  |
| Body |  |
| Expected status |  |
| Actual status |  |

**Response**
```json

```

**Result:** Pass / Fail
**Notes:**

---

### Case 2: Null result (200 OK)

**Request**
```bash

```

| Item | Value |
|---|---|
| Headers |  |
| Body |  |
| Expected status |  |
| Actual status | |

**Response**
```json

```

**Result:** Pass / Fail
**Notes:** 

---

### Case 3: Missing JWT Bearer token (401 Unauthorized)

**Request**
```bash

```

| Item | Value |
|---|---|
| Headers |  |
| Body |  |
| Expected status |  |
| Actual status | |

**Response**
```json

```

**Result:** Pass / Fail
**Notes:** 

---

### Case 4: Role violation (403 Forbidden)

**Request**
```bash

```

| Item | Value |
|---|---|
| Headers |  |
| Body |  |
| Expected status |  |
| Actual status | |

**Response**
```json

```

**Result:** Pass / Fail
**Notes:** 

---

### Case 5: Invalid UUID (400 / 422)

**Request**
```bash

```

| Item | Value |
|---|---|
| Headers |  |
| Body |  |
| Expected status |  |
| Actual status | |

**Response**
```json

```

**Result:** Pass / Fail

---

### Case 6: Missing required parameter (400 / 422)

**Request**
```bash

```

| Item | Value |
|---|---|
| Headers |  |
| Body |  |
| Expected status |  |
| Actual status | |

**Response**
```json

```

**Result:** Pass / Fail

---

## Template for a POST endpoint (copy for each one that has a request body)

### Case: Valid request (201 Created)

**Request**
```bash

```

| Item | Value |
|---|---|
| Headers |  |
| Body |  |
| Expected status |  |
| Actual status | |

**Response**
```json

```

---

## Issues Found in the Contract

| # | Endpoint | Issue | Suggested fix |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
