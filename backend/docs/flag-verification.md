# HackPath Flag Verification

HackPath verifies lab flags only on the Laravel backend. The frontend may display training payloads, XP labels, or local simulations, but those values are not trusted for server-side completion or points.

## Design

- `HACKPATH_FLAG_SECRET` is a server-only secret stored in deployment configuration.
- Each active lab has an expected HMAC digest in an environment variable such as `HACKPATH_LAB_SQLI_001_DIGEST`.
- The backend computes `hash_hmac(HACKPATH_FLAG_ALGORITHM, trim($submittedFlag), HACKPATH_FLAG_SECRET)`.
- The backend compares the submitted digest to the configured digest with `hash_equals()`.
- Labs default to inactive unless explicitly enabled with `HACKPATH_LAB_<LAB_KEY>_ACTIVE=true`.

## Generate a digest

Run this on a trusted administrator machine or server shell. Do not commit the plaintext flag, the real secret, or production digests to Git.

```bash
export HACKPATH_FLAG_SECRET="server-only-secret-from-your-secret-manager"
php -r '$flag = rtrim(stream_get_contents(STDIN), "\r\n"); echo hash_hmac("sha256", trim($flag), getenv("HACKPATH_FLAG_SECRET")), PHP_EOL;' 
```

Then type or pipe the flag into stdin. Store only the resulting digest in deployment configuration:

```bash
HACKPATH_LAB_SQLI_001_ACTIVE=true
HACKPATH_LAB_SQLI_001_DIGEST=<generated-hmac-digest>
```

## Rotation

To rotate flags or secrets:

1. Generate a new `HACKPATH_FLAG_SECRET`.
2. Recompute every active lab digest with the new secret.
3. Deploy the secret and digests together.
4. Run `php artisan config:clear && php artisan config:cache`.
