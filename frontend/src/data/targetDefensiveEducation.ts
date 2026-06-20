type TargetDocProfile = {
  title: string;
  boundary: string;
  interpreter: string;
  riskDescription: string;
  unsafeLaravel: string;
  secureLaravel: string;
  unsafeReact: string;
  secureReact: string;
  trafficField: string;
  trafficValue: string;
  responseInvariant: string;
  primaryControls: string[];
  parserControls: string[];
  cspControls: string[];
  isolationControls: string[];
  qaManual: string[];
  qaAutomated: string[];
  interviewTopics: Array<{ question: string; answer: string }>;
};

const commonRegressionProtocol = `
### Regression Harness Design

The verification plan should be written as a repeatable engineering control, not as an ad hoc tester activity. Each target route needs a fixture that builds a known user, a known authorization context, a known request body, and a known downstream dependency state. The test should assert both successful behavior and rejected behavior. Successful behavior proves that the secure pathway still works for valid users. Rejected behavior proves that malformed, ambiguous, overlong, cross-context, or unauthorized data stops at the first defensive boundary.

QA should preserve the exact evidence that a reviewer needs during a release gate: route name, controller or resolver name, validation class, policy or authorization rule, downstream adapter, response status, response shape, and security log event. A failure should be treated as a structural regression when a request reaches a sink without passing through the documented validator and authorizer. This is especially important for security education platforms because training labs often contain intentionally unsafe teaching surfaces that must remain isolated from production-style account, progress, and reporting flows.

Automated checks should run at several layers. Unit tests validate pure validators, DTO constructors, policy methods, and parser adapters. Feature tests validate HTTP request behavior with synthetic accounts. Static analysis checks for forbidden APIs and unsafe framework escape hatches. Dependency scanning verifies parser and framework versions. Runtime observability confirms that rejected requests are counted without logging sensitive submitted values. This layered approach makes the control durable: a single missed test does not become the only line of defense.
`;

const commonTrafficMatrix = `
### Abstract Traffic Matrix

The examples below are intentionally conceptual. They describe request structure and control placement without providing operational sequences.

| Layer | Safe Structural Expectation | Review Signal |
| --- | --- | --- |
| Browser UI | Input is collected as typed form state and labelled by business purpose. | No security decision depends only on disabled fields, hidden fields, or client-side checks. |
| HTTP Request | The request carries a small, typed value such as an identifier, display string, or selected provider key. | The raw value is not treated as code, path, query structure, markup, network destination, or process instruction. |
| Route Boundary | Middleware authenticates the principal, applies rate limits, and selects the correct trust zone. | Public, authenticated, administrative, and training-only routes have separate route groups. |
| Validation Layer | A server-side request object normalizes type, length, format, and allowed values. | The controller receives validated data, not raw transport data. |
| Authorization Layer | The application verifies the user may perform the action on the resolved object or workflow. | Object ownership and tenant boundaries are checked after lookup and before response generation. |
| Adapter Layer | Database, renderer, parser, network, filesystem, or process calls receive safe arguments. | Values are passed through safe APIs that separate data from instructions. |
| Response Layer | The response uses explicit content type, cache policy, framing policy, and encoding strategy. | Response headers and body shape remain stable for rejected input. |

Conceptual request:

~~~http
POST /api/v1/training/safe-operation HTTP/1.1
Host: academy.example
Content-Type: application/json
Authorization: REDACTED_AUTH_SCHEME <synthetic-staging-token>

{
  "field": "<typed benign training value>",
  "intent": "documented-business-action"
}
~~~

Conceptual response invariant:

~~~http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

{
  "data": {
    "accepted": true,
    "normalized": true
  }
}
~~~

For rejected data, the response should preserve a generic structure, avoid parser or framework internals, and emit a security telemetry event that contains metadata only. Logs should avoid raw secrets, full submitted bodies, session tokens, active flags, credentials, or personal data.
`;

function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

function interviewSection(profile: TargetDocProfile): string {
  return profile.interviewTopics.map((item, index) => [
    `${index + 1}. **Question:** ${item.question}`,
    `   **Answer:** ${item.answer}`,
  ].join('\n')).join('\n\n');
}

