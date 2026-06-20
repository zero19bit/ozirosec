# HackPath

HackPath is a security-training lab platform for learning web vulnerabilities in an authorized, controlled environment. It is organized as a monorepo with a Laravel API backend and a React/Vite frontend.

Current status: active development. The repository includes production-hardening checks, tests, CI, and Docker configuration, but a real production deployment still requires secure environment values, HTTPS, a production database, SMTP, secret management, backups, and operational review.

Write-up platform status: database/domain, initial APIs, signed internal-ingestion boundary, local n8n infrastructure, and inactive workflow templates are present. The platform is not yet production-ready: complete admin/public UI coverage, hardened external fetching, end-to-end fixture ingestion, and Write-up-specific security tests remain required. See `docs/WRITEUP_PLATFORM.md`.

## 1. Project Title and Status

- Project name: `HackPath`
- Purpose: security education, lab practice, progress tracking, and administrator-managed training workflows.
- Backend: Laravel 12, PHP 8.2+, Laravel Sanctum, cookie-based SPA authentication.
- Frontend: React 19, TypeScript, Vite.
- Database options: SQLite for local/testing, PostgreSQL or MySQL/MariaDB for production-style deployments.
- CI: GitHub Actions workflows for backend, frontend, PostgreSQL readiness, and repository hygiene.
- Docker: development and production Compose files are present.

Repository summary:

```text
HackPath/
├── backend/              Laravel 12 API application
├── frontend/             React 19 + TypeScript + Vite SPA
├── docker/               Nginx, PHP, and environment examples for Docker
├── .github/workflows/    CI pipelines
├── CLEAN_INSTALL.md      Short clean-install notes
├── DOCKER.md             Docker-focused notes
├── SECURITY_ROTATION.md  Secret rotation guide
└── README.md             Complete project guide
```

## 2. Important Security and Legal Notice

HackPath is for authorized education and controlled security labs only.

- Use HackPath only on systems and labs you own or have explicit permission to test.
- Do not attack public, third-party, or unauthorized systems.
- Active flags, HMAC secrets, administrator passwords, database credentials, API tokens, and mail credentials must remain server-side.
- Frontend validation is for user experience only; it is never a security boundary.
- Browser data is untrusted. The backend is authoritative for roles, progress, points, completion, and flag verification.
- Never commit `.env`, local databases, generated keys, active flags, real digests, access tokens, or private keys.
- Production credentials must never use sample, placeholder, default, or predictable values.

## 3. Features

Verified current features include:

- User registration and login.
- Laravel Sanctum cookie-based first-party SPA authentication.
- CSRF cookie protection and credentialed requests.
- Current-user endpoint and protected frontend routes.
- Email verification with signed Laravel verification URLs.
- User roles via `App\Enums\UserRole`.
- Administrator UI route at `/admin`.
- Backend authorization through middleware, gates, and policies.
- User suspension controls.
- Final active administrator protection.
- Current-session logout and all-device logout.
- Server-authoritative lab verification, progress, attempts, and points.
- Server-side HMAC flag verification configuration.
- Rate limiting for public, authenticated, lab, admin, and session-management flows.
- Centralized CORS configuration.
- Production configuration validation.
- Docker development and production Compose files.
- Backend and frontend automated tests.
- GitHub Actions CI.

## 4. Technology Stack

### Backend

| Area | Current Repository |
| --- | --- |
| PHP | `^8.2` from `backend/composer.json`; verified locally with PHP `8.2.12` |
| Framework | Laravel `^12.0`; verified `php artisan about` reported Laravel `12.62.0` |
| Auth | Laravel Sanctum `^4.0`, web sessions, CSRF cookies |
| Database | SQLite, PostgreSQL, MySQL/MariaDB via Laravel config |
| Tests | PHPUnit `^11.5.50` through `php artisan test` |
| Formatting | Laravel Pint `^1.24` via `vendor/bin/pint --test` |
| Static analysis | No PHP static analyzer is currently configured |

### Frontend

| Area | Current Repository |
| --- | --- |
| Runtime | Node.js is required; CI uses Node `22` |
| Package manager | npm with `frontend/package-lock.json` |
| UI | React `19.2.6`, React DOM `19.2.6` |
| Language | TypeScript `5.9.3` |
| Build | Vite `^7.3.5`, `vite-plugin-singlefile` |
| Tests | Vitest `^4.1.9`, Testing Library, jsdom |
| Linting | Current `npm run lint` executes `tsc --noEmit` |

### Infrastructure

