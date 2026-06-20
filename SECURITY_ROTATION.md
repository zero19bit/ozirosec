# HackPath Secret Rotation Guide

This repository previously contained insecure development defaults and local runtime files may exist on developer machines. Do not paste secret values into tickets, chat, commits, screenshots, or logs.

## Rotate These Categories

- `APP_KEY`: rotate with care; this can invalidate encrypted cookies, active sessions, remember-me cookies, and encrypted application data.
- Administrator credentials: rotate every admin account password and review administrator membership.
- Database credentials: rotate database usernames/passwords and revoke unused accounts.
- Mail credentials: rotate SMTP/API credentials and review sender permissions.
- External API credentials: rotate cloud, payment, analytics, queue, object storage, and webhook credentials.
- Flag verification secret: rotate `HACKPATH_FLAG_SECRET` and regenerate every active lab digest.
- Leaked access tokens: revoke Laravel Sanctum tokens and any external tokens exposed in logs or local files.

## Current-Tree Checks

Run the local scanner before committing:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\secret-scan.ps1
```

Also inspect ignored local runtime files without printing their contents:

```bash
git status --ignored --short
git ls-files --ignored --exclude-standard --others
```

## Git History Inspection

Do not rewrite shared history automatically. First identify affected paths and coordinate a cleanup window.

```bash
git log --all --name-only --pretty=format: | sort -u
git grep -n -I "HACKPATH_ADMIN_PASSWORD\|APP_KEY=\|HACKPATH_FLAG_SECRET\|BEGIN .*PRIVATE KEY" $(git rev-list --all)
```

If old commits contain secrets, rotate the affected secret categories first, then plan history cleanup with a tool such as `git filter-repo` or BFG Repo-Cleaner.

## Deployment Checklist

1. Set real values only in the deployment secret manager or local `.env`.
2. Keep `.env.example` as placeholders only.
3. Run `php artisan config:clear && php artisan config:cache`.
4. Restart queue workers and app servers.
5. Revoke stale sessions/tokens where needed.
