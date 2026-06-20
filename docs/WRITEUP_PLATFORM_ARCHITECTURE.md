# Write-up platform architecture

## Purpose and audit baseline

This document designs a moderated, bilingual Write-up platform for HackPath. It is an implementation plan, not an implementation. It retains the current Laravel 12 API (`/api/v1`), Sanctum cookie-based SPA authentication, React 19/Vite frontend, and all existing vulnerability IDs, lab keys, roles, progress, and flag-verification behaviour.

### Repository facts found

- The backend is a Laravel 12 API in `backend/`, with versioned API routes in `backend/routes/api.php`. Current public content routes are not yet backed by Laravel; the existing API covers auth, account, progress, lab verification, and a small admin surface.
- Sanctum uses stateful cookie authentication. Admin routes require `auth:sanctum`, a non-suspended and verified user, plus the `admin` middleware. `UserAdministrationPolicy` is registered through `AppServiceProvider` and is an appropriate pattern for a new `WriteupPolicy`.
- Existing domain patterns are `app/Actions/SubmitLabFlag.php`, `app/Http/Requests/Api/V1`, and `app/Http/Resources/Api/V1`. `SubmitLabFlag` uses transactions and server-authoritative state; the Write-up actions should follow that boundary.
- The only Eloquent model is currently `User`; lab definitions are server configuration in `backend/config/vulnerabilities.php`. The frontend has static lab definitions in `frontend/src/data/labs.ts` and static vulnerability content/catalogue in `frontend/src/data/vulnerabilities.ts` and `frontend/src/content/vulnerabilities/`.
- Lab identifiers are string keys (for example `sqli-001`) and frontend lab URLs use their existing slugs. Vulnerability IDs and slugs are also frontend-owned. A write-up must therefore store stable, validated external reference keys, never rename or migrate these datasets as part of this feature.
- The frontend router is centralized in `frontend/src/App.tsx`; `Navbar.tsx` owns public navigation. It has a single `/admin` dashboard component today. `LanguageContext` sets document `lang` and `dir`; `fa` is RTL and `en` LTR. The `apiFetch` client already handles cookie credentials, CSRF and API error envelopes.
- PostgreSQL is the Docker database; Laravel also supports SQLite and MySQL/MariaDB. The default queue connection is database, but there are no scheduled application tasks, jobs, or workers used by this feature yet.
- `compose.yaml` has PHP, Nginx, frontend, and PostgreSQL on separate internal/public networks. `compose.prod.yaml` has PHP, Nginx, PostgreSQL, persistent storage and no frontend service. n8n must join only the internal network and call Laravel over HTTP; it must never receive database credentials or a PostgreSQL network attachment.

## Scope and content policy

HackPath publishes an original educational summary and analysis, not copied third-party articles. Each write-up displays the original publication title/source and a prominent canonical-source link. Store only the minimum source excerpt needed for review (or preferably extracted metadata and a short bounded quotation when licensing permits); do not expose it publicly or use it as the published body. The public rendered content comes only from HackPath-authored translation fields after moderation.

Manual, n8n, API and import work all enter the same domain actions and lifecycle. The source of data changes audit information and validation requirements, not the persistence or moderation path.

## Data design

Use `utf8mb4`/Unicode-capable storage throughout. Laravel PHP enums provide validated state values; database string columns and check constraints where portable retain database-level safety. Model relation keys as strings because the source catalogues are not database tables today.

### Enums

`App\Enums\WriteupOrigin`:

```text
manual | n8n | api | import
```

`App\Enums\WriteupStatus`:

```text
draft | pending_review | needs_revision | approved | scheduled | published | rejected | archived
```

`App\Enums\WriteupTranslationStatus`:

```text
missing | machine_generated | needs_review | reviewed | published
```

### Tables