| Area | Current Repository |
| --- | --- |
| Docker | `compose.yaml`, `compose.prod.yaml`, backend/frontend Dockerfiles |
| Development DB | PostgreSQL container in Docker; SQLite supported natively |
| Web server | Nginx in Docker, `php artisan serve` for simple native local dev |
| CI | GitHub Actions |

## 5. Repository Structure

```text
backend/app/Actions/                 Version-neutral application actions
backend/app/Http/Controllers/Api/V1/  V1 API controllers
backend/app/Http/Requests/Api/V1/     V1 form requests
backend/app/Http/Resources/Api/V1/    V1 API resources
backend/app/Policies/                 Backend authorization policies
backend/app/Services/                 Business services
backend/app/Support/                  Shared support classes and validators
backend/config/                       Laravel configuration
backend/database/migrations/          Database schema
backend/database/seeders/             Seeders, including admin reset seeder
backend/docs/                         Backend-specific docs
backend/routes/api.php                Versioned API route registration
backend/routes/web.php                Web and health routes
backend/tests/                        Backend tests
frontend/src/                         React application source
frontend/src/context/                 Auth context and app context
frontend/src/lib/                     Frontend API client
frontend/src/pages/                   SPA pages
frontend/src/store/                   Zustand app store
docker/                               Docker config, Nginx config, env examples
.github/workflows/                    CI workflows
```

## 6. Prerequisites

Install:

- Git.
- PHP `8.2` or newer.
- Composer `2`.
- Node.js `22` recommended, with npm.
- SQLite for simple local development, or PostgreSQL/MySQL for database-backed development.
- Docker Desktop or Docker Engine with Compose if using Docker.

Check versions:

```bash
git --version
php -v
composer --version
node -v
npm -v
docker --version
docker compose version
```

Composer platform requirements verified by `composer check-platform-reqs` include PHP and extensions such as `dom`, `fileinfo`, `filter`, `hash`, `iconv`, `json`, `libxml`, `openssl`, `pcre`, `phar`, `session`, `tokenizer`, `xml`, and `xmlwriter`. The application also needs a PDO driver for your selected database:

- SQLite: `pdo_sqlite`
- PostgreSQL: `pdo_pgsql`
- MySQL/MariaDB: `pdo_mysql`

`mbstring` and `ctype` are supplied by Symfony polyfills in this install, but native extensions are still recommended for typical Laravel deployments.

## 7. Recommended Installation Methods

Choose one path:

1. Native local setup: recommended for most developers because it is fastest and easiest to debug.
2. Docker development setup: recommended when you want a reproducible PostgreSQL + PHP-FPM + Nginx + Vite environment.
3. Production build/deployment: use only with real HTTPS, secrets, backups, and operational controls.

Do not mix native and Docker commands unless you understand which database and `.env` file you are using.

## 8. Clone the Repository

Use the real repository URL if you have one:

```bash
git clone <repository-url>
cd HackPath
```

PowerShell uses the same commands:

```powershell
git clone <repository-url>
cd HackPath
```

## 9. Backend Installation

### Linux/macOS/WSL

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan hackpath:create-admin
php artisan serve --host=localhost --port=8000
```

### Windows PowerShell

```powershell
cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
New-Item database/database.sqlite -ItemType File -Force
php artisan migrate
php artisan hackpath:create-admin
php artisan serve --host=localhost --port=8000
```

Expected backend development URL:

```text
http://localhost:8000
```

Useful backend health URLs:

```text
http://localhost:8000/health/live
http://localhost:8000/health/ready
```

`php artisan storage:link` is optional. It is only needed if you intentionally serve files from Laravel's public storage disk.

## 10. Environment Configuration

Edit `backend/.env`. Do not edit `backend/.env.example` for local secrets.

### Application

```text
APP_NAME=HackPath
APP_ENV=local
APP_KEY=<generated-by-php-artisan-key-generate>
APP_DEBUG=true
APP_URL=http://localhost:8000
```

`APP_KEY` must be generated with:

```bash
php artisan key:generate
```

### Frontend and CORS

Current backend config uses:

```text
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173
CORS_SUPPORTS_CREDENTIALS=true
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173,localhost,127.0.0.1,::1
```

Terms:

- URL: includes scheme, host, and optional port, for example `http://localhost:5173`.
- Origin: scheme + host + port, with no path, for example `http://localhost:5173`.
- Host/domain: no scheme, for example `localhost`.
- Sanctum stateful domain: host and optional port only, for example `localhost:5173`.

Known-working local browser setup:

```text
Backend APP_URL=http://localhost:8000
Frontend URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173,localhost,127.0.0.1,::1
```

### Session Security

Local HTTP example:

