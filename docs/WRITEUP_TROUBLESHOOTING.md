# Write-up troubleshooting

If a signed internal call returns 401, verify the exact canonical path, Unix timestamp, one-time nonce, raw-body SHA-256 and HMAC secret on both sides. Do not log the secret or signature. A replayed nonce must use a new request and nonce.

If n8n cannot start, ensure the untracked root `.env` has `N8N_ENCRYPTION_KEY`, `N8N_DB_PASSWORD`, and `WRITEUP_INGEST_HMAC_SECRET`. Existing PostgreSQL volumes do not rerun initialization scripts; create the dedicated n8n database/user using a DBA account or recreate disposable local data.

If an item will not publish, verify its status transition and reviewed English/Persian translations. If public content is missing, it must be published and its publication timestamp must be due. Never work around these checks through direct database changes.
