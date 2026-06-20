import type { BilingualVulnerabilityArticle, LocalizedVulnerabilityArticle } from './types';

type Locale = 'en' | 'fa';

interface LocalSpec {
  title: string;
  summary: string;
  family: string;
  mechanism: string;
  causes: string;
  surface: string;
  lifecycle: string;
  prevention: string;
  operations: string;
  request: string;
  response: string;
  vulnerableCode: string;
  secureCode: string;
  scenarios: string[];
  developerChecklist: string[];
  testerChecklist: string[];
  misconceptions: Array<[string, string]>;
}

interface Spec {
  id: BilingualVulnerabilityArticle['id'];
  slug: BilingualVulnerabilityArticle['slug'];
  severity: BilingualVulnerabilityArticle['severity'];
  relatedLabIds: string[];
  relatedVulnerabilityIds: string[];
  mappings: BilingualVulnerabilityArticle['mappings'];
  references: BilingualVulnerabilityArticle['references'];
  en: LocalSpec;
  fa: LocalSpec;
}

function content(spec: LocalSpec, locale: Locale): LocalizedVulnerabilityArticle {
  const fa = locale === 'fa';

  return {
    title: spec.title,
    summary: spec.summary,
    callouts: [
      {
        type: 'warning',
        title: fa ? 'نمونه‌ها فقط برای تمرین مجاز' : 'Authorized-lab-only examples',
        body: fa
          ? 'نمونه‌ها از دامنه‌های ساختگی، مقدارهای REDACTED و Markerهای آموزشی استفاده می‌کنند و راه‌حل دقیق آزمایشگاه یا مقدار محرمانه‌ای را نشان نمی‌دهند.'
          : 'Examples use fake domains, REDACTED values, and training markers. They do not reveal exact lab solutions or confidential values.',
      },
    ],
    overviewSections: [
      {
        id: 'introduction',
        title: fa ? 'مقدمه' : 'Introduction',
        body: [
          fa
            ? `${spec.title} در خانواده ${spec.family} قرار می‌گیرد و روی مرزی اثر می‌گذارد که برنامه در آن رفتار کاربر، وضعیت سرور، یا زیرساخت را قابل اعتماد فرض می‌کند. این ضعف معمولاً در مسیرهای عادی محصول دیده می‌شود، اما وقتی به داده چندکاربری، نشست، Cache، Parser، یا منطق تراکنش برسد اثر امنیتی جدی پیدا می‌کند.`
            : `${spec.title} belongs to the ${spec.family} family and affects a boundary where the application trusts user behavior, server state, or infrastructure behavior. It often appears in ordinary product flows, but becomes security-relevant when it reaches multi-user data, sessions, caches, parsers, or transaction logic.`,
          fa
            ? 'هدف این مقاله توضیح مسیر داده، علت شکست کنترل، روش تست مجاز و اصلاح پایدار است. متن برای آموزش دفاعی HackPath نوشته شده و از Payload عملی، Credential یا مسیر خصوصی استفاده نمی‌کند.'
            : 'This article explains data flow, why the control fails, authorized testing, and durable remediation. It is written for HackPath defensive education and avoids operational payloads, credentials, or private routes.',
        ],
      },
      {
        id: 'technical-explanation',
        title: fa ? 'توضیح فنی دقیق' : 'Detailed technical explanation',
        body: [
          spec.mechanism,
          fa
            ? 'جزئیات فنی مهم در این است که کنترل امنیتی باید با نحوه واقعی پردازش درخواست، وضعیت یا پاسخ هماهنگ باشد. اگر Proxy، Cache، Serializer، GraphQL resolver، OAuth callback یا Rule کسب‌وکار داده را متفاوت از انتظار توسعه‌دهنده پردازش کند، مسیر امن ظاهری می‌تواند به رفتار ناامن تبدیل شود.'
            : 'The important technical detail is that the security control must match how the request, state, or response is actually processed. If a proxy, cache, serializer, GraphQL resolver, OAuth callback, or business rule handles data differently than the developer expects, an apparently safe path can become unsafe.',
        ],
      },
      {
        id: 'root-causes',
        title: fa ? 'علت‌های ریشه‌ای' : 'Root causes',
        body: [
          spec.causes,
          fa
            ? 'علت‌های پشتیبان معمولاً شامل نبود تست رگرسیون، فرض‌های پنهان در معماری، مجوز بیش از حد، لاگ‌برداری ناکافی و مستند نبودن رفتار مورد انتظار در حالت‌های مرزی هستند.'
            : 'Supporting causes commonly include missing regression tests, hidden architectural assumptions, excessive privileges, insufficient logging, and undocumented expected behavior for edge cases.',
        ],
      },
      {
        id: 'attack-surface',
        title: fa ? 'سطح حمله' : 'Attack surface',
        body: [
          spec.surface,
          fa
            ? 'بازبینی باید مسیرهای عمومی، API، Jobهای پس‌زمینه، تنظیمات زیرساخت، قابلیت‌های مدیر، Integrationها و حالت‌های خطا را پوشش دهد؛ چون Batch 3 بیشتر درباره رفتار ترکیبی سیستم است تا یک ورودی ساده.'
            : 'Review should cover public routes, APIs, background jobs, infrastructure configuration, admin capabilities, integrations, and error states because Batch 3 topics are mostly about combined system behavior rather than one simple input.',
        ],
      },
      {
        id: 'attack-lifecycle',
        title: fa ? 'چرخه حمله مرحله‌به‌مرحله' : 'Step-by-step attack lifecycle',
        body: [
          spec.lifecycle,
          fa
            ? 'شواهد قابل مشاهده برای مدافع می‌تواند شامل اختلاف در ترتیب پردازش، پاسخ Cache شده غیرمنتظره، خطای Parser، تغییر وضعیت تکراری، Callback نامعتبر، Query گران، یا رویداد Audit ناسازگار با کاربر فعلی باشد.'
            : 'Defender-visible evidence may include processing-order differences, unexpected cached responses, parser errors, repeated state changes, invalid callbacks, expensive queries, or audit events that do not match the current user.',
        ],
      },
      {
        id: 'technical-impact',
        title: fa ? 'اثر فنی' : 'Technical impact',
        body: [
          fa
            ? 'اثر فنی باید دقیق و محدود به قابلیت آسیب‌دیده بیان شود. این گروه می‌تواند باعث دور زدن کنترل دسترسی، آلودگی Cache، افشای Schema یا داده، تغییر وضعیت نادرست، تقلب تراکنشی، یا اجرای کد در شرایط خاص شود؛ اما نباید بدون شواهد، اثر را به تصاحب کامل سرور تعمیم داد.'
            : 'Technical impact should be precise and limited to the affected feature. This group can cause access-control bypass, cache pollution, schema or data exposure, incorrect state changes, transaction abuse, or code execution in specific circumstances, but it should not be generalized to full server compromise without evidence.',
          fa
            ? 'اثر زمانی شدیدتر می‌شود که چند کاربر، مسیرهای Privileged، پردازش ناهمزمان، یا زیرساخت مشترک درگیر باشند.'
            : 'Impact becomes more serious when multiple users, privileged routes, asynchronous processing, or shared infrastructure are involved.',
        ],
      },
      {
        id: 'business-impact',
        title: fa ? 'اثر کسب‌وکار' : 'Business impact',
        body: [
          fa
            ? 'پیامد سازمانی ممکن است شامل تقلب، اختلال سرویس، افشای داده، پاسخ به رخداد، بازبینی قانونی، کاهش اعتماد و هزینه Audit مسیرهای مشابه باشد. چون بسیاری از ضعف‌های Batch 3 به طراحی Workflow مربوط‌اند، اصلاح آن‌ها معمولاً چند تیم را درگیر می‌کند.'
            : 'Business consequences may include fraud, service disruption, data exposure, incident response, legal review, trust loss, and the cost of auditing similar paths. Because many Batch 3 weaknesses involve workflow design, remediation often involves several teams.',
          fa
            ? 'گزارش ریسک باید توضیح دهد چه فرضی شکسته شده، چه کاربری می‌تواند آن را تحریک کند، و کدام کنترل بعد از اصلاح enforce می‌شود.'
            : 'Risk reporting should explain which assumption broke, which actor can trigger it, and which control is enforced after remediation.',
        ],
      },
      {
        id: 'detection-indicators',
        title: fa ? 'نشانه‌های تشخیص' : 'Detection indicators',
        body: [
          fa
            ? 'نشانه‌ها شامل Header یا Body غیرعادی، درخواست‌های همزمان، Callback تکراری، خطای Deserialization، Query GraphQL سنگین، Cache hit غیرمنتظره، و تغییر وضعیت‌هایی است که با جریان عادی محصول سازگار نیستند.'
            : 'Indicators include unusual headers or bodies, concurrent requests, repeated callbacks, deserialization errors, expensive GraphQL queries, unexpected cache hits, and state changes inconsistent with the normal product flow.',
          fa
            ? 'Detection باید داده کافی برای تحلیل بدهد اما مقدار حساس، Token، فایل کاربر یا محتوای محرمانه را در لاگ ذخیره نکند.'
            : 'Detection should provide enough data for analysis without storing sensitive values, tokens, user files, or confidential content in logs.',
        ],
      },
      {
        id: 'manual-testing-methodology',
        title: fa ? 'روش تست دستی مجاز' : 'Authorized manual testing methodology',
        body: [
          fa
            ? 'تستر ابتدا قابلیت و مرز اعتماد را نقشه‌برداری می‌کند، درخواست پایه معتبر می‌گیرد، یک متغیر را تغییر می‌دهد، رفتار را بین نقش‌ها یا نشست‌ها مقایسه می‌کند و فقط اثر غیرمخرب را ثبت می‌کند. برای Race و Cache باید ترتیب زمانی و هدرهای پاسخ نیز ثبت شوند.'
            : 'A tester maps the feature and trust boundary, captures a valid baseline request, changes one variable, compares behavior across roles or sessions, and records only non-destructive effects. For race and cache issues, timing and response headers should also be recorded.',
          fa
            ? 'پس از اصلاح، همان سناریو و یک مسیر نزدیک دوباره تست می‌شود و داده آزمایشی به حالت اولیه برمی‌گردد.'
            : 'After remediation, the same scenario and a nearby variant are retested, and test data is restored.',
        ],
      },
      {
        id: 'automated-testing-considerations',
        title: fa ? 'ملاحظات تست خودکار' : 'Automated testing considerations',
        body: [
          fa
            ? 'در HackPath می‌توان از Laravel feature tests، تست Component، API contract test، تست همزمانی کنترل‌شده، بررسی Header، Static analysis و DAST محدود استفاده کرد. تست باید رفتار خاص آسیب‌پذیری را مدل کند نه فقط موفق بودن درخواست عادی را.'
            : 'HackPath can use Laravel feature tests, component tests, API contract tests, controlled concurrency tests, header checks, static analysis, and scoped DAST. Tests should model the vulnerability-specific behavior, not just successful normal requests.',
          fa
            ? 'خروجی تست نباید مقدار حساس یا Payload عملی چاپ کند و باید برای تکرارپذیری از داده آزمایشی ثابت استفاده کند.'
            : 'Test output must not print sensitive values or operational payloads and should use deterministic test data for repeatability.',
        ],
      },
      {
        id: 'prevention',
        title: fa ? 'پیشگیری' : 'Prevention',
        body: [spec.prevention, spec.operations],
      },
      {
        id: 'remediation-workflow',
        title: fa ? 'گردش کار اصلاح' : 'Remediation workflow',
        body: [
          fa
            ? 'ابتدا قابلیت‌های آسیب‌دیده و Data flow مرتبط را فهرست کنید. سپس مشکل را در محیط کنترل‌شده بازتولید کنید، فرض شکسته‌شده را مشخص کنید، کنترل اصلی را در لایه درست پیاده کنید و تست رگرسیون اضافه کنید.'
            : 'First inventory affected functionality and related data flow. Reproduce the issue in a controlled environment, identify the broken assumption, implement the primary control at the correct layer, and add regression tests.',
          fa
            ? 'در ادامه مسیرهای مشابه را جستجو کنید، لاگ‌های تاریخی را بررسی کنید، در صورت افشای Credential آن را بچرخانید، Release را با Rollback plan انجام دهید و بعد از انتشار مانیتور کنید.'
            : 'Then search for similar paths, review historical logs, rotate credentials if exposed, deploy with a rollback plan, and monitor after release.',
        ],
      },
    ],
    httpExamples: [
      {
        id: 'training-request',
        title: fa ? 'درخواست آموزشی Sanitized' : 'Sanitized training request',
        description: fa ? 'نمونه فقط مرز اعتماد را نشان می‌دهد.' : 'The example demonstrates the trust boundary only.',
        request: spec.request,
        response: spec.response,
      },
    ],
    impact: [
      fa ? 'رفتار غیرمجاز یا ناامن متناسب با قابلیت آسیب‌دیده.' : 'Unauthorized or unsafe behavior depending on the affected feature.',
      fa ? 'اثر بین‌کاربری زمانی که Cache، Queue، Session یا State مشترک درگیر است.' : 'Cross-user impact when cache, queue, session, or shared state is involved.',
      fa ? 'افزایش ریسک در صورت ترکیب با ضعف‌های Authorization، Injection یا Configuration.' : 'Higher risk when chained with authorization, injection, or configuration flaws.',
    ],
    businessImpact: [
      fa ? 'ریسک تقلب، افشای داده، اختلال سرویس و کاهش اعتماد.' : 'Fraud, data exposure, service disruption, and trust loss.',
      fa ? 'هزینه بازبینی Workflow، تنظیمات زیرساخت و تست مسیرهای مشابه.' : 'Cost of reviewing workflows, infrastructure settings, and similar paths.',
    ],
    remediation: [
      spec.prevention,
      fa ? 'تست رگرسیون و مانیتورینگ مخصوص همین مرز اعتماد اضافه کنید.' : 'Add regression tests and monitoring for this trust boundary.',
      fa ? 'مسیرهای مشابه و تنظیمات مشترک را Audit کنید.' : 'Audit similar routes and shared configuration.',
    ],
    safePayloadExamples: ['<training-marker>', '<REDACTED-value>', '<non-destructive-probe>'],
    attackScenarios: spec.scenarios,
    commonMistakes: [
      fa ? 'تکیه بر UI یا مسیر عادی محصول به‌عنوان کنترل امنیتی.' : 'Treating the UI or happy path as a security control.',
      fa ? 'فراموش کردن اثر Cache، Queue، Proxy یا همزمانی.' : 'Forgetting cache, queue, proxy, or concurrency effects.',
      fa ? 'ثبت مقدار حساس در لاگ هنگام تست یا Debug.' : 'Logging sensitive values during testing or debugging.',
      fa ? 'اصلاح یک مسیر و نادیده گرفتن Helper یا تنظیم مشترک.' : 'Fixing one route while ignoring shared helpers or configuration.',
    ],
    detection: {
      manual: [
        fa ? 'درخواست پایه و حالت تغییر یافته را مقایسه کنید.' : 'Compare baseline and modified requests.',
        fa ? 'کاربر، نشست، نقش، ترتیب زمانی یا Header را جداگانه تغییر دهید.' : 'Vary user, session, role, timing, or headers one at a time.',
        fa ? 'پس از اصلاح همان Probe و مسیر مجاور را دوباره تست کنید.' : 'Retest the same probe and a nearby path after remediation.',
      ],
      automated: [
        fa ? 'Feature test برای حالت مجاز و غیرمجاز اضافه کنید.' : 'Add feature tests for allowed and denied states.',
        fa ? 'Header، Cache policy، Query complexity یا Atomicity را در CI بررسی کنید.' : 'Check headers, cache policy, query complexity, or atomicity in CI.',
        fa ? 'DAST محدود را فقط روی محیط تست اجرا کنید.' : 'Run scoped DAST only against test environments.',
      ],
    },
    codeExamples: [
      {
        language: 'typescript',
        title: fa ? 'نمونه عمداً آسیب‌پذیر و نسخه امن' : 'Intentionally vulnerable example and secure version',
        vulnerable: spec.vulnerableCode,
        fixed: spec.secureCode,
      },
    ],
    developerChecklist: spec.developerChecklist,
    testerChecklist: spec.testerChecklist,
    misconceptions: spec.misconceptions.map(([myth, correction]) => ({ myth, correction })),
    reviewQuestions: [
      fa ? 'کدام فرض امنیتی در این Workflow شکسته می‌شود؟' : 'Which security assumption breaks in this workflow?',
      fa ? 'آیا تست دو کاربر، دو نشست یا همزمانی لازم است؟' : 'Does the test require two users, two sessions, or concurrency?',
      fa ? 'کدام لاگ بدون افشای مقدار حساس برای تشخیص کافی است؟' : 'Which log signal is sufficient without exposing sensitive values?',
    ],
  };
}