```text
SESSION_DRIVER=database
SESSION_DOMAIN=null
SESSION_SECURE_COOKIE=false
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax
```

Production HTTPS example:

```text
SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax
```

For a cross-site SPA deployment, such as API and frontend on different parent sites, `SESSION_SAME_SITE=none` and `SESSION_SECURE_COOKIE=true` are required.

All-device logout requires the database session driver and the `sessions.user_id` column created by the migrations.

### Database: SQLite

Use SQLite for quick local development:

```text
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

Create the file:

```bash
touch database/database.sqlite
```

PowerShell:

```powershell
New-Item database/database.sqlite -ItemType File -Force
```

### Database: PostgreSQL

```text
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=your-database-name
DB_USERNAME=your-database-user
DB_PASSWORD=your-secure-password
DB_SSLMODE=prefer
```

### Database: MySQL/MariaDB

```text
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your-database-name
DB_USERNAME=your-database-user
DB_PASSWORD=your-secure-password
DB_CHARSET=utf8mb4
DB_COLLATION=utf8mb4_unicode_ci
```

### Mail

Local default:

```text
MAIL_MAILER=log
MAIL_FROM_ADDRESS=hello@example.com
MAIL_FROM_NAME="${APP_NAME}"
```

Production SMTP placeholder:

```text
MAIL_MAILER=smtp
MAIL_HOST=smtp.your-domain.example
MAIL_PORT=587
MAIL_USERNAME=your-smtp-username
MAIL_PASSWORD=your-secure-smtp-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@your-domain.example
MAIL_FROM_NAME="${APP_NAME}"
```

Email verification requires working mail delivery in any environment where users must verify their email.

### Flag Verification

Server-side variables:

```text
HACKPATH_FLAG_ALGORITHM=sha256
HACKPATH_FLAG_SECRET=your-random-secret
HACKPATH_LAB_SQLI_001_ACTIVE=false
HACKPATH_LAB_SQLI_001_DIGEST=
HACKPATH_LAB_SQLI_001_POINTS=10
```

Lab-specific environment names are derived from the lab key in `backend/config/vulnerabilities.php`: uppercase the key and replace `-` with `_`. For example `sqli-001` becomes:

```text
HACKPATH_LAB_SQLI_001_ACTIVE
HACKPATH_LAB_SQLI_001_DIGEST
HACKPATH_LAB_SQLI_001_POINTS
```

Generate a digest without committing the plaintext flag:

```bash
export HACKPATH_FLAG_SECRET='your-random-secret'
php -r '$secret=getenv("HACKPATH_FLAG_SECRET"); fwrite(STDERR, "Flag: "); $flag=trim(fgets(STDIN)); echo hash_hmac("sha256", $flag, $secret), PHP_EOL;'
```

PowerShell:

```powershell
$env:HACKPATH_FLAG_SECRET = 'your-random-secret'
php -r '$secret=getenv("HACKPATH_FLAG_SECRET"); fwrite(STDERR, "Flag: "); $flag=trim(fgets(STDIN)); echo hash_hmac("sha256", $flag, $secret), PHP_EOL;'
```

Then set the resulting digest in the appropriate `HACKPATH_LAB_<KEY>_DIGEST` deployment variable. Do not store active plaintext flags in Git or in the frontend.

### Administrator Bootstrap

Preferred secure method:

```bash
php artisan hackpath:create-admin
```

Non-interactive example for local automation only:

```bash
php artisan hackpath:create-admin \
  --username=security-admin \
  --name="Security Admin" \
  --email=admin@example.test \
  --password='your-unique-strong-password!42' \
  --verify-email
```

PowerShell:

```powershell
php artisan hackpath:create-admin `
  --username=security-admin `
  --name="Security Admin" `
  --email=admin@example.test `
  --password='your-unique-strong-password!42' `
  --verify-email
```

The command rejects weak passwords and does not use hard-coded fallbacks.

The legacy reset seeder uses these variables:

```text
HACKPATH_ADMIN_NAME
HACKPATH_ADMIN_USERNAME
HACKPATH_ADMIN_EMAIL
HACKPATH_ADMIN_PASSWORD
```

`php artisan db:seed` calls `ResetToAdminSeeder`, which deletes existing users, sessions, progress, and submission logs before creating one admin. Use it only for an intentional development reset.

## 11. Database Setup

Run migrations:

```bash
php artisan migrate
```

Check migration state:

```bash
php artisan migrate:status
```

Run seeders:

```bash
php artisan db:seed
```

Warning: this project's default `DatabaseSeeder` calls `ResetToAdminSeeder`, which clears user and progress data. Prefer `php artisan hackpath:create-admin` for normal first-admin creation.

