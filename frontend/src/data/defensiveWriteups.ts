import { getTargetDefensiveEducation } from './targetDefensiveEducation';

type DefensiveProfile = {
  rootCause: string;
  interpreterBehavior: string;
  phpVulnerable: string;
  phpSecure: string;
  reactVulnerable: string;
  reactSecure: string;
  verification: string[];
  trafficObservation: string;
  sanitizationMatrix: string[];
  frameworkControls: string[];
  interviewFocus: string;
};

type DefensiveWriteupInput = {
  id: string;
  title: string;
  severity: string;
};

const defaultProfile: DefensiveProfile = {
  rootCause: 'The defect appears when the application accepts client-controlled data and lets it influence a security-sensitive decision without a server-side trust boundary, typed validation, and context-aware encoding.',
  interpreterBehavior: 'Framework interpreters and runtime libraries do exactly what the code asks: parse the request, bind values, call handlers, and render responses. The vulnerability manifests when unsafe values cross from transport parsing into authorization, rendering, persistence, filesystem, network, or process boundaries without an explicit defensive adapter.',
  phpVulnerable: `Route::post('/resource', function (Request $request) {
    $value = $request->input('value');
    return Model::whereRaw("name = '$value'")->first();
});`,
  phpSecure: `Route::post('/resource', function (ValidatedResourceRequest $request) {
    $value = $request->validated('value');
    return Model::query()->where('name', $value)->firstOrFail();
});`,
  reactVulnerable: `export function Detail({ value }) {
  return <div dangerouslySetInnerHTML={{ __html: value }} />;
}`,
  reactSecure: `export function Detail({ value }) {
  return <div>{String(value)}</div>;
}`,
  verification: [
    'Map every externally controlled field to its server-side validation rule and owning controller.',
    'Confirm the control is enforced on the server, not only in React components or browser validation.',
    'Review negative test cases for malformed type, missing field, overlong value, and unauthorized state transition.',
  ],
  trafficObservation: 'A request carries a client-controlled field into a server decision point. A safe implementation normalizes and validates the field before the application performs persistence, rendering, or authorization work.',
  sanitizationMatrix: [
    'Identifiers: reject free-form strings; resolve opaque IDs to authorized records server-side.',
    'Text: validate length and character policy; encode on output for the destination context.',
    'State changes: require authentication, authorization, anti-CSRF controls, and idempotency where appropriate.',
  ],
  frameworkControls: [
    'Laravel: FormRequest validation, policies/gates, mass-assignment allowlists, query builder binding.',
    'React: avoid dangerous rendering sinks, keep authorization out of client-only state, encode by default.',
    'Platform: centralized logging, security regression tests, least-privilege service accounts.',
  ],
  interviewFocus: 'boundary validation and secure-by-default framework use',
};