function article(spec: Spec): BilingualVulnerabilityArticle {
  return {
    id: spec.id,
    slug: spec.slug,
    batch: 3,
    severity: spec.severity,
    currentContentSource: 'frontend/src/data/vulnerabilities.ts',
    relatedLabIds: spec.relatedLabIds,
    relatedVulnerabilityIds: spec.relatedVulnerabilityIds,
    mappings: spec.mappings,
    references: spec.references,
    status: {
      english: 'complete',
      persian: 'complete',
      references: 'complete',
      tests: 'complete',
      finalReview: 'complete',
    },
    locales: {
      en: content(spec.en, 'en'),
      fa: content(spec.fa, 'fa'),
    },
  };
}

export const batch3Articles: BilingualVulnerabilityArticle[] = [
  article({
    id: 'http-smuggling',
    slug: 'http-request-smuggling',
    severity: 'Critical',
    relatedLabIds: ['smuggling-001'],
    relatedVulnerabilityIds: ['web-cache-poisoning', 'cors', 'ssrf'],
    mappings: {
      owasp: ['OWASP WSTG: Testing for HTTP Request Smuggling'],
      cwe: ['CWE-444: Inconsistent Interpretation of HTTP Requests'],
      portSwigger: 'PortSwigger Web Security Academy: HTTP request smuggling',
    },
    references: [
      { title: 'OWASP Testing for HTTP Request Smuggling', url: 'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/16-Testing_for_HTTP_Request_Smuggling' },
      { title: 'PortSwigger HTTP request smuggling', url: 'https://portswigger.net/web-security/request-smuggling' },
      { title: 'MITRE CWE-444', url: 'https://cwe.mitre.org/data/definitions/444.html' },
      { title: 'PortSwigger HTTP request smuggling research', url: 'https://portswigger.net/research/request-smuggling' },
    ],
    en: {
      title: 'HTTP Request Smuggling',
      summary: 'HTTP request smuggling abuses inconsistent request-boundary parsing between front-end and back-end HTTP components.',
      family: 'server-side request handling and proxy parsing',
      mechanism: 'A front-end proxy, CDN, or load balancer and a back-end server may disagree about where one HTTP request ends and the next begins. Ambiguous message framing can desynchronize the connection so one component sees a harmless request while another processes hidden bytes as a separate request.',
      causes: 'Specific causes include mixed HTTP parser behavior, conflicting message-length handling, legacy proxy chains, unsafe back-end connection reuse, and insufficient normalization at the edge.',
      surface: 'The surface includes reverse proxies, API gateways, load balancers, CDN edges, back-end keep-alive pools, and any route where front-end and back-end HTTP versions differ.',
      lifecycle: 'A tester confirms a proxy chain, sends a harmless ambiguous framing marker in a lab, observes timing or response desynchronization, and checks whether the edge rejects ambiguity before the back end receives it.',
      prevention: 'Use modern, consistent HTTP parsing across the chain, reject ambiguous framing at the edge, normalize or terminate requests once, and avoid unsupported protocol downgrades.',
      operations: 'Monitor proxy errors, unexpected 400/502 patterns, request length anomalies, and back-end connection reuse behavior.',
      request: ['POST /api/example HTTP/1.1', 'Host: api.example.test', 'Content-Length: 0', 'X-Training-Marker: REDACTED'].join('\n'),
      response: ['HTTP/1.1 400 Bad Request', 'Connection: close', '', 'Ambiguous request rejected'].join('\n'),
      vulnerableCode: ['proxy.forwardRawRequest(request);', 'backend.keepAlivePool.reuse(connection);'].join('\n'),
      secureCode: ['edge.rejectAmbiguousFraming(request);', 'edge.forwardNormalizedRequest(request);', 'backend.closeOnFramingError();'].join('\n'),
      scenarios: ['A proxy and backend parse request boundaries differently.', 'A back-end connection pool reuses a desynchronized connection.', 'A security control at the edge inspects a different request than the backend processes.'],
      developerChecklist: ['Use one trusted HTTP parser at the edge.', 'Reject ambiguous framing.', 'Align proxy and backend protocol versions.', 'Disable risky connection reuse after parse errors.', 'Add integration tests through the full proxy chain.', 'Log framing failures safely.'],
      testerChecklist: ['Confirm explicit authorization for protocol testing.', 'Use non-destructive markers.', 'Watch timing and status differences.', 'Test through the real proxy chain.', 'Avoid sending hidden state-changing requests.', 'Retest edge rejection behavior.'],
      misconceptions: [['“The application route code can fix smuggling alone.”', 'The vulnerability usually exists in the HTTP component chain before route code runs.'], ['“TLS prevents request smuggling.”', 'TLS protects transport, not parser disagreement inside the server chain.'], ['“Only old servers are affected.”', 'Modern stacks can still be vulnerable when components are combined inconsistently.']],
    },
    fa: {
      title: 'قاچاق درخواست HTTP',
      summary: 'HTTP Request Smuggling از تفاوت Parserهای HTTP در تشخیص مرز درخواست بین Front-end و Back-end سوءاستفاده می‌کند.',
      family: 'پردازش درخواست سمت سرور و Parsing در Proxy',
      mechanism: 'ممکن است Proxy، CDN یا Load balancer با سرور Back-end درباره محل پایان یک درخواست و شروع درخواست بعدی توافق نداشته باشند. Framing مبهم می‌تواند اتصال را Desync کند؛ یک جزء درخواست را بی‌خطر می‌بیند اما جزء دیگر Byteهای پنهان را درخواست جداگانه پردازش می‌کند.',
      causes: 'علت‌های خاص شامل رفتار متفاوت Parserهای HTTP، Message-length ناسازگار، زنجیره Proxy قدیمی، استفاده مجدد ناامن از اتصال Back-end و Normalize نکردن در Edge است.',
      surface: 'سطح حمله شامل Reverse proxy، API gateway، Load balancer، CDN edge، Keep-alive pool در Back-end و مسیرهایی است که نسخه HTTP در Front-end و Back-end متفاوت است.',
      lifecycle: 'تستر زنجیره Proxy را تأیید می‌کند، Marker بی‌خطر با Framing مبهم در آزمایشگاه می‌فرستد، Timing یا پاسخ Desync را مشاهده می‌کند و بررسی می‌کند Edge ابهام را قبل از رسیدن به Back-end رد می‌کند.',
      prevention: 'Parsing مدرن و یکسان HTTP را در کل زنجیره به‌کار ببرید، Framing مبهم را در Edge رد کنید، درخواست را فقط یک‌بار Normalize/Terminate کنید و Downgrade پشتیبانی‌نشده نداشته باشید.',
      operations: 'خطاهای Proxy، الگوی 400/502 غیرمنتظره، ناهنجاری طول درخواست و رفتار Connection reuse در Back-end را پایش کنید.',
      request: ['POST /api/example HTTP/1.1', 'Host: api.example.test', 'Content-Length: 0', 'X-Training-Marker: REDACTED'].join('\n'),
      response: ['HTTP/1.1 400 Bad Request', 'Connection: close', '', 'Ambiguous request rejected'].join('\n'),
      vulnerableCode: ['proxy.forwardRawRequest(request);', 'backend.keepAlivePool.reuse(connection);'].join('\n'),
      secureCode: ['edge.rejectAmbiguousFraming(request);', 'edge.forwardNormalizedRequest(request);', 'backend.closeOnFramingError();'].join('\n'),
      scenarios: ['Proxy و Backend مرز درخواست را متفاوت Parse می‌کنند.', 'Connection pool در Back-end اتصال Desync شده را دوباره استفاده می‌کند.', 'کنترل Edge درخواست متفاوتی از Backend بررسی می‌کند.'],
      developerChecklist: ['در Edge یک Parser قابل اعتماد داشته باش.', 'Framing مبهم را رد کن.', 'نسخه Protocol Proxy و Backend را هم‌راستا کن.', 'بعد از Parse error اتصال را reuse نکن.', 'تست Integration از کل زنجیره بنویس.', 'Framing failure را امن لاگ کن.'],
      testerChecklist: ['مجوز صریح برای تست Protocol بگیر.', 'از Marker غیرمخرب استفاده کن.', 'Timing و Status را مقایسه کن.', 'از زنجیره Proxy واقعی تست کن.', 'درخواست تغییر وضعیت پنهان نفرست.', 'رد شدن در Edge را دوباره تست کن.'],
      misconceptions: [['«کد Route برنامه به‌تنهایی مشکل را حل می‌کند.»', 'مشکل معمولاً قبل از اجرای Route در زنجیره HTTP رخ می‌دهد.'], ['«TLS جلوی Smuggling را می‌گیرد.»', 'TLS Transport را محافظت می‌کند نه اختلاف Parser داخل زنجیره سرور.'], ['«فقط سرورهای قدیمی آسیب‌پذیرند.»', 'Stack مدرن هم با ترکیب ناسازگار Componentها آسیب‌پذیر می‌شود.']],
    },
  }),
  article({
    id: 'deserialization',
    slug: 'deserialization',
    severity: 'Critical',
    relatedLabIds: ['deser-001'],
    relatedVulnerabilityIds: ['rce', 'jwt', 'file-upload'],
    mappings: {
      owasp: ['OWASP 2017 A8: Insecure Deserialization'],
      cwe: ['CWE-502: Deserialization of Untrusted Data'],
      portSwigger: 'PortSwigger Web Security Academy: Insecure deserialization',
    },
    references: [
      { title: 'OWASP Deserialization Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html' },
      { title: 'OWASP Insecure Deserialization', url: 'https://owasp.org/www-community/vulnerabilities/Insecure_Deserialization' },
      { title: 'PortSwigger Insecure deserialization', url: 'https://portswigger.net/web-security/deserialization' },
      { title: 'MITRE CWE-502', url: 'https://cwe.mitre.org/data/definitions/502.html' },
    ],
    en: {
      title: 'Insecure Deserialization',
      summary: 'Insecure deserialization occurs when untrusted serialized data is reconstructed into objects that influence application behavior.',
      family: 'server-side object reconstruction and state handling',
      mechanism: 'Serialized data packages object state for storage or transport. If the application deserializes user-controlled data, object fields, types, or magic methods may influence logic before normal validation runs.',
      causes: 'Specific causes include storing trusted state in client-controlled serialized blobs, accepting arbitrary classes, missing integrity checks, dangerous magic methods, and using serialization where signed JSON would be safer.',
      surface: 'The surface includes cookies, queues, caches, background jobs, remember-me data, import files, session bridges, and legacy PHP/Java/Ruby object formats.',
      lifecycle: 'A tester identifies serialized-looking state, confirms whether tampering is detected with a harmless marker, observes type or field validation, and verifies the server rejects unexpected object structures.',
      prevention: 'Do not deserialize untrusted object formats. Use simple signed data structures, strict class allowlists, integrity protection, and server-side session storage.',
      operations: 'Monitor deserialization exceptions, unexpected class names, integrity failures, and changes to privileged object fields.',
      request: ['POST /api/state/import HTTP/1.1', 'Host: api.example.test', 'Cookie: session=REDACTED', 'Content-Type: application/json', '', '{"state":"REDACTED_SIGNED_VALUE"}'].join('\n'),
      response: ['HTTP/1.1 400 Bad Request', 'Content-Type: application/json', '', '{"message":"Invalid state format"}'].join('\n'),
      vulnerableCode: ['const state = deserialize(req.body.state);', 'applyStateToUser(req.user, state);'].join('\n'),
      secureCode: ['const state = verifySignedJson(req.body.state);', 'validateStateSchema(state);', 'applyAllowedFields(req.user, state);'].join('\n'),
      scenarios: ['Client-side serialized state changes a role-like field.', 'A background worker trusts serialized job data.', 'A legacy cookie stores object graphs.'],
      developerChecklist: ['Avoid object deserialization from users.', 'Use signed JSON schemas.', 'Allowlist classes if unavoidable.', 'Reject magic-method side effects.', 'Keep state server-side.', 'Test tamper detection.'],
      testerChecklist: ['Identify serialized formats.', 'Tamper with harmless markers only.', 'Check integrity enforcement.', 'Compare allowed and unexpected fields.', 'Review worker queues.', 'Retest schema rejection.'],
      misconceptions: [['“Encoded serialized data is protected.”', 'Encoding is not integrity or authorization.'], ['“Only Java has deserialization bugs.”', 'Many ecosystems have unsafe object reconstruction patterns.'], ['“Signing is optional if values are hidden.”', 'Hidden client state can still be modified.']],
    },
    fa: {
      title: 'سریال‌زدایی ناامن',
      summary: 'Insecure Deserialization زمانی رخ می‌دهد که داده Serialized غیرقابل اعتماد به Objectهایی بازسازی شود که رفتار برنامه را تغییر می‌دهند.',
      family: 'بازسازی Object سمت سرور و مدیریت State',
      mechanism: 'Serialization وضعیت Object را برای ذخیره یا انتقال بسته‌بندی می‌کند. اگر برنامه داده تحت کنترل کاربر را Deserialize کند، Field، Type یا Magic method می‌تواند قبل از Validation عادی روی منطق اثر بگذارد.',
      causes: 'علت‌های خاص شامل ذخیره State قابل اعتماد در Blob سمت Client، پذیرش Class دلخواه، نبود Integrity check، Magic method خطرناک و استفاده از Serialization جایی است که JSON امضاشده امن‌تر است.',
      surface: 'سطح حمله شامل Cookie، Queue، Cache، Job پس‌زمینه، Remember-me، Import file، Session bridge و Formatهای Object قدیمی PHP/Java/Ruby است.',
      lifecycle: 'تستر State شبیه Serialized را پیدا می‌کند، با Marker بی‌خطر Tamper detection را بررسی می‌کند، Type یا Field validation را می‌سنجد و تأیید می‌کند ساختار Object غیرمنتظره رد می‌شود.',
      prevention: 'Object format غیرقابل اعتماد را Deserialize نکنید. از ساختار ساده JSON امضاشده، allowlist سخت Class، Integrity protection و Session storage سمت سرور استفاده کنید.',
      operations: 'Exceptionهای Deserialization، Class name غیرمنتظره، Integrity failure و تغییر Fieldهای Privileged را پایش کنید.',
      request: ['POST /api/state/import HTTP/1.1', 'Host: api.example.test', 'Cookie: session=REDACTED', 'Content-Type: application/json', '', '{"state":"REDACTED_SIGNED_VALUE"}'].join('\n'),
      response: ['HTTP/1.1 400 Bad Request', 'Content-Type: application/json', '', '{"message":"Invalid state format"}'].join('\n'),
      vulnerableCode: ['const state = deserialize(req.body.state);', 'applyStateToUser(req.user, state);'].join('\n'),
      secureCode: ['const state = verifySignedJson(req.body.state);', 'validateStateSchema(state);', 'applyAllowedFields(req.user, state);'].join('\n'),
      scenarios: ['State سریال‌شده سمت Client فیلد شبیه Role را تغییر می‌دهد.', 'Worker پس‌زمینه Job data سریال‌شده را اعتماد می‌کند.', 'Cookie قدیمی Object graph ذخیره می‌کند.'],
      developerChecklist: ['Object کاربر را Deserialize نکن.', 'Schema JSON امضاشده استفاده کن.', 'اگر اجتناب‌ناپذیر است Class allowlist بگذار.', 'Side effect در Magic method را رد کن.', 'State را سمت سرور نگه دار.', 'Tamper detection را تست کن.'],
      testerChecklist: ['Formatهای Serialized را پیدا کن.', 'فقط با Marker بی‌خطر Tamper کن.', 'Integrity enforcement را بررسی کن.', 'Field مجاز و غیرمنتظره را مقایسه کن.', 'Queue worker را بررسی کن.', 'رد Schema را دوباره تست کن.'],
      misconceptions: [['«داده Serialized چون Encode شده محافظت شده است.»', 'Encoding نه Integrity است نه Authorization.'], ['«فقط Java مشکل Deserialization دارد.»', 'اکوسیستم‌های زیادی الگوی Object reconstruction ناامن دارند.'], ['«اگر مقدار پنهان باشد Signing لازم نیست.»', 'State سمت Client قابل تغییر است.']],
    },
  }),
  article({
    id: 'graphql',
    slug: 'graphql-vulnerabilities',
    severity: 'High',
    relatedLabIds: ['graphql-001', 'graphql-002'],
    relatedVulnerabilityIds: ['idor', 'nosqli', 'ssrf'],
    mappings: {
      owasp: ['OWASP GraphQL Cheat Sheet', 'OWASP API Security Top 10: API1 Broken Object Level Authorization'],
      cwe: ['CWE-200: Exposure of Sensitive Information', 'CWE-770: Allocation of Resources Without Limits'],
      portSwigger: 'PortSwigger Web Security Academy: GraphQL API vulnerabilities',
    },
    references: [
      { title: 'OWASP GraphQL Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html' },
      { title: 'OWASP API Security Top 10 2023 API1', url: 'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/' },
      { title: 'PortSwigger GraphQL API vulnerabilities', url: 'https://portswigger.net/web-security/graphql' },
      { title: 'GraphQL Learn: Authorization', url: 'https://graphql.org/learn/authorization/' },
      { title: 'MITRE CWE-770', url: 'https://cwe.mitre.org/data/definitions/770.html' },
    ],
    en: {
      title: 'GraphQL Vulnerabilities',
      summary: 'GraphQL vulnerabilities arise when a flexible query layer exposes more data, relationships, or computation than the caller is authorized to use.',
      family: 'API authorization, query exposure, and resource governance',
      mechanism: 'GraphQL lets clients choose fields and nested relationships. That flexibility is safe only when every resolver enforces object authorization, query depth, complexity, batching, and schema exposure rules consistently.',
      causes: 'Specific causes include resolver-level authorization gaps, relying on hidden UI fields, enabled introspection in sensitive deployments, unbounded aliases or nested queries, weak batching controls, and inconsistent checks between REST and GraphQL paths.',
      surface: 'The surface includes public GraphQL endpoints, introspection, persisted queries, mutations, nested object resolvers, file upload resolvers, federation gateways, and admin-only fields accidentally reachable through shared schema code.',
      lifecycle: 'A tester enumerates the schema or available operations, confirms authorization with two accounts, changes object identifiers or nested fields, measures complexity limits, and verifies denied fields fail at resolver time rather than in the UI.',
      prevention: 'Authorize inside resolvers or domain services for every object, enforce depth and complexity limits, restrict batching, disable unnecessary introspection in production, and prefer persisted queries where useful.',
      operations: 'Track unusually deep queries, repeated aliases, high resolver fan-out, introspection attempts in production, and authorization denials by field without logging sensitive argument values.',
      request: ['POST /graphql HTTP/1.1', 'Host: api.example.test', 'Content-Type: application/json', '', '{"query":"query Training($id: ID!) { item(id: $id) { id title } }","variables":{"id":"RESOURCE_ID"}}'].join('\n'),
      response: ['HTTP/1.1 403 Forbidden', 'Content-Type: application/json', '', '{"errors":[{"message":"Not authorized to access this resource"}]}'].join('\n'),
      vulnerableCode: ['const item = await db.items.findById(args.id);', 'return item;'].join('\n'),
      secureCode: ['const item = await db.items.findById(args.id);', 'authorize(ctx.user, "view", item);', 'return exposeAllowedFields(item, ctx.user);'].join('\n'),
      scenarios: ['A nested resolver returns another user’s private object.', 'A batched query bypasses per-request business limits.', 'An expensive alias-heavy query consumes worker resources.'],
      developerChecklist: ['Authorize every resolver result.', 'Limit depth and complexity.', 'Constrain batching and aliases.', 'Review introspection policy.', 'Use typed input validation.', 'Test GraphQL separately from REST.'],
      testerChecklist: ['Test with two accounts.', 'Probe nested object IDs safely.', 'Check introspection behavior.', 'Measure depth and alias limits.', 'Verify mutation authorization.', 'Confirm error messages do not leak schema internals unnecessarily.'],
      misconceptions: [['“GraphQL automatically handles authorization.”', 'GraphQL provides a query language; application code must enforce authorization.'], ['“Hiding a field in the frontend is enough.”', 'Clients can send their own GraphQL documents.'], ['“One endpoint means a smaller attack surface.”', 'One endpoint can expose many operations and object relationships.'], ['“Disabling introspection fixes everything.”', 'It may reduce discovery, but resolver authorization and limits remain required.']],
    },
    fa: {
      title: 'آسیب‌پذیری‌های GraphQL',
      summary: 'آسیب‌پذیری GraphQL زمانی رخ می‌دهد که لایه Query منعطف، داده، رابطه یا محاسبه‌ای بیش از مجوز کاربر در اختیار او بگذارد.',
      family: 'مجوزدهی API، افشای Query و کنترل مصرف منابع',
      mechanism: 'GraphQL به Client اجازه می‌دهد Fieldها و رابطه‌های تو در تو را انتخاب کند. این انعطاف فقط وقتی امن است که هر Resolver مجوز Object، عمق Query، پیچیدگی، Batching و افشای Schema را به‌صورت یکسان enforce کند.',
      causes: 'علت‌های خاص شامل نبود Authorization در Resolver، اعتماد به Field پنهان UI، فعال بودن Introspection در Deployment حساس، Alias یا Query تودرتوی بدون حد، کنترل ضعیف Batching و اختلاف کنترل بین مسیر REST و GraphQL است.',
      surface: 'سطح حمله شامل Endpoint عمومی GraphQL، Introspection، Persisted query، Mutation، Resolverهای Object تودرتو، File upload resolver، Federation gateway و Fieldهای مدیریتی است که از Schema مشترک قابل دسترسی می‌شوند.',
      lifecycle: 'تستر Schema یا Operationهای موجود را شناسایی می‌کند، با دو حساب مجوز را می‌سنجد، شناسه Object یا Field تودرتو را تغییر می‌دهد، محدودیت Complexity را اندازه می‌گیرد و تأیید می‌کند Field غیرمجاز در زمان Resolver رد می‌شود نه فقط در UI.',
      prevention: 'مجوز را داخل Resolver یا Domain service برای هر Object enforce کنید، Depth و Complexity limit بگذارید، Batching را محدود کنید، Introspection غیرضروری را در Production غیرفعال کنید و در صورت نیاز Persisted query به‌کار ببرید.',
      operations: 'Queryهای خیلی عمیق، Alias تکراری، Fan-out زیاد Resolver، تلاش Introspection در Production و Denialهای Authorization بر اساس Field را بدون لاگ کردن مقدار حساس پایش کنید.',
      request: ['POST /graphql HTTP/1.1', 'Host: api.example.test', 'Content-Type: application/json', '', '{"query":"query Training($id: ID!) { item(id: $id) { id title } }","variables":{"id":"RESOURCE_ID"}}'].join('\n'),
      response: ['HTTP/1.1 403 Forbidden', 'Content-Type: application/json', '', '{"errors":[{"message":"Not authorized to access this resource"}]}'].join('\n'),
      vulnerableCode: ['const item = await db.items.findById(args.id);', 'return item;'].join('\n'),
      secureCode: ['const item = await db.items.findById(args.id);', 'authorize(ctx.user, "view", item);', 'return exposeAllowedFields(item, ctx.user);'].join('\n'),
      scenarios: ['Resolver تودرتو Object خصوصی کاربر دیگر را برمی‌گرداند.', 'Query دسته‌ای محدودیت تجاری هر درخواست را دور می‌زند.', 'Query سنگین با Alias زیاد منابع Worker را مصرف می‌کند.'],
      developerChecklist: ['نتیجه هر Resolver را Authorize کن.', 'Depth و Complexity را محدود کن.', 'Batching و Alias را کنترل کن.', 'Policy مربوط به Introspection را بازبینی کن.', 'Input validation نوع‌دار داشته باش.', 'GraphQL را جدا از REST تست کن.'],
      testerChecklist: ['با دو حساب تست کن.', 'شناسه Object تودرتو را امن Probe کن.', 'رفتار Introspection را بررسی کن.', 'محدودیت Depth و Alias را بسنج.', 'Authorization در Mutation را تأیید کن.', 'بررسی کن Errorها Schema داخلی را بیش از حد افشا نکنند.'],
      misconceptions: [['«GraphQL خودش Authorization را انجام می‌دهد.»', 'GraphQL زبان Query است؛ برنامه باید Authorization را enforce کند.'], ['«پنهان کردن Field در Frontend کافی است.»', 'Client می‌تواند Document GraphQL خودش را ارسال کند.'], ['«یک Endpoint یعنی سطح حمله کمتر.»', 'یک Endpoint می‌تواند Operation و رابطه Object زیادی را افشا کند.'], ['«غیرفعال کردن Introspection همه چیز را حل می‌کند.»', 'Discovery کمتر می‌شود، اما Authorization و Limit در Resolver هنوز لازم است.']],
    },
  }),
  article({
    id: 'oauth',
    slug: 'oauth-vulnerabilities',
    severity: 'High',
    relatedLabIds: ['oauth-001'],
    relatedVulnerabilityIds: ['csrf', 'idor', 'jwt'],
    mappings: {
      owasp: ['OWASP OAuth 2.0 Security Cheat Sheet', 'OWASP API Security Top 10: API2 Broken Authentication'],
      cwe: ['CWE-352: Cross-Site Request Forgery', 'CWE-287: Improper Authentication'],
      portSwigger: 'PortSwigger Web Security Academy: OAuth authentication vulnerabilities',
    },
    references: [
      { title: 'OWASP OAuth 2.0 Security Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html' },
      { title: 'PortSwigger OAuth authentication vulnerabilities', url: 'https://portswigger.net/web-security/oauth' },
      { title: 'RFC 6749: The OAuth 2.0 Authorization Framework', url: 'https://www.rfc-editor.org/rfc/rfc6749' },
      { title: 'MITRE CWE-352', url: 'https://cwe.mitre.org/data/definitions/352.html' },
      { title: 'OWASP API Security Top 10 2023 API2', url: 'https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/' },
    ],
    en: {
      title: 'OAuth Vulnerabilities',
      summary: 'OAuth vulnerabilities usually come from incorrect state binding, redirect validation, token handling, or identity assumptions in a login flow.',
      family: 'authentication federation and authorization-code flows',
      mechanism: 'OAuth coordinates a user, client application, authorization server, and redirect URI. Security depends on binding the callback to the initiating session, validating redirect destinations, exchanging codes server-side, and treating provider claims carefully.',
      causes: 'Specific causes include missing state validation, weak redirect URI matching, accepting tokens from the browser as proof of identity, not using PKCE where needed, account linking without verified email ownership, and confusing OAuth authorization with local authentication.',
      surface: 'The surface includes login buttons, callback endpoints, account linking, mobile deep links, redirect URI configuration, OAuth client secrets, token exchange code, and provider claim mapping.',
      lifecycle: 'A tester starts a normal login, records only non-secret flow metadata, checks state and redirect binding, tests account linking with separate accounts, and confirms the backend rejects callbacks not tied to the current session.',
      prevention: 'Use exact redirect URI allowlists, strong state and nonce values tied to the session, PKCE for public clients, server-side code exchange, provider-specific validation, and strict account-linking rules.',
      operations: 'Monitor callback failures, repeated state mismatches, unusual redirect targets, account-linking changes, and provider claim changes without logging tokens or authorization codes.',
      request: ['GET /auth/provider/callback?code=REDACTED&state=TRAINING_STATE HTTP/1.1', 'Host: app.example.test', 'Cookie: session=REDACTED'].join('\n'),
      response: ['HTTP/1.1 403 Forbidden', 'Content-Type: application/json', '', '{"message":"OAuth state validation failed"}'].join('\n'),
      vulnerableCode: ['const profile = await provider.userInfo(req.query.code);', 'loginOrLink(profile.email);'].join('\n'),
      secureCode: ['verifyState(req.session, req.query.state);', 'const tokens = await exchangeCodeServerSide(req.query.code);', 'const profile = validateProviderClaims(tokens);', 'linkOnlyIfEmailVerified(profile);'].join('\n'),
      scenarios: ['A callback is accepted without state binding.', 'A loose redirect URI accepts an attacker-controlled destination.', 'Account linking trusts an unverified provider email.'],
      developerChecklist: ['Bind state to the session.', 'Validate redirect URIs exactly.', 'Use PKCE for public clients.', 'Exchange codes server-side.', 'Validate issuer and audience.', 'Require verified ownership for linking.'],
      testerChecklist: ['Avoid capturing real tokens.', 'Check state mismatch behavior.', 'Test redirect allowlists.', 'Use separate accounts for linking tests.', 'Confirm callback sessions are bound.', 'Verify errors do not reveal tokens.'],
      misconceptions: [['“OAuth login is secure by default.”', 'The protocol is a framework; implementation choices determine safety.'], ['“The provider email always proves identity.”', 'Email claims need provider-specific verification and account-linking rules.'], ['“Redirect URI prefix matching is convenient and safe.”', 'Loose matching can turn into callback hijacking.'], ['“Frontend token checks are enough.”', 'The backend must validate and bind the flow.']],
    },
    fa: {
      title: 'آسیب‌پذیری‌های OAuth',
      summary: 'آسیب‌پذیری OAuth معمولاً از اتصال نادرست state، اعتبارسنجی redirect، مدیریت token یا فرض‌های اشتباه هویتی در جریان Login ایجاد می‌شود.',
      family: 'Federation احراز هویت و جریان Authorization Code',
      mechanism: 'OAuth بین کاربر، Client application، Authorization server و Redirect URI هماهنگی ایجاد می‌کند. امنیت به اتصال Callback به Session آغازکننده، اعتبارسنجی مقصد Redirect، تبادل Code سمت سرور و برخورد دقیق با Claimهای Provider وابسته است.',
      causes: 'علت‌های خاص شامل نبود state validation، تطبیق ضعیف Redirect URI، پذیرش Token مرورگر به‌عنوان اثبات هویت، استفاده نکردن از PKCE در Client عمومی، Account linking بدون مالکیت Email تأییدشده و اشتباه گرفتن OAuth authorization با Authentication محلی است.',
      surface: 'سطح حمله شامل دکمه Login، Callback endpoint، Account linking، Mobile deep link، تنظیم Redirect URI، Client secret، کد Token exchange و نگاشت Claimهای Provider است.',
      lifecycle: 'تستر Login عادی را شروع می‌کند، فقط Metadata غیرمحرمانه Flow را ثبت می‌کند، اتصال State و Redirect را می‌سنجد، Account linking را با حساب‌های جدا تست می‌کند و تأیید می‌کند Backend Callback نامرتبط با Session فعلی را رد می‌کند.',
      prevention: 'Allowlist دقیق Redirect URI، مقدار State و Nonce قوی متصل به Session، PKCE برای Client عمومی، تبادل Code سمت سرور، Validation مخصوص Provider و قانون سخت Account linking استفاده کنید.',
      operations: 'Callback failure، State mismatch تکراری، Redirect target غیرعادی، تغییر Account linking و تغییر Claim Provider را بدون لاگ کردن Token یا Authorization code پایش کنید.',
      request: ['GET /auth/provider/callback?code=REDACTED&state=TRAINING_STATE HTTP/1.1', 'Host: app.example.test', 'Cookie: session=REDACTED'].join('\n'),
      response: ['HTTP/1.1 403 Forbidden', 'Content-Type: application/json', '', '{"message":"OAuth state validation failed"}'].join('\n'),
      vulnerableCode: ['const profile = await provider.userInfo(req.query.code);', 'loginOrLink(profile.email);'].join('\n'),
      secureCode: ['verifyState(req.session, req.query.state);', 'const tokens = await exchangeCodeServerSide(req.query.code);', 'const profile = validateProviderClaims(tokens);', 'linkOnlyIfEmailVerified(profile);'].join('\n'),
      scenarios: ['Callback بدون اتصال State پذیرفته می‌شود.', 'Redirect URI آزاد مقصد تحت کنترل مهاجم را قبول می‌کند.', 'Account linking به Email تأییدنشده Provider اعتماد می‌کند.'],
      developerChecklist: ['State را به Session وصل کن.', 'Redirect URI را دقیق Validate کن.', 'برای Client عمومی PKCE استفاده کن.', 'Code را سمت سرور Exchange کن.', 'Issuer و Audience را Validate کن.', 'برای Linking مالکیت Verified بخواه.'],
      testerChecklist: ['Token واقعی را Capture نکن.', 'رفتار State mismatch را بررسی کن.', 'Redirect allowlist را تست کن.', 'برای Linking از حساب جدا استفاده کن.', 'اتصال Callback به Session را تأیید کن.', 'مطمئن شو Errorها Token افشا نمی‌کنند.'],
      misconceptions: [['«OAuth login به‌صورت پیش‌فرض امن است.»', 'Protocol چارچوب است؛ پیاده‌سازی امنیت را تعیین می‌کند.'], ['«Email Provider همیشه هویت را ثابت می‌کند.»', 'Claim ایمیل نیازمند Verification و قانون Linking مخصوص Provider است.'], ['«Prefix matching برای Redirect هم راحت است هم امن.»', 'تطبیق آزاد می‌تواند به Callback hijacking منجر شود.'], ['«بررسی Token در Frontend کافی است.»', 'Backend باید Flow را Validate و Bind کند.']],
    },
  }),
  article({
    id: 'race-conditions',
    slug: 'race-conditions',
    severity: 'High',
    relatedLabIds: ['race-001'],
    relatedVulnerabilityIds: ['business-logic', 'idor', 'csrf'],
    mappings: {
      owasp: ['OWASP API Security Top 10: API6 Unrestricted Access to Sensitive Business Flows'],
      cwe: ['CWE-362: Concurrent Execution using Shared Resource with Improper Synchronization'],
      portSwigger: 'PortSwigger Web Security Academy: Race conditions',
    },
    references: [
      { title: 'PortSwigger Race conditions', url: 'https://portswigger.net/web-security/race-conditions' },
      { title: 'MITRE CWE-362', url: 'https://cwe.mitre.org/data/definitions/362.html' },
      { title: 'OWASP API Security Top 10 2023 API6', url: 'https://owasp.org/API-Security/editions/2023/en/0xa6-unrestricted-access-to-sensitive-business-flows/' },
      { title: 'Laravel Database Transactions', url: 'https://laravel.com/docs/database#database-transactions' },
    ],
    en: {
      title: 'Race Conditions',
      summary: 'Race conditions occur when concurrent operations observe or change shared state in an order the application did not safely control.',
      family: 'concurrency, transactional integrity, and shared-state safety',
      mechanism: 'A request may check a value, then update it later. If another request changes the same record between those steps, both operations can pass checks that should have been mutually exclusive.',
      causes: 'Specific causes include check-then-act code outside transactions, missing unique constraints, non-atomic counters, queue workers processing the same job twice, insufficient row locks, and business rules implemented only in application memory.',
      surface: 'The surface includes coupon redemption, purchases, XP awards, lab completion, password reset usage, inventory changes, email verification, file processing, and any endpoint that changes scarce or one-time state.',
      lifecycle: 'A tester identifies a one-time or limited action, sends synchronized harmless requests in a test account, compares final state against the expected invariant, and verifies the fix enforces atomicity at the database or queue boundary.',
      prevention: 'Use database constraints, transactions, row locks, atomic updates, idempotency keys, queue de-duplication, and invariant tests that assert the final state after concurrent requests.',
      operations: 'Monitor duplicate awards, negative balances, repeated one-time events, retry storms, lock wait spikes, and audit records that show the same transition happening more than once.',
      request: ['POST /api/example/redeem HTTP/1.1', 'Host: api.example.test', 'Content-Type: application/json', '', '{"coupon":"TRAINING_MARKER"}'].join('\n'),
      response: ['HTTP/1.1 409 Conflict', 'Content-Type: application/json', '', '{"message":"Operation already completed"}'].join('\n'),
      vulnerableCode: ['if (!coupon.used) {', '  awardBenefit(user);', '  coupon.used = true;', '}'].join('\n'),
      secureCode: ['await transaction(async () => {', '  const coupon = await lockCoupon(code);', '  ensureUnused(coupon);', '  markUsedAndAwardOnce(coupon, user);', '});'].join('\n'),
      scenarios: ['Two requests redeem one coupon.', 'Concurrent lab submissions award points twice.', 'Two workers process the same state transition.'],
      developerChecklist: ['Define invariants explicitly.', 'Use transactions for check and update.', 'Add unique constraints.', 'Use locks for shared rows.', 'Make success idempotent.', 'Test concurrent requests.'],
      testerChecklist: ['Use authorized test accounts.', 'Synchronize harmless duplicate requests.', 'Inspect final state, not only responses.', 'Check audit records.', 'Retest after adding locks.', 'Avoid exhausting real resources.'],
      misconceptions: [['“JavaScript is single-threaded, so races cannot happen.”', 'Server, database, queues, and multiple requests still run concurrently.'], ['“A frontend disabled button prevents double submit.”', 'Attackers and flaky networks can send multiple requests.'], ['“Transactions alone fix every race.”', 'Transactions must include the right reads, writes, locks, and constraints.'], ['“Only financial flows matter.”', 'Any scarce, one-time, or security-sensitive state can be affected.']],
    },
    fa: {
      title: 'شرایط رقابتی',
      summary: 'Race Condition زمانی رخ می‌دهد که عملیات همزمان، State مشترک را با ترتیبی مشاهده یا تغییر دهند که برنامه آن را امن کنترل نکرده است.',
      family: 'همزمانی، یکپارچگی تراکنش و ایمنی State مشترک',
      mechanism: 'یک درخواست ممکن است مقداری را بررسی کند و بعداً آن را تغییر دهد. اگر درخواست دیگری بین این دو مرحله همان رکورد را تغییر دهد، هر دو عملیات می‌توانند Checkهایی را پاس کنند که باید متقابلاً انحصاری باشند.',
      causes: 'علت‌های خاص شامل کد check-then-act بیرون از Transaction، نبود Unique constraint، Counter غیراتمی، Workerهایی که یک Job را دوبار پردازش می‌کنند، Row lock ناکافی و Rule تجاری فقط در حافظه Application است.',
      surface: 'سطح حمله شامل Coupon redemption، خرید، Award XP، Lab completion، استفاده از Password reset، تغییر Inventory، Email verification، File processing و هر Endpointی است که State محدود یا یک‌بارمصرف را تغییر می‌دهد.',
      lifecycle: 'تستر Action یک‌بارمصرف یا محدود را پیدا می‌کند، درخواست‌های بی‌خطر همزمان با حساب آزمایشی می‌فرستد، State نهایی را با Invariant مورد انتظار مقایسه می‌کند و تأیید می‌کند اصلاح Atomicity را در مرز Database یا Queue enforce می‌کند.',
      prevention: 'از Constraint دیتابیس، Transaction، Row lock، Atomic update، Idempotency key، Queue de-duplication و تست Invariant برای State نهایی بعد از درخواست‌های همزمان استفاده کنید.',
      operations: 'Award تکراری، Balance منفی، رویداد یک‌بارمصرف تکراری، Retry storm، افزایش Lock wait و Audit recordهایی را که یک Transition را بیش از یک‌بار نشان می‌دهند پایش کنید.',
      request: ['POST /api/example/redeem HTTP/1.1', 'Host: api.example.test', 'Content-Type: application/json', '', '{"coupon":"TRAINING_MARKER"}'].join('\n'),
      response: ['HTTP/1.1 409 Conflict', 'Content-Type: application/json', '', '{"message":"Operation already completed"}'].join('\n'),
      vulnerableCode: ['if (!coupon.used) {', '  awardBenefit(user);', '  coupon.used = true;', '}'].join('\n'),
      secureCode: ['await transaction(async () => {', '  const coupon = await lockCoupon(code);', '  ensureUnused(coupon);', '  markUsedAndAwardOnce(coupon, user);', '});'].join('\n'),
      scenarios: ['دو درخواست یک Coupon را Redeem می‌کنند.', 'Lab submission همزمان دوبار امتیاز می‌دهد.', 'دو Worker یک Transition را دوبار پردازش می‌کنند.'],
      developerChecklist: ['Invariantها را صریح تعریف کن.', 'Check و Update را در Transaction بگذار.', 'Unique constraint اضافه کن.', 'برای Row مشترک Lock بگیر.', 'موفقیت را Idempotent کن.', 'درخواست همزمان را تست کن.'],
      testerChecklist: ['از حساب آزمایشی مجاز استفاده کن.', 'درخواست تکراری بی‌خطر را همزمان کن.', 'State نهایی را بررسی کن نه فقط Response.', 'Audit record را ببین.', 'بعد از Lock دوباره تست کن.', 'منبع واقعی را مصرف نکن.'],
      misconceptions: [['«JavaScript تک‌نخی است پس Race نداریم.»', 'Server، Database، Queue و درخواست‌های متعدد همچنان همزمان اجرا می‌شوند.'], ['«غیرفعال کردن Button در Frontend جلوی دوبار ارسال را می‌گیرد.»', 'مهاجم یا شبکه ناپایدار می‌تواند چند درخواست بفرستد.'], ['«Transaction به‌تنهایی همه Raceها را حل می‌کند.»', 'Transaction باید Read، Write، Lock و Constraint درست را دربر بگیرد.'], ['«فقط جریان مالی مهم است.»', 'هر State محدود، یک‌بارمصرف یا امنیتی ممکن است آسیب ببیند.']],
    },
  }),
  article({
    id: 'business-logic',
    slug: 'business-logic-flaws',
    severity: 'High',
    relatedLabIds: ['bizlogic-001', 'bizlogic-002'],
    relatedVulnerabilityIds: ['race-conditions', 'idor', 'csrf'],
    mappings: {
      owasp: ['OWASP API Security Top 10: API6 Unrestricted Access to Sensitive Business Flows'],
      cwe: ['CWE-840: Business Logic Errors'],
      portSwigger: 'PortSwigger Web Security Academy: Business logic vulnerabilities',
    },
    references: [
      { title: 'PortSwigger Business logic vulnerabilities', url: 'https://portswigger.net/web-security/logic-flaws' },
      { title: 'MITRE CWE-840', url: 'https://cwe.mitre.org/data/definitions/840.html' },
      { title: 'OWASP API Security Top 10 2023 API6', url: 'https://owasp.org/API-Security/editions/2023/en/0xa6-unrestricted-access-to-sensitive-business-flows/' },
      { title: 'OWASP ASVS Business Logic', url: 'https://owasp.org/www-project-application-security-verification-standard/' },
    ],
    en: {
      title: 'Business Logic Flaws',
      summary: 'Business logic flaws happen when valid application features can be combined or sequenced in a way that violates the intended business rule.',
      family: 'workflow integrity and domain-rule enforcement',
      mechanism: 'The input may be syntactically valid and authorized, but the application fails to enforce a domain invariant such as quantity limits, order state, approval steps, eligibility, or one-time use.',
      causes: 'Specific causes include rules enforced only in the UI, missing server-side invariants, inconsistent validation across endpoints, negative or boundary values, skipped workflow steps, and trusting client-supplied prices, points, roles, or completion state.',
      surface: 'The surface includes checkout, coupons, account upgrades, refunds, learning progress, XP awards, admin workflows, onboarding, trial limits, and any multi-step feature with assumptions about order or eligibility.',
      lifecycle: 'A tester documents the normal workflow, identifies invariants, changes step order or boundary values in a non-destructive test account, and verifies the server rejects actions that break the domain rule.',
      prevention: 'Move domain rules into server-side services, derive sensitive values from trusted sources, validate state transitions, make workflows explicit, and write tests for invalid order, repeated action, and boundary values.',
      operations: 'Monitor unusual transitions, impossible totals, negative quantities, repeated benefits, admin overrides, and mismatches between client intent and server-derived values.',
      request: ['POST /api/example/order HTTP/1.1', 'Host: api.example.test', 'Content-Type: application/json', '', '{"quantity":0,"clientPrice":"REDACTED"}'].join('\n'),
      response: ['HTTP/1.1 422 Unprocessable Content', 'Content-Type: application/json', '', '{"errors":{"quantity":["Quantity must be within the allowed purchase range"]}}'].join('\n'),
      vulnerableCode: ['const total = req.body.clientPrice * req.body.quantity;', 'createOrder(user, total);'].join('\n'),
      secureCode: ['const product = await loadProduct(req.body.productId);', 'validateQuantity(req.body.quantity);', 'const total = calculateServerPrice(product, req.body.quantity);', 'createOrder(user, total);'].join('\n'),
      scenarios: ['An out-of-range quantity changes the expected total.', 'A user skips an approval step.', 'Client-supplied XP or completion state is accepted.'],
      developerChecklist: ['List domain invariants.', 'Reject client-supplied trusted values.', 'Validate state transitions.', 'Centralize business rules.', 'Test boundaries and step order.', 'Audit similar workflows.'],
      testerChecklist: ['Map the happy path.', 'Identify values the server should derive.', 'Try safe boundary values.', 'Reorder non-destructive steps.', 'Compare roles and states.', 'Document the broken invariant precisely.'],
      misconceptions: [['“If input validation passes, business logic is safe.”', 'Business rules need their own invariants beyond syntax.'], ['“Users cannot change hidden form fields.”', 'Clients can submit arbitrary requests.'], ['“Only payment systems have logic bugs.”', 'Training progress, roles, quotas, and approvals also rely on logic.'], ['“A one-off patch is enough.”', 'Shared domain rules should be centralized and tested.']],
    },
    fa: {
      title: 'نقص‌های منطق کسب‌وکار',
      summary: 'Business Logic Flaw زمانی رخ می‌دهد که قابلیت‌های معتبر برنامه به شکلی ترکیب یا مرتب شوند که قانون تجاری مورد انتظار نقض شود.',
      family: 'یکپارچگی Workflow و enforce کردن Ruleهای Domain',
      mechanism: 'ورودی ممکن است از نظر Syntax معتبر و Authorized باشد، اما برنامه Invariant دامنه مثل محدودیت تعداد، وضعیت سفارش، مرحله تأیید، Eligibility یا مصرف یک‌بارمصرف را enforce نمی‌کند.',
      causes: 'علت‌های خاص شامل Rule فقط در UI، نبود Invariant سمت سرور، Validation ناسازگار بین Endpointها، مقدار منفی یا مرزی، رد کردن مرحله Workflow و اعتماد به Price، Point، Role یا Completion state ارسال‌شده از Client است.',
      surface: 'سطح حمله شامل Checkout، Coupon، Account upgrade، Refund، Learning progress، Award XP، Admin workflow، Onboarding، Trial limit و هر قابلیت چندمرحله‌ای با فرض ترتیب یا Eligibility است.',
      lifecycle: 'تستر Workflow عادی را مستند می‌کند، Invariantها را مشخص می‌کند، ترتیب مرحله یا مقدار مرزی را در حساب آزمایشی غیرمخرب تغییر می‌دهد و تأیید می‌کند Server اقدام ناقض Rule دامنه را رد می‌کند.',
      prevention: 'Ruleهای دامنه را به Service سمت سرور منتقل کنید، مقدار حساس را از منبع قابل اعتماد derive کنید، State transition را Validate کنید، Workflow را صریح کنید و برای ترتیب نامعتبر، Action تکراری و مقدار مرزی تست بنویسید.',
      operations: 'Transition غیرعادی، Total ناممکن، Quantity منفی، Benefit تکراری، Override مدیریتی و اختلاف بین قصد Client و مقدار Derive شده سمت سرور را پایش کنید.',
      request: ['POST /api/example/order HTTP/1.1', 'Host: api.example.test', 'Content-Type: application/json', '', '{"quantity":0,"clientPrice":"REDACTED"}'].join('\n'),
      response: ['HTTP/1.1 422 Unprocessable Content', 'Content-Type: application/json', '', '{"errors":{"quantity":["Quantity must be within the allowed purchase range"]}}'].join('\n'),
      vulnerableCode: ['const total = req.body.clientPrice * req.body.quantity;', 'createOrder(user, total);'].join('\n'),
      secureCode: ['const product = await loadProduct(req.body.productId);', 'validateQuantity(req.body.quantity);', 'const total = calculateServerPrice(product, req.body.quantity);', 'createOrder(user, total);'].join('\n'),
      scenarios: ['Quantity خارج از محدوده Total مورد انتظار را تغییر می‌دهد.', 'کاربر مرحله Approval را رد می‌کند.', 'XP یا Completion state ارسال‌شده از Client پذیرفته می‌شود.'],
      developerChecklist: ['Invariantهای Domain را فهرست کن.', 'مقدار Trusted از Client را رد کن.', 'State transition را Validate کن.', 'Ruleهای تجاری را Centralize کن.', 'Boundary و Step order را تست کن.', 'Workflow مشابه را Audit کن.'],
      testerChecklist: ['Happy path را نقشه‌برداری کن.', 'مشخص کن چه مقدارهایی باید سمت سرور derive شوند.', 'مقدار مرزی امن را امتحان کن.', 'مرحله غیرمخرب را جابه‌جا کن.', 'Role و State را مقایسه کن.', 'Invariant شکسته‌شده را دقیق مستند کن.'],
      misconceptions: [['«اگر Input validation پاس شود، منطق تجاری امن است.»', 'Rule تجاری به Invariant جدا از Syntax نیاز دارد.'], ['«کاربر نمی‌تواند Hidden field را تغییر دهد.»', 'Client می‌تواند درخواست دلخواه ارسال کند.'], ['«فقط سیستم پرداخت Logic bug دارد.»', 'Progress آموزشی، Role، Quota و Approval هم به منطق وابسته‌اند.'], ['«Patch موردی کافی است.»', 'Rule مشترک دامنه باید متمرکز و تست شود.']],
    },
  }),
  article({
    id: 'web-cache-poisoning',
    slug: 'web-cache-poisoning',
    severity: 'High',
    relatedLabIds: ['cache-001'],
    relatedVulnerabilityIds: ['xss', 'http-smuggling', 'cors'],
    mappings: {
      owasp: ['OWASP Community: Cache Poisoning'],
      cwe: ['CWE-444: Inconsistent Interpretation of HTTP Requests'],
      portSwigger: 'PortSwigger Web Security Academy: Web cache poisoning',
    },
    references: [
      { title: 'OWASP Cache Poisoning', url: 'https://owasp.org/www-community/attacks/Cache_Poisoning' },
      { title: 'PortSwigger Web cache poisoning', url: 'https://portswigger.net/web-security/web-cache-poisoning' },
      { title: 'PortSwigger Practical Web Cache Poisoning', url: 'https://portswigger.net/research/practical-web-cache-poisoning' },
      { title: 'MDN HTTP caching', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching' },
    ],
    en: {
      title: 'Web Cache Poisoning',
      summary: 'Web cache poisoning happens when attacker-influenced response content is stored under a cache key that other users later receive.',
      family: 'HTTP caching, response variation, and shared infrastructure safety',
      mechanism: 'A cache chooses a key from selected request parts. If the origin varies the response using an unkeyed header, host value, query parameter, or language signal, the cache may store attacker-influenced content and serve it to unrelated users.',
      causes: 'Specific causes include unkeyed inputs affecting responses, unsafe cache of personalized pages, missing Vary headers, host or forwarded-header trust issues, reflected response content on cacheable routes, and cache rules not matching application behavior.',
      surface: 'The surface includes CDN edges, reverse proxies, static asset routes, pages with reflected headers, localized responses, redirects, error pages, and any route where Cache-Control permits shared storage.',
      lifecycle: 'A tester identifies cacheable responses, sends a harmless marker in one candidate input, checks whether the marker appears in a cached response for a separate request, and confirms the fix keys or rejects that variation.',
      prevention: 'Cache only responses designed for sharing, include correct Vary behavior, reject untrusted forwarded headers, separate personalized content, and align CDN rules with application response variation.',
      operations: 'Monitor cache hit ratios after suspicious headers, unexpected response variation, poisoned redirect targets, unusual host header values, and changes to CDN rule configuration.',
      request: ['GET /public/page HTTP/1.1', 'Host: www.example.test', 'X-Forwarded-Host: training-marker.example'].join('\n'),
      response: ['HTTP/1.1 200 OK', 'Cache-Control: public, max-age=60', 'Vary: Accept-Language', '', '<html>Shared response without unkeyed marker</html>'].join('\n'),
      vulnerableCode: ['const canonical = req.headers["x-forwarded-host"] ?? req.headers.host;', 'renderPublicPage({ canonical });'].join('\n'),
      secureCode: ['const canonical = config.publicOrigin;', 'rejectUntrustedForwardedHeaders(req);', 'setCachePolicyForSharedContent(res);'].join('\n'),
      scenarios: ['An unkeyed header changes a cached page.', 'A cached redirect points users to an unintended host.', 'A localized response is cached without the correct Vary header.'],
      developerChecklist: ['Inventory shared-cache routes.', 'Remove unkeyed response variation.', 'Set precise Cache-Control.', 'Use correct Vary headers.', 'Validate host and forwarded headers.', 'Test with separate cache keys.'],
      testerChecklist: ['Use harmless markers.', 'Check cache headers first.', 'Compare primed and unprimed requests.', 'Use separate sessions where needed.', 'Avoid poisoning live shared caches.', 'Verify cache purge and key changes.'],
      misconceptions: [['“Only static files are cached.”', 'CDNs and proxies may cache dynamic responses when configured to do so.'], ['“Cache poisoning requires JavaScript injection.”', 'Redirects, metadata, links, and content fragments can also matter.'], ['“Cache-Control exists, so it is safe.”', 'The policy must match actual response variation.'], ['“Purging fixes the root cause.”', 'A purge removes current entries but not the vulnerable cache behavior.']],
    },
    fa: {
      title: 'مسموم‌سازی کش وب',
      summary: 'Web Cache Poisoning زمانی رخ می‌دهد که محتوای پاسخ تحت تأثیر مهاجم با Cache key مشترک ذخیره شود و بعداً به کاربران دیگر برسد.',
      family: 'HTTP caching، تغییر پاسخ و ایمنی زیرساخت مشترک',
      mechanism: 'Cache کلید را از بخش‌های انتخاب‌شده درخواست می‌سازد. اگر Origin پاسخ را بر اساس Header، Host، Query parameter یا Language signal که در Cache key نیست تغییر دهد، Cache می‌تواند محتوای تحت تأثیر مهاجم را ذخیره و به کاربران نامرتبط ارائه کند.',
      causes: 'علت‌های خاص شامل ورودی Unkeyed مؤثر بر Response، Cache ناامن صفحه شخصی، نبود Header مناسب Vary، اعتماد اشتباه به Host یا Forwarded header، محتوای Reflected روی Route قابل Cache و ناسازگاری Ruleهای Cache با رفتار برنامه است.',
      surface: 'سطح حمله شامل CDN edge، Reverse proxy، مسیر Asset، صفحه با Header بازتابی، پاسخ Localized، Redirect، Error page و هر Route با Cache-Control مناسب Shared storage است.',
      lifecycle: 'تستر Response قابل Cache را پیدا می‌کند، Marker بی‌خطر را در یک ورودی Candidate می‌فرستد، بررسی می‌کند Marker در Response Cache شده برای درخواست جدا ظاهر می‌شود یا نه و تأیید می‌کند اصلاح، Variation را Key یا Reject می‌کند.',
      prevention: 'فقط Responseهایی را Cache کنید که برای اشتراک طراحی شده‌اند، رفتار Vary درست بگذارید، Forwarded header غیرقابل اعتماد را رد کنید، محتوای شخصی را جدا کنید و Ruleهای CDN را با Variation واقعی برنامه هم‌راستا کنید.',
      operations: 'Cache hit ratio بعد از Header مشکوک، Response variation غیرمنتظره، Redirect target آلوده، Host header غیرعادی و تغییر Ruleهای CDN را پایش کنید.',
      request: ['GET /public/page HTTP/1.1', 'Host: www.example.test', 'X-Forwarded-Host: training-marker.example'].join('\n'),
      response: ['HTTP/1.1 200 OK', 'Cache-Control: public, max-age=60', 'Vary: Accept-Language', '', '<html>Shared response without unkeyed marker</html>'].join('\n'),
      vulnerableCode: ['const canonical = req.headers["x-forwarded-host"] ?? req.headers.host;', 'renderPublicPage({ canonical });'].join('\n'),
      secureCode: ['const canonical = config.publicOrigin;', 'rejectUntrustedForwardedHeaders(req);', 'setCachePolicyForSharedContent(res);'].join('\n'),
      scenarios: ['Header خارج از Cache key صفحه Cache شده را تغییر می‌دهد.', 'Redirect Cache شده کاربران را به Host ناخواسته می‌برد.', 'Response محلی‌سازی‌شده بدون Vary درست Cache می‌شود.'],
      developerChecklist: ['Routeهای Shared cache را فهرست کن.', 'Response variation خارج از Key را حذف کن.', 'Cache-Control دقیق بگذار.', 'Vary header درست تنظیم کن.', 'Host و Forwarded header را Validate کن.', 'با Cache key جدا تست کن.'],
      testerChecklist: ['از Marker بی‌خطر استفاده کن.', 'اول Headerهای Cache را بررسی کن.', 'درخواست Primed و Unprimed را مقایسه کن.', 'در صورت نیاز Session جدا استفاده کن.', 'Cache مشترک Live را آلوده نکن.', 'Purge و تغییر Key را تأیید کن.'],
      misconceptions: [['«فقط فایل Static کش می‌شود.»', 'CDN و Proxy ممکن است Response پویا را هم Cache کنند.'], ['«Cache poisoning حتماً نیاز به JavaScript injection دارد.»', 'Redirect، Metadata، Link و Fragment محتوا هم می‌توانند مهم باشند.'], ['«Cache-Control داریم پس امن است.»', 'Policy باید با Variation واقعی پاسخ هماهنگ باشد.'], ['«Purge مشکل را ریشه‌ای حل می‌کند.»', 'Purge Entry فعلی را حذف می‌کند اما رفتار آسیب‌پذیر Cache را نه.']],
    },
  }),
];