Destructive full reset:

```bash
php artisan migrate:fresh --seed
```

`migrate:fresh --seed` drops all tables and deletes existing data. Never run it on production unless you intend to destroy the database.

Before production migrations, take and verify a database backup.

## 12. Running the Backend

From `backend/`:

```bash
php artisan serve --host=localhost --port=8000
```

Expected development URL:

```text
http://localhost:8000
```

Queue configuration defaults to `database` in `.env.example`, but the current normal browser flow does not require a separate queue worker for local development. If you switch queued mail/jobs away from `sync`, run:

```bash
php artisan queue:work
```

No Reverb, WebSockets, Horizon, or Redis service is required by the current repository.

## 13. Frontend Installation

The frontend currently has no committed `.env.example`. It works with defaults:

```text
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SANCTUM_CSRF_URL=http://localhost:8000/sanctum/csrf-cookie
```

If you need to override these, create `frontend/.env.local` and do not commit it:

```text
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SANCTUM_CSRF_URL=http://localhost:8000/sanctum/csrf-cookie
```

Vite variables are public browser-bundled values. Never put secrets in `VITE_*`.

Install and run:

```bash
cd frontend
npm ci
npm run dev
```

PowerShell uses the same commands:

```powershell
cd frontend
npm ci
npm run dev
```

Expected frontend URL:

```text
http://localhost:5173
```

Available scripts:

```bash
npm run dev
npm run typecheck
npm run lint
npm test -- --run
npm run build
npm run preview
```

## 14. Running the Complete Application

Native local order:

1. Start your database, or create `backend/database/database.sqlite`.
2. In `backend/`, run `php artisan migrate`.
3. In `backend/`, create an admin with `php artisan hackpath:create-admin`.
4. In `backend/`, start Laravel with `php artisan serve --host=localhost --port=8000`.
5. In `frontend/`, start Vite with `npm run dev`.
6. Open `http://localhost:5173`.
7. Register or log in.
8. Complete email verification if the feature you are accessing requires a verified email.

Cookie-based SPA requirements:

- The frontend origin must exactly match `CORS_ALLOWED_ORIGINS`.
- `SANCTUM_STATEFUL_DOMAINS` must include the frontend host and port without scheme.
- The frontend API client sends `credentials: 'include'`.
- Mutating requests request `/sanctum/csrf-cookie` first and send `X-XSRF-TOKEN`.
- Local HTTP usually needs `SESSION_SECURE_COOKIE=false`.
- Production HTTPS must use `SESSION_SECURE_COOKIE=true`.
- Do not store browser auth tokens in `localStorage` or `sessionStorage`.

## 15. First Successful Login Checklist

If login appears to succeed and then immediately logs out, check:

- Backend is running at `http://localhost:8000`.
- Frontend is running at `http://localhost:5173`.
- Migrations completed.
- `APP_KEY` exists in `backend/.env`.
- `SESSION_DRIVER=database` for normal local work.
- `CORS_ALLOWED_ORIGINS` exactly matches the browser frontend origin.
- `SANCTUM_STATEFUL_DOMAINS` contains `localhost:5173`.
- `/sanctum/csrf-cookie` returns successfully.
- Browser accepts the `XSRF-TOKEN` and session cookies.
- The user is not suspended.
- The user has verified email when accessing verified-only features.
- You are not mixing `localhost` and `127.0.0.1` in ways that break cookie/domain behavior.

Do not paste private cookies or session IDs into issues, screenshots, or logs.

## 16. Email Verification Setup

Registration sends Laravel's standard email verification notification.

Local default:

```text
MAIL_MAILER=log
```

With `MAIL_MAILER=log`, verification messages are written to Laravel logs instead of being delivered. For real delivery, configure SMTP as shown in the environment section.

Important details:

- `APP_URL` affects signed verification links.
- Verification route: `/api/v1/email/verify/{id}/{hash}`.
- Status route: `/api/v1/email/verification`.
- Resend route: `/api/v1/email/verification-notification`.
- Frontend pending page: `/verify-email`.
- Links expire according to Laravel auth verification configuration.

If links are invalid or expired:

```bash
php artisan optimize:clear
```

Then request a new verification email from the frontend.

## 17. Security Lab Configuration

Lab definitions live in:

```text
backend/config/vulnerabilities.php
```

To enable a lab securely:

1. Pick a lab key from `backend/config/vulnerabilities.php`, for example `sqli-001`.
2. Generate a high-entropy `HACKPATH_FLAG_SECRET`.
3. Generate an HMAC digest for the plaintext flag using `hash_hmac('sha256', trim($flag), HACKPATH_FLAG_SECRET)`.
4. Set:

