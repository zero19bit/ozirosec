# Production Database Deployment

HackPath supports SQLite for local development and automated tests. Production
should use PostgreSQL or MySQL with a dedicated least-privilege application user.

## Local SQLite

Use SQLite for simple local development:

```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

Create the local file only on your machine:

```bash
cd backend
New-Item -ItemType File database/database.sqlite
php artisan migrate --seed
```

Do not commit `database.sqlite`, SQLite journal files, or populated database
backups. The repository ignore rules exclude these files.

## PostgreSQL Production

Create a database and a least-privilege user with your platform's secret manager:

```sql
CREATE DATABASE hackpath;
CREATE USER hackpath_app WITH PASSWORD '<from-secret-manager>';
GRANT CONNECT ON DATABASE hackpath TO hackpath_app;
\c hackpath
GRANT USAGE, CREATE ON SCHEMA public TO hackpath_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO hackpath_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO hackpath_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO hackpath_app;
```

Configure Laravel:

```env
DB_CONNECTION=pgsql
DB_HOST=postgres.internal
DB_PORT=5432
DB_DATABASE=hackpath
DB_USERNAME=hackpath_app
DB_PASSWORD=<from-secret-manager>
DB_SSLMODE=require
```

## MySQL Production

Create a database and least-privilege user:

```sql
CREATE DATABASE hackpath CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hackpath_app'@'%' IDENTIFIED BY '<from-secret-manager>';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP
    ON hackpath.* TO 'hackpath_app'@'%';
FLUSH PRIVILEGES;
```

Configure Laravel:

```env
DB_CONNECTION=mysql
DB_HOST=mysql.internal
DB_PORT=3306
DB_DATABASE=hackpath
DB_USERNAME=hackpath_app
DB_PASSWORD=<from-secret-manager>
DB_CHARSET=utf8mb4
DB_COLLATION=utf8mb4_unicode_ci
```

## Deployment Procedure

1. Back up the production database before every migration deployment.
2. Verify the backup by restoring it into a disposable database and running a
   smoke test against the restored copy.
3. Put the application in maintenance mode if your deployment does not support
   zero-downtime migrations.
4. Deploy code and run:

```bash
php artisan config:cache
php artisan migrate --force
php artisan route:cache
```

5. Run a smoke test: registration/login, current user, lab progress read, and
   one non-production lab verification if available.
6. Disable maintenance mode.

## Rollback Procedure

1. Prefer restoring the verified backup for destructive or data-shaping changes.
2. For reversible schema-only migrations, run:

```bash
php artisan migrate:rollback --step=1 --force
```

3. Redeploy the previous application version.
4. Run the same smoke tests used after deployment.

## Portability Notes

- User IDs use Laravel `id()`/`foreignId()` consistently, so foreign key types
  match across SQLite, PostgreSQL, and MySQL.
- Boolean columns are defined through Laravel schema builders; SQLite stores
  them differently internally, so production behavior should be verified on the
  selected engine in CI before launch.
- Username uniqueness depends on canonical lowercase storage in application
  code. PostgreSQL remains case-sensitive at the index level, so do not bypass
  Laravel validation/backfill when writing users.
- SQLite cannot fully model production row locking and concurrency semantics.
  Concurrency-sensitive lab progress behavior should be tested on PostgreSQL or
  MySQL before production release.
- Existing production databases must not be silently converted. Create a tested
  migration/backup plan before changing the production engine.
