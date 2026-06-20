# HackPath SPA Authentication

HackPath treats the React app as a first-party SPA. Browser authentication uses Laravel's web session cookie, Sanctum stateful SPA middleware, and CSRF protection.

## Browser contract

- Fetch `/sanctum/csrf-cookie` before login, registration, logout, and other state-changing API requests.
- Send requests with `credentials: 'include'`.
- Send the `X-XSRF-TOKEN` header from the readable `XSRF-TOKEN` cookie.
- Do not store personal access tokens, bearer tokens, passwords, or session secrets in browser storage.
- Use `GET /api/v1/user` to hydrate the current user after app startup.

## Production settings

Set these through deployment configuration or a secret manager:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.example.com
FRONTEND_URL=https://app.example.com
CORS_ALLOWED_ORIGINS=https://app.example.com
CORS_SUPPORTS_CREDENTIALS=true
SANCTUM_STATEFUL_DOMAINS=app.example.com
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=none
SESSION_DOMAIN=.example.com
```

Use `SESSION_SAME_SITE=lax` only when the SPA and API are same-site. For a cross-site SPA/API deployment that relies on credentialed requests, use `SESSION_SAME_SITE=none` with `SESSION_SECURE_COOKIE=true`.

Never use wildcard CORS origins with credentialed requests.
