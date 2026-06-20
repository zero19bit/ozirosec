# Write-up platform

HackPath Write-ups are bilingual, moderated educational summaries. Manual and automated records use the same `writeups`, translations, tag, source, lab and vulnerability relations. Automated records are created with `ingestion_method=n8n` and `pending_review`; n8n cannot publish content.

## Local development

Install PHP 8.2+, Composer, Node 22+, Docker Compose and PostgreSQL/SQLite as described in the root README. Run backend migrations from `backend` with `php artisan migrate`, then run the backend and frontend using the root README commands. The public library is `/writeups`; administration is protected under `/admin`.

For Docker, copy the root `.env.example` to an untracked `.env`, set the required n8n secrets, then use `docker compose up -d`. Open `http://localhost:5678` and create the n8n owner account interactively.

## Content policy

Publish original HackPath summaries and analysis, not copied source articles. Preserve source URL and original author attribution, label AI-assisted material where applicable, verify technical claims manually, and do not invent CVEs, severity, or affected products. Never include active lab flags, solutions, digests, credentials, API keys, or private request captures.

## Current readiness

Database/domain models, public/admin API foundations, signed internal endpoints, Compose infrastructure and inactive workflow templates exist. The hardened-fetch proxy, end-to-end n8n fixture ingestion, complete admin/public UI, and the dedicated security-test suite are not complete; see `WRITEUP_SECURITY.md` and `WRITEUP_TROUBLESHOOTING.md` before deployment.
