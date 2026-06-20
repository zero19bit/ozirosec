# Self-hosted n8n

The development Compose stack runs n8n Community Edition at `http://localhost:5678`. Before starting it, copy `.env.example` to an untracked `.env` and set a random n8n encryption key, a dedicated n8n database password, and the Laravel ingestion HMAC secret. Create the initial owner account in the browser; never automate a weak default account.

`postgres` creates the `n8n` database and `n8n_user` only when its data volume is first initialized. This user is not granted access to the `hackpath` database. If the existing local PostgreSQL volume predates this change, create the n8n database/user once using a DBA session or recreate only disposable development data.

The `n8n_data` volume stores n8n settings and encrypted credentials. Back up the dedicated n8n PostgreSQL database, the `n8n_data` volume, and `N8N_ENCRYPTION_KEY` together. Losing that key can make stored credentials unrecoverable.

Workflow import and fixture ingestion are not yet deployment-ready. The committed templates are inactive and require a hardened fetch proxy, approved AI credential, signed internal API test, and manual moderation verification before activation.

For production, expose `https://n8n.example.ir` only behind HTTPS and restricted access (VPN, IP allowlist, Cloudflare Access, or SSO). Set `N8N_HOST`, `N8N_PROTOCOL=https`, `N8N_SECURE_COOKIE=true`, and `WEBHOOK_URL=https://n8n.example.ir/` in an untracked production environment file. Use a reverse proxy, strong owner account, execution pruning, backups, and a dedicated 4 GB VPS resource budget. The included service is limited to 768 MiB RAM, 0.75 CPU, and a production concurrency ceiling of five; do not run local AI models on this host.
