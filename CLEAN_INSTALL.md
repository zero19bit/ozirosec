# Clean Installation

HackPath keeps generated dependencies and runtime artifacts out of Git. Rebuild
them from lock files after cloning.

## Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

For local SQLite development, create the database file if it does not exist:

```bash
New-Item -ItemType File database/database.sqlite
php artisan migrate
```

For Linux/macOS shells, use:

```bash
touch database/database.sqlite
php artisan migrate
```

## Frontend

```bash
cd frontend
npm ci
npm run build
```

## Verification

```bash
cd backend
php artisan test
```

```bash
cd frontend
npm run typecheck
npm test -- --run
npm run build
```

## Tracked Files

Keep `backend/composer.lock` and `frontend/package-lock.json` committed for
deterministic installs. Do not commit `vendor/`, `node_modules/`, local SQLite
databases, caches, logs, coverage, or build output.