| Table | Key columns and constraints | Purpose |
| --- | --- | --- |
| `writeup_sources` | `id`, `name`, `slug` unique, `source_type`, `base_url`, `feed_url` nullable, `allowed_domains` JSON, `enabled`, `fetch_policy` JSON, `created_by`, timestamps, soft deletes | Admin-managed, allowlisted sources. URLs are validated and normalized; disabling stops future n8n collection. |
| `writeups` | UUID/ULID public ID plus numeric PK, `origin`, `status`, `source_id` nullable FK, `canonical_url` nullable, `canonical_url_hash` nullable unique, `source_guid` nullable, `source_guid_hash` nullable, `content_hash` nullable, `normalized_title_hash` nullable, `published_at`, `scheduled_for`, `submitted_at`, `reviewed_at`, `reviewed_by`, `created_by`, `updated_by`, `rejection_reason` nullable, timestamps, soft deletes | Shared parent entity, source attribution, lifecycle and audit identity. `canonical_url_hash` is SHA-256 of canonicalized URL rather than a database-specific long URL unique index. |
| `writeup_translations` | `id`, `writeup_id` FK, `locale` (`en`/`fa`), `slug`, `title`, `short_summary`, `key_findings` JSON, `technical_overview`, `attack_explanation`, `root_cause`, `impact`, `mitigation`, `developer_lessons`, `conclusion`, `translation_status`, `is_ai_generated`, `ai_model_metadata` JSON nullable, `reviewed_by`, `reviewed_at`, timestamps; unique (`writeup_id`, `locale`) and unique (`locale`, `slug`) | Normalized bilingual HackPath-authored content. Markdown is stored as source text and rendered only through a strict sanitizer. Slug is locale-specific, immutable after publication except through an explicit redirect workflow. |
| `writeup_vulnerability` | `writeup_id` FK, `vulnerability_id` string, `is_primary`, timestamps; unique (`writeup_id`, `vulnerability_id`) and indexed (`vulnerability_id`, `writeup_id`) | Connects to existing frontend vulnerability IDs without altering them. Validation reads an exported/configured allowlist generated from the existing catalogue; no FK is possible until that catalogue is centralized. |
| `lab_writeup` | `writeup_id` FK, `lab_key` string, `is_primary`, timestamps; unique (`writeup_id`, `lab_key`) and indexed (`lab_key`, `writeup_id`) | Connects to `backend/config/vulnerabilities.php` keys and frontend lab IDs. Do not store lab flags, solutions, request captures, or secret instructions. |
| `writeup_tags` | `id`, `slug` unique, timestamps | Controlled reusable tags. |
| `writeup_tag` | `writeup_id`, `writeup_tag_id`; unique pair | Many-to-many tagging. |
| `writeup_automation_runs` | UUID/ULID external `run_key` unique, `source_id` nullable, `workflow_name`, `workflow_version`, `n8n_execution_id` nullable, `status`, `started_at`, `finished_at`, counters, bounded `error_code`/sanitized `error_summary`, `metadata` JSON, timestamps | Operational monitoring. Never store n8n credentials, raw prompts, complete third-party article bodies, or response headers. |
| `writeup_ingestion_attempts` | `id`, `automation_run_id` nullable FK, `source_id` nullable FK, `writeup_id` nullable FK, `idempotency_key` unique, `canonical_url_hash`, `source_guid_hash`, `content_hash`, `outcome`, `reason_code`, `request_digest`, timestamps | Immutable, minimally retained ingestion/duplicate audit trail. Supports retry analysis without raw sensitive content. |
| `internal_api_nonces` | `key_id`, `nonce_hash`, `expires_at`, timestamps; unique (`key_id`, `nonce_hash`) | Atomically consumed replay-protection records, pruned after the accepted timestamp window plus retention buffer. |
| `writeup_status_events` | `writeup_id`, `from_status`, `to_status`, `actor_type`, `actor_id` nullable, `reason` nullable, `metadata` JSON, timestamps | Append-only lifecycle audit. This is strongly recommended even though not in the minimum list. |

#### Duplicate constraints and behaviour

- `canonical_url_hash` is unique when non-null; normalize by removing fragments, lowercasing the host, removing default ports, normalizing trailing slash/query tracking parameters according to source policy, then hash.
- `source_guid_hash` has a unique composite index with `source_id` when non-null. A GUID must be namespaced by source.
- `content_hash` is SHA-256 of normalized permitted source text/metadata; index it with `source_id` for exact duplicate detection. It is deliberately not the only global uniqueness rule because syndication can produce equivalent material legitimately.
- `normalized_title_hash` is indexed, not unique. It is a review signal combined with publication date/source and must not silently reject legitimate reports with similar titles.
- `CheckWriteupDuplicateAction` runs before creation and again inside the persistence transaction. On a unique-index race, return an idempotent duplicate result, create an attempt record, and do not make a second write-up.

### Status transitions

