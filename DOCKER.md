# HackPath Docker Guide

This setup keeps development and production concerns separate. Images never copy local `.env` files, `vendor`, or `node_modules`; runtime configuration must come from environment variables or a secret manager.

## Services

Development uses:

- `php`: Laravel PHP-FPM application.
- `nginx`: lightweight backend web server exposed on `http://localhost:8000`.
- `postgres`: PostgreSQL on an internal Docker network only.
- `frontend`: Vite dev server exposed on `http://localhost:5173`.

Redis is intentionally not included because the current app does not require it. Mail is logged by default in development; add Mailpit only if you need browser-visible email testing.

## Development First Run

```powershell
docker compose build
docker compose up -d
docker compose exec php composer install
docker compose exec php php artisan migrate --seed
```

Open:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api/v1`
- Sanctum CSRF: `http://localhost:8000/sanctum/csrf-cookie`
- Liveness: `http://localhost:8000/health/live`
- Readiness: `http://localhost:8000/health/ready`

The development environment file is `docker/env/backend.dev.example`. It contains local-only values. Do not reuse them in production.

## Development Commands

```powershell
docker compose exec php php artisan test
docker compose exec php php artisan migrate:fresh --seed
docker compose exec frontend npm run typecheck
docker compose exec frontend npm test -- --run
docker compose exec frontend npm run build
```

To recreate containers without losing the database:

```powershell
docker compose down
docker compose up -d
```

To delete development database data intentionally:

```powershell
docker compose down -v
```

## Cookie-Based SPA Authentication

Development is configured for:

- Browser frontend origin: `http://localhost:5173`
- Browser backend origin: `http://localhost:8000`
- `FRONTEND_URL=http://localhost:5173`
- `CORS_ALLOWED_ORIGINS=http://localhost:5173`
- `SANCTUM_STATEFUL_DOMAINS=localhost:5173,frontend:5173`
- `SESSION_DOMAIN=localhost`
- `SESSION_SECURE_COOKIE=false`

Production should use a single HTTPS site when possible, for example `https://hackpath.example.com`, with the SPA served by Nginx and API routes proxied to PHP-FPM. For cross-subdomain deployment, align `SESSION_DOMAIN`, `SANCTUM_STATEFUL_DOMAINS`, `FRONTEND_URL`, and `CORS_ALLOWED_ORIGINS`.

## Production Build

Build production images:

```powershell
docker compose -f compose.prod.yaml build
```

Before running production, copy the example files to untracked runtime env files or configure equivalent secrets in your orchestrator:

```powershell
Copy-Item docker/env/backend.prod.example docker/env/backend.prod.env
Copy-Item docker/env/postgres.prod.example docker/env/postgres.prod.env
```

Replace every `REPLACE_WITH_...` value. Do not commit the copied files.

If using the provided production compose file directly, point `env_file` entries at your untracked files or provide environment variables through your platform.

## Release and Migration Flow

Do not run migrations automatically in every web replica. Run one explicit release command:

```powershell
docker compose -f compose.prod.yaml run --rm php php artisan migrate --force
```

Then start or roll your web services:

```powershell
docker compose -f compose.prod.yaml up -d
```

Rollback application code with your image registry or deployment platform. Roll back database changes only after confirming the migration `down()` path is safe for production data:

```powershell
docker compose -f compose.prod.yaml run --rm php php artisan migrate:rollback --step=1 --force
```

Always back up the production database before migrations.

## Queue Worker and Scheduler

Run queue workers as separate replicas from the same PHP image:

```powershell
docker compose -f compose.prod.yaml run --rm php php artisan queue:work --sleep=3 --tries=3 --timeout=90
```

Run the scheduler as a separate process:

```powershell
docker compose -f compose.prod.yaml run --rm php php artisan schedule:work
```

Do not run workers or schedulers inside the Nginx container.

## Caches, Storage, and Logs

The production PHP entrypoint runs:

- `php artisan config:cache`
- `php artisan route:cache`
- `php artisan view:cache`

Set `HACKPATH_CACHE_BOOTSTRAP=false` only for debugging startup configuration issues.

Persist Laravel `storage/` with a volume or platform disk. Send logs to stdout/stderr in containers using `LOG_CHANNEL=stderr`, and collect them with your orchestrator.

## Health Checks

- `/health/live`: liveness only; does not touch dependencies.
- `/health/ready`: readiness; checks database connectivity and returns no secret data.

Use liveness for container restart decisions and readiness for load-balancer traffic.
