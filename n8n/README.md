# n8n local service and workflow templates

Copy the root `.env.example` to an untracked `.env`, generate high-entropy values for `N8N_ENCRYPTION_KEY`, `N8N_DB_PASSWORD`, and `WRITEUP_INGEST_HMAC_SECRET`, then run `docker compose up -d n8n`.

Open `http://localhost:5678` and create the initial owner account interactively. No default owner password exists. n8n receives only a dedicated PostgreSQL database/user and communicates with HackPath through the internal signed API; it must never receive Laravel database credentials.

## Workflow import

Import the JSON files in `n8n/workflows/` from the n8n editor. Keep every workflow inactive until the internal API, a hardened fetch proxy, and an approved AI credential are configured. Required environment values are `WRITEUP_INGEST_HMAC_SECRET`, `HACKPATH_INTERNAL_API_URL`, and `HACKPATH_FETCH_PROXY_URL`; none belong in workflow JSON.

The ingestion template signs the Laravel canonical request format, fetches only Laravel-returned RSS/API sources, validates structured English/Persian output, and is designed to submit only `pending_review` records. It deliberately does **not** implement direct arbitrary article fetching: n8n cannot provide sufficient SSRF protection for redirects and DNS rebinding by itself. Route article retrieval through a hardened proxy that permits configured hostnames, revalidates every redirect, blocks private/link-local/metadata IP ranges, bounds size/time/content type, and returns extracted text only.

Use an approved AI credential stored in n8n credentials or environment-backed secret storage. The prompt must treat article text as untrusted data, ignore embedded instructions, never reveal credentials or invoke tools, avoid fabricated CVEs/severity/products, and return structured JSON only. Keep retries bounded to three attempts and log only safe summaries.
