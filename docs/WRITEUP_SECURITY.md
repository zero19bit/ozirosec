# Write-up security

Internal n8n requests use HMAC-SHA256 over method, path, timestamp, nonce, and raw-body digest. Laravel checks clock skew, digest and signature with constant-time comparison, records a hashed nonce for replay protection, limits payload size, and applies a service-keyed rate limit. Generate HMAC secrets with a cryptographically secure generator; store them only in deployment secret storage and rotate Laravel/n8n together.

Public resources must exclude notes, reviewer IDs, automation errors, raw ingestion data, credentials and unpublished content. Use structured text rendering with raw HTML disabled; external links require `noopener noreferrer`. Logs must contain only safe IDs/digests/outcomes, never article bodies, HMAC values, AI keys, cookies, credentials, or lab flags.

Article text is untrusted data. AI prompts must reject embedded instructions, never disclose secrets/call tools based on article text, and return bounded JSON only. Direct n8n crawling is not approved; use a hardened fetch proxy before activation. Back up PostgreSQL, `n8n_data`, and `N8N_ENCRYPTION_KEY`; loss of the encryption key can make n8n credentials unusable.