Centralize transitions in `WriteupStatus` (or an explicit state-transition map service); controllers must not update `status` directly.

| From | Allowed transitions |
| --- | --- |
| `draft` | `pending_review`, `archived` |
| `pending_review` | `needs_revision`, `approved`, `rejected`, `archived` |
| `needs_revision` | `draft`, `pending_review`, `archived` |
| `approved` | `scheduled`, `published`, `needs_revision`, `archived` |
| `scheduled` | `published`, `approved`, `archived` |
| `published` | `archived` |
| `rejected` | `draft`, `archived` |
| `archived` | `draft` (restoration requires a reason and new review) |

Only an active administrator may approve, reject, schedule, publish or archive. The initial domain policy requires reviewed/published English and Persian translations before publication. A scheduler may transition only due `scheduled` records to `published`, using the same `PublishWriteupAction` and event/audit rules.

## Backend domain structure

Add Eloquent models for each table; use relations, scoped queries (`published`, `visibleInLocale`), casts for enums/JSON/dates, and `SoftDeletes` on sources/writeups. Add `WriteupPolicy` with `viewAny`, `view`, `create`, `update`, `review`, `publish`, and `manageSources`; register it as current policy registration does. Keep the existing `EnsureUserIsAdmin` middleware and user policy unchanged.

Required shared actions:

```text
CreateWriteupAction
UpdateWriteupAction
CheckWriteupDuplicateAction
SubmitWriteupForReviewAction
ApproveWriteupAction
PublishWriteupAction
RejectWriteupAction
ArchiveWriteupAction
```

Also add narrow supporting actions: `ScheduleWriteupAction`, `RecordWriteupStatusEventAction`, `CreateIngestionAttemptAction`, and `IngestWriteupAction`. `IngestWriteupAction` validates/normalizes a trusted transport DTO, calls duplicate detection and delegates creation and submission to the same actions the admin form calls. Every state-changing action runs in a transaction, locks the write-up row where appropriate, records a status event, and assigns the authenticated actor or internal-key identity.

Use dedicated Form Requests for browser/admin and internal payloads; use API Resources for the public list/detail, admin detail and source/run shapes. Never return hidden review notes, raw ingest payloads, source credentials, nonce values, private URLs, or security-sensitive lab data in public resources.

## API design

Keep all additions versioned under `/api/v1`; retain every existing route and response contract. Use consistent `{ "data": ... }` envelopes, Laravel pagination metadata, and explicit allowlisted `sort`/filter values.

### Public routes

```text
GET /api/v1/writeups
GET /api/v1/writeups/{locale}/{slug}
GET /api/v1/vulnerabilities/{vulnerabilityId}/writeups
GET /api/v1/labs/{labKey}/writeups
```

`GET /writeups` accepts `locale=en|fa`, `tag`, `vulnerability_id`, `lab_key`, `source`, `q` (bounded), `page`, `per_page` (1–50), and allowlisted `sort=published_at|-published_at`. It returns only published write-ups with an approved translation in the requested locale. The detail response includes original-source attribution, links, related tags/vulnerabilities/labs, and no operational metadata. Related endpoints validate the existing vulnerability/lab key, return the same paginated public resource and should not expose unpublished association existence.

### Admin routes

All routes below are within `/api/v1/admin`, retain current middleware (`auth:sanctum`, `not.suspended`, `verified`, `admin`), and add separate write-up read/mutation rate limiters:

```text
GET    /writeups/metrics
GET    /writeups
POST   /writeups
GET    /writeups/{writeup}
PATCH  /writeups/{writeup}
POST   /writeups/{writeup}/preview
POST   /writeups/{writeup}/submit
POST   /writeups/{writeup}/approve
POST   /writeups/{writeup}/reject
POST   /writeups/{writeup}/publish
POST   /writeups/{writeup}/schedule
POST   /writeups/{writeup}/archive
DELETE /writeups/{writeup}

GET|POST                 /writeup-sources
GET|PATCH|DELETE         /writeup-sources/{source}
GET                      /writeup-automation-runs
GET                      /writeup-automation-runs/{run}
```

`DELETE` is permitted only for an unpublished draft with no immutable audit need; otherwise archive it. Preview sanitizes in the same way as public rendering and is never a raw HTML pass-through. Admin list filters include status/origin/source/locale/review-assignee/date range/duplicate marker. Source deletion is a soft disable when it has ingested records.