function buildTargetDoc(profile: TargetDocProfile): string {
  return `
## 1. Low-Level Component Anatomy

${profile.title} is best understood as a boundary failure between ordinary request data and a component that has its own interpreter semantics. The relevant boundary in this category is **${profile.boundary}**. A secure design treats the incoming value as inert data until it has passed through type validation, normalization, authorization, and a safe adapter. The unsafe design lets the value keep too much semantic power as it moves through the stack.

Data movement usually starts in a React form, route parameter, query string, JSON body, upload field, or integration setting. At that point the value is only browser-controlled input. The first correction point is the UI model: name the field by business intent, avoid accepting open-ended text when an enum or opaque identifier is sufficient, and never imply that client-side validation is authoritative. The second correction point is the HTTP contract: the request should carry typed data, not a fragment of another language. The third correction point is the Laravel request object, where the application should enforce length, type, canonical form, and allowlisted values. The fourth correction point is the service layer, where the application resolves domain objects, applies policies, and calls framework APIs that keep data separated from instructions.

The isolation lapse occurs when the application allows a request value to cross into ${profile.interpreter} before that value is transformed into a safe representation. ${profile.riskDescription} The interpreter is not defective; it is faithfully following the semantics of the value it receives. The engineering mistake is giving an interpreter a string, object, URL, document, or command shape that still contains user-controlled structure.

A production-grade fix has to be structural. Filtering a few characters is not enough because parsers normalize input differently, frameworks add convenience escape hatches, and future developers may copy the unsafe pattern into a nearby feature. The durable control is to introduce a narrow adapter that is easy to use and hard to bypass. For example, controllers should accept validated DTOs, service methods should accept domain primitives, query builders should receive bound values, renderers should receive text or sanitized rich-text objects, XML processors should receive parser profiles, and network clients should receive approved destination descriptors rather than arbitrary transport strings.

For bilingual and RTL interfaces, the UI must also keep layout direction separate from content direction. Page chrome can use the active locale direction, but technical identifiers, English vulnerability names, code labels, and protocol terms should preserve their lexical direction. This prevents the user interface from visually corrupting English security terminology inside Persian layouts.

## 2. Code Blueprinting

The following code pairs are defensive review artifacts. The left side demonstrates an unsafe source pattern that reviewers should remove. The right side demonstrates a remediated shape using PHP 8.5-style strict typing, Laravel 13-style request boundaries, and React/TypeScript form discipline.

### PHP 8.5 / Laravel 13

| Vulnerable Source Code | Remediated Secure Code |
| --- | --- |
| ~~~php
${profile.unsafeLaravel}
~~~ | ~~~php
${profile.secureLaravel}
~~~ |

### React / TypeScript

| Vulnerable Source Code | Remediated Secure Code |
| --- | --- |
| ~~~tsx
${profile.unsafeReact}
~~~ | ~~~tsx
${profile.secureReact}
~~~ |

### Blueprint Review Notes

Reviewers should focus on the shape of the data flow. The vulnerable examples generally pass raw form state, query values, document bodies, or operator-like text directly into a sensitive component. The remediated examples introduce named request classes, typed DTOs, allowlisted choices, safe framework APIs, and service boundaries. This makes the secure path explicit and testable.

In Laravel, the controller should be thin. It should receive a FormRequest, call a domain service, and return a response. It should not concatenate query text, render request-controlled templates, configure parsers inline, build arbitrary network destinations, or invoke process boundaries directly. In React, the component should guide input shape, but it must never become the authority for security. TypeScript improves correctness by documenting expected client state, yet the server still validates every field.

## 3. Compliance Verification

This category maps to OWASP Top 10 themes around injection, insecure design, security misconfiguration, and access-control-adjacent failures. Verification should be framed as safe regression detection under controlled staging conditions. The purpose is not to demonstrate harm; the purpose is to prove that unsafe data cannot reach the sensitive interpreter and that rejected data is handled consistently.

### Manual QA Methodology

${bulletList(profile.qaManual)}

### Automated QA Methodology

${bulletList(profile.qaAutomated)}

${commonRegressionProtocol}

### Release Gate Evidence

- Link each route to its validation class, authorization policy, service method, and sensitive adapter.
- Store test fixtures in the repository so future engineers can reproduce the control.
- Require code review approval for any use of raw SQL, raw HTML, dynamic parser configuration, generic URL fetching, file parsing, process execution, or framework escape hatches.
- Confirm that rejected requests produce deterministic status codes and do not emit framework internals.
- Confirm that security events contain metadata only and never store submitted secrets, active training flags, session credentials, or complete request bodies.

## 4. Abstract Traffic Matrix

For ${profile.title}, the field of interest is usually represented as **${profile.trafficField}**. A benign training value might look like **${profile.trafficValue}**. The important point is not the exact value; the important point is whether the application treats the value as data or lets it become interpreter structure.

${commonTrafficMatrix}

Category-specific response invariant: ${profile.responseInvariant}

The data flow anomaly appears when the request value reaches ${profile.interpreter} before it is converted to a validated domain primitive. A safe telemetry trace should show a clear sequence: request received, route middleware passed, request validation completed, authorization completed, domain service invoked, safe adapter called, response emitted. If the trace shows raw request values entering the adapter, the implementation should be considered structurally unsafe even if a narrow sample input appears harmless.

## 5. Comprehensive Remediation Strategy

### Parameterized and Typed Inputs

${bulletList(profile.primaryControls)}

### Secure Parser and Interpreter Controls

${bulletList(profile.parserControls)}

### Strict Content Security Policy and Browser Controls

${bulletList(profile.cspControls)}

### Architectural Isolation

${bulletList(profile.isolationControls)}

### Production Checklist

- Define a single owner for the vulnerable boundary and document the accepted safe adapter.
- Add a FormRequest or schema validator for every route that accepts user-controlled data.
- Convert free-form fields into enums, opaque identifiers, or pre-approved configuration keys wherever possible.
- Enforce object-level authorization after object resolution and before data release.
- Replace raw interpreter calls with APIs that separate instructions from values.
- Add safe defaults at the framework level so new routes inherit validation, headers, throttling, and telemetry.
- Add static analysis rules that flag unsafe APIs and require security review for exceptions.
- Add integration tests for valid input, missing input, malformed input, unauthorized access, overlong input, and ambiguous input.
- Add monitoring for rejection rates, parser errors, unusual validation failures, and repeated boundary violations.
- Keep training-only lab endpoints in isolated route groups, tenants, networks, databases, and runtime roles.

The remediation strategy should also include documentation for future maintainers. Security controls fail when they are surprising or difficult to use. The safe adapter should be the easiest path. If engineers need to remember a long list of forbidden characters, the design is too fragile. If they can call a named service that accepts a typed value and returns a safe result, the design becomes resilient.

## 6. Engineering Interview Prep

${interviewSection(profile)}
`.trim();
}

