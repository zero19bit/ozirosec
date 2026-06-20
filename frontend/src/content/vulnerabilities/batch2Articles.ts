import type { BilingualVulnerabilityArticle, LocalizedVulnerabilityArticle } from './types';

interface LocalizedSpec {
  title: string;
  summary: string;
  layer: string;
  mechanism: string;
  rootCause: string;
  attackSurface: string;
  lifecycle: string;
  primaryControl: string;
  defenseInDepth: string;
  request: string;
  response: string;
  vulnerableCode: string;
  secureCode: string;
  scenarios: string[];
  developerChecklist: string[];
  testerChecklist: string[];
  misconceptions: Array<[string, string]>;
}

interface BatchTwoSpec {
  id: BilingualVulnerabilityArticle['id'];
  slug: BilingualVulnerabilityArticle['slug'];
  severity: BilingualVulnerabilityArticle['severity'];
  relatedLabIds: string[];
  relatedVulnerabilityIds: string[];
  mappings: BilingualVulnerabilityArticle['mappings'];
  references: BilingualVulnerabilityArticle['references'];
  en: LocalizedSpec;
  fa: LocalizedSpec;
}

function buildContent(spec: LocalizedSpec, locale: 'en' | 'fa'): LocalizedVulnerabilityArticle {
  const isFa = locale === 'fa';

  return {
    title: spec.title,
    summary: spec.summary,
    callouts: [
      {
        type: 'warning',
        title: isFa ? 'نمونه‌ها فقط برای آزمایشگاه مجاز' : 'Authorized-lab-only examples',
        body: isFa
          ? 'همه درخواست‌ها، پاسخ‌ها و کدها از دامنه‌های نمونه، مقدارهای placeholder و REDACTED استفاده می‌کنند و هیچ مقدار فعال، اعتبارنامه، ماده اعتبارسنجی یا راه‌حل دقیق آزمایشگاه را فاش نمی‌کنند.'
          : 'All requests, responses, and code use sample domains, placeholders, and REDACTED values. They do not expose active flags, credentials, verification material, or exact lab solutions.',
      },
    ],
    overviewSections: [
      {
        id: 'introduction',
        title: isFa ? 'مقدمه' : 'Introduction',
        body: [
          isFa
            ? `${spec.title} روی ${spec.layer} اثر می‌گذارد و زمانی مهم می‌شود که برنامه مرز اعتماد را ساده‌تر از واقعیت در نظر بگیرد. این آسیب‌پذیری معمولاً در قابلیت‌های عادی محصول پنهان است، اما می‌تواند به تصمیم امنیتی، داده حساس یا پردازش سمت سرور برسد.`
            : `${spec.title} affects ${spec.layer}. It matters because the application treats a trust boundary as simpler than it really is. The weakness often hides in ordinary product features, yet it can reach a security decision, sensitive data, or server-side processing.`,
          isFa
            ? `در HackPath هدف یادگیری الگو و روش دفاع است، نه حفظ Payload. مقاله نشان می‌دهد داده چگونه جریان پیدا می‌کند، چرا کنترل موجود کافی نیست و چه اصلاحی باعث می‌شود همان کلاس خطا در مسیرهای مشابه تکرار نشود.`
            : 'In HackPath the goal is to learn the pattern and the defense, not memorize a payload. This article explains how data flows, why the existing control fails, and what repair prevents the same class of mistake from reappearing in nearby routes.',
        ],
      },
      {
        id: 'technical-explanation',
        title: isFa ? 'توضیح فنی دقیق' : 'Detailed technical explanation',
        body: [
          spec.mechanism,
          isFa
            ? 'نکته مهم این است که کنترل امنیتی باید در همان لایه‌ای قرار بگیرد که تصمیم واقعی گرفته می‌شود. اگر کنترل فقط در UI، فقط در Validation سطحی یا فقط در یک Header اختیاری باشد، تغییر مسیر داده، Parser، Proxy یا مصرف‌کننده API می‌تواند آن را دور بزند.'
            : 'The key point is that the security control must live at the layer where the real decision is made. If the control exists only in the UI, only as shallow validation, or only as an optional header, a change in data flow, parser behavior, proxy behavior, or API consumer can bypass it.',
        ],
      },
      {
        id: 'root-causes',
        title: isFa ? 'علت‌های ریشه‌ای' : 'Root causes',
        body: [
          spec.rootCause,
          isFa
            ? 'علت‌های ثانویه معمولاً شامل مجوز بیش از حد، نبود تست رگرسیون، اعتماد به ورودی ذخیره‌شده، تفاوت محیط توسعه و Production، و نبود مالک مشخص برای کنترل امنیتی هستند.'
            : 'Secondary causes often include excessive privileges, missing regression tests, trusting stored input, development-versus-production drift, and no clear owner for the security control.',
        ],
      },
      {
        id: 'attack-surface',
        title: isFa ? 'سطح حمله' : 'Attack surface',
        body: [
          spec.attackSurface,
          isFa
            ? 'هنگام بازبینی، فقط فرم‌های عمومی را بررسی نکنید. مسیرهای Admin، Jobهای پس‌زمینه، Import/Export، Webhookها، تنظیمات Integration و مسیرهای API که کمتر در UI دیده می‌شوند نیز باید بررسی شوند.'
            : 'During review, do not stop at public forms. Admin routes, background jobs, imports and exports, webhooks, integration settings, and API routes that are not visible in the UI also need coverage.',
        ],
      },
      {
        id: 'attack-lifecycle',
        title: isFa ? 'چرخه حمله مرحله‌به‌مرحله' : 'Step-by-step attack lifecycle',
        body: [
          spec.lifecycle,
          isFa
            ? 'مدافع ممکن است الگو را در لاگ به شکل مقدارهای غیرعادی، خطاهای Parser، درخواست‌های تکراری، اختلاف Status code، افزایش زمان پاسخ یا دسترسی به Objectهایی ببیند که با کاربر فعلی هم‌خوانی ندارند.'
            : 'A defender may see the pattern in logs as unusual values, parser errors, repeated requests, status-code differences, response-time differences, or access to objects that do not match the current user.',
        ],
      },
      {
        id: 'technical-impact',
        title: isFa ? 'اثر فنی' : 'Technical impact',
        body: [
          isFa
            ? 'اثر فنی به قابلیت آسیب‌دیده وابسته است و نباید اغراق شود. ممکن است شامل افشای داده، تغییر داده، دور زدن احراز هویت یا مجوز، دسترسی به سرویس داخلی، پردازش فایل ناامن، اجرای فرمان یا اختلال سرویس باشد؛ اما همه موارد به RCE ختم نمی‌شوند.'
            : 'Technical impact depends on the affected feature and should not be overstated. It may include data disclosure, data modification, authentication or authorization bypass, internal-service access, unsafe file processing, command execution, or service disruption; not every case becomes RCE.',
          isFa
            ? 'شدت زمانی بالاتر می‌رود که داده چندکاربری، نقش‌های Privileged، Secretها، پردازش سمت سرور یا مسیرهای قابل زنجیره شدن با آسیب‌پذیری‌های دیگر درگیر باشند.'
            : 'Severity increases when multi-user data, privileged roles, secrets, server-side processing, or chainable routes are involved.',
        ],
      },
      {
        id: 'business-impact',
        title: isFa ? 'اثر کسب‌وکار' : 'Business impact',
        body: [
          isFa
            ? 'اثر سازمانی می‌تواند شامل نقض حریم خصوصی، هزینه پاسخ به رخداد، بازبینی قانونی، اختلال سرویس، کاهش اعتماد مشتری و زمان مهندسی برای Audit مسیرهای مشابه باشد.'
            : 'Organizational impact can include privacy violations, incident-response cost, legal review, service disruption, loss of customer trust, and engineering time spent auditing similar paths.',
          isFa
            ? 'برای مدیریت ریسک، گزارش باید دقیقاً توضیح دهد چه داده یا عملی در معرض خطر است، چه کاربری می‌تواند آن را تحریک کند و چه کنترل‌هایی بعد از اصلاح اضافه شده‌اند.'
            : 'For risk management, the report should state exactly which data or action is exposed, which user can trigger it, and which controls were added after remediation.',
        ],
      },
      {
        id: 'detection-indicators',
        title: isFa ? 'نشانه‌های تشخیص' : 'Detection indicators',
        body: [
          isFa
            ? 'نشانه‌ها شامل مقدارهای غیرمنتظره در پارامترها، خطاهای Parser یا Framework، درخواست به مقصدهای غیرمعمول، اختلاف پاسخ بین دو کاربر، تلاش برای تغییر Identifierها و افزایش خطاهای Validation است.'
            : 'Indicators include unexpected parameter values, parser or framework errors, requests to unusual destinations, response differences between users, attempts to modify identifiers, and increased validation failures.',
          isFa
            ? 'Detection جای Prevention را نمی‌گیرد. لاگ‌ها باید برای کشف رفتار غیرعادی کافی باشند اما نباید Token، Cookie، فایل، Secret یا Payload حساس را ذخیره کنند.'
            : 'Detection does not replace prevention. Logs should be rich enough to reveal abnormal behavior but must not store tokens, cookies, files, secrets, or sensitive payloads.',
        ],
      },
      {
        id: 'manual-testing-methodology',
        title: isFa ? 'روش تست دستی مجاز' : 'Authorized manual testing methodology',
        body: [
          isFa
            ? 'تستر ابتدا قابلیت مرتبط را پیدا می‌کند، مرز اعتماد را مشخص می‌کند، درخواست پایه را با حساب آزمایشی ثبت می‌کند و فقط یک متغیر را در هر بار تغییر می‌دهد. سپس Status code، Body، زمان پاسخ و Side effect را با حالت امن مورد انتظار مقایسه می‌کند.'
            : 'A tester first identifies the relevant feature, maps the trust boundary, records a baseline request with a test account, and changes only one variable at a time. They compare status code, body, timing, and side effects with the expected secure behavior.',
          isFa
            ? 'تست باید غیرمخرب باشد، داده آزمایشی را بعد از پایان بازگرداند، شواهد Sanitized نگه دارد و بعد از اصلاح همان سناریو و مسیرهای مجاور را دوباره بررسی کند.'
            : 'Testing should be non-destructive, restore test data afterward, keep evidence sanitized, and retest both the original scenario and nearby routes after remediation.',
        ],
      },
      {
        id: 'automated-testing-considerations',
        title: isFa ? 'ملاحظات تست خودکار' : 'Automated testing considerations',
        body: [
          isFa
            ? 'در این پروژه، تست‌های Laravel Feature، تست‌های Component فرانت‌اند، SAST سبک، DAST محدود و API contract tests می‌توانند رگرسیون را پیدا کنند. تست باید سناریوی خاص آسیب‌پذیری را مدل کند، نه فقط اینکه endpoint پاسخ 200 می‌دهد.'
            : 'In this project, Laravel feature tests, frontend component tests, lightweight SAST, scoped DAST, and API contract tests can catch regressions. The test must model the vulnerability-specific scenario, not merely assert that the endpoint returns 200.',
          isFa
            ? 'برای مسیرهای حساس، از دو کاربر، دو نقش، ورودی malformed، مقدار Boundary و حالت شکست استفاده کنید. خروجی تست نباید Secret یا Payload فعال چاپ کند.'
            : 'For sensitive paths, use two users, two roles, malformed input, boundary values, and failure states. Test output must not print secrets or active payloads.',
        ],
      },
      {
        id: 'prevention',
        title: isFa ? 'پیشگیری' : 'Prevention',
        body: [
          spec.primaryControl,
          spec.defenseInDepth,
        ],
      },
      {
        id: 'remediation-workflow',
        title: isFa ? 'گردش کار اصلاح' : 'Remediation workflow',
        body: [
          isFa
            ? 'ابتدا Routeها، Componentها و Data flowهای آسیب‌دیده را فهرست کنید. مشکل را در محیط ایزوله بازتولید کنید، علت ریشه‌ای را مشخص کنید، اصلاح اصلی را اعمال کنید و بعد کنترل‌های دفاع‌درعمق را اضافه کنید.'
            : 'Start by inventorying affected routes, components, and data flows. Reproduce the issue in isolation, identify the root cause, apply the primary fix, and then add defense-in-depth controls.',
          isFa
            ? 'در پایان Regression test اضافه کنید، مسیرهای مشابه را جستجو کنید، لاگ‌ها را برای سوءاستفاده احتمالی بررسی کنید، اگر Secret یا Credential در معرض خطر بوده آن را بچرخانید، Release را با برنامه Rollback انجام دهید و بعد از انتشار مانیتور کنید.'
            : 'Finally, add regression tests, search for similar code paths, review logs for possible abuse, rotate exposed secrets or credentials when relevant, deploy with a rollback plan, and monitor after release.',
        ],
      },
    ],
    httpExamples: [
      {
        id: 'sanitized-probe',
        title: isFa ? 'درخواست آموزشی Sanitized' : 'Sanitized educational request',
        description: isFa
          ? 'این نمونه فقط مرز اعتماد را نشان می‌دهد و از مقدارهای placeholder استفاده می‌کند.'
          : 'This example demonstrates the trust boundary only and uses placeholders.',
        request: spec.request,
        response: spec.response,
      },
    ],
    impact: [
      isFa ? 'افشا یا تغییر داده متناسب با قابلیت آسیب‌دیده.' : 'Data disclosure or modification depending on the affected feature.',
      isFa ? 'دور زدن کنترل امنیتی وقتی تصمیم اعتماد در لایه اشتباه گرفته شود.' : 'Security-control bypass when the trust decision is made at the wrong layer.',
      isFa ? 'افزایش اثر در صورت ترکیب با نقش Privileged، پردازش سمت سرور یا Secretها.' : 'Greater impact when combined with privileged roles, server-side processing, or secrets.',
    ],
    businessImpact: [
      isFa ? 'هزینه پاسخ به رخداد، اصلاح فوری و بازبینی مسیرهای مشابه.' : 'Incident response, urgent remediation, and review of similar paths.',
      isFa ? 'ریسک حریم خصوصی، از دست رفتن اعتماد و فشار عملیاتی روی تیم پشتیبانی و مهندسی.' : 'Privacy risk, trust loss, and operational pressure on support and engineering teams.',
    ],
    remediation: [
      spec.primaryControl,
      isFa ? 'برای مسیر آسیب‌دیده و مسیرهای مجاور Regression test اضافه کنید.' : 'Add regression tests for the affected route and nearby routes.',
      isFa ? 'لاگ‌ها را بدون ذخیره Secret برای تلاش‌های قبلی بررسی کنید.' : 'Review logs for prior attempts without storing secrets.',
    ],
    safePayloadExamples: ['<authorized-lab marker>', '<REDACTED value>', '<non-destructive probe>'],
    attackScenarios: spec.scenarios,
    commonMistakes: [
      isFa ? 'اعتماد به کنترل Client-side به‌جای کنترل سرور.' : 'Trusting client-side controls instead of server-side controls.',
      isFa ? 'اصلاح یک endpoint و نادیده گرفتن helper مشترک.' : 'Fixing one endpoint while ignoring a shared helper.',
      isFa ? 'ثبت Token، Cookie یا فایل حساس در لاگ تست.' : 'Logging tokens, cookies, or sensitive files during testing.',
      isFa ? 'فرض امن بودن داده داخلی یا ذخیره‌شده.' : 'Assuming internal or stored data is automatically safe.',
    ],
    detection: {
      manual: [
        isFa ? 'درخواست پایه را با حساب آزمایشی ثبت و یک متغیر را تغییر دهید.' : 'Record a baseline request with a test account and change one variable.',
        isFa ? 'رفتار را بین کاربرها، نقش‌ها یا Contextهای متفاوت مقایسه کنید.' : 'Compare behavior across users, roles, or contexts.',
        isFa ? 'بعد از اصلاح، همان Probe و یک Bypass نزدیک را دوباره تست کنید.' : 'After remediation, retest the same probe and a nearby bypass.',
      ],
      automated: [
        isFa ? 'Feature test یا API contract test برای حالت مجاز و غیرمجاز اضافه کنید.' : 'Add feature or API contract tests for allowed and denied states.',
        isFa ? 'Static check برای APIهای خطرناک یا تنظیمات ناامن اضافه کنید.' : 'Add static checks for dangerous APIs or unsafe configuration.',
        isFa ? 'DAST محدود را فقط در Scope آزمایشی اجرا کنید.' : 'Run scoped DAST only in test environments.',
      ],
    },
    codeExamples: [
      {
        language: 'typescript',
        title: isFa ? 'نمونه عمداً آسیب‌پذیر و نسخه امن' : 'Intentionally vulnerable example and secure version',
        vulnerable: spec.vulnerableCode,
        fixed: spec.secureCode,
      },
    ],
    developerChecklist: spec.developerChecklist,
    testerChecklist: spec.testerChecklist,
    misconceptions: spec.misconceptions.map(([myth, correction]) => ({ myth, correction })),
    reviewQuestions: [
      isFa ? 'کنترل اصلی در کدام لایه enforce می‌شود؟' : 'At which layer is the primary control enforced?',
      isFa ? 'آیا دو کاربر یا دو نقش متفاوت در تست پوشش داده شده‌اند؟' : 'Are two users or roles covered in testing?',
      isFa ? 'آیا لاگ‌ها بدون افشای Secret برای تشخیص کافی هستند؟' : 'Are logs useful for detection without exposing secrets?',
    ],
  };
}