### Internal n8n routes

Do not use Sanctum browser cookies for this surface and do not attach n8n to the database. Define a separate internal route group, e.g. in `backend/routes/internal.php` registered by Laravel, or in `api.php` under `/api/internal`, with only an `internal.writeups` middleware stack:

```text
GET   /api/internal/writeup-sources
POST  /api/internal/writeups/check-duplicate
POST  /api/internal/writeups/ingest
POST  /api/internal/writeup-automation-runs
PATCH /api/internal/writeup-automation-runs/{run}
```

Payloads have a version field, source identifier, canonical URL, GUID where available, hashes, bounded metadata, source attribution, and original HackPath English/Persian draft summaries. Ingest always creates `pending_review` (or safely returns an idempotent prior result); it cannot publish or approve. Internal responses are minimal and do not leak source configuration beyond the authenticated source's own allowed data.

## Internal-request security

Implement `VerifyInternalWriteupSignature` before controller binding, plus an internal per-key/IP limiter and strict JSON/body-size middleware.

1. n8n sends `X-Internal-Key-Id`, `X-Internal-Timestamp` (UTC Unix seconds), `X-Internal-Nonce` (128-bit random base64url), `X-Internal-Content-SHA256`, and `X-Internal-Signature`.
2. Signature input is `METHOD\nPATH\nTIMESTAMP\nNONCE\nSHA256(raw_body)` and uses `hash_hmac('sha256', input, key_secret)`. Compare with `hash_equals` only.
3. Reject unknown/revoked key IDs, malformed headers, content-hash mismatch, a timestamp outside a small configurable skew (recommended 300 seconds), or a nonce already inserted. Consume nonce atomically under the composite unique index before controller work. Log only key ID/fingerprint and request digest.
4. Each HMAC key has an allowed source ID set, endpoint scopes, rotation dates and rate/burst limits in server-side config or a future encrypted credential store. n8n supplies no arbitrary source ID; controller verifies it is allowlisted and enabled.
5. Set a low route body cap (recommended 256 KiB after the content policy excludes full source pages), JSON-only request content type, schema limits per field, max arrays/tags/relations, and request timeouts. Reject surplus/unknown unversioned fields.
6. Apply IP/network policy at the reverse proxy where feasible, but do not trust it alone; Docker internal-network access plus HMAC and replay protection is the trust boundary. Audit failures without storing credentials, raw bodies or prompt text.

Add independent rate limiters for internal source listing, duplicate checks, ingest and run updates. Duplicate hits count against a source/key quota; repeated duplicate flooding eventually returns `429` and marks the run degraded.

## n8n deployment and workflow

Add n8n Community Edition to a new override such as `compose.n8n.yaml` so the existing development and production stacks remain unchanged until explicitly enabled. Use a pinned n8n image digest/version, a named n8n data volume, `N8N_ENCRYPTION_KEY` and n8n basic/authentication configuration supplied only from deployment secrets, and internal service DNS to the Laravel Nginx/PHP endpoint. Do not publish the n8n editor publicly; expose it only through VPN/reverse proxy SSO or localhost administration. Use a dedicated n8n database only if production operational needs require it; it must be a separate database/user, never the HackPath application database.

### Responsibilities

| n8n | Laravel |
| --- | --- |
| Fetch enabled source definitions through the signed internal API; poll RSS or source-approved APIs; normalize source metadata; identify new entries; request duplicate checks; fetch only allowed public content; classify candidate material; create original English and Persian drafts; submit `pending_review`; report run state. | Validate everything; re-check allowlists and duplicates; persist entities/attempts/events; provide moderation and source management; authorize administrators; schedule/publish; render public resources; retain audit history. |

### Workflow outline

1. Scheduled trigger, one execution/run record per source.
2. Signed `GET /internal/writeup-sources`; process only enabled sources assigned to this workflow.
3. For each feed/API item: canonicalize URL/GUID, bound metadata, then signed duplicate check.
4. If new, fetch through a hardened HTTP request path with an allowlisted host and redirects revalidated at every hop. Extract only allowed metadata/text within byte/time limits.
5. Treat article text as untrusted data. Classify; if it is not an educational security write-up, record a skip reason and continue.
6. Ask the configured model to produce an original, non-infringing English educational summary and Persian draft, with instructions that article text cannot override workflow rules. Keep prompts/model settings outside public records.
7. Validate the output locally for expected length/shape and submit a signed ingest request. Laravel creates `pending_review` only.
8. Update run counters/status. Retries use an idempotency key derived from source ID plus canonical URL/GUID and are bounded with exponential backoff.

