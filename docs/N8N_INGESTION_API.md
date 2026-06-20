# n8n internal ingestion API

n8n must call Laravel over the internal network. It never receives PostgreSQL credentials and must not connect to the HackPath database.

## Authentication

Every request uses `WRITEUP_INGEST_HMAC_SECRET` and the canonical string:

```text
METHOD\nPATH\nTIMESTAMP\nNONCE\nSHA256(raw request body)
```

`PATH` includes the leading slash (for example `/api/internal/writeups/ingest`). Send `X-HackPath-Timestamp` (Unix seconds), `X-HackPath-Nonce` (random base64url), `X-HackPath-Content-SHA256` (lowercase body digest), and `X-HackPath-Signature` (lowercase HMAC-SHA256). JSON requests must use `Content-Type: application/json`.

Laravel permits timestamps only within `WRITEUP_INGEST_ALLOWED_CLOCK_SKEW` (default 300 seconds), checks the body digest and signature in constant time, and atomically stores the nonce hash. A reused nonce returns a generic 401 response; validation detail is intentionally not disclosed.

## Endpoints

`GET /api/internal/writeup-sources`, `POST /api/internal/writeups/check-duplicate`, `POST /api/internal/writeups/ingest`, `POST /api/internal/writeup-automation-runs`, and `PATCH /api/internal/writeup-automation-runs/{id}` all require the headers above. Ingest is always stored as `n8n` / `pending_review`; supplied publish, approval, reviewer, creator, or featured fields are ignored.

## Environment and rotation

Set `WRITEUP_INGEST_HMAC_SECRET` only in deployment secret storage, `WRITEUP_INGEST_ALLOWED_CLOCK_SKEW=300`, and `WRITEUP_INGEST_MAX_PAYLOAD_BYTES=262144`. Rotate by deploying a new secret to Laravel and n8n in a coordinated maintenance window; then invalidate the old n8n credential. Do not log signatures, secrets, complete article bodies, or prompt contents.