```text
HACKPATH_FLAG_SECRET=your-random-secret
HACKPATH_LAB_SQLI_001_ACTIVE=true
HACKPATH_LAB_SQLI_001_DIGEST=generated-hmac-digest
HACKPATH_LAB_SQLI_001_POINTS=10
```

5. Run:

```bash
php artisan config:clear
php artisan config:cache
php artisan test --filter=VulnerabilityManagerTest
```

Disable a lab by setting:

```text
HACKPATH_LAB_SQLI_001_ACTIVE=false
```

Trust model:

- The frontend may show lab instructions and examples, but never active flags or reusable verification secrets.
- The backend decides whether a lab exists, is active, is correct, and how many points it awards.
- Repeated correct submissions are idempotent and must not award points twice.

## 18. Administrator Usage

Create the first admin:

```bash
cd backend
php artisan hackpath:create-admin
```

Access the admin UI:

```text
http://localhost:5173/admin
```

Current admin capabilities include:

- View admin metrics.
- View user list.
- View submission logs.
- Change user roles.
- Suspend or unsuspend users.

Backend safeguards:

- Admin endpoints require authentication, verified email, non-suspended status, and admin authorization.
- Suspended administrators are denied.
- A regular user cannot promote themselves.
- The system prevents demoting, suspending, or deleting the final active administrator in protected flows.
- Frontend admin route protection is UI-only; backend policies and middleware are the security boundary.

## 19. Docker Development Setup

Docker services in `compose.yaml`:

- `php`
- `nginx`
- `postgres`
- `frontend`

Exposed ports:

- Frontend: `http://localhost:5173`
- Backend through Nginx: `http://localhost:8000`
- PostgreSQL is internal only and not published to the host.

Build and start:

```bash
docker compose build
docker compose up -d
docker compose ps
```

Run migrations:

```bash
docker compose exec php php artisan migrate
```

Create an administrator:

```bash
docker compose exec php php artisan hackpath:create-admin
```

Logs:

```bash
docker compose logs -f
```

Stop containers while preserving named volumes:

```bash
docker compose down
```

Warning: delete named volumes and database data:

```bash
docker compose down -v
```

Docker development environment values are loaded from:

```text
docker/env/backend.dev.example
```

This file contains local-only sample values. Do not reuse them for production.

## 20. Docker Troubleshooting

- Port already in use: stop the process using `5173` or `8000`, or change Compose port mappings.
- Database unhealthy: run `docker compose logs postgres`.
- PHP unhealthy: run `docker compose logs php`.
- Frontend cannot reach backend: confirm `VITE_API_BASE_URL=http://localhost:8000/api/v1`.
- Session cookie not set: check `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, `SANCTUM_STATEFUL_DOMAINS`, and `SESSION_DOMAIN`.
- Migrations not executed: run `docker compose exec php php artisan migrate`.
- Wrong DB hostname inside Docker: use `DB_HOST=postgres`, not `127.0.0.1`.
- Stale image: run `docker compose build --no-cache`.
- Storage/cache permissions: run `docker compose exec php sh -lc "mkdir -p storage/logs storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache"`.

## 21. Backend Tests

From `backend/`:

```bash
composer validate --strict
php artisan test
vendor/bin/pint --test
```

Run a single test file:

```bash
php artisan test tests/Feature/SanctumSpaAuthenticationTest.php
```

Filter by test name or class:

```bash
php artisan test --filter=SanctumSpaAuthenticationTest
```

Clear cached config while debugging:

```bash
php artisan optimize:clear
```

Tests use the environment configured in `backend/phpunit.xml`, including SQLite `:memory:` by default.

## 22. Frontend Tests

From `frontend/`:

```bash
npm run typecheck
npm run lint
npm test -- --run
npm run build
npm audit --omit=dev
```

Meaning:

- `npm run dev`: starts Vite development server.
- `npm run typecheck`: runs TypeScript without emitting files.
- `npm run lint`: currently runs TypeScript checks.
- `npm test -- --run`: runs Vitest once.
- `npm run build`: creates a production build in `frontend/dist`.

## 23. Full Project Verification

### Linux/macOS/WSL

```bash
git clone <repository-url>
cd HackPath

cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan hackpath:create-admin
composer validate --strict
php artisan route:list
php artisan migrate:status
php artisan test
vendor/bin/pint --test

cd ../frontend
npm ci
npm run typecheck
npm run lint
npm test -- --run
npm run build
npm audit --omit=dev
```

### Windows PowerShell

```powershell
git clone <repository-url>
cd HackPath

cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
New-Item database/database.sqlite -ItemType File -Force
php artisan migrate
php artisan hackpath:create-admin
composer validate --strict
php artisan route:list
php artisan migrate:status
php artisan test
vendor\bin\pint --test

cd ..\frontend
npm ci
npm run typecheck
npm run lint
npm test -- --run
npm run build
npm audit --omit=dev
```

### Docker

```bash
docker compose config
docker compose build
docker compose up -d
docker compose ps
docker compose exec php php artisan migrate
docker compose exec php php artisan hackpath:create-admin
```

In this workspace, `docker compose config` was verified. `docker compose build` could not be executed because the Docker Desktop Linux engine was not running.

## 24. Continuous Integration

Workflow files:

- `.github/workflows/security-quality.yml`
- `.github/workflows/backend-postgres.yml`
- `.github/workflows/repository-hygiene.yml`

`security-quality.yml` runs on pull requests, pushes to `main`, and manual dispatch.

Backend CI:

- PHP 8.2.
- Composer validation.
- Composer install from `composer.lock`.
- Laravel config cache and route cache validation.
- SQLite migrations.
- `php artisan test`.
- `vendor/bin/pint --test`.

Frontend CI:

- Node 22.
- `npm ci`.
- `npm run typecheck`.
- `npm run lint`.
- `npm test -- --run`.
- `npm run build`.
- `npm audit --omit=dev`.

`backend-postgres.yml` runs a PostgreSQL service and validates migration/test readiness against PostgreSQL.

`repository-hygiene.yml` runs `scripts/check-tracked-artifacts.ps1` to prevent generated artifacts from being tracked.

Code coverage is not currently configured.

## 25. Production Deployment Checklist

Before production:

- Set `APP_ENV=production`.
- Set `APP_DEBUG=false`.
- Generate a real `APP_KEY`.
- Use HTTPS for `APP_URL` and `FRONTEND_URL`.
- Set explicit HTTPS `CORS_ALLOWED_ORIGINS`.
- Set correct `SANCTUM_STATEFUL_DOMAINS`.
- Set `SESSION_SECURE_COOKIE=true`.
- Keep `SESSION_HTTP_ONLY=true`.
- Use safe `SESSION_SAME_SITE` for your SPA topology.
- Use PostgreSQL or MySQL/MariaDB, not local `database.sqlite`.
- Configure SMTP for email verification.
- Configure `HACKPATH_FLAG_SECRET` and active lab digests through secrets.
- Configure trusted proxies only with documented infrastructure.
- Back up the database before migrations.
- Do not run Vite dev server or `php artisan serve` in production.
- Do not commit `.env` or secret files.

Backend production install:

```bash
cd backend
composer install --no-dev --classmap-authoritative
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
```

Frontend production build:

```bash
cd frontend
npm ci
npm run build
```

Docker production build:

```bash
docker compose -f compose.prod.yaml build
docker compose -f compose.prod.yaml run --rm php php artisan migrate --force
docker compose -f compose.prod.yaml up -d
```

Run queue workers as separate processes only if queued jobs are enabled:

```bash
php artisan queue:work --sleep=3 --tries=3 --timeout=90
```

Run the scheduler separately if scheduled tasks are added:

```bash
php artisan schedule:work
```

## 26. Production Environment Validation

`App\Support\ProductionConfigurationValidator` runs during application boot when:

```text
APP_ENV=production
```

or:

```text
HACKPATH_ENFORCE_PRODUCTION_CONFIG=true
```

It rejects:

- `APP_DEBUG=true`.
- Missing or malformed `APP_KEY`.
- Non-HTTPS `APP_URL`.
- Non-HTTPS `FRONTEND_URL`.
- Insecure session cookie settings.
- Unsafe SameSite settings for cross-site credentialed SPA deployments.
- Wildcard credentialed CORS.
- Missing or insecure admin bootstrap credentials when bootstrap is enabled.
- Missing `HACKPATH_FLAG_SECRET` when active labs require it.
- Active labs without expected digests.
- Local `database.sqlite` production database.
- Broad trusted proxies without documentation.

Verify production-like validation locally without deploying:

```bash
php artisan config:clear
HACKPATH_ENFORCE_PRODUCTION_CONFIG=true php artisan config:cache
```

PowerShell:

```powershell
php artisan config:clear
$env:HACKPATH_ENFORCE_PRODUCTION_CONFIG = 'true'
php artisan config:cache
Remove-Item Env:\HACKPATH_ENFORCE_PRODUCTION_CONFIG
```

Do not bypass these checks. Fix the reported configuration key.

## 27. Backup and Rollback

Before migrations:

- Back up the database.
- Verify the backup can be restored.
- Back up persistent `storage/` if user-uploaded or generated files matter.
- Preserve deployment secrets in your secret manager.

Rollback strategy:

- Prefer rolling back application images or releases first.
- Run database rollback only after reviewing the migration `down()` method and data-loss risk.
- Some schema changes cannot safely restore deleted or transformed data.
- Restore from database backup if a migration corrupts production data.

Never treat this as a universal rollback command:

```bash
php artisan migrate:rollback --step=1 --force
```

It is safe only when you have reviewed the specific migration.

## 28. Troubleshooting Guide

### Laravel key error

Symptom:

```text
No application encryption key has been specified
```

Fix:

```bash
cd backend
php artisan key:generate
php artisan optimize:clear
```

### Missing PHP extension

Run:

```bash
cd backend
composer check-platform-reqs
```

Install the missing PHP extension for your OS and restart the terminal/web server.

### Composer dependency errors

```bash
cd backend
composer validate --strict
composer install
```

If the lock file is incompatible with your PHP version, upgrade PHP to `8.2+`.

### npm dependency errors

```bash
cd frontend
npm ci
```

Use `npm ci`, not `npm install`, for deterministic lock-file installation.

### Vite cannot reach backend

Check `frontend/.env.local` if present:

```text
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SANCTUM_CSRF_URL=http://localhost:8000/sanctum/csrf-cookie
```

Also verify Laravel is running:

```bash
curl http://localhost:8000/health/live
```

PowerShell:

```powershell
Invoke-WebRequest http://localhost:8000/health/live
```

### CORS error

Check:

```text
CORS_ALLOWED_ORIGINS=http://localhost:5173
CORS_SUPPORTS_CREDENTIALS=true
```

Then clear config:

```bash
cd backend
php artisan optimize:clear
```

Do not use wildcard CORS with credentials.

### HTTP 401 unauthenticated

Check:

- User is logged in.
- Browser is accepting cookies.
- Frontend uses `credentials: 'include'`.
- `SANCTUM_STATEFUL_DOMAINS` includes frontend host and port.
- `/sanctum/csrf-cookie` succeeds before mutating requests.

### HTTP 403 unauthorized or suspended

Check:

- User role is correct.
- User is not suspended.
- User email is verified for verified-only routes.
- Admin actions require backend authorization, not just frontend route access.

### HTTP 419 CSRF/session expired

Fix checklist:

- Request `/sanctum/csrf-cookie`.
- Send `X-XSRF-TOKEN`.
- Keep credentials enabled in fetch.
- Check `SESSION_DOMAIN`, `SESSION_SECURE_COOKIE`, and SameSite settings.
- Clear stale config:

```bash
php artisan optimize:clear
```

Do not disable CSRF as a fix.

### HTTP 422 validation error

Read the JSON `errors` object. It contains field-level validation messages.

### HTTP 429 rate limited

Wait for the `retry_after` value if present. Do not lower rate limits to hide abuse; fix noisy clients or tests.

### Email verification not sent

Check:

```text
MAIL_MAILER
MAIL_HOST
MAIL_PORT
MAIL_USERNAME
MAIL_PASSWORD
MAIL_FROM_ADDRESS
APP_URL
```

With `MAIL_MAILER=log`, inspect Laravel logs instead of expecting email delivery.

### Verification link invalid or expired

Check `APP_URL`, clock skew, link expiration, and whether the logged-in user matches the verification link user. Request a new link from `/verify-email`.

### Database connection refused

Native local:

- Confirm database service is running.
- Confirm `DB_HOST`, `DB_PORT`, credentials, and database name.

Docker:

```text
DB_HOST=postgres
```

Use `postgres`, not `127.0.0.1`, from inside the PHP container.

### SQLite file missing or not writable

```bash
cd backend
touch database/database.sqlite
php artisan migrate
```

PowerShell:

```powershell
cd backend
New-Item database/database.sqlite -ItemType File -Force
php artisan migrate
```

### Migration duplicate-column error

Run:

```bash
php artisan migrate:status
php artisan optimize:clear
```

The repository includes corrective migration tests for role/suspension columns. Do not manually edit the migrations table unless you know the exact deployed migration history.

### Session cookie not created

Check:

- `SESSION_DOMAIN`.
- `SESSION_SECURE_COOKIE`.
- `SESSION_SAME_SITE`.
- Browser devtools cookie rejection reason.
- Whether frontend and backend hostnames match your configured domains.

### Login succeeds but user appears logged out

Usually caused by cookie, CORS, or Sanctum stateful-domain mismatch. Use the checklist in section 15.

### Docker port conflict

Change the host side of Compose ports or stop the existing process:

```bash
docker compose ps
docker compose down
```

### Docker database hostname issue

Inside Docker, use:

```text
DB_HOST=postgres
```

On the host, use your local database host such as `127.0.0.1`.

### Permission denied for `storage/` or `bootstrap/cache/`

Native Linux/macOS:

```bash
cd backend
mkdir -p storage/logs storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache
chmod -R ug+rw storage bootstrap/cache
```

Docker:

```bash
docker compose exec php sh -lc "mkdir -p storage/logs storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache"
```

### Laravel config changes not taking effect

```bash
cd backend
php artisan optimize:clear
```

This clears cached config, routes, views, and events.

## 29. Common Development Commands

| Task | Command |
| --- | --- |
| Backend install | `cd backend && composer install` |
| Copy backend env | `cp .env.example .env` |
| PowerShell env copy | `Copy-Item .env.example .env` |
| Generate app key | `php artisan key:generate` |
| Create SQLite file | `touch database/database.sqlite` |
| PowerShell SQLite file | `New-Item database/database.sqlite -ItemType File -Force` |
| Run migrations | `php artisan migrate` |
| Migration status | `php artisan migrate:status` |
| Seed database | `php artisan db:seed` |
| Create admin | `php artisan hackpath:create-admin` |
| Start backend | `php artisan serve --host=localhost --port=8000` |
| Backend tests | `php artisan test` |
| Backend formatting check | `vendor/bin/pint --test` |
| Clear Laravel caches | `php artisan optimize:clear` |
| Frontend install | `cd frontend && npm ci` |
| Start frontend | `npm run dev` |
| Frontend typecheck | `npm run typecheck` |
| Frontend lint | `npm run lint` |
| Frontend tests | `npm test -- --run` |
| Frontend build | `npm run build` |
| Docker start | `docker compose up -d` |
| Docker stop | `docker compose down` |
| Docker logs | `docker compose logs -f` |

## 30. Security Checklist

- `.env` files are ignored and not committed.
- No active plaintext flags are in Git.
- No secrets are placed in `VITE_*` variables.
- `APP_DEBUG=false` in production.
- HTTPS is enabled in production.
- Secure cookies are enabled in production.
- CORS origins are explicit and do not use wildcard credentials.
- Sanctum stateful domains match the SPA host and port.
- Administrator passwords are unique and strong.
- Email verification mail is configured.
- Production database backups are scheduled and restore-tested.
- Backend and frontend tests pass.
- Dependency audits are reviewed.
- Secrets are rotated after exposure.
- Browser authentication tokens are not stored in local or session storage.
- Backend remains authoritative for roles, progress, points, completion, and flags.
- Production logs do not expose flags, passwords, tokens, SQL traces, or `.env` values.

## 31. API Overview

Inspect routes:

```bash
cd backend
php artisan route:list --path=api
```

Current API uses `/api/v1` and route names prefixed with `api.v1.`. Major groups:

- Authentication: register, login, logout, logout-all.
- Current user: read and profile update.
- Email verification: status, resend, signed verification.
- Labs: server-side flag verification.
- Progress: authenticated progress snapshot.
- Administration: metrics, users, logs, user updates.

API V1 organization is documented in:

```text
backend/docs/api-versioning.md
```

## 32. Contributing and Development Workflow

1. Create a branch.
2. Install backend dependencies with `composer install`.
3. Install frontend dependencies with `npm ci`.
4. Make focused changes.
5. Add or update tests for behavior changes.
6. Run backend checks:

```bash
cd backend
composer validate --strict
php artisan test
vendor/bin/pint --test
```

7. Run frontend checks:

```bash
cd frontend
npm run typecheck
npm run lint
npm test -- --run
npm run build
npm audit --omit=dev
```

8. Inspect the diff:

```bash
git status
git diff
```

9. Do not commit generated files, local databases, `.env`, secrets, logs, build output, `vendor/`, or `node_modules/`.
10. Submit a pull request.

## 33. License

No root `LICENSE` file is currently present. `backend/composer.json` declares `MIT` metadata for the Laravel backend package, but the repository does not currently include a standalone license file.

## Supporting Documents

- `CLEAN_INSTALL.md`: short clean-install summary.
- `DOCKER.md`: Docker-specific guide.
- `SECURITY_ROTATION.md`: secret rotation guidance.
- `backend/docs/api-versioning.md`: API versioning rules.