const profiles: Record<string, DefensiveProfile> = {
  sqli: {
    rootCause: 'SQL injection is caused by mixing query structure with untrusted data. Once user input is concatenated into SQL text, the database parser cannot distinguish application-authored syntax from request-authored syntax.',
    interpreterBehavior: 'The SQL engine tokenizes the final query string after interpolation. If the application sends one combined string, the interpreter parses user-controlled bytes as SQL grammar. Prepared statements prevent this by compiling the statement shape separately from bound values.',
    phpVulnerable: `Route::get('/users', function (Request $request) {
    $email = $request->query('email');
    return DB::select("select * from users where email = '$email'");
});`,
    phpSecure: `Route::get('/users', function (UserLookupRequest $request) {
    $email = $request->validated('email');
    return DB::table('users')->where('email', $email)->first();
});`,
    reactVulnerable: `export function UserSearch({ onSearch }) {
  const [email, setEmail] = useState('');
  return <button onClick={() => onSearch('/api/users?email=' + email)}>Search</button>;
}`,
    reactSecure: `export function UserSearch({ onSearch }) {
  const [email, setEmail] = useState('');
  const submit = () => onSearch({ email: email.trim().toLowerCase() });
  return <button onClick={submit}>Search</button>;
}`,
    verification: [
      'OWASP ASVS 5.3: verify parameterized database access for every dynamic query.',
      'Review ORM escape hatches such as raw SQL, whereRaw, orderByRaw, and stored procedure string assembly.',
      'Run safe negative tests that submit quotes, delimiters, and overlong strings in a staging dataset and assert generic errors plus unchanged records.',
    ],
    trafficObservation: 'HTTP field: email=<user text> -> controller validation -> parameter binding -> database plan. The anomaly is any path where email is appended to SQL text before execution.',
    sanitizationMatrix: [
      'Search text: trim, length-limit, bind as a parameter.',
      'Sort fields: map symbolic names to hardcoded column identifiers.',
      'Numeric filters: parse to integer/decimal types before query binding.',
    ],
    frameworkControls: [
      'Laravel: prefer query builder/Eloquent bindings; forbid DB::raw in request paths without review.',
      'Database: use least-privilege accounts and separate read/write roles.',
      'React: treat client validation as UX only; never build SQL-like query fragments client-side.',
    ],
    interviewFocus: 'prepared statements, query shape separation, and ORM raw-query governance',
  },
  xss: {
    rootCause: 'XSS occurs when untrusted data is rendered into a browser execution context without context-aware output encoding. The browser parser interprets the bytes as markup, script, URL, or style rather than inert text.',
    interpreterBehavior: 'HTML, JavaScript, CSS, and URL parsers have different escaping rules. A value that is safe in a text node may be unsafe in an attribute or script block. React escapes text by default, but unsafe sinks bypass that protection.',
    phpVulnerable: `Route::get('/profile', function (Request $request) {
    return view('profile', ['bioHtml' => $request->input('bio')]);
});

// Blade
{!! $bioHtml !!}`,
    phpSecure: `Route::get('/profile', function (ProfileRequest $request) {
    return view('profile', ['bio' => $request->validated('bio')]);
});

// Blade
{{ $bio }}`,
    reactVulnerable: `export function Comment({ body }) {
  return <article dangerouslySetInnerHTML={{ __html: body }} />;
}`,
    reactSecure: `export function Comment({ body }) {
  return <article>{body}</article>;
}`,
    verification: [
      'OWASP ASVS 5.3 and 14.4: verify output encoding and CSP for every rendered user-controlled value.',
      'Search for dangerous sinks: dangerouslySetInnerHTML, innerHTML, document.write, unsafe template rendering, and raw Blade output.',
      'Assert security headers include a strict Content-Security-Policy without unsafe-inline in production.',
    ],
    trafficObservation: 'HTTP field: comment=<display text> -> persistence -> render. The anomaly is a response where stored text changes the DOM structure instead of appearing as text.',
    sanitizationMatrix: [
      'Plain text: store as text, encode on output.',
      'Rich text: sanitize with an allowlist sanitizer and strip active content.',
      'URLs: parse and allow only approved schemes and host policies.',
    ],
    frameworkControls: [
      'Laravel: use escaped Blade braces by default; centralize any HTML sanitizer.',
      'React: avoid dangerous sinks; render strings as children.',
      'Browser: deploy CSP, HttpOnly cookies, and Trusted Types where supported.',
    ],
    interviewFocus: 'context-aware encoding, safe rendering sinks, and CSP as defense in depth',
  },
  csrf: {
    rootCause: 'CSRF appears when state-changing routes rely only on ambient browser credentials. The browser automatically attaches cookies, so the server must verify intentionality separately.',
    interpreterBehavior: 'HTTP request handling sees a valid authenticated session because cookies are present. Without a per-session token, SameSite policy, and origin checks, the handler cannot distinguish a user-initiated request from a cross-site form or navigation.',
    phpVulnerable: `Route::post('/settings/email', function (Request $request) {
    auth()->user()->update(['email' => $request->input('email')]);
});`,
    phpSecure: `Route::post('/settings/email', function (EmailRequest $request) {
    auth()->user()->update($request->validated());
})->middleware(['auth', 'verified']);`,
    reactVulnerable: `fetch('/settings/email', {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify({ email }),
});`,
    reactSecure: `fetch('/settings/email', {
  method: 'POST',
  credentials: 'same-origin',
  headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
  body: JSON.stringify({ email }),
});`,
    verification: [
      'OWASP ASVS 3.5 and 4.2: verify anti-CSRF controls on every state-changing route.',
      'Confirm cookies use SameSite=Lax or Strict where business flow permits.',
      'Remove or alter the CSRF token in a staging request and assert the server rejects it.',
    ],
    trafficObservation: 'Normal flow includes session cookie plus a server-issued request token. The anomaly is a state-changing request accepted with cookies alone.',
    sanitizationMatrix: [
      'Mutating POST/PATCH/DELETE: require CSRF token and authenticated session.',
      'High-risk actions: require recent re-authentication or step-up verification.',
      'APIs: prefer bearer tokens not stored in ambient cookies, or enforce same-origin controls.',
    ],
    frameworkControls: [
      'Laravel: keep VerifyCsrfToken middleware enabled and avoid broad route exemptions.',
      'React: read CSRF token from server-rendered metadata or a bootstrap endpoint.',
      'Platform: validate Origin/Referer as defense in depth for browser routes.',
    ],
    interviewFocus: 'intent verification for browser state changes',
  },
  ssrf: {
    rootCause: 'SSRF occurs when a server-side network client is controlled by request data. The trusted server becomes a proxy across network boundaries that the user cannot normally reach.',
    interpreterBehavior: 'URL parsers normalize hosts, redirects, schemes, and DNS results before the HTTP client connects. If validation happens before canonicalization or ignores DNS/IP ranges, the runtime may connect to internal addresses.',
    phpVulnerable: `Route::post('/preview', function (Request $request) {
    return Http::get($request->input('url'))->body();
});`,
    phpSecure: `Route::post('/preview', function (PreviewRequest $request) {
    $url = app(ApprovedUrlResolver::class)->resolve($request->validated('url'));
    return Http::timeout(2)->withoutRedirecting()->get($url)->body();
});`,
    reactVulnerable: `export function PreviewForm() {
  return <input name="url" placeholder="Any URL" />;
}`,
    reactSecure: `export function PreviewForm() {
  return <select name="provider"><option value="docs">Approved docs provider</option></select>;
}`,
    verification: [
      'OWASP ASVS 5.2 and 13.2: verify server-side URL fetches use allowlisted destinations.',
      'Review redirect behavior, DNS rebinding protections, timeout limits, and blocked private IP ranges.',
      'In staging, submit approved and unapproved destinations and assert only approved network egress occurs.',
    ],
    trafficObservation: 'HTTP field: resourceProvider=<symbolic id> -> server maps to approved origin -> egress. The anomaly is a raw URL crossing directly into an HTTP client.',
    sanitizationMatrix: [
      'Destination: prefer symbolic provider IDs over free-form URLs.',
      'Scheme: allow only https unless a documented internal service requires otherwise.',
      'Network: block loopback, link-local, private, multicast, and metadata ranges after DNS resolution.',
    ],
    frameworkControls: [
      'Laravel: wrap Http client calls in an approved resolver service.',
      'React: present approved integrations instead of arbitrary URL fields.',
      'Infrastructure: enforce egress firewall rules and metadata service protections.',
    ],
    interviewFocus: 'safe server-side egress and URL canonicalization',
  },
  xxe: {
    rootCause: 'XXE stems from XML parsers that resolve external entities or DTDs from untrusted input. The parser performs file or network resolution as part of document expansion.',
    interpreterBehavior: 'XML processors may expand entities before application code receives the parsed tree. If DTDs and external entities are enabled, parsing itself becomes a sensitive filesystem or network operation.',
    phpVulnerable: `$xml = $request->getContent();
$dom = new DOMDocument();
$dom->loadXML($xml);
return $dom->textContent;`,
    phpSecure: `$xml = $request->getContent();
$dom = new DOMDocument();
$dom->loadXML($xml, LIBXML_NONET);
if (str_contains($xml, '<!DOCTYPE')) {
    abort(400, 'DTD is not supported');
}`,
    reactVulnerable: `export function XmlUploader() {
  return <input type="file" accept=".xml,.svg" />;
}`,
    reactSecure: `export function XmlUploader() {
  return <input type="file" accept="application/json" aria-describedby="json-only" />;
}`,
    verification: [
      'OWASP ASVS 5.5: verify XML parsers disable DTDs, external entities, and network access.',
      'Review all XML-capable formats including SVG, office documents, SAML, SOAP, and import feeds.',
      'Confirm parser errors are generic and do not reveal local paths or internal network details.',
    ],
    trafficObservation: 'HTTP body: XML document -> parser configuration -> object model. The anomaly is parser-level entity resolution before business validation.',
    sanitizationMatrix: [
      'XML body: reject DTD declarations unless a documented safe parser profile exists.',
      'File upload: validate magic bytes, extension, size, and parser mode.',
      'Integrations: prefer JSON for new APIs where XML features are not required.',
    ],
    frameworkControls: [
      'Laravel/PHP: use LIBXML_NONET and reject DTDs for untrusted documents.',
      'React: restrict accepted formats as UX guidance only; server remains authoritative.',
      'Platform: deny parser egress at the network layer.',
    ],
    interviewFocus: 'secure XML parser configuration',
  },
  rce: {
    rootCause: 'Remote code execution appears when untrusted data reaches an interpreter boundary such as shell, eval, template execution, dynamic import, or unsafe deserialization.',
    interpreterBehavior: 'Command shells and language evaluators parse strings as instructions. If application data is passed into an instruction string, the runtime grants that data control over execution semantics.',
    phpVulnerable: `Route::post('/diagnostics/ping', function (Request $request) {
    return shell_exec('ping -c 1 ' . $request->input('host'));
});`,
    phpSecure: `Route::post('/diagnostics/ping', function (HostRequest $request) {
    $host = $request->validated('host');
    Process::timeout(3)->run(['ping', '-c', '1', $host]);
    return response()->json(['status' => 'completed']);
});`,
    reactVulnerable: `export function Diagnostics() {
  return <input name="host" placeholder="host or command" />;
}`,
    reactSecure: `export function Diagnostics() {
  return <input name="host" inputMode="url" aria-label="Hostname to validate" />;
}`,
    verification: [
      'OWASP ASVS 5.2: verify user input never reaches eval, shell, or dynamic execution sinks.',
      'Search for shell_exec, exec, system, eval, Function constructor, dynamic require/import, and template evaluation.',
      'Validate process isolation: non-root runtime user, read-only filesystem where possible, and minimal OS capabilities.',
    ],
    trafficObservation: 'HTTP field: host=<hostname> -> validator -> argument-array process API. The anomaly is host being concatenated into a command string.',
    sanitizationMatrix: [
      'Hostnames: parse against RFC-compatible hostname/IP validators.',
      'Process execution: use argument arrays, timeouts, and fixed binaries.',
      'Features: prefer library APIs over shelling out.',
    ],
    frameworkControls: [
      'Laravel: use Process with array arguments and strict FormRequest validation.',
      'React: constrain UX inputs but assume server-side validation is required.',
      'Runtime: sandbox workers and remove unnecessary interpreters from containers.',
    ],
    interviewFocus: 'interpreter boundary elimination and least-privilege execution',
  },
  'path-traversal': {
    rootCause: 'Path traversal occurs when user-controlled path fragments are joined with server filesystem paths without canonicalization and containment checks.',
    interpreterBehavior: 'Filesystem APIs normalize separators, relative segments, symlinks, and platform-specific aliases. String checks before canonicalization can disagree with the path the OS actually opens.',
    phpVulnerable: `Route::get('/download', function (Request $request) {
    return response()->download(storage_path('docs/' . $request->query('file')));
});`,
    phpSecure: `Route::get('/download/{document}', function (Document $document) {
    Gate::authorize('view', $document);
    return Storage::disk('private')->download($document->stored_name);
});`,
    reactVulnerable: `export function DownloadLink({ filename }) {
  return <a href={'/download?file=' + filename}>Download</a>;
}`,
    reactSecure: `export function DownloadLink({ documentId }) {
  return <a href={'/download/' + encodeURIComponent(documentId)}>Download</a>;
}`,
    verification: [
      'OWASP ASVS 5.2 and 12.3: verify file access uses opaque IDs and storage abstractions.',
      'Confirm canonical paths remain inside the intended storage root after symlink and separator normalization.',
      'Review download, image, template, import, archive, and log viewer features.',
    ],
    trafficObservation: 'Safe flow uses documentId -> authorization -> stored filename. The anomaly is a request path fragment becoming a filesystem path.',
    sanitizationMatrix: [
      'File references: use opaque database IDs, not raw paths.',
      'Extensions: allowlist by business type and never trust client filenames.',
      'Storage: keep private files outside public web roots.',
    ],
    frameworkControls: [
      'Laravel: use Storage disks, policies, and generated server-side filenames.',
      'React: pass IDs and labels separately; do not construct path fragments.',
      'Platform: restrict filesystem permissions to the narrow storage directory.',
    ],
    interviewFocus: 'canonical path containment and opaque identifiers',
  },
  idor: {
    rootCause: 'IDOR is caused by using client-supplied object identifiers without verifying that the authenticated principal is authorized for the resolved object.',
    interpreterBehavior: 'Routers and ORMs correctly resolve the requested ID. The vulnerability exists because object lookup is not scoped by tenant, owner, role, or policy after resolution.',
    phpVulnerable: `Route::get('/orders/{order}', function (Order $order) {
    return $order;
});`,
    phpSecure: `Route::get('/orders/{order}', function (Order $order) {
    Gate::authorize('view', $order);
    return $order;
});`,
    reactVulnerable: `export function OrderLink({ id }) {
  return <Link to={'/orders/' + id}>Open order</Link>;
}`,
    reactSecure: `export function OrderLink({ id }) {
  return <Link to={'/orders/' + encodeURIComponent(id)}>Open order</Link>;
}`,
    verification: [
      'OWASP ASVS 4.1: verify every object access has server-side authorization.',
      'Test with two staging users and assert cross-user object IDs return 403 or 404.',
      'Review route model binding, GraphQL resolvers, exports, and nested resources.',
    ],
    trafficObservation: 'HTTP path: /orders/{id} -> model resolution -> policy check -> response. The anomaly is model resolution followed directly by response serialization.',
    sanitizationMatrix: [
      'Object IDs: validate format, then authorize the resolved object.',
      'Collections: scope queries by tenant and principal before filtering.',
      'Errors: avoid revealing existence of unauthorized objects.',
    ],
    frameworkControls: [
      'Laravel: policies, gates, scoped bindings, and tenant-aware global scopes.',
      'React: never hide unauthorized links as the only access control.',
      'Logging: record denied object access attempts for detection.',
    ],
    interviewFocus: 'object-level authorization',
  },
  jwt: {
    rootCause: 'JWT vulnerabilities come from trusting token headers or claims without strict cryptographic verification, issuer/audience checks, and lifecycle controls.',
    interpreterBehavior: 'JWT libraries decode headers and payloads before or during verification. If the application accepts attacker-selected algorithms, weak keys, missing claims, or unsigned tokens, decoded data may be trusted without integrity.',
    phpVulnerable: `$payload = JWT::decode($token, new Key($request->header('kid'), $request->header('alg')));
auth()->loginUsingId($payload->sub);`,
    phpSecure: `$payload = JWT::decode($token, new Key(config('jwt.public_key'), 'RS256'));
abort_unless($payload->iss === config('app.url'), 401);
abort_unless(in_array('web', (array) $payload->aud, true), 401);`,
    reactVulnerable: `const role = JSON.parse(atob(token.split('.')[1])).role;
return role === 'admin' ? <AdminPanel /> : null;`,
    reactSecure: `return session.user.permissions.includes('admin:view')
  ? <AdminPanel />
  : null;`,
    verification: [
      'OWASP ASVS 2.1 and 3.1: verify token signature, algorithm allowlist, issuer, audience, expiration, and key rotation.',
      'Confirm authorization decisions are based on server-validated sessions or introspected claims.',
      'Review storage location and ensure sensitive tokens are not exposed to unnecessary JavaScript access.',
    ],
    trafficObservation: 'HTTP Authorization header -> fixed verifier config -> claims validation -> authorization context. The anomaly is decoded claims being trusted before verification.',
    sanitizationMatrix: [
      'Algorithms: hardcode accepted algorithms per issuer.',
      'Claims: require exp, iss, aud, sub, and appropriate authorization claims.',
      'Keys: rotate, identify with trusted key sets, and reject unknown key IDs.',
    ],
    frameworkControls: [
      'Laravel: central middleware for JWT verification and claim validation.',
      'React: treat decoded token data as display-only unless supplied by verified session state.',
      'Platform: use short lifetimes and refresh-token rotation.',
    ],
    interviewFocus: 'cryptographic verification and claim trust',
  },
  cors: {
    rootCause: 'CORS misconfiguration happens when the server grants browser read access to origins that should not be trusted, especially when credentials are allowed.',
    interpreterBehavior: 'Browsers enforce CORS based on response headers. If the API reflects arbitrary Origin values or combines wildcard-like behavior with credentials, the browser permits cross-origin JavaScript to read protected responses.',
    phpVulnerable: `header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
header('Access-Control-Allow-Credentials: true');`,
    phpSecure: `$origin = request()->headers->get('Origin');
abort_unless(in_array($origin, config('cors.allowed_origins'), true), 403);
return response()->json($data)->header('Access-Control-Allow-Origin', $origin);`,
    reactVulnerable: `fetch('https://api.example.test/account', { credentials: 'include' });`,
    reactSecure: `fetch('/api/account', { credentials: 'same-origin' });`,
    verification: [
      'OWASP ASVS 14.5: verify CORS policies use exact origin allowlists.',
      'Confirm credentialed endpoints never reflect arbitrary Origin values.',
      'Test staging preflight and simple requests from approved and unapproved origins.',
    ],
    trafficObservation: 'Request Origin -> exact allowlist check -> CORS headers. The anomaly is Access-Control-Allow-Origin mirroring any supplied Origin.',
    sanitizationMatrix: [
      'Origins: exact scheme, host, and port match.',
      'Methods: expose only required methods per route group.',
      'Headers: expose minimal response headers and avoid credentials unless required.',
    ],
    frameworkControls: [
      'Laravel: configure fruitcake/laravel-cors or framework CORS config with explicit origins.',
      'React: prefer same-origin API gateways.',
      'Platform: separate public and credentialed APIs.',
    ],
    interviewFocus: 'browser trust boundaries and CORS header semantics',
  },
  ssti: {
    rootCause: 'SSTI occurs when untrusted input is treated as template source rather than template data. The template engine evaluates expressions, filters, or object access embedded in that input.',
    interpreterBehavior: 'Template engines compile template syntax into executable rendering logic. Passing user content into the template compiler lets the user influence that logic.',
    phpVulnerable: `$template = "Hello " . $request->input('name');
return Blade::render($template);`,
    phpSecure: `return view('hello', [
    'name' => $request->validate(['name' => 'required|string|max:80'])['name'],
]);`,
    reactVulnerable: `const Template = compile(userSuppliedTemplate);
return <Template data={profile} />;`,
    reactSecure: `return <p>Hello {profile.displayName}</p>;`,
    verification: [
      'OWASP ASVS 5.3: verify user input is passed as data, never as template source.',
      'Search for dynamic template compilation and render-from-string helpers.',
      'Confirm template sandboxes do not expose filesystem, process, environment, or service objects.',
    ],
    trafficObservation: 'HTTP field: displayName=<text> -> view data -> escaped render. The anomaly is displayName being compiled as template syntax.',
    sanitizationMatrix: [
      'Display text: escape as text in pre-authored templates.',
      'User-authored templates: restrict to a safe DSL with no runtime object access.',
      'Emails/documents: separate content blocks from rendering templates.',
    ],
    frameworkControls: [
      'Laravel: avoid Blade::render on request data.',
      'React: compose components from trusted code, not user template strings.',
      'Platform: disable dangerous template filters/functions in multi-tenant systems.',
    ],
    interviewFocus: 'template source versus template data separation',
  },
  clickjacking: {
    rootCause: 'Clickjacking occurs when sensitive UI can be embedded by another site and visually manipulated so users activate controls without reliable context.',
    interpreterBehavior: 'Browsers allow framing unless response headers restrict it. Without frame-ancestors or X-Frame-Options, the browser renders the page inside an attacker-controlled embedding context.',
    phpVulnerable: `Route::get('/account/delete', fn () => view('delete-account'));`,
    phpSecure: `Route::middleware('security.headers')->get('/account/delete', fn () => view('delete-account'));

// Header policy: Content-Security-Policy: frame-ancestors 'self'`,
    reactVulnerable: `return <button onClick={deleteAccount}>Delete account</button>;`,
    reactSecure: `return <ConfirmAction requiredPhrase="DELETE" onConfirm={deleteAccount} />;`,
    verification: [
      'OWASP ASVS 14.4: verify CSP frame-ancestors or X-Frame-Options on sensitive pages.',
      'Confirm high-risk actions require explicit confirmation independent of pointer position.',
      'Review payment, profile, admin, OAuth consent, and destructive action screens.',
    ],
    trafficObservation: 'Normal response includes frame restrictions. The anomaly is a sensitive HTML response without anti-framing headers.',
    sanitizationMatrix: [
      'Sensitive pages: frame-ancestors none or self.',
      'Embeddable widgets: isolate on separate origins with minimal privileges.',
      'Destructive actions: require CSRF, confirmation, and recent authentication.',
    ],
    frameworkControls: [
      'Laravel: add security header middleware globally or per route group.',
      'React: add confirmation friction for irreversible actions.',
      'Platform: test headers at CDN and origin layers.',
    ],
    interviewFocus: 'browser framing controls and action confirmation design',
  },
  nosqli: {
    rootCause: 'NoSQL injection occurs when request values are inserted into database query objects without type validation, allowing operators or unexpected structures to alter query semantics.',
    interpreterBehavior: 'Document databases interpret objects such as comparison operators as query syntax. If the application expected a string but accepts an object, the database driver may treat client data as query instructions.',
    phpVulnerable: `$user = DB::collection('users')->where('email', $request->input('email'))->first();`,
    phpSecure: `$data = $request->validate(['email' => 'required|email|max:255']);
$user = DB::collection('users')->where('email', (string) $data['email'])->first();`,
    reactVulnerable: `fetch('/login', { method: 'POST', body: JSON.stringify(formState) });`,
    reactSecure: `fetch('/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: String(email), password: String(password) }),
});`,
    verification: [
      'OWASP ASVS 5.2: verify JSON schema validation rejects objects/arrays where strings are expected.',
      'Review MongoDB, Elasticsearch, Redis query builders, and dynamic filters.',
      'Assert operator-like keys are rejected unless explicitly modeled by server-side code.',
    ],
    trafficObservation: 'HTTP JSON field: email:string -> validator -> query equality. The anomaly is email:object reaching a query builder.',
    sanitizationMatrix: [
      'Scalar fields: enforce primitive types with schema validation.',
      'Filters: map approved operators server-side.',
      'Search: limit regex support and cap execution cost.',
    ],
    frameworkControls: [
      'Laravel: validate JSON shapes and cast to expected scalar types.',
      'React: submit explicit DTOs rather than spreading arbitrary form objects.',
      'Database: disable server-side scripting features where possible.',
    ],
    interviewFocus: 'type validation for document query construction',
  },
  'http-smuggling': {
    rootCause: 'HTTP request smuggling is caused by inconsistent request boundary parsing between front-end and back-end HTTP components.',
    interpreterBehavior: 'Intermediaries decide where one request ends and the next begins using Content-Length, Transfer-Encoding, protocol version, and connection reuse rules. Parser disagreement can desynchronize request streams.',
    phpVulnerable: `// Risk pattern: origin trusts ambiguous traffic forwarded by a proxy
Route::any('/{path}', fn () => response('ok'));`,
    phpSecure: `// Control pattern: reject ambiguous framing at the edge and use HTTP/2 to origin
Route::middleware('trusted.proxy')->any('/{path}', fn () => response('ok'));`,
    reactVulnerable: `// Client code cannot fix server parser disagreement.
fetch('/api/action', { method: 'POST', body });`,
    reactSecure: `// Frontend relies on platform controls and avoids custom raw HTTP tunneling.
fetch('/api/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });`,
    verification: [
      'OWASP ASVS 14.4: verify edge and origin reject ambiguous message framing.',
      'Review CDN, WAF, reverse proxy, load balancer, and origin protocol settings as one chain.',
      'Use approved staging-safe scanner checks that detect parser disagreement without targeting users.',
    ],
    trafficObservation: 'Safe flow has one normalized request boundary at the edge and origin. The anomaly is edge and origin deriving different body lengths or next-request boundaries.',
    sanitizationMatrix: [
      'Framing: reject requests with conflicting length indicators.',
      'Protocol: prefer HTTP/2 end-to-end or normalize to one safe version at the edge.',
      'Connections: disable unsafe backend connection reuse if normalization cannot be guaranteed.',
    ],
    frameworkControls: [
      'Laravel: rely on hardened web server/proxy normalization before PHP-FPM.',
      'React: no direct mitigation beyond avoiding nonstandard request construction.',
      'Platform: patch proxy/origin servers and align parser settings.',
    ],
    interviewFocus: 'HTTP parser normalization across proxy chains',
  },
  'file-upload': {
    rootCause: 'File upload vulnerabilities arise when uploaded content is trusted based on client metadata, filename, or extension rather than server-side content validation and safe storage.',
    interpreterBehavior: 'Web servers, image libraries, archive tools, and browsers interpret files by content, extension, MIME type, and serving context. A mismatch can turn uploaded content into active code or unsafe client-rendered data.',
    phpVulnerable: `$path = $request->file('avatar')->storeAs('public', $request->file('avatar')->getClientOriginalName());`,
    phpSecure: `$file = $request->validate(['avatar' => 'required|image|max:2048'])['avatar'];
$name = Str::uuid() . '.jpg';
Image::read($file)->cover(256, 256)->save(storage_path('app/private/' . $name));`,
    reactVulnerable: `<input type="file" onChange={uploadAnyFile} />`,
    reactSecure: `<input type="file" accept="image/png,image/jpeg" onChange={uploadAvatar} />`,
    verification: [
      'OWASP ASVS 12.1: verify content validation, safe naming, size limits, malware scanning, and non-executable storage.',
      'Confirm downloads are served with safe Content-Type and Content-Disposition.',
      'Review archive extraction and image processing paths for secondary parser risks.',
    ],
    trafficObservation: 'HTTP multipart file -> server validates content -> rewrites name -> private storage. The anomaly is original filename or client MIME controlling storage/serving behavior.',
    sanitizationMatrix: [
      'Images: decode and re-encode to a safe format.',
      'Documents: scan, store privately, and serve as attachments.',
      'Archives: extract in isolated workers with path containment and file count limits.',
    ],
    frameworkControls: [
      'Laravel: validate file rules, randomize names, store outside public disk by default.',
      'React: accept attribute improves UX but is not a security boundary.',
      'Platform: serve user content from a separate origin without cookies.',
    ],
    interviewFocus: 'safe upload pipelines and content re-encoding',
  },
  deserialization: {
    rootCause: 'Insecure deserialization occurs when untrusted bytes are reconstructed into rich runtime objects with behavior, magic methods, or type metadata.',
    interpreterBehavior: 'Deserializers may instantiate classes, invoke lifecycle hooks, resolve references, or allocate resources before application validation runs. Integrity and type constraints must happen before object materialization.',
    phpVulnerable: `$profile = unserialize($request->cookie('profile'));
return $profile->displayName;`,
    phpSecure: `$profile = json_decode(Crypt::decryptString($request->cookie('profile')), true, flags: JSON_THROW_ON_ERROR);
Validator::make($profile, ['displayName' => 'required|string|max:80'])->validate();`,
    reactVulnerable: `const state = JSON.parse(localStorage.getItem('trustedState') || '{}');
setSession(state);`,
    reactSecure: `const state = sessionSchema.safeParse(JSON.parse(localStorage.getItem('uiState') || '{}'));
setUiState(state.success ? state.data : defaultState);`,
    verification: [
      'OWASP ASVS 5.5: verify untrusted data is not deserialized into executable object graphs.',
      'Search for unserialize, pickle, BinaryFormatter, native Java serialization, Marshal.load, and custom object mappers.',
      'Confirm serialized tokens have encryption or HMAC integrity and strict schema validation.',
    ],
    trafficObservation: 'Safe flow uses signed JSON -> schema validation -> plain data object. The anomaly is request data becoming framework/domain objects before integrity checks.',
    sanitizationMatrix: [
      'Client state: JSON only, schema-validated, signed if security relevant.',
      'Server messages: prefer protobuf/JSON with explicit schemas.',
      'Legacy serialization: isolate behind allowlisted classes and integrity protection.',
    ],
    frameworkControls: [
      'Laravel: use Crypt and JSON arrays for client-side state, not unserialize.',
      'React: treat localStorage as untrusted and validate before use.',
      'Platform: remove gadget-prone libraries where possible.',
    ],
    interviewFocus: 'safe serialization formats and integrity checks',
  },
  graphql: {
    rootCause: 'GraphQL vulnerabilities arise when a flexible query language is exposed without field-level authorization, query cost controls, and production-safe schema visibility.',
    interpreterBehavior: 'The GraphQL executor walks resolver trees requested by the client. Without limits and resolver authorization, clients can request expensive shapes or fields the UI never exposes.',
    phpVulnerable: `GraphQL::query('user', [
    'type' => $userType,
    'args' => ['id' => Type::id()],
    'resolve' => fn ($root, $args) => User::find($args['id']),
]);`,
    phpSecure: `GraphQL::query('user', [
    'type' => $userType,
    'args' => ['id' => Type::nonNull(Type::id())],
    'resolve' => fn ($root, $args) => Gate::authorize('view', User::findOrFail($args['id'])) ?: User::find($args['id']),
]);`,
    reactVulnerable: `client.query({ query: gql(queryTextFromUser) });`,
    reactSecure: `client.query({ query: GetCurrentUserDocument, variables: { id: currentUserId } });`,
    verification: [
      'OWASP ASVS 13.4: verify resolver authorization, depth limits, cost limits, and rate limits.',
      'Confirm introspection policy matches environment and schema exposure decisions.',
      'Test staging queries for unauthorized field access and excessive complexity rejection.',
    ],
    trafficObservation: 'HTTP body: named operation + variables -> validation rules -> authorized resolvers. The anomaly is arbitrary query shape reaching resolvers without cost or authorization gates.',
    sanitizationMatrix: [
      'Variables: schema validate scalar types and enum values.',
      'Resolvers: authorize every object and sensitive field.',
      'Operations: enforce depth, cost, timeout, and persisted queries where possible.',
    ],
    frameworkControls: [
      'Laravel GraphQL: use policies in resolvers and query complexity rules.',
      'React: use generated typed operations and avoid user-authored GraphQL text.',
      'Platform: rate-limit by user and operation name.',
    ],
    interviewFocus: 'resolver authorization and query cost governance',
  },
  oauth: {
    rootCause: 'OAuth vulnerabilities come from weak binding between authorization requests, callbacks, clients, redirect URIs, and token storage.',
    interpreterBehavior: 'OAuth servers and clients exchange short-lived artifacts across browser redirects. If state, PKCE, redirect URI, and issuer checks are loose, the callback handler may bind the wrong authorization result to the user session.',
    phpVulnerable: `Route::get('/oauth/callback', function (Request $request) {
    $tokens = OAuth::exchange($request->query('code'));
    session(['access_token' => $tokens->access_token]);
});`,
    phpSecure: `Route::get('/oauth/callback', function (Request $request) {
    abort_unless(hash_equals(session('oauth_state'), $request->query('state')), 403);
    $tokens = OAuth::exchangeWithPkce($request->query('code'), session('pkce_verifier'));
    session()->forget(['oauth_state', 'pkce_verifier']);
});`,
    reactVulnerable: `localStorage.setItem('access_token', token);`,
    reactSecure: `// Prefer an HttpOnly, Secure, SameSite cookie issued by the backend after callback completion.
setSessionStatus('connected');`,
    verification: [
      'OWASP ASVS 2.1 and OAuth Security BCP: verify state, PKCE, exact redirect URI matching, issuer checks, and single-use codes.',
      'Confirm access tokens are not stored in localStorage for sensitive browser apps.',
      'Review callback error handling and account-linking flows.',
    ],
    trafficObservation: 'Authorization request -> state and PKCE stored in session -> callback verifies state -> code exchange. The anomaly is a callback accepted without binding checks.',
    sanitizationMatrix: [
      'Redirect URI: exact pre-registered match.',
      'State: unpredictable, session-bound, single-use.',
      'Tokens: short-lived access tokens and rotated refresh tokens.',
    ],
    frameworkControls: [
      'Laravel Socialite/custom clients: validate state and use PKCE for public clients.',
      'React: avoid token parsing/storage; rely on backend session status.',
      'Platform: monitor anomalous account-linking and callback failures.',
    ],
    interviewFocus: 'OAuth flow binding and token handling',
  },
  'race-conditions': {
    rootCause: 'Race conditions appear when code checks state and changes state in separate non-atomic operations while concurrent requests can interleave between them.',
    interpreterBehavior: 'Application servers process requests concurrently. Databases preserve correctness only when operations use transactions, isolation, locks, constraints, or atomic update predicates that express the invariant.',
    phpVulnerable: `$coupon = Coupon::whereCode($request->code)->first();
if (!$coupon->used) {
    $coupon->update(['used' => true]);
    Credit::create(['user_id' => auth()->id(), 'amount' => $coupon->amount]);
}`,
    phpSecure: `DB::transaction(function () use ($request) {
    $coupon = Coupon::where('code', $request->code)->where('used', false)->lockForUpdate()->firstOrFail();
    $coupon->update(['used' => true, 'used_by' => auth()->id()]);
    Credit::create(['user_id' => auth()->id(), 'amount' => $coupon->amount]);
});`,
    reactVulnerable: `<button onClick={() => redeem(code)}>Redeem</button>`,
    reactSecure: `<button disabled={isSubmitting} onClick={() => redeem(code)}>Redeem</button>`,
    verification: [
      'OWASP ASVS 1.11 and 5.2: verify critical state transitions are atomic and idempotent.',
      'Review check-then-act flows for coupons, inventory, payments, account creation, and rate limits.',
      'Run approved concurrency tests in staging and assert invariant preservation.',
    ],
    trafficObservation: 'Safe flow uses request -> transaction/atomic predicate -> single committed state change. The anomaly is separate read and write operations around a business invariant.',
    sanitizationMatrix: [
      'One-time actions: enforce unique constraints and atomic updates.',
      'Payments: use idempotency keys and ledger-style transactions.',
      'Inventory: decrement with conditional update and verify affected row count.',
    ],
    frameworkControls: [
      'Laravel: DB::transaction, lockForUpdate, unique indexes, and queue idempotency.',
      'React: disable duplicate submissions for UX, but rely on server idempotency.',
      'Platform: monitor duplicate state transitions.',
    ],
    interviewFocus: 'atomicity, isolation, and idempotency',
  },
  'business-logic': {
    rootCause: 'Business logic flaws happen when code implements a workflow without enforcing the real-world invariants that make the workflow safe.',
    interpreterBehavior: 'Frameworks validate syntax and route requests, but they do not understand business rules such as sequence, ownership, price authority, eligibility, or maximum allowed state transitions.',
    phpVulnerable: `Route::post('/checkout', function (Request $request) {
    Payment::charge(auth()->user(), $request->input('total'));
    Order::create($request->all());
});`,
    phpSecure: `Route::post('/checkout', function (CheckoutRequest $request) {
    $cart = Cart::forUser(auth()->id())->with('items.product')->firstOrFail();
    $total = app(PricingService::class)->calculate($cart);
    Payment::charge(auth()->user(), $total);
});`,
    reactVulnerable: `<input name="total" value={cartTotal} />`,
    reactSecure: `<OrderSummary total={serverCalculatedTotal} />`,
    verification: [
      'OWASP ASVS 1.1 and 4.1: verify threat models and server-side business invariant tests.',
      'Review workflow bypass, negative values, repeated actions, stale state, and role transitions.',
      'Create unit tests around business rules, not only controllers.',
    ],
    trafficObservation: 'Safe flow submits intent and item IDs; server calculates price and eligibility. The anomaly is client-supplied business truth being accepted.',
    sanitizationMatrix: [
      'Prices: derive from server catalog.',
      'Workflow state: validate allowed transitions server-side.',
      'Quantities: enforce min/max and inventory availability.',
    ],
    frameworkControls: [
      'Laravel: domain services, policies, FormRequests, and database constraints.',
      'React: show calculated values but do not submit authority values.',
      'Platform: reconcile financial and inventory events asynchronously.',
    ],
    interviewFocus: 'domain invariant enforcement',
  },
  'web-cache-poisoning': {
    rootCause: 'Web cache poisoning occurs when cacheable responses vary based on inputs that are not part of the cache key.',
    interpreterBehavior: 'Caches key responses on configured URL, headers, and vary rules. If the origin reflects an unkeyed header or parameter, one user can influence a cached representation served to others.',
    phpVulnerable: `$host = request()->header('X-Forwarded-Host', request()->getHost());
return response("<script src='https://$host/app.js'></script>")->header('Cache-Control', 'public');`,
    phpSecure: `$assetHost = config('app.asset_host');
return response("<script src='$assetHost/app.js'></script>")
    ->header('Cache-Control', 'public')
    ->header('Vary', 'Accept-Encoding');`,
    reactVulnerable: `const assetHost = window.__BOOTSTRAP__.assetHost;
loadScript(assetHost + '/app.js');`,
    reactSecure: `import './app.css';
// Asset hosts are fixed at build/deploy time, not request-header derived.`,
    verification: [
      'OWASP ASVS 14.4: verify cache keys include all response-varying inputs or responses are not cached.',
      'Review reflected headers, host-based asset generation, redirects, and CDN cache rules.',
      'Use staging cache diagnostics to confirm untrusted headers do not alter cacheable bodies.',
    ],
    trafficObservation: 'Safe flow uses configured asset host and explicit Vary rules. The anomaly is unkeyed request metadata changing a cacheable response body.',
    sanitizationMatrix: [
      'Host headers: validate against deployment config; never reflect into assets.',
      'Sensitive responses: Cache-Control no-store.',
      'Public responses: minimize request-varying content and define Vary explicitly.',
    ],
    frameworkControls: [
      'Laravel: set trusted proxies and configured canonical URLs.',
      'React: avoid bootstrapping executable asset URLs from request headers.',
      'CDN: normalize cache keys and strip untrusted forwarding headers.',
    ],
    interviewFocus: 'cache key design and unkeyed input control',
  },
};

