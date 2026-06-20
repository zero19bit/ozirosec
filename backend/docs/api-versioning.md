# HackPath API Versioning

The public API contract currently lives under `/api/v1` with route names prefixed by `api.v1.`. The V1 HTTP layer is organized under:

- `App\Http\Controllers\Api\V1`
- `App\Http\Requests\Api\V1`
- `App\Http\Resources\Api\V1`

Version-neutral behavior belongs outside the HTTP version namespace. Examples:

- `App\Actions\SubmitLabFlag`
- `App\Services\VulnerabilityManager`
- `App\Policies`
- `App\Support`

## V1 Compatibility Rules

- Preserve `/api/v1/...` URLs.
- Preserve route names.
- Preserve successful response shapes unless a security fix explicitly requires a change.
- Keep validation in Form Requests.
- Keep stable serialization in API Resources.
- Keep authorization in policies, gates, and middleware.
- Keep lab, progress, and user-management business behavior in actions/services/policies.

## Error Envelope

JSON API errors use a stable top-level `message`. Validation and rate-limit errors also include `errors`; rate-limit responses include `retry_after` when Laravel provides it.

Sensitive internals such as stack traces, SQL, file paths, and environment values must not be exposed in production error responses.

## Adding V2

A future V2 should add a separate route group and HTTP namespace, for example:

- `routes/api.php` group: `/api/v2`, route name prefix `api.v2.`
- `App\Http\Controllers\Api\V2`
- `App\Http\Requests\Api\V2`
- `App\Http\Resources\Api\V2`

V2 should share version-neutral logic from `App\Actions`, `App\Services`, `App\Policies`, and `App\Support`. Do not copy domain logic into V2 controllers.

V1 and V2 can coexist while clients migrate. Deprecation should be documented with:

- deprecation date
- removal date
- migration guide
- response/header notices if needed
- compatibility test coverage for both versions during the overlap period