const profiles: Record<string, TargetDocProfile> = {
  sqli: {
    title: 'SQL Injection',
    boundary: 'request value to relational query compiler',
    interpreter: 'the SQL parser and query planner',
    riskDescription: 'When user-controlled bytes are merged into query text, the database receives a single language string rather than a precompiled query shape plus values.',
    unsafeLaravel: `<?php

declare(strict_types=1);

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\DB;

Route::get('/reports/users', function (Request $request) {
    $email = (string) $request->query('email');

    return DB::select("select id, name, email from users where email = '$email'");
});`,
    secureLaravel: `<?php

declare(strict_types=1);

final class UserReportRequest extends FormRequest
{
    public function rules(): array
    {
        return ['email' => ['required', 'email:rfc', 'max:254']];
    }
}

Route::get('/reports/users', function (UserReportRequest $request) {
    return DB::table('users')
        ->select(['id', 'name', 'email'])
        ->where('email', $request->validated('email'))
        ->first();
});`,
    unsafeReact: `type Props = { runReport: (url: string) => void };

export function UserReportSearch({ runReport }: Props) {
  const [email, setEmail] = useState('');

  return <button onClick={() => runReport('/reports/users?email=' + email)}>Run</button>;
}`,
    secureReact: `type UserReportCriteria = Readonly<{ email: string }>;

export function UserReportSearch({ runReport }: { runReport: (criteria: UserReportCriteria) => void }) {
  const [email, setEmail] = useState('');
  const submit = () => runReport({ email: email.trim().toLowerCase() });

  return <button onClick={submit}>Run</button>;
}`,
    trafficField: 'email',
    trafficValue: 'analyst@example.test',
    responseInvariant: 'The database query shape remains constant regardless of submitted email content, and only bound values change.',
    primaryControls: [
      'Use parameter binding for every value in SELECT, INSERT, UPDATE, DELETE, search, and reporting queries.',
      'Map sort fields, directions, and report columns through server-side allowlists rather than accepting raw identifiers.',
      'Represent numeric filters as parsed integers or decimals before query construction.',
      'For multi-tenant data, scope the query by tenant and policy before optional filters are applied.',
      'Reject ORM raw-query escape hatches in request paths unless a security-reviewed adapter owns them.',
    ],
    parserControls: [
      'Separate SQL statement structure from values through prepared statements or framework query builders.',
      'For stored procedures, pass typed parameters and avoid procedure bodies that concatenate SQL text.',
      'Use database roles with minimum privileges so a query bug cannot access unrelated schemas.',
      'Log query fingerprints, not full submitted values, when investigating validation failures.',
    ],
    cspControls: [
      'CSP does not fix SQL safety, but it should still be applied to pages that render database-backed content.',
      'Use no-store for sensitive report responses and avoid caching personalized query results.',
      'Ensure error pages do not expose SQL text, connection details, or stack traces.',
    ],
    isolationControls: [
      'Keep training databases separate from user accounts, progress tables, and administrative data.',
      'Use read-only replicas for reporting features that do not need writes.',
      'Place lab-intentional SQL training surfaces behind dedicated route groups and synthetic datasets.',
      'Review migrations and seeders to ensure active flags or secrets are never stored in relational tables.',
    ],
    qaManual: [
      'Review every repository method and controller for raw SQL construction and query builder escape hatches.',
      'Submit benign boundary strings in staging and verify that responses are generic, stable, and backed by bound parameters.',
      'Check logs to ensure rejected inputs do not produce database syntax errors visible to users.',
      'Verify that sort, filter, and export features use allowlisted fields.',
      'Confirm least-privilege database accounts through schema-level permission review.',
    ],
    qaAutomated: [
      'Add static rules that flag DB::raw, whereRaw, orderByRaw, unprepared statements, and string-built query fragments.',
      'Run feature tests that inspect query logs or mock repositories to prove parameter binding.',
      'Use dependency scanning to keep database drivers and ORM layers current.',
      'Add migration tests that confirm sensitive lab flags are absent from SQL tables.',
      'Run CI checks that fail when debug database errors are enabled in production configuration.',
    ],
    interviewTopics: [
      {
        question: 'Why is escaping not equivalent to parameter binding for SQL safety?',
        answer: 'Escaping attempts to transform data so it remains safe inside a language string, but the application is still building one combined SQL document. Parameter binding separates statement compilation from values. The database receives a stable query plan and typed parameters, so user input cannot alter query grammar.',
      },
      {
        question: 'How should a system safely implement user-controlled sorting?',
        answer: 'The request should carry a symbolic sort key such as created_at_desc. The server maps that symbol to a hardcoded column and direction. Raw column names or direction strings should never be copied from the request into SQL.',
      },
      {
        question: 'What Laravel review signals suggest SQL boundary risk?',
        answer: 'DB::raw, whereRaw, orderByRaw, unprepared statements, dynamic table names, string-built stored procedure calls, and repository methods that accept query fragments are strong signals. They are not always wrong, but they require a named adapter and focused tests.',
      },
      {
        question: 'How do database permissions contribute to defense in depth?',
        answer: 'The application account should have only the permissions needed for its role. Reporting flows may need read-only access. Write flows should not own schema administration. Least privilege limits blast radius if an application boundary fails.',
      },
      {
        question: 'What regression test proves the durable fix?',
        answer: 'A durable test verifies that the repository calls a parameterized API with a constant query shape for varied inputs. It also verifies that malformed input is rejected by the FormRequest before the repository is called.',
      },
    ],
  },
  xss: {
    title: 'Cross-Site Scripting (XSS)',
    boundary: 'stored or reflected text to browser rendering engine',
    interpreter: 'the HTML, URL, CSS, and JavaScript parsers inside the browser',
    riskDescription: 'When text is rendered through an unsafe sink, the browser may interpret it as document structure or executable script context instead of displaying it as inert content.',
    unsafeLaravel: `<?php

declare(strict_types=1);

Route::get('/profile', function (Request $request) {
    return view('profile', ['bio' => $request->query('bio')]);
});

// profile.blade.php
{!! $bio !!}`,
    secureLaravel: `<?php

declare(strict_types=1);

final class ProfilePreviewRequest extends FormRequest
{
    public function rules(): array
    {
        return ['bio' => ['required', 'string', 'max:500']];
    }
}

Route::get('/profile', fn (ProfilePreviewRequest $request) => view('profile', [
    'bio' => $request->validated('bio'),
]));

// profile.blade.php
{{ $bio }}`,
    unsafeReact: `export function CommentPreview({ html }: { html: string }) {
  return <article dangerouslySetInnerHTML={{ __html: html }} />;
}`,
    secureReact: `export function CommentPreview({ body }: { body: string }) {
  return <article lang="en" dir="ltr">{body}</article>;
}`,
    trafficField: 'displayText',
    trafficValue: 'A normal training comment',
    responseInvariant: 'User-authored text appears as text nodes, not as new DOM structure, active attributes, or executable script context.',
    primaryControls: [
      'Render plain text as text nodes in React and escaped Blade output in Laravel.',
      'Use context-aware output encoding for HTML body, HTML attributes, URLs, CSS, and JavaScript data contexts.',
      'Represent rich text as a sanitized structured document, not as arbitrary HTML.',
      'Validate maximum length and accepted formatting features before persistence.',
      'Keep technical English terms inside RTL pages marked with lang and dir attributes when needed.',
    ],
    parserControls: [
      'Centralize rich-text sanitization with an allowlist sanitizer and remove active content, event attributes, and unsafe URL schemes.',
      'Avoid dangerouslySetInnerHTML, innerHTML, document.write, and raw Blade output in application code.',
      'Use Trusted Types where supported for high-risk browser surfaces.',
      'Treat database content as untrusted until it is encoded for the specific output context.',
    ],
    cspControls: [
      'Deploy a strict Content-Security-Policy with script-src nonces or hashes and without unsafe-inline.',
      'Set object-src none, base-uri self, frame-ancestors according to framing policy, and restrict connect-src.',
      'Use HttpOnly, Secure, and SameSite cookies so browser script cannot read session tokens.',
      'Report CSP violations to a monitoring endpoint and triage unexpected script sources.',
    ],
    isolationControls: [
      'Serve user-generated files from a separate origin with no ambient application cookies.',
      'Keep administrative review screens and public preview surfaces separated.',
      'Apply locale-aware typography without changing the lexical direction of English security terms.',
      'Use a design-system component for safe rich text rather than ad hoc rendering.',
    ],
    qaManual: [
      'Search source code for dangerous browser and template sinks.',
      'Review every rich-text feature for sanitizer ownership, allowed elements, and output context.',
      'Inspect rendered DOM in staging to confirm submitted text remains text.',
      'Verify CSP headers on all document responses.',
      'Check multilingual cards to ensure English titles remain LTR inside Persian page layouts.',
    ],
    qaAutomated: [
      'Add lint rules forbidding dangerous rendering sinks outside approved sanitizer modules.',
      'Run component tests that render representative text and assert DOM node structure remains inert.',
      'Use header tests to verify CSP, cookie flags, and content-type policies.',
      'Add snapshot tests for RTL and LTR card layouts with English and Persian text mixed.',
      'Scan dependencies for sanitizer and markdown renderer advisories.',
    ],
    interviewTopics: [
      {
        question: 'Why is React usually safer for text rendering than manual DOM APIs?',
        answer: 'React escapes string children by default, so a string becomes text rather than document structure. Manual DOM APIs and dangerous rendering sinks bypass that default and require a separate sanitizer and review process.',
      },
      {
        question: 'What does context-aware encoding mean?',
        answer: 'Different browser parsers have different rules. Text in an HTML body, an attribute, a URL, a CSS block, and JavaScript data all require different handling. A secure design encodes for the destination context or avoids the context entirely.',
      },
      {
        question: 'How does CSP help if output encoding is already correct?',
        answer: 'CSP is defense in depth. It limits what the browser may execute or load if a rendering bug is introduced later. It also provides telemetry through violation reports.',
      },
      {
        question: 'How should rich text be supported safely?',
        answer: 'Use a structured editor or markdown subset, sanitize on the server with an allowlist, store the sanitized representation or original plus review metadata, and render through a single audited component.',
      },
      {
        question: 'Why does RTL support matter for secure documentation cards?',
        answer: 'Security terms often use English identifiers. In an RTL page, those terms need lang and dir isolation so users do not misread code names, protocol labels, or vulnerability titles.',
      },
    ],
  },
  csrf: {
    title: 'Cross-Site Request Forgery (CSRF)',
    boundary: 'browser-authenticated request to state-changing route',
    interpreter: 'the server route handler that trusts ambient browser credentials',
    riskDescription: 'Cookies are attached by the browser according to origin and cookie policy. Without an independent intentionality signal, the server may process a state change because the session is valid, not because the user initiated the action in the trusted application.',
    unsafeLaravel: `<?php

declare(strict_types=1);

Route::post('/account/email', function (Request $request) {
    $request->user()->update(['email' => $request->input('email')]);
});`,
    secureLaravel: `<?php

declare(strict_types=1);

final class ChangeEmailRequest extends FormRequest
{
    public function rules(): array
    {
        return ['email' => ['required', 'email:rfc', 'max:254']];
    }
}

Route::post('/account/email', function (ChangeEmailRequest $request) {
    $request->user()->update($request->validated());
})->middleware(['auth:sanctum', 'verified', 'throttle:account-changes']);`,
    unsafeReact: `fetch('/account/email', {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify({ email }),
});`,
    secureReact: `fetch('/account/email', {
  method: 'POST',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-TOKEN': csrfToken,
  },
  body: JSON.stringify({ email }),
});`,
    trafficField: 'email',
    trafficValue: 'new-address@example.test',
    responseInvariant: 'A state-changing request is accepted only when authentication, CSRF token validation, origin policy, and business validation all succeed.',
    primaryControls: [
      'Require CSRF tokens for browser-based state-changing routes.',
      'Use SameSite cookies appropriate to the application flow.',
      'Validate Origin and Referer headers as additional browser-route signals.',
      'Use POST, PATCH, PUT, or DELETE for state changes and keep GET safe and idempotent.',
      'Require re-authentication or step-up confirmation for high-risk account changes.',
    ],
    parserControls: [
      'Validate JSON content type and reject ambiguous form/body combinations.',
      'Bind CSRF tokens to the session and rotate where appropriate.',
      'Avoid accepting CSRF tokens through URLs because URLs appear in logs and history.',
      'Normalize API clients so every mutating request includes the token header automatically.',
    ],
    cspControls: [
      'CSP does not replace CSRF tokens, but frame-ancestors can reduce UI embedding risk around sensitive actions.',
      'Use form-action to restrict where forms may submit from application pages.',
      'Use no-store on sensitive account-management responses.',
      'Keep cookies HttpOnly, Secure, and SameSite to reduce unintended credential exposure.',
    ],
    isolationControls: [
      'Separate browser-session endpoints from token-based machine APIs.',
      'Keep administrative state changes in an admin route group with stricter middleware.',
      'Use idempotency keys for payment-like state changes.',
      'Log rejected token, origin, and method mismatches without recording submitted secrets.',
    ],
    qaManual: [
      'Inventory every state-changing route and confirm token middleware coverage.',
      'Remove or alter the token in staging and assert the route rejects the request.',
      'Verify SameSite, Secure, and HttpOnly cookie attributes.',
      'Confirm GET routes do not mutate application state.',
      'Review account-linking, email-change, password-change, payment, and admin routes.',
    ],
    qaAutomated: [
      'Add feature tests for missing token, mismatched token, missing origin, and invalid content type.',
      'Run route-list checks that flag mutating routes outside the CSRF-protected middleware group.',
      'Add browser integration tests for token bootstrap and refresh.',
      'Add header assertions for cookie and cache policy.',
      'Monitor rejection counts by route to detect integration regressions.',
    ],
    interviewTopics: [
      {
        question: 'Why are cookies not sufficient proof of user intent?',
        answer: 'Cookies prove that the browser has a session. They do not prove that the request came from the trusted application UI. A CSRF token adds a session-bound value that an unrelated site cannot read from the trusted origin.',
      },
      {
        question: 'How should SPAs obtain and send CSRF tokens?',
        answer: 'A backend can bootstrap a token through a same-origin document or endpoint, then the SPA sends it in a custom header for mutating requests. The server validates the token against the session.',
      },
      {
        question: 'Why should state-changing GET routes be avoided?',
        answer: 'GET is designed for safe retrieval and may be triggered by prefetching, crawlers, image loading, or navigation. Mutations need explicit methods and protections.',
      },
      {
        question: 'What is the role of SameSite cookies?',
        answer: 'SameSite limits when browsers attach cookies in cross-site contexts. It reduces risk, but it is not a full replacement for token validation because application flows and browser behavior vary.',
      },
      {
        question: 'What makes a CSRF fix durable?',
        answer: 'A durable fix applies middleware by route group, adds route inventory tests, validates token behavior in feature tests, and documents exceptions. It does not rely on individual developers remembering to add tokens manually.',
      },
    ],
  },
  ssrf: {
    title: 'Server-Side Request Forgery (SSRF)',
    boundary: 'request-controlled destination to server-side network client',
    interpreter: 'the URL parser, DNS resolver, redirect handler, and HTTP client',
    riskDescription: 'A server-side network client has access to networks and identity contexts that the browser user does not. If request data controls the destination, the server may cross unintended network boundaries.',
    unsafeLaravel: `<?php

declare(strict_types=1);

Route::post('/preview', function (Request $request) {
    return Http::get((string) $request->input('url'))->body();
});`,
    secureLaravel: `<?php

declare(strict_types=1);

enum PreviewProvider: string
{
    case Documentation = 'documentation';
    case Changelog = 'changelog';
}

final class PreviewRequest extends FormRequest
{
    public function rules(): array
    {
        return ['provider' => ['required', Rule::enum(PreviewProvider::class)]];
    }
}

Route::post('/preview', function (PreviewRequest $request, ApprovedPreviewClient $client) {
    return $client->fetch(PreviewProvider::from($request->validated('provider')));
});`,
    unsafeReact: `export function PreviewForm() {
  const [url, setUrl] = useState('');
  return <input value={url} onChange={(event) => setUrl(event.target.value)} />;
}`,
    secureReact: `const providers = ['documentation', 'changelog'] as const;
type Provider = typeof providers[number];

export function PreviewForm({ submit }: { submit: (provider: Provider) => void }) {
  return <button onClick={() => submit('documentation')}>Preview documentation</button>;
}`,
    trafficField: 'provider',
    trafficValue: 'documentation',
    responseInvariant: 'The server maps a symbolic provider to a pre-approved destination; raw URLs never cross into the HTTP client.',
    primaryControls: [
      'Prefer provider IDs or integration keys over arbitrary URLs.',
      'When URLs are unavoidable, canonicalize scheme, host, port, DNS result, and final redirect target.',
      'Allow only required schemes and disable redirects unless explicitly reviewed.',
      'Set short timeouts, small response limits, and safe content-type expectations.',
      'Treat redirects as new destinations that require the same validation as the original request.',
    ],
    parserControls: [
      'Validate after URL parsing, after DNS resolution, and after redirect resolution.',
      'Block loopback, link-local, private, multicast, and metadata address ranges at the resolver and firewall layers.',
      'Use a dedicated egress client that all server-side fetches must call.',
      'Reject userinfo, unusual ports, non-HTTP schemes, and ambiguous host representations unless explicitly required.',
    ],
    cspControls: [
      'CSP controls browser egress, not server-side egress, but connect-src should still restrict frontend API destinations.',
      'Do not expose fetched third-party content directly into document contexts without content-type and rendering controls.',
      'Use no-store for preview responses that may contain integration data.',
      'Avoid reflecting destination details in user-visible error messages.',
    ],
    isolationControls: [
      'Place outbound fetch workers in a network segment with limited egress.',
      'Deny access to cloud metadata services and internal administrative networks at the infrastructure layer.',
      'Use separate service identities for preview workers, with no database or secret-management privileges.',
      'Keep training SSRF labs in synthetic networks that cannot reach platform control planes.',
    ],
    qaManual: [
      'Inventory every Http client, webhook, import, preview, avatar, and metadata-fetch feature.',
      'Confirm destinations are symbolic allowlist entries or pass through an approved resolver.',
      'Review redirect handling and DNS validation behavior.',
      'Verify error messages do not disclose internal network details.',
      'Confirm infrastructure egress rules block private and metadata ranges.',
    ],
    qaAutomated: [
      'Add unit tests for URL canonicalization, DNS classification, redirect rejection, and provider mapping.',
      'Add integration tests with a local controlled destination service in staging.',
      'Use static analysis to flag direct Http::get calls with request data.',
      'Run infrastructure policy tests for egress firewall rules.',
      'Monitor outbound destination categories and alert on unexpected networks.',
    ],
    interviewTopics: [
      {
        question: 'Why is hostname allowlisting alone insufficient?',
        answer: 'Hostnames resolve to IP addresses, may change over time, and redirects can move the client to a new destination. Validation must consider canonical URL structure, DNS results, redirect targets, and network ranges.',
      },
      {
        question: 'Why are symbolic providers safer than user-submitted URLs?',
        answer: 'A provider key lets the server choose a configured destination. The request expresses intent, not transport details. That removes URL parser ambiguity from the user-controlled surface.',
      },
      {
        question: 'What belongs in a safe egress adapter?',
        answer: 'Scheme validation, host allowlisting, DNS/IP classification, redirect policy, timeout limits, response size limits, content-type checks, logging, and metrics should live in one adapter.',
      },
      {
        question: 'How does infrastructure reduce SSRF risk?',
        answer: 'Network egress rules, metadata service protections, isolated workers, and least-privilege identities ensure that even a missed application validation does not grant broad internal reach.',
      },
      {
        question: 'How should previews render fetched content?',
        answer: 'Preview content should be treated as untrusted data, constrained by content type, size, and rendering mode. It should not be injected into an active document context.',
      },
    ],
  },
  xxe: {
    title: 'XML External Entity (XXE)',
    boundary: 'uploaded or submitted XML to XML parser configuration',
    interpreter: 'the XML processor, entity resolver, DTD loader, and document builder',
    riskDescription: 'XML processors can expand document type definitions and external entities before application logic sees the parsed tree. Parser configuration therefore becomes the security boundary.',
    unsafeLaravel: `<?php

declare(strict_types=1);

Route::post('/imports/xml', function (Request $request) {
    $document = new DOMDocument();
    $document->loadXML($request->getContent());

    return response()->json(['root' => $document->documentElement?->tagName]);
});`,
    secureLaravel: `<?php

declare(strict_types=1);

final class XmlImportService
{
    public function parse(string $xml): DOMDocument
    {
        if (str_contains($xml, '<!DOCTYPE')) {
            throw ValidationException::withMessages(['xml' => 'DTD is not supported.']);
        }

        $document = new DOMDocument();
        $document->loadXML($xml, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING);

        return $document;
    }
}`,
    unsafeReact: `export function XmlImport() {
  return <input type="file" accept=".xml,.svg,.docx" />;
}`,
    secureReact: `export function XmlImport() {
  return (
    <input
      type="file"
      accept="application/xml,text/xml"
      aria-describedby="xml-import-policy"
    />
  );
}`,
    trafficField: 'xmlDocument',
    trafficValue: '<trainingDocument><title>Inventory</title></trainingDocument>',
    responseInvariant: 'The parser accepts only the approved XML profile, does not resolve network resources, and rejects DTD-bearing documents.',
    primaryControls: [
      'Disable DTDs and external entity resolution for untrusted XML.',
      'Prefer JSON or a constrained document format when XML features are not required.',
      'Validate content type, size, encoding, and schema before business processing.',
      'Use a dedicated parser service rather than configuring parser flags inline.',
      'Reject unexpected XML-capable formats such as SVG or office archives unless a safe pipeline exists.',
    ],
    parserControls: [
      'Use LIBXML_NONET or equivalent network-disabled parser modes.',
      'Reject DOCTYPE declarations for untrusted documents.',
      'Disable external general entities, external parameter entities, and external DTD loading in parser libraries.',
      'Limit document size, node depth, entity expansion, and processing time.',
    ],
    cspControls: [
      'CSP cannot secure server-side XML parsing, but it should constrain how imported content is later displayed.',
      'Serve transformed documents with explicit content type and no active script context.',
      'Use attachment disposition for untrusted XML-derived exports.',
      'Prevent SVG uploads from being served as active same-origin documents unless sanitized and isolated.',
    ],
    isolationControls: [
      'Parse complex documents in isolated workers with no network egress.',
      'Store uploaded documents outside the web root until validation completes.',
      'Separate import processing permissions from application account permissions.',
      'Keep training XML parser labs on synthetic filesystems and networks.',
    ],
    qaManual: [
      'Inventory XML, SVG, SOAP, SAML, office document, and integration import paths.',
      'Review parser flags and library defaults for each path.',
      'Confirm documents with unsupported DTD features are rejected generically.',
      'Verify parser errors do not disclose local paths or internal services.',
      'Review upload and transformation flows for content-type confusion.',
    ],
    qaAutomated: [
      'Add unit tests for parser service configuration and DTD rejection.',
      'Add file fixture tests for allowed XML, overlong XML, nested XML, unsupported document type, and wrong content type.',
      'Run static checks that flag direct DOMDocument or SimpleXML parsing outside the parser service.',
      'Scan XML libraries for security advisories.',
      'Monitor parser failure counts and document-size rejection metrics.',
    ],
    interviewTopics: [
      {
        question: 'Why does XXE prevention start with parser configuration?',
        answer: 'Entity resolution happens during parsing, often before application validation logic receives a document tree. The parser must be configured to reject or disable unsafe XML features at the boundary.',
      },
      {
        question: 'Why is client-side file accept not a security control?',
        answer: 'The accept attribute guides the file picker, but users and clients can submit different content. The server must verify content type, size, parser profile, and business schema.',
      },
      {
        question: 'What is the safest approach when XML is not required?',
        answer: 'Use a simpler format such as JSON with a strict schema. Removing unnecessary XML features removes the parser behaviors that create the risk.',
      },
      {
        question: 'How should SVG be handled?',
        answer: 'Treat SVG as XML and potentially active content. Sanitize it with a dedicated allowlist, serve it from an isolated origin, or convert it to a safe raster format.',
      },
      {
        question: 'What makes parser tests meaningful?',
        answer: 'They should instantiate the exact production parser service and assert safe behavior for allowed documents and rejection for unsupported features, rather than testing a different parser path.',
      },
    ],
  },
  rce: {
    title: 'Remote Code Execution (RCE)',
    boundary: 'request-controlled data to runtime execution boundary',
    interpreter: 'the shell, process runner, dynamic evaluator, template compiler, or language runtime',
    riskDescription: 'Execution boundaries interpret strings or objects as instructions. If request data reaches that boundary with instruction semantics intact, the runtime may perform work outside the intended business operation.',
    unsafeLaravel: `<?php

declare(strict_types=1);

Route::post('/diagnostics/ping', function (Request $request) {
    return shell_exec('ping -c 1 ' . $request->input('host'));
});`,
    secureLaravel: `<?php

declare(strict_types=1);

final class DiagnosticsRequest extends FormRequest
{
    public function rules(): array
    {
        return ['host' => ['required', 'string', 'max:253', new HostnameRule()]];
    }
}

Route::post('/diagnostics/ping', function (DiagnosticsRequest $request) {
    $result = Process::timeout(3)->run(['ping', '-c', '1', $request->validated('host')]);

    return response()->json(['exit_code' => $result->exitCode()]);
});`,
    unsafeReact: `export function DiagnosticsForm() {
  const [host, setHost] = useState('');
  return <input value={host} onChange={(event) => setHost(event.target.value)} />;
}`,
    secureReact: `type DiagnosticsRequest = Readonly<{ host: string }>;

export function DiagnosticsForm({ submit }: { submit: (request: DiagnosticsRequest) => void }) {
  const [host, setHost] = useState('');
  return <button onClick={() => submit({ host: host.trim() })}>Run diagnostic</button>;
}`,
    trafficField: 'host',
    trafficValue: 'status.example.test',
    responseInvariant: 'The process runner receives a fixed binary and an argument array; request data never becomes part of an executable instruction string.',
    primaryControls: [
      'Avoid runtime execution for user-triggered workflows whenever a library API can perform the task.',
      'When process execution is unavoidable, use fixed binaries, argument arrays, timeouts, and strict validators.',
      'Never pass request data to eval, shell string execution, dynamic template compilation, or dynamic imports.',
      'Represent allowed operations as enums or command objects owned by the server.',
      'Return minimal status information rather than raw process output.',
    ],
    parserControls: [
      'Use process APIs that keep command and arguments separate.',
      'Validate hostnames, filenames, template names, and operation names as domain primitives.',
      'Disable dangerous template functions and dynamic evaluation features.',
      'Reject deserialization formats that instantiate runtime objects from untrusted data.',
    ],
    cspControls: [
      'CSP does not secure server execution boundaries, but it reduces browser-side execution if output rendering regresses.',
      'Keep diagnostic responses JSON-only with explicit content type.',
      'Use no-store for operational responses.',
      'Avoid reflecting process details into HTML documents.',
    ],
    isolationControls: [
      'Run worker processes as non-root users with minimal filesystem and network permissions.',
      'Use containers, seccomp/AppArmor profiles, read-only filesystems, and bounded CPU/memory.',
      'Separate training execution labs from the platform API and user-progress database.',
      'Remove unnecessary shells, compilers, package managers, and interpreters from production containers.',
    ],
    qaManual: [
      'Inventory execution boundaries: shell calls, process runners, eval, template compilation, deserialization, plugins, and dynamic imports.',
      'Review each boundary for fixed operation names and typed argument objects.',
      'Confirm application users and containers have least-privilege runtime permissions.',
      'Verify errors are generic and raw process output is not returned.',
      'Review training lab isolation so intentionally unsafe exercises cannot access platform services.',
    ],
    qaAutomated: [
      'Add static analysis rules for shell_exec, exec, system, eval, dynamic Function, and unsafe template compilation.',
      'Add unit tests for validators that feed execution adapters.',
      'Add integration tests that assert process calls receive fixed arrays and timeouts.',
      'Scan container images for unnecessary runtime tools.',
      'Monitor process launch counts, timeout rates, and unexpected binary names.',
    ],
    interviewTopics: [
      {
        question: 'Why are argument arrays safer than command strings?',
        answer: 'Argument arrays let the process API pass values directly to the target binary without asking a shell to parse one combined instruction string. This preserves separation between operation and data.',
      },
      {
        question: 'What is the best remediation for unnecessary process execution?',
        answer: 'Remove the execution boundary entirely and use a library or service API. If no interpreter is invoked, request data cannot become runtime instructions.',
      },
      {
        question: 'How does least privilege help after application validation?',
        answer: 'Least privilege reduces impact if a validation bug appears later. The process should run with minimal filesystem, network, environment, and operating-system capabilities.',
      },
      {
        question: 'Which code patterns should trigger mandatory security review?',
        answer: 'Any shell invocation, dynamic evaluation, runtime code generation, template-from-string rendering, untrusted deserialization, plugin loading, or process adapter should require review.',
      },
      {
        question: 'What should diagnostic endpoints return?',
        answer: 'They should return minimal structured status, not raw command output. Detailed operational output belongs in protected logs with redaction and access control.',
      },
    ],
  },
};

export function getTargetDefensiveEducation(id: string): string | null {
  const profile = profiles[id];

  return profile ? buildTargetDoc(profile) : null;
}