## Content and transport threat model

| Threat | Defence |
| --- | --- |
| SSRF, private addresses and cloud metadata | Permit sources only from administrator-maintained domains; resolve DNS immediately before each connection; reject loopback, link-local, RFC1918, CGNAT, multicast, unspecified, IPv6 local/private and metadata ranges; disable URL userinfo; pin/revalidate redirect hosts/IPs; permit HTTP(S) only; cap redirects (for example 3), connect/read time and response size. Use an egress proxy/network policy as defence in depth. |
| Redirect abuse/DNS rebinding | No automatic redirects without revalidation; validate all resolved A/AAAA addresses per hop; restrict to 80/443 and allowed hostnames; record final canonical URL. |
| Prompt injection in articles | Treat all retrieved text as data; fixed system instructions; delimit untrusted text; prohibit tool calls/secrets/external instructions from retrieved content; structured JSON output schema; discard model instructions embedded in source; moderator approval remains mandatory. |
| XSS and malicious Markdown/HTML | Store Markdown/plain structured text, never trust source HTML; parse/sanitize on server with a strict allowlist and render via `react-markdown` without raw HTML, custom URI scheme filtering, and no unsafe plugins. Sanitize preview through the same pipeline. Add CSP and `rel="noopener noreferrer"` on external source links. |
| Forged/replayed n8n requests | Key-scoped HMAC over method/path/timestamp/nonce/body digest, constant-time comparison, short time window, atomic nonce records, internal-only network, least privilege and rotation/revocation. |
| Duplicate flooding | Database uniqueness, atomic duplicate action, source/key/IP quotas, payload bounds, idempotency keys, attempt records and alert thresholds. |
| Oversized/malicious responses | Max HTTP bytes, MIME allowlist, streaming abort, decompression limits, timeouts, bounded JSON/request schema and no full third-party-body persistence. |
| Secret/solution disclosure | Never send `.env`, database credentials, flags, lab verification digests, cookies, or source credentials to n8n/model prompts/public APIs. Exclude lab solution/flag fields from write-up input validation; redaction scan outputs and logs. Separate n8n credentials from Laravel internal-HMAC secrets. |

## Frontend design

Add public routes without changing existing routes:

```text
/writeups
/writeups/:locale/:slug
/vulnerabilities/:slug/writeups        (or an inline related section using the existing detail route)
/labs/:slug/writeups                    (or an inline related section using the existing detail route)
```

The recommended UX is `/writeups` and `/writeups/:locale/:slug` plus a “Related write-ups” section embedded in the existing vulnerability and lab detail pages. Keep existing `/vulnerabilities/:slug` and `/labs/:slug` semantics intact. The page resolves locale from `LanguageContext`, requests that locale and renders a clear language-unavailable state rather than silently mixing languages. Use Tailwind logical properties (`start`, `end`, `text-start`) as current components do, so RTL remains correct.

Expand `/admin` into nested/layout routes or tabs while preserving its dashboard:

```text
/admin/writeups
/admin/writeups/new
/admin/writeups/:id
/admin/writeup-sources
/admin/writeup-automation
```

The editor has one form model for manual and imported drafts, separate localized tabs, source attribution picker, existing vulnerability ID/lab-key selectors, preview, status history and reviewer controls. It must never expose internal HMAC keys, raw automation secrets or protected source bodies. Add i18n strings in both existing translation resources and use the existing `apiFetch` client.

## Batch implementation plan

### 1. Database and backend domain

- Add migrations: `create_writeup_sources_table`, `create_writeups_table`, `create_writeup_translations_table`, `create_writeup_vulnerability_table`, `create_lab_writeup_table`, `create_writeup_tags_table`, `create_writeup_tag_table`, `create_writeup_automation_runs_table`, `create_writeup_ingestion_attempts_table`, `create_internal_api_nonces_table`, `create_writeup_status_events_table`.
- Add `app/Enums/WriteupOrigin.php`, `WriteupStatus.php`, `TranslationStatus.php`; models under `app/Models/`; relations on `User` only where useful.
- Add domain actions under `app/Actions/`, DTOs/value objects under `app/Data/` or `app/Domain/Writeups/`, and `WriteupPolicy`.
- Add a small catalogue-validation adapter that consumes existing `config/vulnerabilities.php` lab keys and a versioned exported vulnerability-ID allowlist. Do not migrate/rename current static catalogues in this phase.
- Dependency decision: use Laravel facilities first; only add a maintained HTML sanitizer/Markdown package after license/security review.