function article(spec: BatchTwoSpec): BilingualVulnerabilityArticle {
  return {
    id: spec.id,
    slug: spec.slug,
    batch: 2,
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
      en: buildContent(spec.en, 'en'),
      fa: buildContent(spec.fa, 'fa'),
    },
  };
}

export const batch2Articles: BilingualVulnerabilityArticle[] = [
  article({
    id: 'ssrf',
    slug: 'ssrf',
    severity: 'Critical',
    relatedLabIds: ['ssrf-001', 'ssrf-002'],
    relatedVulnerabilityIds: ['xxe', 'cors', 'rce'],
    mappings: {
      owasp: ['OWASP Top 10 2021 A10: Server-Side Request Forgery', 'OWASP API8:2023 Security Misconfiguration'],
      cwe: ['CWE-918: Server-Side Request Forgery'],
      portSwigger: 'PortSwigger Web Security Academy: Server-side request forgery',
    },
    references: [
      { title: 'OWASP Top 10 A10: SSRF', url: 'https://owasp.org/Top10/2021/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/' },
      { title: 'OWASP SSRF Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html' },
      { title: 'PortSwigger SSRF', url: 'https://portswigger.net/web-security/ssrf' },
      { title: 'MITRE CWE-918', url: 'https://cwe.mitre.org/data/definitions/918.html' },
      { title: 'OWASP API8:2023 Security Misconfiguration', url: 'https://owasp.org/API-Security/editions/2023/en/0xa8-security-misconfiguration/' },
    ],
    en: {
      title: 'Server-Side Request Forgery (SSRF)',
      summary: 'SSRF occurs when a server fetches a user-influenced URL or network destination without strict validation, allowing requests to unexpected internal or external systems.',
      layer: 'server-side integrations, URL fetchers, metadata services, and outbound HTTP clients',
      mechanism: 'The vulnerable service receives a URL, host, webhook target, image source, import location, or callback address and then makes the request from the server network. Because the request originates from trusted infrastructure, it may reach internal services or cloud metadata paths that a browser user cannot access directly.',
      rootCause: 'Specific root causes include open-ended URL fetchers, DNS rebinding blind spots, validation before redirects, missing IP-range blocking after resolution, allowing non-HTTP schemes, and network egress rules that treat application servers as fully trusted.',
      attackSurface: 'SSRF commonly appears in webhook setup, URL previews, PDF/image importers, avatar fetchers, server-side analytics callbacks, XML processors, cloud integrations, and admin tools that test connectivity.',
      lifecycle: 'A tester identifies a feature that causes the server to fetch a destination, replaces the destination with a benign lab-controlled host marker, observes whether the server connects, then checks redirect handling, DNS resolution, and blocked internal ranges without touching real internal assets.',
      primaryControl: 'Use strict allowlists for destination hosts or service identifiers, resolve and validate IPs after redirects, block private/link-local ranges, and prefer predefined integration IDs over arbitrary URLs.',
      defenseInDepth: 'Segment outbound network access, require service-to-service authentication, limit response data returned to users, log destination classes safely, and configure cloud metadata protections.',
      request: ['POST /api/integrations/fetch-preview HTTP/1.1', 'Host: api.example.test', 'Cookie: session=REDACTED', 'Content-Type: application/json', '', '{"url":"https://allowed.example.test/resource"}'].join('\n'),
      response: ['HTTP/1.1 200 OK', 'Content-Type: application/json', '', '{"status":"queued","destination":"allowed.example.test"}'].join('\n'),
      vulnerableCode: ['const target = String(req.body.url ?? "");', 'const response = await fetch(target);', 'res.json({ preview: await response.text() });'].join('\n'),
      secureCode: ['const target = new URL(String(req.body.url ?? ""));', 'assertAllowedOutboundDestination(target);', 'const response = await fetch(target, { redirect: "manual" });', 'res.json({ status: "fetched" });'].join('\n'),
      scenarios: ['A URL previewer fetches arbitrary user-supplied URLs.', 'A webhook tester follows redirects to unexpected destinations.', 'A document importer returns server-side fetch errors to the user.'],
      developerChecklist: ['Use host/service allowlists, not denylist strings.', 'Validate after DNS resolution and redirects.', 'Block private, loopback, link-local, and metadata ranges.', 'Disable unused schemes.', 'Limit returned response bodies.', 'Add egress firewall rules.'],
      testerChecklist: ['Find URL-fetching features.', 'Use a lab-controlled destination marker.', 'Check redirects and DNS changes safely.', 'Compare allowed and denied destinations.', 'Review logs for outbound request metadata.', 'Retest egress controls after fix.'],
      misconceptions: [['“The server is behind a firewall, so SSRF is harmless.”', 'The firewall can make SSRF more valuable because the server can reach internal resources.'], ['“Blocking localhost is enough.”', 'Private ranges, link-local ranges, redirects, IPv6, and DNS changes also matter.'], ['“SSRF only reads data.”', 'Some internal services accept state-changing requests or expose metadata.']],
    },
    fa: {
      title: 'جعل درخواست سمت سرور (SSRF)',
      summary: 'SSRF زمانی رخ می‌دهد که سرور مقصد URL یا شبکه‌ای تحت تأثیر کاربر را بدون اعتبارسنجی سخت‌گیرانه Fetch کند و درخواست به سرویس‌های داخلی یا خارجی غیرمنتظره برسد.',
      layer: 'Integrationهای سمت سرور، URL fetcherها، سرویس‌های metadata و HTTP clientهای خروجی',
      mechanism: 'سرویس آسیب‌پذیر URL، Host، مقصد Webhook، منبع تصویر، محل Import یا Callback را دریافت می‌کند و سپس از شبکه سرور به آن درخواست می‌فرستد. چون درخواست از زیرساخت قابل اعتماد می‌آید، ممکن است به سرویس داخلی یا مسیر Metadata ابری برسد که کاربر مرورگر مستقیم به آن دسترسی ندارد.',
      rootCause: 'علت‌های خاص شامل URL fetcher آزاد، ندیدن DNS rebinding، اعتبارسنجی قبل از Redirect، نبود بررسی IP بعد از Resolve، مجاز بودن Schemeهای غیر HTTP و قوانین Egressی است که سرور برنامه را کاملاً قابل اعتماد فرض می‌کنند.',
      attackSurface: 'SSRF در تنظیم Webhook، پیش‌نمایش URL، Import تصویر یا PDF، دریافت Avatar، Callback تحلیل، پردازش XML، Integration ابری و ابزارهای مدیریتی تست اتصال دیده می‌شود.',
      lifecycle: 'تستر قابلیتی را پیدا می‌کند که سرور را وادار به Fetch مقصد می‌کند، مقصد را با Marker کنترل‌شده آزمایشگاهی جایگزین می‌کند، اتصال سرور را مشاهده می‌کند و سپس Redirect، DNS resolution و محدوده‌های داخلی مسدودشده را بدون تماس با دارایی واقعی بررسی می‌کند.',
      primaryControl: 'برای مقصدها allowlist سخت‌گیرانه Host یا شناسه سرویس استفاده کنید، IP را بعد از Redirect Resolve و Validate کنید، محدوده‌های private و link-local را ببندید و به‌جای URL دلخواه از Integration IDهای از پیش تعریف‌شده استفاده کنید.',
      defenseInDepth: 'دسترسی خروجی شبکه را Segment کنید، احراز هویت Service-to-service بخواهید، داده پاسخ برگشتی به کاربر را محدود کنید، کلاس مقصد را امن لاگ کنید و محافظت Metadata ابری را فعال کنید.',
      request: ['POST /api/integrations/fetch-preview HTTP/1.1', 'Host: api.example.test', 'Cookie: session=REDACTED', 'Content-Type: application/json', '', '{"url":"https://allowed.example.test/resource"}'].join('\n'),
      response: ['HTTP/1.1 200 OK', 'Content-Type: application/json', '', '{"status":"queued","destination":"allowed.example.test"}'].join('\n'),
      vulnerableCode: ['const target = String(req.body.url ?? "");', 'const response = await fetch(target);', 'res.json({ preview: await response.text() });'].join('\n'),
      secureCode: ['const target = new URL(String(req.body.url ?? ""));', 'assertAllowedOutboundDestination(target);', 'const response = await fetch(target, { redirect: "manual" });', 'res.json({ status: "fetched" });'].join('\n'),
      scenarios: ['پیش‌نمایش URL هر مقصدی را Fetch می‌کند.', 'تستر Webhook به Redirectهای مقصد غیرمنتظره می‌رود.', 'Importer سند خطای Fetch سمت سرور را به کاربر نشان می‌دهد.'],
      developerChecklist: ['به‌جای denylist رشته‌ای از allowlist Host/Service استفاده کن.', 'بعد از DNS و Redirect اعتبارسنجی کن.', 'محدوده private، loopback، link-local و metadata را ببند.', 'Schemeهای غیرضروری را غیرفعال کن.', 'Body پاسخ برگشتی را محدود کن.', 'قانون Egress اضافه کن.'],
      testerChecklist: ['قابلیت‌های URL-fetching را پیدا کن.', 'از مقصد Marker کنترل‌شده آزمایشگاهی استفاده کن.', 'Redirect و DNS change را امن بررسی کن.', 'مقصد مجاز و غیرمجاز را مقایسه کن.', 'Metadata درخواست خروجی را در لاگ بررسی کن.', 'بعد از اصلاح Egress را دوباره تست کن.'],
      misconceptions: [['«سرور پشت Firewall است، پس SSRF بی‌خطر است.»', 'همین Firewall می‌تواند SSRF را ارزشمندتر کند چون سرور به منابع داخلی دسترسی دارد.'], ['«بستن localhost کافی است.»', 'Private range، link-local، Redirect، IPv6 و DNS change هم مهم‌اند.'], ['«SSRF فقط داده می‌خواند.»', 'برخی سرویس‌های داخلی درخواست تغییر وضعیت یا Metadata حساس می‌پذیرند.']],
    },
  }),
  article({
    id: 'jwt',
    slug: 'jwt-vulnerabilities',
    severity: 'Critical',
    relatedLabIds: ['jwt-001', 'jwt-002', 'jwt-003'],
    relatedVulnerabilityIds: ['idor', 'oauth', 'business-logic'],
    mappings: {
      owasp: ['OWASP Top 10 2021 A07: Identification and Authentication Failures'],
      cwe: ['CWE-347: Improper Verification of Cryptographic Signature'],
      portSwigger: 'PortSwigger Web Security Academy: JWT attacks',
    },
    references: [
      { title: 'OWASP JSON Web Token for Java Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html' },
      { title: 'PortSwigger JWT attacks', url: 'https://portswigger.net/web-security/jwt' },
      { title: 'MITRE CWE-347', url: 'https://cwe.mitre.org/data/definitions/347.html' },
      { title: 'RFC 7519 JSON Web Token', url: 'https://www.rfc-editor.org/rfc/rfc7519' },
    ],
    en: {
      title: 'JWT Vulnerabilities',
      summary: 'JWT vulnerabilities arise when tokens are trusted without strict signature, algorithm, claim, lifetime, and key-management validation.',
      layer: 'token-based authentication, stateless sessions, API gateways, and identity integrations',
      mechanism: 'A JWT is a signed set of claims. The server must verify the signature with an expected algorithm and key, then validate issuer, audience, expiry, and application-specific claims. Vulnerabilities appear when the token header controls verification, claims are trusted without policy, or keys are weak or confused.',
      rootCause: 'Specific causes include accepting none or unexpected algorithms, algorithm confusion, weak shared secrets, missing exp/aud/iss validation, trusting client-side decoded payloads, and not rotating compromised keys.',
      attackSurface: 'JWT issues appear in API Authorization headers, session bridging, mobile clients, password reset flows, service tokens, and third-party identity callbacks.',
      lifecycle: 'A tester inspects token structure without treating decoded data as proof, checks server behavior with invalid signatures and claims, compares role and audience enforcement, and confirms failures are rejected without exposing token material.',
      primaryControl: 'Pin accepted algorithms, verify signatures server-side, validate required claims, use strong keys, rotate keys safely, and keep authorization decisions server-side.',
      defenseInDepth: 'Prefer HttpOnly cookies for first-party SPAs where appropriate, use short lifetimes and refresh controls, monitor token failures, and never store verification secrets in frontend bundles.',
      request: ['GET /api/profile HTTP/1.1', 'Host: api.example.test', 'Authorization: REDACTED', 'Accept: application/json'].join('\n'),
      response: ['HTTP/1.1 401 Unauthorized', 'Content-Type: application/json', '', '{"message":"Token validation failed"}'].join('\n'),
      vulnerableCode: ['const payload = decodeJwtWithoutVerify(token);', 'req.user = payload;', 'next();'].join('\n'),
      secureCode: ['const payload = verifyJwt(token, { algorithms: ["RS256"], issuer, audience });', 'authorizeClaims(payload);', 'req.user = payload.sub;'].join('\n'),
      scenarios: ['A server trusts decoded payload data.', 'A weak signing key allows token forgery.', 'A service accepts a token for the wrong audience.'],
      developerChecklist: ['Never trust decoded-only JWT payloads.', 'Pin algorithms.', 'Validate issuer, audience, expiry, and subject.', 'Use strong keys and rotation.', 'Keep secrets server-side.', 'Test invalid signatures.'],
      testerChecklist: ['Check rejection of invalid signatures.', 'Compare audience and issuer enforcement.', 'Test expired token handling.', 'Inspect role claim trust boundaries.', 'Review key rotation behavior.', 'Confirm no token secrets in frontend.'],
      misconceptions: [['“JWT payload is encrypted.”', 'Standard JWT payloads are encoded, not encrypted, unless JWE is used.'], ['“If it decodes, it is valid.”', 'Decoding is not verification.'], ['“Stateless means no server-side authorization.”', 'Claims still need server-side policy decisions.']],
    },
    fa: {
      title: 'آسیب‌پذیری‌های JWT',
      summary: 'ضعف‌های JWT وقتی رخ می‌دهند که Token بدون بررسی سخت‌گیرانه امضا، Algorithm، Claim، عمر Token و مدیریت Key قابل اعتماد فرض شود.',
      layer: 'احراز هویت مبتنی بر Token، نشست Stateless، API gateway و Integration هویتی',
      mechanism: 'JWT مجموعه‌ای از Claimهای امضاشده است. سرور باید امضا را با Algorithm و Key مورد انتظار Verify کند، سپس issuer، audience، expiry و Claimهای خاص برنامه را Validate کند. ضعف زمانی رخ می‌دهد که Header توکن روی Verification اثر بگذارد، Claim بدون Policy پذیرفته شود یا Key ضعیف یا confused باشد.',
      rootCause: 'علت‌های خاص شامل پذیرش none یا Algorithm غیرمنتظره، Algorithm confusion، Secret مشترک ضعیف، نبود اعتبارسنجی exp/aud/iss، اعتماد به Payload Decode شده سمت Client و نچرخاندن Key لو رفته است.',
      attackSurface: 'JWT در Authorization header API، Session bridging، Client موبایل، Password reset، Service token و Callback هویت ثالث دیده می‌شود.',
      lifecycle: 'تستر ساختار Token را بدون فرض اعتبار Payload بررسی می‌کند، رفتار سرور با امضای نامعتبر و Claim متفاوت را می‌سنجد، Role و Audience را مقایسه می‌کند و تأیید می‌کند شکست‌ها بدون افشای Token رد می‌شوند.',
      primaryControl: 'Algorithm مجاز را Pin کنید، امضا را سمت سرور Verify کنید، Claimهای ضروری را Validate کنید، Key قوی استفاده کنید، Key rotation امن داشته باشید و تصمیم Authorization را سمت سرور نگه دارید.',
      defenseInDepth: 'برای SPA اول‌شخص در صورت تناسب Cookie HttpOnly را ترجیح دهید، عمر کوتاه و Refresh کنترل‌شده بگذارید، شکست Token را مانیتور کنید و Secret verification را وارد Bundle فرانت‌اند نکنید.',
      request: ['GET /api/profile HTTP/1.1', 'Host: api.example.test', 'Authorization: REDACTED', 'Accept: application/json'].join('\n'),
      response: ['HTTP/1.1 401 Unauthorized', 'Content-Type: application/json', '', '{"message":"Token validation failed"}'].join('\n'),
      vulnerableCode: ['const payload = decodeJwtWithoutVerify(token);', 'req.user = payload;', 'next();'].join('\n'),
      secureCode: ['const payload = verifyJwt(token, { algorithms: ["RS256"], issuer, audience });', 'authorizeClaims(payload);', 'req.user = payload.sub;'].join('\n'),
      scenarios: ['سرور داده Payload decode شده را اعتماد می‌کند.', 'Signing key ضعیف جعل Token را ممکن می‌کند.', 'سرویس Token با Audience اشتباه را می‌پذیرد.'],
      developerChecklist: ['Payload decode-only را اعتماد نکن.', 'Algorithm را Pin کن.', 'issuer، audience، expiry و subject را Validate کن.', 'Key قوی و Rotation داشته باش.', 'Secret را سمت سرور نگه دار.', 'امضای نامعتبر را تست کن.'],
      testerChecklist: ['رد شدن امضای نامعتبر را بررسی کن.', 'Audience و issuer را مقایسه کن.', 'Expired token را تست کن.', 'مرز اعتماد Role claim را ببین.', 'Key rotation را بررسی کن.', 'نبود Secret در فرانت‌اند را تأیید کن.'],
      misconceptions: [['«Payload JWT رمزنگاری شده است.»', 'در JWT معمولی Payload فقط Encode شده است مگر JWE استفاده شود.'], ['«اگر Decode شد معتبر است.»', 'Decode کردن Verification نیست.'], ['«Stateless یعنی Authorization سمت سرور لازم نیست.»', 'Claimها همچنان باید با Policy سمت سرور بررسی شوند.']],
    },
  }),
  article({
    id: 'nosqli',
    slug: 'nosql-injection',
    severity: 'High',
    relatedLabIds: ['nosqli-001'],
    relatedVulnerabilityIds: ['sqli', 'graphql', 'business-logic'],
    mappings: {
      owasp: ['OWASP Top 10 2021 A03: Injection'],
      cwe: ['CWE-943: Improper Neutralization of Special Elements in Data Query Logic'],
      portSwigger: 'PortSwigger Web Security Academy: NoSQL injection',
    },
    references: [
      { title: 'OWASP WSTG Testing for NoSQL Injection', url: 'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05.6-Testing_for_NoSQL_Injection' },
      { title: 'PortSwigger NoSQL injection', url: 'https://portswigger.net/web-security/nosql-injection' },
      { title: 'MITRE CWE-943', url: 'https://cwe.mitre.org/data/definitions/943.html' },
      { title: 'OWASP Top 10 A03: Injection', url: 'https://owasp.org/Top10/A03_2021-Injection/' },
    ],
    en: {
      title: 'NoSQL Injection',
      summary: 'NoSQL injection occurs when user-controlled data changes database query objects, operators, filters, or JavaScript expressions in NoSQL-backed applications.',
      layer: 'document database queries, JSON filters, authentication lookups, search APIs, and aggregation pipelines',
      mechanism: 'NoSQL queries often use structured objects rather than SQL strings. If JSON body data is merged directly into a query, an attacker may inject operators or alter filter logic so the database evaluates a different condition than intended.',
      rootCause: 'Specific causes include accepting arbitrary JSON objects, failing to enforce scalar types, merging user data into query filters, enabling server-side JavaScript expressions, and weak schema validation.',
      attackSurface: 'NoSQLi appears in login forms, search filters, profile queries, GraphQL resolvers backed by document stores, aggregation endpoints, and APIs that accept flexible JSON filters.',
      lifecycle: 'A tester identifies JSON-backed filtering, sends type-safe baseline values, then changes one field to a harmless structured marker to see whether operators or nested objects are accepted instead of rejected.',
      primaryControl: 'Validate expected types with schemas, build queries from fixed server-side structures, reject unexpected operators, and use database drivers safely.',
      defenseInDepth: 'Disable server-side JavaScript where possible, restrict database privileges, log rejected operator-like input safely, and add tests for object-versus-string confusion.',
      request: ['POST /api/search HTTP/1.1', 'Host: api.example.test', 'Content-Type: application/json', 'Cookie: session=REDACTED', '', '{"username":"LAB_USER"}'].join('\n'),
      response: ['HTTP/1.1 200 OK', 'Content-Type: application/json', '', '{"results":[]}'].join('\n'),
      vulnerableCode: ['const filter = req.body;', 'const users = await db.collection("users").find(filter).toArray();'].join('\n'),
      secureCode: ['const username = assertString(req.body.username);', 'const users = await db.collection("users").find({ username }).toArray();'].join('\n'),
      scenarios: ['A login query accepts an object instead of a string.', 'A search endpoint passes arbitrary JSON to a document database.', 'An aggregation API exposes operator selection to users.'],
      developerChecklist: ['Validate scalar types.', 'Reject unexpected keys and operators.', 'Construct filters server-side.', 'Disable server-side JavaScript.', 'Use schema validation.', 'Test object injection cases.'],
      testerChecklist: ['Compare string and object input.', 'Check unexpected operator rejection.', 'Test nested JSON keys.', 'Review authentication filters.', 'Inspect aggregation endpoints.', 'Retest schema validation.'],
      misconceptions: [['“NoSQL means no injection.”', 'Injection can target query objects and operators, not only SQL strings.'], ['“JSON is safe because it is structured.”', 'Structure can be abused if arbitrary objects become query filters.'], ['“Schema-less databases need schema-less APIs.”', 'Applications can and should validate API shapes.']],
    },
    fa: {
      title: 'تزریق NoSQL',
      summary: 'NoSQL Injection زمانی رخ می‌دهد که داده تحت کنترل کاربر Objectهای Query، Operatorها، Filterها یا عبارت‌های JavaScript پایگاه NoSQL را تغییر دهد.',
      layer: 'Queryهای Document database، JSON filter، Lookup احراز هویت، Search API و Aggregation pipeline',
      mechanism: 'Queryهای NoSQL معمولاً Object ساختاریافته هستند نه رشته SQL. اگر داده JSON مستقیم داخل Query merge شود، مهاجم می‌تواند Operator تزریق کند یا منطق Filter را تغییر دهد تا پایگاه داده شرطی متفاوت را ارزیابی کند.',
      rootCause: 'علت‌های خاص شامل پذیرش JSON object دلخواه، enforce نکردن Scalar type، Merge داده کاربر در Query filter، فعال بودن JavaScript سمت پایگاه داده و Schema validation ضعیف است.',
      attackSurface: 'NoSQLi در فرم ورود، فیلتر جستجو، Query پروفایل، Resolverهای GraphQL متصل به Document store، Endpointهای Aggregation و APIهای دارای JSON filter انعطاف‌پذیر دیده می‌شود.',
      lifecycle: 'تستر Filtering مبتنی بر JSON را پیدا می‌کند، مقدار پایه Type-safe می‌فرستد، سپس یک Field را به Marker ساختاریافته بی‌خطر تغییر می‌دهد تا ببیند Operator یا Object nested پذیرفته می‌شود یا رد.',
      primaryControl: 'Type مورد انتظار را با Schema Validate کنید، Query را از ساختار ثابت سمت سرور بسازید، Operator غیرمنتظره را رد کنید و Driver پایگاه داده را امن به‌کار ببرید.',
      defenseInDepth: 'JavaScript سمت پایگاه داده را در صورت امکان غیرفعال کنید، مجوز DB را محدود کنید، ورودی شبیه Operator را امن لاگ کنید و برای سردرگمی Object/String تست بنویسید.',
      request: ['POST /api/search HTTP/1.1', 'Host: api.example.test', 'Content-Type: application/json', 'Cookie: session=REDACTED', '', '{"username":"LAB_USER"}'].join('\n'),
      response: ['HTTP/1.1 200 OK', 'Content-Type: application/json', '', '{"results":[]}'].join('\n'),
      vulnerableCode: ['const filter = req.body;', 'const users = await db.collection("users").find(filter).toArray();'].join('\n'),
      secureCode: ['const username = assertString(req.body.username);', 'const users = await db.collection("users").find({ username }).toArray();'].join('\n'),
      scenarios: ['Query ورود به‌جای String یک Object را می‌پذیرد.', 'Endpoint جستجو JSON دلخواه را مستقیم به Document database می‌دهد.', 'Aggregation API انتخاب Operator را به کاربر می‌دهد.'],
      developerChecklist: ['Scalar type را Validate کن.', 'Key و Operator غیرمنتظره را رد کن.', 'Filter را سمت سرور بساز.', 'JavaScript سمت DB را ببند.', 'Schema validation استفاده کن.', 'Object injection را تست کن.'],
      testerChecklist: ['ورودی String و Object را مقایسه کن.', 'رد Operator غیرمنتظره را بررسی کن.', 'Nested JSON key را تست کن.', 'Filter احراز هویت را ببین.', 'Aggregation endpoint را بررسی کن.', 'Schema validation را دوباره تست کن.'],
      misconceptions: [['«NoSQL یعنی Injection نداریم.»', 'Injection می‌تواند Query object و Operator را هدف بگیرد، نه فقط رشته SQL.'], ['«JSON چون ساختاریافته است امن است.»', 'اگر Object دلخواه Query filter شود، همین ساختار قابل سوءاستفاده است.'], ['«Database بدون Schema یعنی API هم بدون Schema باشد.»', 'برنامه باید شکل API را Validate کند.']],
    },
  }),
  article({
    id: 'rce',
    slug: 'remote-code-execution',
    severity: 'Critical',
    relatedLabIds: ['cmdi-001', 'cmdi-002'],
    relatedVulnerabilityIds: ['ssti', 'file-upload', 'deserialization'],
    mappings: {
      owasp: ['OWASP Top 10 2021 A03: Injection'],
      cwe: ['CWE-78: Improper Neutralization of Special Elements used in an OS Command'],
      portSwigger: 'PortSwigger Web Security Academy: OS command injection',
    },
    references: [
      { title: 'OWASP Command Injection', url: 'https://owasp.org/www-community/attacks/Command_Injection' },
      { title: 'OWASP OS Command Injection Defense Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html' },
      { title: 'OWASP Top 10 A03: Injection', url: 'https://owasp.org/Top10/A03_2021-Injection/' },
      { title: 'PortSwigger OS Command Injection', url: 'https://portswigger.net/web-security/os-command-injection' },
      { title: 'MITRE CWE-78', url: 'https://cwe.mitre.org/data/definitions/78.html' },
    ],
    en: {
      title: 'Remote Code Execution (RCE)',
      summary: 'RCE allows attacker-influenced data to reach an execution sink such as an operating-system command, template engine, deserializer, or plugin runner.',
      layer: 'server-side command execution, template rendering, job workers, plugin systems, and integration helpers',
      mechanism: 'RCE is a consequence class: untrusted data crosses from data into executable instructions. In command injection, the sink is a shell or process launcher; in other variants it may be a template interpreter, dynamic include, unsafe deserializer, or script runner.',
      rootCause: 'Specific causes include shelling out with concatenated input, passing user data to interpreters, allowing arbitrary templates or plugins, excessive worker privileges, and exposing diagnostic utilities through web routes.',
      attackSurface: 'RCE-prone surfaces include network diagnostic tools, PDF generators, template previews, import converters, image processors, background job payloads, and administrative automation screens.',
      lifecycle: 'A tester maps execution-adjacent features, sends a non-destructive marker, observes timing or output differences, confirms the vulnerable sink with harmless behavior, and records evidence without executing destructive commands or reading secrets.',
      primaryControl: 'Avoid shell invocation; use safe library APIs, fixed argument arrays, allowlists, sandboxing, and framework authorization before any execution-adjacent action.',
      defenseInDepth: 'Run workers as low-privilege users, isolate containers, disable dangerous functions, restrict filesystem and network access, and alert on unexpected process launches.',
      request: ['POST /api/tools/diagnostic HTTP/1.1', 'Host: api.example.test', 'Cookie: session=REDACTED', 'Content-Type: application/json', '', '{"target":"LAB_SAFE_HOST"}'].join('\n'),
      response: ['HTTP/1.1 200 OK', 'Content-Type: application/json', '', '{"status":"validated","output":"REDACTED"}'].join('\n'),
      vulnerableCode: ['const target = String(req.body.target ?? "");', 'exec(`ping ${target}`, (error, stdout) => res.send(stdout));'].join('\n'),
      secureCode: ['const target = validateHost(req.body.target);', 'execFile("ping", ["-c", "1", target], { timeout: 3000 }, handleResult);'].join('\n'),
      scenarios: ['A diagnostic helper concatenates a host into a shell command.', 'A template preview evaluates untrusted expressions.', 'A converter runs a user-selected binary option.'],
      developerChecklist: ['Do not concatenate shell commands.', 'Prefer library APIs over process execution.', 'Use argument arrays and allowlists.', 'Run workers with low privileges.', 'Disable execution in templates.', 'Test blocked metacharacters safely.'],
      testerChecklist: ['Identify execution-adjacent features.', 'Use harmless timing or marker probes.', 'Avoid destructive commands.', 'Check worker privileges conceptually.', 'Review process logs.', 'Retest sandbox boundaries.'],
      misconceptions: [['“Only admin tools can have RCE.”', 'Background and import features reachable by regular users can also execute server-side code paths.'], ['“Escaping a few characters is enough.”', 'Shell parsing is complex; avoiding the shell is safer.'], ['“RCE always means root access.”', 'Impact depends on the privileges and isolation of the process.']],
    },
    fa: {
      title: 'اجرای کد از راه دور (RCE)',
      summary: 'RCE زمانی رخ می‌دهد که داده تحت تأثیر مهاجم به Sink اجرایی مثل فرمان سیستم‌عامل، Template engine، Deserializer یا Plugin runner برسد.',
      layer: 'اجرای فرمان سمت سرور، Template rendering، Workerهای Job، Plugin system و helperهای Integration',
      mechanism: 'RCE یک کلاس پیامد است: داده غیرقابل اعتماد از مرز Data عبور کرده و به دستور اجرایی تبدیل می‌شود. در Command injection، Sink یک Shell یا Process launcher است؛ در گونه‌های دیگر ممکن است Template interpreter، include پویا، Deserializer ناامن یا Script runner باشد.',
      rootCause: 'علت‌های خاص شامل اجرای Shell با ورودی چسبانده‌شده، دادن داده کاربر به Interpreter، اجازه Template یا Plugin دلخواه، مجوز زیاد Worker و نمایش ابزارهای Diagnostic از طریق Route وب است.',
      attackSurface: 'سطح RCE شامل ابزارهای عیب‌یابی شبکه، PDF generator، Template preview، Import converter، Image processor، Payloadهای Job و صفحه‌های Automation مدیریتی است.',
      lifecycle: 'تستر قابلیت نزدیک به اجرا را نقشه‌برداری می‌کند، Marker غیرمخرب می‌فرستد، تفاوت زمان یا خروجی را می‌بیند، Sink آسیب‌پذیر را با رفتار بی‌خطر تأیید می‌کند و بدون اجرای دستور مخرب یا خواندن Secret شواهد می‌گیرد.',
      primaryControl: 'از Shell invocation پرهیز کنید؛ API کتابخانه امن، آرایه Argument ثابت، allowlist، Sandbox و Authorization Framework را قبل از هر عمل نزدیک به اجرا به‌کار ببرید.',
      defenseInDepth: 'Worker را با کاربر کم‌مجوز اجرا کنید، Container را ایزوله کنید، Function خطرناک را ببندید، Filesystem و Network را محدود کنید و روی Process launch غیرمنتظره Alert بگذارید.',
      request: ['POST /api/tools/diagnostic HTTP/1.1', 'Host: api.example.test', 'Cookie: session=REDACTED', 'Content-Type: application/json', '', '{"target":"LAB_SAFE_HOST"}'].join('\n'),
      response: ['HTTP/1.1 200 OK', 'Content-Type: application/json', '', '{"status":"validated","output":"REDACTED"}'].join('\n'),
      vulnerableCode: ['const target = String(req.body.target ?? "");', 'exec(`ping ${target}`, (error, stdout) => res.send(stdout));'].join('\n'),
      secureCode: ['const target = validateHost(req.body.target);', 'execFile("ping", ["-c", "1", target], { timeout: 3000 }, handleResult);'].join('\n'),
      scenarios: ['helper عیب‌یابی Host را داخل Shell command می‌چسباند.', 'Template preview عبارت غیرقابل اعتماد را Evaluate می‌کند.', 'Converter گزینه Binary انتخاب‌شده توسط کاربر را اجرا می‌کند.'],
      developerChecklist: ['Shell command را با Concatenation نساز.', 'به‌جای Process execution از API کتابخانه استفاده کن.', 'Argument array و allowlist به‌کار ببر.', 'Worker را کم‌مجوز اجرا کن.', 'اجرای Template را ببند.', 'متاکاراکترها را امن تست کن.'],
      testerChecklist: ['قابلیت نزدیک به اجرا را پیدا کن.', 'از Probe بی‌خطر Timing یا Marker استفاده کن.', 'دستور مخرب اجرا نکن.', 'Privilege Worker را مفهومی بررسی کن.', 'Process log را ببین.', 'مرز Sandbox را دوباره تست کن.'],
      misconceptions: [['«RCE فقط در ابزار Admin رخ می‌دهد.»', 'Background و Import feature قابل دسترسی کاربر عادی هم می‌تواند مسیر اجرای سرور داشته باشد.'], ['«Escape چند کاراکتر کافی است.»', 'Parsing در Shell پیچیده است؛ حذف Shell امن‌تر است.'], ['«RCE همیشه یعنی Root access.»', 'اثر به مجوز و Isolation پردازش بستگی دارد.']],
    },
  }),
  article({
    id: 'idor',
    slug: 'idor',
    severity: 'High',
    relatedLabIds: ['idor-001', 'idor-002'],
    relatedVulnerabilityIds: ['jwt', 'oauth', 'business-logic'],
    mappings: {
      owasp: ['OWASP Top 10 2021 A01: Broken Access Control', 'OWASP API1:2023 Broken Object Level Authorization'],
      cwe: ['CWE-639: Authorization Bypass Through User-Controlled Key'],
      portSwigger: 'PortSwigger Web Security Academy: Access control vulnerabilities and privilege escalation',
    },
    references: [
      { title: 'OWASP Insecure Direct Object Reference Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html' },
      { title: 'OWASP API1:2023 Broken Object Level Authorization', url: 'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/' },
      { title: 'PortSwigger Access Control', url: 'https://portswigger.net/web-security/access-control' },
      { title: 'MITRE CWE-639', url: 'https://cwe.mitre.org/data/definitions/639.html' },
    ],
    en: {
      title: 'Insecure Direct Object Reference (IDOR)',
      summary: 'IDOR occurs when the server uses user-controlled object identifiers without verifying that the authenticated user is allowed to access that object.',
      layer: 'object-level authorization, API resource routing, account ownership checks, and multi-tenant data access',
      mechanism: 'The request contains an identifier such as a user ID, order ID, document ID, UUID, or slug. Authentication proves who the caller is, but the server fails to verify whether that caller owns or may access the referenced object.',
      rootCause: 'Specific causes include fetching records by ID before authorization, trusting hidden form fields, missing policy checks, relying on unpredictable IDs as authorization, and inconsistent tenant scoping in queries.',
      attackSurface: 'IDOR appears in profile routes, order history, invoices, file downloads, messages, admin APIs, GraphQL IDs, export jobs, and mobile API endpoints.',
      lifecycle: 'A tester records a baseline request for one user, changes only the object identifier to a different test-owned object, compares status and response data, and confirms whether server-side authorization blocks access.',
      primaryControl: 'Enforce object-level authorization for every access using policies, scoped queries, tenant constraints, and server-derived user identity.',
      defenseInDepth: 'Use non-guessable IDs as privacy support only, add audit logs for denied object access, and write tests with two users and two objects.',
      request: ['GET /api/orders/RESOURCE_ID HTTP/1.1', 'Host: api.example.test', 'Cookie: session=REDACTED', 'Accept: application/json'].join('\n'),
      response: ['HTTP/1.1 403 Forbidden', 'Content-Type: application/json', '', '{"message":"This resource is not available to the current user."}'].join('\n'),
      vulnerableCode: ['const order = await Order.find(req.params.id);', 'return res.json(order);'].join('\n'),
      secureCode: ['const order = await Order.findOwnedBy(req.user.id, req.params.id);', 'authorize("view", order);', 'return res.json(order);'].join('\n'),
      scenarios: ['A user changes an order identifier.', 'An export job accepts another account’s document ID.', 'A GraphQL node lookup returns cross-tenant data.'],
      developerChecklist: ['Use policies for object access.', 'Scope queries by current user or tenant.', 'Ignore client-supplied user IDs.', 'Test two-user denial cases.', 'Audit denied object access.', 'Do not treat UUIDs as authorization.'],
      testerChecklist: ['Create two test users and objects.', 'Change only the object ID.', 'Compare 403 and 404 behavior.', 'Check nested objects and exports.', 'Review logs for denied attempts.', 'Retest after policy changes.'],
      misconceptions: [['“Authentication means authorization.”', 'A logged-in user still needs permission for each object.'], ['“UUIDs fix IDOR.”', 'UUIDs reduce guessing but do not prove ownership.'], ['“The UI hides the link.”', 'Attackers can call APIs directly.']],
    },
    fa: {
      title: 'ارجاع مستقیم ناامن به شیء (IDOR)',
      summary: 'IDOR زمانی رخ می‌دهد که سرور از شناسه شیء تحت کنترل کاربر استفاده کند اما بررسی نکند کاربر احراز هویت‌شده اجازه دسترسی به همان شیء را دارد یا نه.',
      layer: 'Authorization در سطح Object، Routing منبع API، بررسی مالکیت حساب و دسترسی داده Multi-tenant',
      mechanism: 'درخواست شامل شناسه‌ای مثل User ID، Order ID، Document ID، UUID یا Slug است. Authentication ثابت می‌کند فراخواننده کیست، اما سرور بررسی نمی‌کند آیا همان کاربر مالک یا مجاز به دسترسی به Object ارجاع‌شده هست یا نه.',
      rootCause: 'علت‌های خاص شامل گرفتن Record با ID قبل از Authorization، اعتماد به Hidden field، نبود Policy check، تکیه بر ID غیرقابل حدس به‌عنوان Authorization و Tenant scoping ناسازگار در Query است.',
      attackSurface: 'IDOR در Profile route، تاریخچه سفارش، Invoice، File download، Message، Admin API، GraphQL ID، Export job و Endpoint موبایل دیده می‌شود.',
      lifecycle: 'تستر درخواست پایه یک کاربر را ثبت می‌کند، فقط شناسه Object را به Object متعلق به حساب تست دیگر تغییر می‌دهد، Status و داده پاسخ را مقایسه می‌کند و تأیید می‌کند Authorization سمت سرور دسترسی را می‌بندد.',
      primaryControl: 'برای هر دسترسی Object-level authorization را با Policy، Query scoped، Tenant constraint و هویت استخراج‌شده از سرور enforce کنید.',
      defenseInDepth: 'ID غیرقابل حدس فقط کمک حریم خصوصی است؛ لاگ Audit برای دسترسی ردشده اضافه کنید و تست دو کاربر و دو Object بنویسید.',
      request: ['GET /api/orders/RESOURCE_ID HTTP/1.1', 'Host: api.example.test', 'Cookie: session=REDACTED', 'Accept: application/json'].join('\n'),
      response: ['HTTP/1.1 403 Forbidden', 'Content-Type: application/json', '', '{"message":"This resource is not available to the current user."}'].join('\n'),
      vulnerableCode: ['const order = await Order.find(req.params.id);', 'return res.json(order);'].join('\n'),
      secureCode: ['const order = await Order.findOwnedBy(req.user.id, req.params.id);', 'authorize("view", order);', 'return res.json(order);'].join('\n'),
      scenarios: ['کاربر شناسه سفارش را تغییر می‌دهد.', 'Export job شناسه سند حساب دیگر را می‌پذیرد.', 'GraphQL node lookup داده Cross-tenant برمی‌گرداند.'],
      developerChecklist: ['برای Object access از Policy استفاده کن.', 'Query را با کاربر یا Tenant فعلی Scope کن.', 'User ID ارسالی Client را نادیده بگیر.', 'تست Deny دو کاربر بنویس.', 'دسترسی ردشده را Audit کن.', 'UUID را Authorization فرض نکن.'],
      testerChecklist: ['دو کاربر و دو Object تست بساز.', 'فقط Object ID را تغییر بده.', 'رفتار 403 و 404 را مقایسه کن.', 'Objectهای Nested و Export را بررسی کن.', 'لاگ تلاش ردشده را ببین.', 'بعد از تغییر Policy دوباره تست کن.'],
      misconceptions: [['«Authentication یعنی Authorization.»', 'کاربر واردشده همچنان برای هر Object نیاز به مجوز دارد.'], ['«UUID مشکل IDOR را حل می‌کند.»', 'UUID حدس زدن را سخت می‌کند اما مالکیت را ثابت نمی‌کند.'], ['«UI لینک را نشان نمی‌دهد.»', 'مهاجم می‌تواند API را مستقیم فراخوانی کند.']],
    },
  }),
  article({
    id: 'xxe',
    slug: 'xxe',
    severity: 'Critical',
    relatedLabIds: ['xxe-001', 'xxe-002'],
    relatedVulnerabilityIds: ['ssrf', 'file-upload', 'rce'],
    mappings: {
      owasp: ['OWASP Top 10 2021 A05: Security Misconfiguration'],
      cwe: ['CWE-611: Improper Restriction of XML External Entity Reference'],
      portSwigger: 'PortSwigger Web Security Academy: XML external entity injection',
    },
    references: [
      { title: 'OWASP XXE Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html' },
      { title: 'OWASP XML External Entity Processing', url: 'https://owasp.org/www-community/vulnerabilities/XML_External_Entity_%28XXE%29_Processing' },
      { title: 'OWASP XML Security Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/XML_Security_Cheat_Sheet.html' },
      { title: 'PortSwigger XXE', url: 'https://portswigger.net/web-security/xxe' },
      { title: 'MITRE CWE-611', url: 'https://cwe.mitre.org/data/definitions/611.html' },
    ],
    en: {
      title: 'XML External Entity (XXE)',
      summary: 'XXE happens when an XML parser processes external entities or DTD features from untrusted XML, enabling file disclosure, SSRF-like requests, or parser abuse.',
      layer: 'XML parsers, document importers, SOAP-style APIs, SVG processors, and file metadata pipelines',
      mechanism: 'An XML document may declare entities and document type definitions. If the parser resolves external entities from untrusted input, it can read local resources or make outbound requests while constructing the parsed document.',
      rootCause: 'Specific causes include DTDs enabled by default, parser features not explicitly disabled, accepting XML where JSON would suffice, processing uploaded XML-derived formats, and returning parser expansion output to the user.',
      attackSurface: 'XXE appears in XML APIs, stock or inventory messages, SAML/SOAP integrations, SVG image processing, office document import, RSS feeds, and background parsers.',
      lifecycle: 'A tester identifies XML parsing, submits a harmless document with a safe marker, observes parser behavior, checks whether DTDs are rejected, and verifies that external entity resolution is disabled without reading local system files.',
      primaryControl: 'Disable DTDs and external entity resolution in every XML parser, prefer simpler formats where possible, and use hardened parser factories with secure defaults.',
      defenseInDepth: 'Run parsers with low privileges, isolate file processing, block outbound network access from parser workers, and avoid returning raw parser errors.',
      request: ['POST /api/xml/import HTTP/1.1', 'Host: api.example.test', 'Content-Type: application/xml', 'Cookie: session=REDACTED', '', '<document><name>LAB_XML_MARKER</name></document>'].join('\n'),
      response: ['HTTP/1.1 202 Accepted', 'Content-Type: application/json', '', '{"status":"accepted"}'].join('\n'),
      vulnerableCode: ['const parser = new XMLParser({ processEntities: true });', 'const parsed = parser.parse(req.body);', 'res.json(parsed);'].join('\n'),
      secureCode: ['const parser = new XMLParser({ processEntities: false });', 'rejectDoctype(req.body);', 'const parsed = parser.parse(req.body);'].join('\n'),
      scenarios: ['An XML API resolves external entities.', 'An SVG upload is parsed by a library with XML features enabled.', 'A SOAP integration returns parser errors to authenticated users.'],
      developerChecklist: ['Disable DTDs and external entities.', 'Reject unexpected XML input.', 'Harden SVG and document processors.', 'Run parsers with low filesystem privileges.', 'Block parser worker egress.', 'Add parser regression tests.'],
      testerChecklist: ['Confirm XML parsing exists.', 'Use harmless markers, not local file targets.', 'Check DTD rejection.', 'Compare direct and background parser behavior.', 'Inspect parser error handling.', 'Retest uploaded XML-derived formats.'],
      misconceptions: [['“We do not expose XML APIs.”', 'SVG, office files, SAML, SOAP, and feeds may still use XML parsers.'], ['“Modern parsers are safe by default.”', 'Defaults vary by language, library, and version.'], ['“XXE is only file disclosure.”', 'It can also cause SSRF-like requests or denial of service depending on parser behavior.']],
    },
    fa: {
      title: 'موجودیت خارجی XML (XXE)',
      summary: 'XXE زمانی رخ می‌دهد که Parser XML موجودیت خارجی یا قابلیت DTD را از XML غیرقابل اعتماد پردازش کند و به افشای فایل، درخواست شبیه SSRF یا سوءاستفاده از Parser منجر شود.',
      layer: 'Parserهای XML، Importer سند، APIهای شبیه SOAP، پردازشگر SVG و Pipelineهای Metadata فایل',
      mechanism: 'سند XML می‌تواند Entity و DTD تعریف کند. اگر Parser موجودیت خارجی ورودی غیرقابل اعتماد را Resolve کند، هنگام ساخت سند Parsed می‌تواند منبع محلی بخواند یا درخواست خروجی بفرستد.',
      rootCause: 'علت‌های خاص شامل فعال بودن DTD پیش‌فرض، غیرفعال نکردن Featureهای Parser، پذیرش XML وقتی JSON کافی است، پردازش Formatهای مبتنی بر XML و برگرداندن خروجی Expansion به کاربر است.',
      attackSurface: 'XXE در APIهای XML، پیام‌های Inventory، SAML/SOAP، پردازش SVG، Import سندهای Office، Feedهای RSS و Parserهای پس‌زمینه دیده می‌شود.',
      lifecycle: 'تستر وجود XML parsing را پیدا می‌کند، سند بی‌خطر با Marker می‌فرستد، رفتار Parser را می‌بیند، رد شدن DTD را بررسی می‌کند و بدون خواندن فایل سیستم واقعی تأیید می‌کند External entity resolution غیرفعال است.',
      primaryControl: 'DTD و External entity resolution را در همه Parserهای XML غیرفعال کنید، در صورت امکان Format ساده‌تر استفاده کنید و Parser factoryهای Harden شده با پیش‌فرض امن بسازید.',
      defenseInDepth: 'Parser را با مجوز کم اجرا کنید، پردازش فایل را ایزوله کنید، دسترسی خروجی Worker را ببندید و خطای خام Parser را به کاربر برنگردانید.',
      request: ['POST /api/xml/import HTTP/1.1', 'Host: api.example.test', 'Content-Type: application/xml', 'Cookie: session=REDACTED', '', '<document><name>LAB_XML_MARKER</name></document>'].join('\n'),
      response: ['HTTP/1.1 202 Accepted', 'Content-Type: application/json', '', '{"status":"accepted"}'].join('\n'),
      vulnerableCode: ['const parser = new XMLParser({ processEntities: true });', 'const parsed = parser.parse(req.body);', 'res.json(parsed);'].join('\n'),
      secureCode: ['const parser = new XMLParser({ processEntities: false });', 'rejectDoctype(req.body);', 'const parsed = parser.parse(req.body);'].join('\n'),
      scenarios: ['API XML موجودیت خارجی را Resolve می‌کند.', 'SVG upload با Library دارای XML feature فعال پردازش می‌شود.', 'Integration SOAP خطای Parser را به کاربر احراز هویت‌شده نشان می‌دهد.'],
      developerChecklist: ['DTD و External entity را غیرفعال کن.', 'XML غیرمنتظره را رد کن.', 'پردازشگر SVG و سند را Harden کن.', 'Parser را با مجوز کم اجرا کن.', 'Egress Worker پردازش را ببند.', 'Regression test برای Parser اضافه کن.'],
      testerChecklist: ['وجود XML parsing را تأیید کن.', 'از Marker بی‌خطر استفاده کن نه هدف فایل محلی.', 'رد شدن DTD را بررسی کن.', 'رفتار Parser مستقیم و پس‌زمینه را مقایسه کن.', 'خطای Parser را بررسی کن.', 'Formatهای مبتنی بر XML را دوباره تست کن.'],
      misconceptions: [['«ما API XML نداریم.»', 'SVG، Office file، SAML، SOAP و Feed ممکن است همچنان XML parser داشته باشند.'], ['«Parserهای جدید امن‌اند.»', 'Defaultها بین زبان، Library و نسخه متفاوت‌اند.'], ['«XXE فقط افشای فایل است.»', 'بسته به Parser می‌تواند درخواست شبیه SSRF یا DoS هم ایجاد کند.']],
    },
  }),
  article({
    id: 'ssti',
    slug: 'ssti',
    severity: 'Critical',
    relatedLabIds: ['ssti-001', 'ssti-002'],
    relatedVulnerabilityIds: ['rce', 'xss', 'file-upload'],
    mappings: {
      owasp: ['OWASP Top 10 2021 A03: Injection'],
      cwe: ['CWE-1336: Improper Neutralization of Special Elements Used in a Template Engine'],
      portSwigger: 'PortSwigger Web Security Academy: Server-side template injection',
    },
    references: [
      { title: 'PortSwigger SSTI', url: 'https://portswigger.net/web-security/server-side-template-injection' },
      { title: 'MITRE CWE-1336', url: 'https://cwe.mitre.org/data/definitions/1336.html' },
      { title: 'OWASP Top 10 A03: Injection', url: 'https://owasp.org/Top10/A03_2021-Injection/' },
      { title: 'OWASP WSTG Testing for SSTI', url: 'https://owasp.org/www-project-web-security-testing-guide/v41/4-Web_Application_Security_Testing/07-Input_Validation_Testing/18-Testing_for_Server_Side_Template_Injection' },
    ],
    en: {
      title: 'Server-Side Template Injection (SSTI)',
      summary: 'SSTI occurs when user-controlled input is interpreted by a server-side template engine rather than rendered as inert text.',
      layer: 'template rendering, email templates, PDF generation, CMS previews, and server-side personalization',
      mechanism: 'Template engines evaluate expressions, filters, and helpers before producing HTML, text, or documents. If untrusted input becomes template source, the engine may evaluate attacker-controlled expressions inside the server process.',
      rootCause: 'Specific causes include rendering user input as template source, exposing preview features without sandboxing, allowing custom templates for low-trust users, and granting templates access to powerful objects.',
      attackSurface: 'SSTI appears in email template editors, CMS blocks, invoice/PDF generators, error pages, notification previews, theme customization, and support macros.',
      lifecycle: 'A tester identifies a template-rendered field, submits a harmless expression marker, compares literal rendering with evaluated output, then verifies sandboxing and object access without executing destructive actions.',
      primaryControl: 'Render user content as data, not template source; restrict template editing to trusted roles; sandbox engines; and expose only minimal helper objects.',
      defenseInDepth: 'Run renderers with low privileges, separate preview workers, restrict filesystem/network access, and add tests for expression markers.',
      request: ['POST /api/templates/preview HTTP/1.1', 'Host: api.example.test', 'Cookie: session=REDACTED', 'Content-Type: application/json', '', '{"body":"Hello LAB_TEMPLATE_MARKER"}'].join('\n'),
      response: ['HTTP/1.1 200 OK', 'Content-Type: application/json', '', '{"preview":"Hello LAB_TEMPLATE_MARKER"}'].join('\n'),
      vulnerableCode: ['const body = String(req.body.body ?? "");', 'const output = templateEngine.render(body, context);'].join('\n'),
      secureCode: ['const body = escapeTemplateText(String(req.body.body ?? ""));', 'const output = renderApprovedTemplate("notification", { body });'].join('\n'),
      scenarios: ['A preview feature evaluates user-supplied template text.', 'A low-trust user can edit server-side notification templates.', 'A PDF generator exposes template helpers to untrusted content.'],
      developerChecklist: ['Separate template source from user data.', 'Restrict template authoring.', 'Sandbox template engines.', 'Limit helper objects.', 'Disable dangerous filters.', 'Test expression markers.'],
      testerChecklist: ['Find server-rendered preview features.', 'Use harmless expression markers.', 'Check literal versus evaluated output.', 'Review helper exposure.', 'Inspect renderer isolation.', 'Retest sandbox escapes safely.'],
      misconceptions: [['“Template injection is client-side XSS.”', 'SSTI evaluates on the server and can have different impact.'], ['“Only admin templates matter.”', 'Support macros and personalization fields may also render server-side.'], ['“Escaping HTML fixes SSTI.”', 'The issue is template evaluation before HTML output.']],
    },
    fa: {
      title: 'تزریق قالب سمت سرور (SSTI)',
      summary: 'SSTI وقتی رخ می‌دهد که ورودی کاربر توسط Template engine سمت سرور تفسیر شود، نه اینکه به‌صورت متن بی‌اثر رندر شود.',
      layer: 'Template rendering، قالب ایمیل، PDF generation، Preview در CMS و Personalization سمت سرور',
      mechanism: 'Template engine پیش از تولید HTML، متن یا سند، Expression، Filter و Helper را Evaluate می‌کند. اگر ورودی غیرقابل اعتماد به Template source تبدیل شود، Engine ممکن است عبارت تحت کنترل مهاجم را داخل Process سرور اجرا کند.',
      rootCause: 'علت‌های خاص شامل رندر ورودی کاربر به‌عنوان Template source، Preview بدون Sandbox، اجازه Custom template به کاربر کم‌اعتماد و دسترسی Template به Objectهای قدرتمند است.',
      attackSurface: 'SSTI در Editor قالب ایمیل، Blockهای CMS، Generator فاکتور/PDF، Error page، Notification preview، Theme customization و Macro پشتیبانی دیده می‌شود.',
      lifecycle: 'تستر Field رندرشده با Template را پیدا می‌کند، Marker عبارت بی‌خطر می‌فرستد، Literal rendering را با خروجی Evaluate شده مقایسه می‌کند و بدون عمل مخرب Sandbox و دسترسی Object را بررسی می‌کند.',
      primaryControl: 'محتوای کاربر را Data رندر کنید نه Template source؛ ویرایش Template را به Role قابل اعتماد محدود کنید؛ Engine را Sandbox کنید و فقط Helperهای حداقلی expose کنید.',
      defenseInDepth: 'Renderer را کم‌مجوز اجرا کنید، Worker preview را جدا کنید، Filesystem/Network را محدود کنید و برای Markerهای Expression تست اضافه کنید.',
      request: ['POST /api/templates/preview HTTP/1.1', 'Host: api.example.test', 'Cookie: session=REDACTED', 'Content-Type: application/json', '', '{"body":"Hello LAB_TEMPLATE_MARKER"}'].join('\n'),
      response: ['HTTP/1.1 200 OK', 'Content-Type: application/json', '', '{"preview":"Hello LAB_TEMPLATE_MARKER"}'].join('\n'),
      vulnerableCode: ['const body = String(req.body.body ?? "");', 'const output = templateEngine.render(body, context);'].join('\n'),
      secureCode: ['const body = escapeTemplateText(String(req.body.body ?? ""));', 'const output = renderApprovedTemplate("notification", { body });'].join('\n'),
      scenarios: ['قابلیت Preview متن Template ارسالی کاربر را Evaluate می‌کند.', 'کاربر کم‌اعتماد می‌تواند قالب Notification سمت سرور را ویرایش کند.', 'PDF generator helperهای Template را به محتوای غیرقابل اعتماد expose می‌کند.'],
      developerChecklist: ['Template source را از User data جدا کن.', 'Template authoring را محدود کن.', 'Engine را Sandbox کن.', 'Helper objectها را محدود کن.', 'Filter خطرناک را ببند.', 'Expression marker را تست کن.'],
      testerChecklist: ['Previewهای Server-rendered را پیدا کن.', 'از Marker عبارت بی‌خطر استفاده کن.', 'Literal و Evaluated output را مقایسه کن.', 'Helper exposure را بررسی کن.', 'Isolation renderer را ببین.', 'Sandbox escape را امن دوباره تست کن.'],
      misconceptions: [['«Template injection همان XSS سمت Client است.»', 'SSTI روی سرور Evaluate می‌شود و اثر متفاوتی دارد.'], ['«فقط قالب‌های Admin مهم‌اند.»', 'Macro پشتیبانی و Fieldهای Personalization هم ممکن است سمت سرور رندر شوند.'], ['«HTML escaping SSTI را حل می‌کند.»', 'مشکل Evaluation قالب قبل از خروجی HTML است.']],
    },
  }),
  article({
    id: 'file-upload',
    slug: 'file-upload-vulnerabilities',
    severity: 'Critical',
    relatedLabIds: ['fileupload-001', 'fileupload-002'],
    relatedVulnerabilityIds: ['path-traversal', 'rce', 'xxe'],
    mappings: {
      owasp: ['OWASP Top 10 2021 A05: Security Misconfiguration'],
      cwe: ['CWE-434: Unrestricted Upload of File with Dangerous Type'],
      portSwigger: 'PortSwigger Web Security Academy: File upload vulnerabilities',
    },
    references: [
      { title: 'OWASP File Upload Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html' },
      { title: 'OWASP Unrestricted File Upload', url: 'https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload' },
      { title: 'PortSwigger File Upload Vulnerabilities', url: 'https://portswigger.net/web-security/file-upload' },
      { title: 'MITRE CWE-434', url: 'https://cwe.mitre.org/data/definitions/434.html' },
      { title: 'Laravel Validation: Files', url: 'https://laravel.com/docs/12.x/validation#validating-files' },
    ],
    en: {
      title: 'File Upload Vulnerabilities',
      summary: 'File upload vulnerabilities occur when uploaded content, metadata, storage paths, or post-processing steps are trusted without strict validation and isolation.',
      layer: 'file handling, storage, content validation, archive extraction, media processing, and download delivery',
      mechanism: 'Uploads cross a high-risk boundary: user-controlled bytes enter server storage and may later be parsed, transformed, served, scanned, or extracted. A weak upload flow may trust MIME headers, extensions, filenames, archive paths, or processor behavior.',
      rootCause: 'Specific causes include trusting Content-Type, storing files in executable paths, preserving dangerous filenames, extracting archives without path checks, missing size limits, and running processors with excessive privileges.',
      attackSurface: 'File upload risk appears in avatars, attachments, importers, ZIP extraction, media galleries, support tickets, document conversion, and admin bulk upload tools.',
      lifecycle: 'A tester maps allowed file types, sends benign files with controlled metadata, checks validation versus storage behavior, observes post-processing, and verifies that downloads are served as inert content.',
      primaryControl: 'Validate extension, MIME, and content signatures; rename files; store outside executable roots; scan or process in isolation; and enforce strict size and type allowlists.',
      defenseInDepth: 'Use separate storage domains, safe Content-Disposition, malware scanning where appropriate, archive path normalization, low-privilege processors, and lifecycle cleanup.',
      request: ['POST /api/uploads HTTP/1.1', 'Host: api.example.test', 'Cookie: session=REDACTED', 'Content-Type: multipart/form-data; boundary=BOUNDARY', '', '--BOUNDARY', 'Content-Disposition: form-data; name="file"; filename="safe-sample.txt"', 'Content-Type: text/plain', '', 'LAB_FILE_MARKER', '--BOUNDARY--'].join('\n'),
      response: ['HTTP/1.1 201 Created', 'Content-Type: application/json', '', '{"id":"FILE_ID","status":"stored"}'].join('\n'),
      vulnerableCode: ['const file = req.file;', 'await file.move(`public/uploads/${file.originalname}`);', 'res.json({ path: `/uploads/${file.originalname}` });'].join('\n'),
      secureCode: ['const file = validateUploadedFile(req.file, allowedTypes);', 'const storedName = randomName(file);', 'await storeOutsideWebRoot(storedName, file.buffer);'].join('\n'),
      scenarios: ['An avatar upload trusts Content-Type only.', 'A ZIP extractor writes files outside the intended directory.', 'A media processor parses untrusted files with high privileges.'],
      developerChecklist: ['Use allowlisted file types.', 'Check content signatures.', 'Rename uploaded files.', 'Store outside executable roots.', 'Normalize archive paths.', 'Limit size and count.', 'Serve downloads safely.'],
      testerChecklist: ['Map allowed file types.', 'Compare extension, MIME, and content behavior.', 'Check storage location.', 'Test archive path handling safely.', 'Inspect download headers.', 'Retest processor isolation.'],
      misconceptions: [['“Checking Content-Type is enough.”', 'Clients control headers; verify content and enforce allowlists.'], ['“Renaming files solves upload risk.”', 'Processing and storage location still matter.'], ['“Images are always safe.”', 'Image parsers and metadata processors can be attack surface.']],
    },
    fa: {
      title: 'آسیب‌پذیری‌های بارگذاری فایل',
      summary: 'ضعف‌های File Upload زمانی رخ می‌دهند که محتوای فایل، Metadata، مسیر ذخیره یا پردازش پس از Upload بدون Validation و Isolation سخت‌گیرانه قابل اعتماد فرض شود.',
      layer: 'File handling، Storage، Content validation، استخراج Archive، Media processing و تحویل Download',
      mechanism: 'Upload مرز پرریسکی است: Byteهای کنترل‌شده توسط کاربر وارد Storage سرور می‌شوند و بعداً ممکن است Parse، Transform، Serve، Scan یا Extract شوند. جریان ضعیف ممکن است MIME header، Extension، Filename، مسیر Archive یا رفتار Processor را اعتماد کند.',
      rootCause: 'علت‌های خاص شامل اعتماد به Content-Type، ذخیره در مسیر اجرایی، حفظ Filename خطرناک، استخراج Archive بدون Path check، نبود Size limit و اجرای Processor با مجوز زیاد است.',
      attackSurface: 'ریسک File Upload در Avatar، Attachment، Importer، ZIP extraction، Media gallery، Ticket پشتیبانی، Document conversion و Bulk upload مدیریتی دیده می‌شود.',
      lifecycle: 'تستر نوع فایل مجاز را نقشه‌برداری می‌کند، فایل بی‌خطر با Metadata کنترل‌شده می‌فرستد، Validation را با رفتار Storage مقایسه می‌کند، Post-processing را مشاهده می‌کند و تأیید می‌کند Download به‌صورت محتوای بی‌اثر Serve می‌شود.',
      primaryControl: 'Extension، MIME و Signature محتوا را Validate کنید؛ فایل را Rename کنید؛ بیرون از Web root اجرایی ذخیره کنید؛ پردازش را ایزوله کنید؛ و allowlist سخت برای Size و Type enforce کنید.',
      defenseInDepth: 'Storage domain جدا، Content-Disposition امن، Malware scanning در صورت نیاز، Normalization مسیر Archive، Processor کم‌مجوز و Cleanup چرخه عمر اضافه کنید.',
      request: ['POST /api/uploads HTTP/1.1', 'Host: api.example.test', 'Cookie: session=REDACTED', 'Content-Type: multipart/form-data; boundary=BOUNDARY', '', '--BOUNDARY', 'Content-Disposition: form-data; name="file"; filename="safe-sample.txt"', 'Content-Type: text/plain', '', 'LAB_FILE_MARKER', '--BOUNDARY--'].join('\n'),
      response: ['HTTP/1.1 201 Created', 'Content-Type: application/json', '', '{"id":"FILE_ID","status":"stored"}'].join('\n'),
      vulnerableCode: ['const file = req.file;', 'await file.move(`public/uploads/${file.originalname}`);', 'res.json({ path: `/uploads/${file.originalname}` });'].join('\n'),
      secureCode: ['const file = validateUploadedFile(req.file, allowedTypes);', 'const storedName = randomName(file);', 'await storeOutsideWebRoot(storedName, file.buffer);'].join('\n'),
      scenarios: ['Avatar upload فقط Content-Type را اعتماد می‌کند.', 'ZIP extractor فایل را بیرون مقصد می‌نویسد.', 'Media processor فایل غیرقابل اعتماد را با مجوز زیاد Parse می‌کند.'],
      developerChecklist: ['از allowlist نوع فایل استفاده کن.', 'Signature محتوا را بررسی کن.', 'فایل Upload شده را Rename کن.', 'بیرون مسیر اجرایی ذخیره کن.', 'مسیر Archive را Normalize کن.', 'Size و Count را محدود کن.', 'Download را امن Serve کن.'],
      testerChecklist: ['نوع‌های فایل مجاز را نقشه‌برداری کن.', 'رفتار Extension، MIME و محتوا را مقایسه کن.', 'محل Storage را بررسی کن.', 'Archive path را امن تست کن.', 'Headerهای Download را ببین.', 'Isolation پردازشگر را دوباره تست کن.'],
      misconceptions: [['«بررسی Content-Type کافی است.»', 'Client هدر را کنترل می‌کند؛ محتوا و allowlist باید بررسی شوند.'], ['«Rename کردن فایل کافی است.»', 'پردازش و محل ذخیره همچنان مهم‌اند.'], ['«Image همیشه امن است.»', 'Parser تصویر و Metadata processor خودش سطح حمله است.']],
    },
  }),
];