export function buildDefensiveEducation({ id, title, severity }: DefensiveWriteupInput): string {
  const targetEducation = getTargetDefensiveEducation(id);

  if (targetEducation !== null) {
    return targetEducation;
  }

  const profile = profiles[id] ?? defaultProfile;

  return [
    `## 1. Architectural Root Cause`,
    `${profile.rootCause}`,
    ``,
    `**Low-level interpreter behavior:** ${profile.interpreterBehavior}`,
    ``,
    `**Severity context:** ${severity} severity means the engineering review should include prevention controls, regression tests, operational monitoring, and documented ownership for the affected trust boundary.`,
    ``,
    `## 2. Code Blueprinting`,
    `The vulnerable examples below are intentionally non-operational teaching patterns. They show the unsafe data-flow shape that reviewers should remove during remediation.`,
    ``,
    `### PHP / Laravel`,
    `| Vulnerable Code | Validated Secure Code |`,
    `| --- | --- |`,
    `| ~~~php\n${profile.phpVulnerable}\n~~~ | ~~~php\n${profile.phpSecure}\n~~~ |`,
    ``,
    `### JavaScript / React`,
    `| Vulnerable Code | Validated Secure Code |`,
    `| --- | --- |`,
    `| ~~~tsx\n${profile.reactVulnerable}\n~~~ | ~~~tsx\n${profile.reactSecure}\n~~~ |`,
    ``,
    `## 3. Defensive Verification`,
    `QA engineers should verify ${title} controls in a staging environment with non-production accounts and synthetic data only.`,
    ``,
    ...profile.verification.map((item) => `- ${item}`),
    `- Evidence to capture: route or component name, request field, validation rule, authorization decision, expected rejection, log event, and linked regression test.`,
    ``,
    `## 4. Academic Traffic Analysis`,
    `Abstract HTTP structure for safe review:`,
    ``,
    `~~~http`,
    `METHOD /controlled-route HTTP/1.1`,
    `Host: training.example`,
    `Content-Type: application/json`,
    `Authorization: REDACTED_AUTH_SCHEME <staging-token>`,
    ``,
    `{`,
    `  "field": "<synthetic benign value>",`,
    `  "context": "training-only"`,
    `}`,
    `~~~`,
    ``,
    `${profile.trafficObservation}`,
    ``,
    `Blue-team reviewers should compare ingress logs, controller validation results, downstream service calls, and response metadata. The goal is to prove that untrusted request data is normalized before it crosses a sensitive boundary.`,
    ``,
    `## 5. Remediation Protocol`,
    `### Mitigation Checklist`,
    `- Identify the trust boundary and name the owner for the route, resolver, job, or component.`,
    `- Add server-side schema validation before business logic runs.`,
    `- Add authorization checks at the object and action level.`,
    `- Replace unsafe interpreter, parser, renderer, filesystem, database, or network calls with framework-safe APIs.`,
    `- Add regression tests for accepted, rejected, missing, malformed, and unauthorized inputs.`,
    `- Add monitoring for rejected attempts and unexpected error rates.`,
    ``,
    `### Input Sanitization Matrix`,
    ...profile.sanitizationMatrix.map((item) => `- ${item}`),
    ``,
    `### Secure Framework Configuration`,
    ...profile.frameworkControls.map((item) => `- ${item}`),
    ``,
    `## 6. Developer Interview Prep`,
    `1. **Question:** What is the primary root cause of ${title}?`,
    `   **Answer:** The root cause is unsafe data flow across a trust boundary. A strong answer identifies the exact interpreter or framework boundary, explains how untrusted data changes behavior, and names the control that prevents that change.`,
    ``,
    `2. **Question:** Why is client-side validation insufficient for ${title}?`,
    `   **Answer:** Client-side validation improves UX but runs in an environment controlled by the user. Security decisions must be repeated on the server with typed validation, authorization, and auditable rejection behavior.`,
    ``,
    `3. **Question:** Which framework control would you implement first?`,
    `   **Answer:** Start with the framework-native safe path: FormRequest validation and policies in Laravel, safe rendering and typed DTOs in React, and centralized middleware or services for shared controls.`,
    ``,
    `4. **Question:** How do you prevent regressions after remediation?`,
    `   **Answer:** Add unit tests for validators and policies, integration tests for rejected requests, static analysis rules for unsafe APIs, and observability for rejected boundary violations.`,
    ``,
    `5. **Question:** What separates a patch from a durable fix for ${profile.interviewFocus}?`,
    `   **Answer:** A patch changes one code path. A durable fix removes the unsafe pattern, documents the secure abstraction, adds tests and review rules, and makes the safe implementation the easiest implementation for future developers.`,
  ].join('\n');
}