### 2. Backend APIs and moderation

- Modify `backend/routes/api.php`; add public/admin controllers under `app/Http/Controllers/Api/V1/`.
- Add Form Requests in `app/Http/Requests/Api/V1/Writeups/`, Resources in `app/Http/Resources/Api/V1/`, policy registration and named rate limiters in `AppServiceProvider`.
- Add moderation/scheduler job and schedule registration only after status actions/tests exist; configure worker deployment in Docker docs. Preserve the existing queue default.
- Add feature/unit tests for actions, authorization, transition matrix, filters/pagination, localization and public non-disclosure.

### 3. Internal n8n ingestion security

- Add internal routes, `VerifyInternalWriteupSignature`, payload/body-limit middleware, request classes and internal controllers; add a dedicated config file such as `config/writeup_ingestion.php` and new secret placeholders only in environment examples.
- Add nonce pruning command/schedule, safe audit logging, rate limits, source scope checks and internal contract tests including forged/replay/expired/key-rotation cases.
- Dependency decision: Laravel `Http` client plus strict URL-validation service; use a vetted IP/CIDR parsing library only if PHP standard facilities cannot cover IPv4/IPv6 correctness.

### 4. Admin frontend

- Update `frontend/src/App.tsx`, `Navbar.tsx` only where a new admin entry is needed, `i18n/i18n.ts`, and `lib/apiClient.ts` types/helpers.
- Add `pages/admin/Writeups*.tsx`, `WriteupSources*.tsx`, `WriteupAutomation*.tsx`, `components/writeups/`, and typed `lib/writeupApi.ts`.
- Test route guard, editor validation, preview sanitization rendering, source management and RTL UI.

### 5. Public frontend

- Add `pages/Writeups.tsx`, `WriteupDetail.tsx`, `components/writeups/WriteupCard.tsx`, `WriteupContent.tsx`, `RelatedWriteups.tsx`; update `App.tsx`, `Navbar.tsx`, existing Lab/Vulnerability detail components and i18n.
- Add Vitest coverage for locale switching, empty/unavailable translations, source attribution/external-link safety, filters and related sections.

### 6. Docker n8n integration

- Add `compose.n8n.yaml`, `docker/n8n/` configuration/README, deployment environment examples and `DOCKER.md` updates. Pin image version; add a named n8n volume and internal-only network attachment. Do not alter existing Compose defaults or grant n8n DB network/credentials.
- Document backup, upgrade, key rotation, internal API URL and reverse-proxy access control.

### 7. n8n workflows

- Add version-controlled workflow JSON/templates under `n8n/workflows/`, an import/deployment README and non-secret environment-variable schema. Use credential references in n8n, never exported real credentials.
- Implement source polling, hardened fetch/classification/drafting, duplicate check, idempotent ingest, run reporting, retry/error branches and a manual test workflow.

### 8. Security tests and final documentation

- Add backend tests for URL/IP/redirect validation, signature cases, nonce races, payload limits, XSS/Markdown handling, source scopes, duplicates, status transitions and unauthorized disclosure.
- Add frontend tests for sanitized output/RTL and API contract compatibility; run Pint/typecheck/test suites.
- Update `README.md`, `DOCKER.md`, backend API-versioning/security docs, runbook/source policy, data-retention policy and incident/key-rotation procedures.

## Decisions still required before implementation

1. Is English-only publication allowed while the Persian translation is pending, or must both translations be approved before publication?
2. Which source domains, licenses and permitted APIs are approved? RSS/API metadata is preferable; confirm whether any short review excerpt may be retained.
3. Select the model provider, data-processing agreement, retention settings, budget/rate limits, and whether Persian is machine draft-only until a human reviews it.
4. Decide whether the static vulnerability catalogue should eventually become an API/database catalogue. Until then, introduce the explicit ID allowlist/export contract described above.
5. Confirm production n8n access model (VPN/SSO/private proxy), external egress proxy, monitoring/alerting destination, and retention periods for ingestion attempts/nonces/run records.
