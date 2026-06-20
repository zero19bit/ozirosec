import type { BilingualVulnerabilityArticle, LocalizedVulnerabilityArticle } from './types';

interface ArticleSpec {
  id: BilingualVulnerabilityArticle['id'];
  slug: BilingualVulnerabilityArticle['slug'];
  severity: BilingualVulnerabilityArticle['severity'];
  relatedLabIds: string[];
  relatedVulnerabilityIds: string[];
  mappings: BilingualVulnerabilityArticle['mappings'];
  references: BilingualVulnerabilityArticle['references'];
  en: {
    title: string;
    summary: string;
    terms: {
      topic: string;
      trustedBoundary: string;
      coreFailure: string;
      dataAtRisk: string;
      safeAction: string;
      browserMechanism: string;
      primaryControl: string;
      reviewFocus: string;
    };
    httpRequest: string;
    httpResponse: string;
    vulnerableCode: string;
    secureCode: string;
    relatedScenarios: string[];
    misconceptions: Array<[string, string]>;
  };
  fa: {
    title: string;
    summary: string;
    terms: ArticleSpec['en']['terms'];
    httpRequest: string;
    httpResponse: string;
    vulnerableCode: string;
    secureCode: string;
    relatedScenarios: string[];
    misconceptions: Array<[string, string]>;
  };
}

function englishContent(spec: ArticleSpec): LocalizedVulnerabilityArticle {
  const { terms } = spec.en;

  return {
    title: spec.en.title,
    summary: spec.en.summary,
    callouts: [
      {
        type: 'warning',
        title: 'Authorized-lab-only examples',
        body: 'Examples use example.test, placeholders, and REDACTED values. They explain the pattern without providing an active flag, credential, or exact HackPath lab solution.',
      },
    ],
    overviewSections: [
      {
        id: 'introduction',
        title: 'Introduction',
        body: [
          `${terms.topic} is a practical web security weakness because it appears in normal product features rather than obviously dangerous code. The issue emerges when ${terms.trustedBoundary} is treated as safer than it really is, so user-controlled behavior can influence a sensitive browser or server decision.`,
          `For training, the important lesson is not to memorize a payload. The durable skill is recognizing the trust boundary, understanding why ${terms.coreFailure}, and designing controls that continue to work as routes, components, and deployments change.`,
        ],
      },
      {
        id: 'technical-explanation',
        title: 'Detailed technical explanation',
        body: [
          `Technically, ${terms.topic} occurs when ${terms.coreFailure}. The application may still look correct in the happy path, but an attacker in an authorized lab can change request context, rendering context, or browser state so the application performs an action or exposes data in a way the developer did not intend.`,
          `The browser and server each enforce only specific rules. ${terms.browserMechanism} helps, but it is not a complete authorization system. The application must enforce ${terms.primaryControl} on the server side or at the correct output/header boundary.`,
        ],
      },
      {
        id: 'root-causes',
        title: 'Specific root causes',
        body: [
          `Common root causes include unclear ownership of ${terms.reviewFocus}, inconsistent framework defaults, missing regression tests, and treating a client-side behavior as if it were a server-side authorization guarantee.`,
          `A second root cause is configuration drift. A feature may be safe during initial implementation, then become vulnerable when a new frontend route, reverse proxy, CDN rule, template helper, or API consumer changes how ${terms.trustedBoundary} is handled.`,
        ],
      },
      {
        id: 'attack-surface',
        title: 'Specific attack surface',
        body: [
          `The attack surface includes endpoints and UI states that process ${terms.dataAtRisk}. Review public pages, authenticated workflows, admin tools, JSON APIs, embedded widgets, and any endpoint behind a proxy or SPA route.`,
          `Batch 1 testing should focus on common user journeys: search, profile update, account settings, file or image retrieval, browser-driven state changes, and cross-origin or framed interactions. These are realistic places for ${terms.topic} to hide.`,
        ],
      },
      {
        id: 'attack-lifecycle',
        title: 'Step-by-step attack lifecycle',
        body: [
          `A responsible tester first confirms scope, maps the feature, and identifies which user action or response is security-sensitive. Next, they send a minimal probe using placeholder data and compare normal behavior with the changed context.`,
          `If the probe shows a difference, the tester documents the affected boundary, captures sanitized evidence, and stops at the minimum proof of impact. The final step is to verify that the remediation blocks the pattern, not only the first probe.`,
        ],
      },
      {
        id: 'technical-impact',
        title: 'Technical impact',
        body: [
          `The technical impact is exposure or manipulation of ${terms.dataAtRisk}. Depending on the feature, this may mean unauthorized actions, disclosure of user-specific data, bypass of a browser protection boundary, or abuse of a trusted UI flow.`,
          `Impact should be stated precisely. Do not claim full compromise unless the vulnerable feature actually reaches credentials, privileged actions, executable code, or cross-user data.`,
        ],
      },
      {
        id: 'business-impact',
        title: 'Business impact',
        body: [
          `Business impact includes user trust damage, support cost, fraud risk, privacy review, and urgent remediation across similar features. The severity depends on which workflow is affected and whether sensitive accounts or regulated data are involved.`,
          `For product teams, ${terms.topic} is also a maintainability warning: security assumptions are spread across frontend code, backend policy, headers, templates, and deployment configuration.`,
        ],
      },
      {
        id: 'detection-indicators',
        title: 'Detection indicators',
        body: [
          `Indicators include unusual requests with changed origin, framing, encoding, path, token, or rendering context; unexpected state-changing requests; inconsistent response headers; and application logs showing repeated near-identical probes.`,
          `Defenders should monitor behavior without storing secrets. Evidence should keep URLs, headers, and bodies sanitized when they include cookies, anti-CSRF tokens, session identifiers, or user data.`,
        ],
      },
      {
        id: 'manual-testing-methodology',
        title: 'Authorized manual testing methodology',
        body: [
          `Manual testing starts with a harmless baseline request, then one controlled variation that exercises the suspected boundary. Use example.test, test accounts, placeholder values, and a dedicated lab dataset.`,
          `Document the request, response, browser state, and expected secure behavior. Avoid destructive actions and never test against systems where you do not have explicit authorization.`,
        ],
      },
      {
        id: 'automated-testing-considerations',
        title: 'Automated testing considerations',
        body: [
          `Automated scanners can catch missing headers, unsafe reflections, weak token checks, or traversal-like patterns, but they often need authenticated context and careful exclusions to avoid noisy or destructive traffic.`,
          `Static checks are useful for dangerous APIs and missing framework controls. Dynamic tests are better for deployment headers and runtime routing. Treat both as regression signals, not replacements for design review.`,
        ],
      },
      {
        id: 'prevention',
        title: 'Detailed prevention guidance',
        body: [
          `Prevention centers on ${terms.primaryControl}. The control must be enforced at the layer that actually makes the trust decision, not only in a visible UI element or client-side helper.`,
          `Use framework-supported controls, explicit allowlists, secure headers, safe encoding, and tests that prove malicious-looking input remains inert. Re-check controls after proxy, CDN, and SPA routing changes.`,
        ],
      },
      {
        id: 'remediation-workflow',
        title: 'Existing-system remediation workflow',
        body: [
          `First, identify all routes and components sharing the vulnerable pattern. Apply a narrow fix, then search for the same helper, middleware, header policy, or rendering pattern elsewhere in the codebase.`,
          `After deployment, add regression tests, review logs for prior abuse, update secure coding guidance, and make the control visible in code review checklists so the issue does not return in a nearby feature.`,
        ],
      },
    ],
    httpExamples: [
      {
        id: `${spec.id}-probe`,
        title: 'Sanitized training probe',
        description: 'A minimal authorized-lab request that demonstrates the relevant trust boundary without exposing an exact solution.',
        request: spec.en.httpRequest,
        response: spec.en.httpResponse,
      },
    ],
    impact: [
      `Unauthorized influence over ${terms.dataAtRisk}.`,
      'Unexpected behavior in a workflow the user or administrator considers trusted.',
      'Possible cross-user impact when the affected feature handles authenticated state.',
    ],
    businessImpact: [
      'Support, incident review, and product trust cost after users experience unexpected actions or data exposure.',
      'Engineering cost to audit similar routes, headers, components, and framework defaults.',
    ],
    remediation: [
      `Enforce ${terms.primaryControl} where the trust decision is made.`,
      'Add regression tests for the exact boundary and a near-miss bypass.',
      'Review adjacent routes and shared helpers for the same weakness.',
    ],
    safePayloadExamples: ['<authorized-lab probe>', '<encoded boundary marker>', '<REDACTED test value>'],
    attackScenarios: spec.en.relatedScenarios,
    commonMistakes: [
      'Trusting client-side checks as security controls.',
      'Fixing one route while leaving the shared helper vulnerable.',
      'Testing only the happy path and not browser or proxy edge cases.',
      'Logging sensitive request values while investigating the issue.',
    ],
    detection: {
      manual: [
        'Compare baseline and single-variable probe behavior in a lab account.',
        `Inspect ${terms.reviewFocus} in browser tools and server logs.`,
        'Confirm the fixed version rejects or neutralizes the same pattern.',
      ],
      automated: [
        'Run scoped dynamic scans with authenticated test accounts.',
        'Use static checks for dangerous APIs, missing headers, or unsafe path/rendering helpers.',
        'Add CI checks for security headers or framework middleware where applicable.',
      ],
    },
    codeExamples: [
      {
        language: 'typescript',
        title: `${spec.en.title} vulnerable and secure pattern`,
        vulnerable: spec.en.vulnerableCode,
        fixed: spec.en.secureCode,
      },
    ],
    developerChecklist: [
      `Identify every place handling ${terms.trustedBoundary}.`,
      `Apply ${terms.primaryControl} in server or framework code.`,
      'Add a regression test for the vulnerable pattern.',
      'Keep secrets, tokens, and cookies out of logs.',
      'Review proxy/CDN/header behavior before release.',
    ],
    testerChecklist: [
      'Confirm written authorization and use test accounts.',
      'Capture only sanitized evidence.',
      'Use one controlled probe at a time.',
      'Record expected secure behavior.',
      'Retest after remediation and check adjacent workflows.',
    ],
    misconceptions: spec.en.misconceptions.map(([myth, correction]) => ({ myth, correction })),
    reviewQuestions: [
      `Where is ${terms.trustedBoundary} converted into a security decision?`,
      `Which test proves ${terms.safeAction} remains safe?`,
      'Could a proxy, browser, or new frontend route bypass the control?',
    ],
  };
}

function persianContent(spec: ArticleSpec): LocalizedVulnerabilityArticle {
  const { terms } = spec.fa;

  return {
    title: spec.fa.title,
    summary: spec.fa.summary,
    callouts: [
      {
        type: 'warning',
        title: 'نمونه‌ها فقط برای آزمایشگاه مجاز',
        body: 'نمونه‌ها از example.test، مقدارهای placeholder و REDACTED استفاده می‌کنند. این متن الگو را توضیح می‌دهد و هیچ Flag، Credential یا راه‌حل دقیق آزمایشگاه HackPath را فاش نمی‌کند.',
      },
    ],
    overviewSections: [
      {
        id: 'introduction',
        title: 'مقدمه',
        body: [
          `${terms.topic} یک ضعف عملی امنیت وب است، چون معمولاً داخل قابلیت‌های عادی محصول دیده می‌شود نه فقط در کد واضحاً خطرناک. مشکل وقتی شکل می‌گیرد که ${terms.trustedBoundary} امن‌تر از واقعیت فرض شود و رفتار تحت کنترل کاربر بتواند روی تصمیم حساس مرورگر یا سرور اثر بگذارد.`,
          `هدف آموزشی حفظ کردن Payload نیست. مهارت پایدار این است که مرز اعتماد را بشناسیم، بفهمیم چرا ${terms.coreFailure}، و کنترلی طراحی کنیم که با تغییر Route، Component و Deployment همچنان درست کار کند.`,
        ],
      },
      {
        id: 'technical-explanation',
        title: 'توضیح فنی دقیق',
        body: [
          `از نظر فنی، ${terms.topic} زمانی رخ می‌دهد که ${terms.coreFailure}. برنامه در مسیر عادی ممکن است کاملاً درست به نظر برسد، اما مهاجم در محیط مجاز می‌تواند Context درخواست، رندر یا وضعیت مرورگر را تغییر دهد تا برنامه عملی انجام دهد یا داده‌ای نشان دهد که توسعه‌دهنده قصدش را نداشته است.`,
          `مرورگر و سرور هرکدام فقط قوانین مشخصی را اجرا می‌کنند. ${terms.browserMechanism} کمک می‌کند، اما سیستم کامل Authorization نیست. برنامه باید ${terms.primaryControl} را سمت سرور یا در همان مرز Header/Output که تصمیم اعتماد گرفته می‌شود اعمال کند.`,
        ],
      },
      {
        id: 'root-causes',
        title: 'علت‌های ریشه‌ای مشخص',
        body: [
          `علت‌های رایج شامل مالکیت نامشخص ${terms.reviewFocus}، پیش‌فرض‌های ناسازگار Framework، نبود Regression test و اعتماد به رفتار Client-side به‌جای کنترل امنیتی سمت سرور است.`,
          `علت دوم Drift پیکربندی است. قابلیتی که ابتدا امن بوده، با Route جدید فرانت‌اند، Reverse proxy، قانون CDN، helper قالب یا مصرف‌کننده جدید API می‌تواند آسیب‌پذیر شود، چون نحوه برخورد با ${terms.trustedBoundary} تغییر کرده است.`,
        ],
      },
      {
        id: 'attack-surface',
        title: 'سطح حمله مشخص',
        body: [
          `سطح حمله شامل Endpointها و حالت‌های UI است که ${terms.dataAtRisk} را پردازش می‌کنند. صفحه‌های عمومی، Workflowهای احراز هویت‌شده، ابزارهای مدیر، JSON API، Widgetهای Embed شده و Endpointهای پشت Proxy یا SPA route را بررسی کنید.`,
          `در Batch 1 تمرکز باید روی مسیرهای رایج کاربر باشد: جستجو، تغییر Profile، تنظیمات حساب، دریافت فایل یا تصویر، تغییر وضعیت با مرورگر و تعامل‌های Cross-origin یا داخل Frame. این‌ها محل‌های واقعی پنهان شدن ${terms.topic} هستند.`,
        ],
      },
      {
        id: 'attack-lifecycle',
        title: 'چرخه حمله مرحله‌به‌مرحله',
        body: [
          `تستر مسئول ابتدا Scope را تأیید می‌کند، قابلیت را نقشه‌برداری می‌کند و مشخص می‌کند کدام عمل کاربر یا پاسخ امنیتی حساس است. سپس با داده placeholder یک Probe حداقلی می‌فرستد و رفتار عادی را با Context تغییرکرده مقایسه می‌کند.`,
          `اگر Probe تفاوت نشان داد، تستر مرز آسیب‌دیده را مستند می‌کند، شواهد Sanitized می‌گیرد و در حد کمترین اثبات اثر توقف می‌کند. مرحله آخر تأیید این است که اصلاح، الگو را مسدود کرده نه فقط همان Probe اول را.`,
        ],
      },
      {
        id: 'technical-impact',
        title: 'اثر فنی',
        body: [
          `اثر فنی شامل افشا یا دستکاری ${terms.dataAtRisk} است. بسته به قابلیت، این می‌تواند به عملیات غیرمجاز، افشای داده مخصوص کاربر، دور زدن مرز حفاظتی مرورگر یا سوءاستفاده از جریان UI مورد اعتماد منجر شود.`,
          `اثر باید دقیق بیان شود. تا وقتی قابلیت آسیب‌پذیر واقعاً به Credential، عملیات Privileged، کد قابل اجرا یا داده بین‌کاربری نمی‌رسد، نباید ادعای Full compromise کرد.`,
        ],
      },
      {
        id: 'business-impact',
        title: 'اثر کسب‌وکار',
        body: [
          `اثر کسب‌وکار شامل کاهش اعتماد کاربر، هزینه پشتیبانی، ریسک تقلب، بازبینی حریم خصوصی و اصلاح فوری قابلیت‌های مشابه است. شدت به Workflow آسیب‌دیده و حساسیت حساب‌ها یا داده‌ها بستگی دارد.`,
          `برای تیم محصول، ${terms.topic} هشدار نگهداشت‌پذیری هم هست: فرض‌های امنیتی بین کد فرانت‌اند، Policy بک‌اند، Headerها، Templateها و تنظیمات Deployment پخش شده‌اند.`,
        ],
      },
      {
        id: 'detection-indicators',
        title: 'نشانه‌های تشخیص',
        body: [
          `نشانه‌ها شامل درخواست‌های غیرعادی با Origin، Frame، Encoding، Path، Token یا Rendering context تغییرکرده؛ درخواست‌های تغییر وضعیت غیرمنتظره؛ Headerهای پاسخ ناسازگار؛ و لاگ‌هایی با Probeهای تکراری و مشابه است.`,
          `مدافع باید بدون ذخیره Secretها رفتار را پایش کند. وقتی URL، Header یا Body شامل Cookie، توکن ضد CSRF، شناسه نشست یا داده کاربر است، شواهد باید Sanitized بمانند.`,
        ],
      },
      {
        id: 'manual-testing-methodology',
        title: 'روش تست دستی مجاز',
        body: [
          `تست دستی با یک درخواست پایه بی‌خطر شروع می‌شود، سپس یک تغییر کنترل‌شده همان مرز مشکوک را امتحان می‌کند. از example.test، حساب آزمایشی، مقدار placeholder و دیتاست آزمایشگاهی استفاده کنید.`,
          `درخواست، پاسخ، وضعیت مرورگر و رفتار امن مورد انتظار را مستند کنید. عملیات مخرب انجام ندهید و هرگز روی سامانه‌ای که مجوز صریح ندارید تست نکنید.`,
        ],
      },
      {
        id: 'automated-testing-considerations',
        title: 'ملاحظات تست خودکار',
        body: [
          `اسکنرها می‌توانند Headerهای جاافتاده، Reflection ناامن، کنترل ضعیف Token یا الگوهای شبیه Traversal را پیدا کنند، اما اغلب به Context احراز هویت‌شده و Exclusion دقیق نیاز دارند تا ترافیک مخرب یا پرنویز تولید نشود.`,
          `بررسی ایستا برای APIهای خطرناک و نبود کنترل Framework مفید است. تست پویا برای Headerهای Deployment و Routing زمان اجرا بهتر است. هر دو را Signal رگرسیون بدانید، نه جایگزین Design review.`,
        ],
      },
      {
        id: 'prevention',
        title: 'راهنمای پیشگیری دقیق',
        body: [
          `پیشگیری بر ${terms.primaryControl} متمرکز است. کنترل باید در همان لایه‌ای اعمال شود که تصمیم اعتماد را می‌گیرد، نه فقط در یک عنصر قابل مشاهده UI یا helper سمت Client.`,
          `از کنترل‌های رسمی Framework، allowlist صریح، Header امن، Encoding درست و تست‌هایی استفاده کنید که ثابت کنند ورودی مشکوک بی‌اثر می‌ماند. بعد از تغییر Proxy، CDN و SPA routing دوباره کنترل‌ها را بررسی کنید.`,
        ],
      },
      {
        id: 'remediation-workflow',
        title: 'گردش کار اصلاح در سیستم موجود',
        body: [
          `ابتدا همه Routeها و Componentهایی را پیدا کنید که الگوی آسیب‌پذیر مشترک دارند. اصلاح محدود را اعمال کنید، سپس همان helper، middleware، header policy یا rendering pattern را در بقیه کد جستجو کنید.`,
          `پس از Deployment، Regression test اضافه کنید، لاگ‌ها را برای سوءاستفاده قبلی بررسی کنید، راهنمای کدنویسی امن را به‌روزرسانی کنید و کنترل را در Checklist بازبینی کد قابل مشاهده کنید تا مشکل در قابلیت نزدیک برنگردد.`,
        ],
      },
    ],
    httpExamples: [
      {
        id: `${spec.id}-probe`,
        title: 'Probe آموزشی Sanitized',
        description: 'درخواست حداقلی برای آزمایشگاه مجاز که مرز اعتماد را بدون افشای راه‌حل دقیق نشان می‌دهد.',
        request: spec.fa.httpRequest,
        response: spec.fa.httpResponse,
      },
    ],
    impact: [
      `اثرگذاری غیرمجاز روی ${terms.dataAtRisk}.`,
      'رفتار غیرمنتظره در Workflowی که کاربر یا مدیر آن را قابل اعتماد می‌داند.',
      'اثر احتمالی بین‌کاربری وقتی قابلیت آسیب‌دیده با وضعیت احراز هویت‌شده کار می‌کند.',
    ],
    businessImpact: [
      'هزینه پشتیبانی، بازبینی رخداد و کاهش اعتماد پس از عمل غیرمنتظره یا افشای داده.',
      'هزینه مهندسی برای Audit کردن Routeها، Headerها، Componentها و پیش‌فرض‌های Framework مشابه.',
    ],
    remediation: [
      `${terms.primaryControl} را در محل تصمیم اعتماد اعمال کنید.`,
      'برای مرز آسیب‌دیده و یک مسیر دورزدن نزدیک Regression test اضافه کنید.',
      'Routeها و helperهای مجاور را برای همین ضعف بررسی کنید.',
    ],
    safePayloadExamples: ['<authorized-lab probe>', '<encoded boundary marker>', '<REDACTED test value>'],
    attackScenarios: spec.fa.relatedScenarios,
    commonMistakes: [
      'اعتماد به کنترل Client-side به‌عنوان کنترل امنیتی.',
      'اصلاح یک Route و باقی گذاشتن helper مشترک.',
      'تست فقط مسیر عادی و نادیده گرفتن Edge case مرورگر یا Proxy.',
      'ثبت مقدارهای حساس درخواست هنگام بررسی رخداد.',
    ],
    detection: {
      manual: [
        'رفتار پایه و Probe تک‌متغیره را با حساب آزمایشگاهی مقایسه کنید.',
        `${terms.reviewFocus} را در ابزار مرورگر و لاگ سرور بررسی کنید.`,
        'تأیید کنید نسخه اصلاح‌شده همان الگو را رد یا بی‌اثر می‌کند.',
      ],
      automated: [
        'اسکن پویا را با حساب تست و Scope محدود اجرا کنید.',
        'برای APIهای خطرناک، Headerهای جاافتاده یا helperهای ناامن از بررسی ایستا استفاده کنید.',
        'در صورت امکان کنترل Header یا Middleware را در CI بررسی کنید.',
      ],
    },
    codeExamples: [
      {
        language: 'typescript',
        title: `الگوی آسیب‌پذیر و امن ${spec.fa.title}`,
        vulnerable: spec.fa.vulnerableCode,
        fixed: spec.fa.secureCode,
      },
    ],
    developerChecklist: [
      `همه محل‌های پردازش ${terms.trustedBoundary} را پیدا کن.`,
      `${terms.primaryControl} را در کد سرور یا Framework اعمال کن.`,
      'برای الگوی آسیب‌پذیر Regression test اضافه کن.',
      'Secret، Token و Cookie را در لاگ ذخیره نکن.',
      'رفتار Proxy/CDN/Header را قبل از انتشار بررسی کن.',
    ],
    testerChecklist: [
      'مجوز کتبی و حساب تست داشته باش.',
      'فقط شواهد Sanitized ثبت کن.',
      'هر بار فقط یک Probe کنترل‌شده بفرست.',
      'رفتار امن مورد انتظار را بنویس.',
      'بعد از اصلاح، Workflowهای مجاور را هم دوباره تست کن.',
    ],
    misconceptions: spec.fa.misconceptions.map(([myth, correction]) => ({ myth, correction })),
    reviewQuestions: [
      `${terms.trustedBoundary} کجا به تصمیم امنیتی تبدیل می‌شود؟`,
      `کدام تست ثابت می‌کند ${terms.safeAction} امن می‌ماند؟`,
      'آیا Proxy، مرورگر یا Route جدید فرانت‌اند می‌تواند کنترل را دور بزند؟',
    ],
  };
}

function makeArticle(spec: ArticleSpec): BilingualVulnerabilityArticle {
  return {
    id: spec.id,
    slug: spec.slug,
    batch: 1,
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
      en: englishContent(spec),
      fa: persianContent(spec),
    },
  };
}

export const batch1Articles: BilingualVulnerabilityArticle[] = [
  makeArticle({
    id: 'xss',
    slug: 'cross-site-scripting',
    severity: 'High',
    relatedLabIds: ['xss-001', 'xss-002', 'xss-003', 'xss-004', 'xss-005'],
    relatedVulnerabilityIds: ['csrf', 'cors', 'clickjacking'],
    mappings: {
      owasp: ['OWASP Top 10 2021 A03: Injection', 'OWASP Web Security Testing Guide: Testing for Reflected Cross Site Scripting'],
      cwe: ['CWE-79: Improper Neutralization of Input During Web Page Generation'],
      portSwigger: 'PortSwigger Web Security Academy: Cross-site scripting',
    },
    references: [
      { title: 'OWASP Cross Site Scripting', url: 'https://owasp.org/www-community/attacks/xss/' },
      { title: 'OWASP XSS Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html' },
      { title: 'OWASP XSS Filter Evasion Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html' },
      { title: 'PortSwigger Cross-site scripting', url: 'https://portswigger.net/web-security/cross-site-scripting' },
      { title: 'MITRE CWE-79', url: 'https://cwe.mitre.org/data/definitions/79.html' },
    ],
    en: {
      title: 'Cross-Site Scripting (XSS)',
      summary: 'XSS occurs when untrusted data is rendered into a browser-executed context without the correct output encoding or sanitization.',
      terms: {
        topic: 'Cross-Site Scripting (XSS)',
        trustedBoundary: 'browser-rendered content',
        coreFailure: 'untrusted data is placed into HTML, JavaScript, URL, or DOM sinks without context-aware output encoding',
        dataAtRisk: 'session-bound user actions, visible page content, and data reachable by the victim browser',
        safeAction: 'user-supplied text renders as text rather than executable markup',
        browserMechanism: 'the same-origin policy limits cross-site reads',
        primaryControl: 'context-aware output encoding, safe DOM APIs, and vetted sanitization for intentionally allowed markup',
        reviewFocus: 'template output, DOM sinks, rich-text rendering, and Content Security Policy',
      },
      httpRequest: ['GET /search?q=LAB_XSS_MARKER HTTP/1.1', 'Host: example.test', 'Cookie: session=REDACTED'].join('\n'),
      httpResponse: ['HTTP/1.1 200 OK', 'Content-Type: text/html', '', '<p>Search results for LAB_XSS_MARKER</p>'].join('\n'),
      vulnerableCode: ['const term = new URLSearchParams(location.search).get("q") ?? "";', 'results.innerHTML = "Search results for " + term;'].join('\n'),
      secureCode: ['const term = new URLSearchParams(location.search).get("q") ?? "";', 'results.textContent = `Search results for ${term}`;'].join('\n'),
      relatedScenarios: ['A search result reflects user text into HTML.', 'A stored comment renders as markup for other users.', 'A DOM sink reads location data and writes it with innerHTML.'],
      misconceptions: [
        ['“React or any framework makes XSS impossible.”', 'Frameworks reduce risk, but unsafe escape hatches, dangerous HTML rendering, and third-party widgets can reintroduce XSS.'],
        ['“Input validation is enough.”', 'Validation helps business rules; output encoding must match the final rendering context.'],
        ['“CSP fixes XSS by itself.”', 'CSP is defense in depth and can be misconfigured or bypassed if unsafe rendering remains.'],
      ],
    },
    fa: {
      title: 'اسکریپت‌نویسی میان‌سایتی (XSS)',
      summary: 'XSS زمانی رخ می‌دهد که داده غیرقابل اعتماد بدون Encoding یا Sanitization درست وارد Context قابل اجرای مرورگر شود.',
      terms: {
        topic: 'اسکریپت‌نویسی میان‌سایتی (XSS)',
        trustedBoundary: 'محتوای رندرشده در مرورگر',
        coreFailure: 'داده غیرقابل اعتماد بدون Output encoding متناسب با Context داخل HTML، JavaScript، URL یا DOM sink قرار می‌گیرد',
        dataAtRisk: 'عملیات وابسته به نشست کاربر، محتوای صفحه و داده‌ای که مرورگر قربانی به آن دسترسی دارد',
        safeAction: 'متن کاربر به‌صورت متن نمایش داده شود نه Markup اجرایی',
        browserMechanism: 'Same-Origin Policy خواندن Cross-site را محدود می‌کند',
        primaryControl: 'Output encoding متناسب با Context، DOM API امن و Sanitization معتبر برای Markup مجاز',
        reviewFocus: 'خروجی Template، DOM sink، Rich-text rendering و Content Security Policy',
      },
      httpRequest: ['GET /search?q=LAB_XSS_MARKER HTTP/1.1', 'Host: example.test', 'Cookie: session=REDACTED'].join('\n'),
      httpResponse: ['HTTP/1.1 200 OK', 'Content-Type: text/html', '', '<p>Search results for LAB_XSS_MARKER</p>'].join('\n'),
      vulnerableCode: ['const term = new URLSearchParams(location.search).get("q") ?? "";', 'results.innerHTML = "Search results for " + term;'].join('\n'),
      secureCode: ['const term = new URLSearchParams(location.search).get("q") ?? "";', 'results.textContent = `Search results for ${term}`;'].join('\n'),
      relatedScenarios: ['عبارت جستجو در HTML بازتاب داده می‌شود.', 'نظر ذخیره‌شده برای کاربران دیگر به‌صورت Markup رندر می‌شود.', 'DOM sink داده URL را با innerHTML می‌نویسد.'],
      misconceptions: [
        ['«React یا هر Framework دیگری XSS را غیرممکن می‌کند.»', 'Framework ریسک را کم می‌کند، اما escape hatch ناامن، HTML خطرناک و Widget ثالث می‌تواند XSS را برگرداند.'],
        ['«اعتبارسنجی ورودی کافی است.»', 'Validation برای قوانین کسب‌وکار مفید است؛ خروجی باید متناسب با Context نهایی Encode شود.'],
        ['«CSP به‌تنهایی XSS را حل می‌کند.»', 'CSP دفاع تکمیلی است و اگر Rendering ناامن باقی بماند ممکن است بد پیکربندی یا دور زده شود.'],
      ],
    },
  }),
  makeArticle({
    id: 'csrf',
    slug: 'csrf',
    severity: 'High',
    relatedLabIds: ['csrf-001', 'csrf-002'],
    relatedVulnerabilityIds: ['xss', 'cors', 'clickjacking'],
    mappings: {
      owasp: ['OWASP Top 10 2021 A01: Broken Access Control'],
      cwe: ['CWE-352: Cross-Site Request Forgery'],
      portSwigger: 'PortSwigger Web Security Academy: Cross-site request forgery',
    },
    references: [
      { title: 'OWASP CSRF', url: 'https://owasp.org/www-community/attacks/csrf' },
      { title: 'OWASP CSRF Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html' },
      { title: 'PortSwigger CSRF', url: 'https://portswigger.net/web-security/csrf' },
      { title: 'MDN CSRF', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF' },
      { title: 'MITRE CWE-352', url: 'https://cwe.mitre.org/data/definitions/352.html' },
    ],
    en: {
      title: 'Cross-Site Request Forgery (CSRF)',
      summary: 'CSRF abuses the browser’s automatic credential sending to make an authenticated user perform an unintended state-changing request.',
      terms: {
        topic: 'Cross-Site Request Forgery (CSRF)',
        trustedBoundary: 'browser-attached cookies and authenticated state',
        coreFailure: 'the server accepts a state-changing request without verifying that the user intentionally initiated it',
        dataAtRisk: 'account settings, profile data, transaction state, and other authenticated changes',
        safeAction: 'state-changing requests require a valid user-bound anti-CSRF proof',
        browserMechanism: 'cookies are automatically attached to matching sites',
        primaryControl: 'per-session CSRF tokens, SameSite cookies, origin checks, and re-authentication for sensitive actions',
        reviewFocus: 'state-changing routes, token binding, SameSite attributes, and Origin or Referer checks',
      },
      httpRequest: ['POST /account/email HTTP/1.1', 'Host: example.test', 'Cookie: session=REDACTED', 'Content-Type: application/x-www-form-urlencoded', '', 'email=placeholder@example.test&csrf=REDACTED'].join('\n'),
      httpResponse: ['HTTP/1.1 204 No Content', 'Set-Cookie: XSRF-TOKEN=REDACTED; SameSite=Lax'].join('\n'),
      vulnerableCode: ['app.post("/account/email", requireSession, async (req, res) => {', '  await updateEmail(req.user.id, req.body.email);', '  res.sendStatus(204);', '});'].join('\n'),
      secureCode: ['app.post("/account/email", requireSession, verifyCsrfToken, async (req, res) => {', '  await updateEmail(req.user.id, req.body.email);', '  res.sendStatus(204);', '});'].join('\n'),
      relatedScenarios: ['A profile change accepts cookie-authenticated POSTs without CSRF tokens.', 'A token is valid but not bound to the user session.', 'A sensitive action relies only on a confirmation page.'],
      misconceptions: [
        ['“JSON APIs cannot have CSRF.”', 'Cookie-authenticated JSON APIs can be vulnerable if browsers can send the request and the server lacks CSRF validation.'],
        ['“SameSite alone is always enough.”', 'SameSite helps but must match the deployment and should be paired with tokens for important state changes.'],
        ['“GET requests are harmless.”', 'State-changing GET routes are design bugs and expand CSRF exposure.'],
      ],
    },
    fa: {
      title: 'جعل درخواست میان‌سایتی (CSRF)',
      summary: 'CSRF از ارسال خودکار Credential توسط مرورگر سوءاستفاده می‌کند تا کاربر واردشده یک درخواست تغییر وضعیت ناخواسته انجام دهد.',
      terms: {
        topic: 'جعل درخواست میان‌سایتی (CSRF)',
        trustedBoundary: 'Cookieهای متصل‌شده توسط مرورگر و وضعیت احراز هویت‌شده',
        coreFailure: 'سرور درخواست تغییر وضعیت را بدون اثبات قصد واقعی کاربر می‌پذیرد',
        dataAtRisk: 'تنظیمات حساب، داده Profile، وضعیت تراکنش و تغییرات احراز هویت‌شده',
        safeAction: 'درخواست تغییر وضعیت نیازمند اثبات ضد CSRF معتبر و وابسته به کاربر باشد',
        browserMechanism: 'Cookieها خودکار برای سایت‌های مطابق ارسال می‌شوند',
        primaryControl: 'توکن CSRF وابسته به نشست، SameSite cookie، بررسی Origin و احراز هویت دوباره برای عملیات حساس',
        reviewFocus: 'Routeهای تغییر وضعیت، اتصال Token به نشست، SameSite و بررسی Origin یا Referer',
      },
      httpRequest: ['POST /account/email HTTP/1.1', 'Host: example.test', 'Cookie: session=REDACTED', 'Content-Type: application/x-www-form-urlencoded', '', 'email=placeholder@example.test&csrf=REDACTED'].join('\n'),
      httpResponse: ['HTTP/1.1 204 No Content', 'Set-Cookie: XSRF-TOKEN=REDACTED; SameSite=Lax'].join('\n'),
      vulnerableCode: ['app.post("/account/email", requireSession, async (req, res) => {', '  await updateEmail(req.user.id, req.body.email);', '  res.sendStatus(204);', '});'].join('\n'),
      secureCode: ['app.post("/account/email", requireSession, verifyCsrfToken, async (req, res) => {', '  await updateEmail(req.user.id, req.body.email);', '  res.sendStatus(204);', '});'].join('\n'),
      relatedScenarios: ['تغییر Profile درخواست POST دارای Cookie را بدون توکن CSRF می‌پذیرد.', 'توکن معتبر است اما به نشست همان کاربر وصل نیست.', 'عملیات حساس فقط به صفحه تأیید ظاهری تکیه می‌کند.'],
      misconceptions: [
        ['«JSON API دچار CSRF نمی‌شود.»', 'اگر API با Cookie احراز هویت شود و مرورگر بتواند درخواست را بفرستد، نبود CSRF validation خطرناک است.'],
        ['«SameSite همیشه کافی است.»', 'SameSite کمک می‌کند اما باید با معماری Deployment هماهنگ باشد و برای تغییرات مهم با Token همراه شود.'],
        ['«GET بی‌خطر است.»', 'Route تغییر وضعیت با GET خودش نقص طراحی است و سطح CSRF را زیاد می‌کند.'],
      ],
    },
  }),
  makeArticle({
    id: 'cors',
    slug: 'cors',
    severity: 'High',
    relatedLabIds: ['cors-001'],
    relatedVulnerabilityIds: ['csrf', 'xss'],
    mappings: {
      owasp: ['OWASP Top 10 2021 A05: Security Misconfiguration'],
      cwe: ['CWE-942: Permissive Cross-domain Security Policy with Untrusted Domains', 'CWE-346: Origin Validation Error'],
      portSwigger: 'PortSwigger Web Security Academy: Cross-origin resource sharing',
    },
    references: [
      { title: 'OWASP Testing CORS', url: 'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side_Testing/07-Testing_Cross_Origin_Resource_Sharing' },
      { title: 'OWASP API8:2023 Security Misconfiguration', url: 'https://owasp.org/API-Security/editions/2023/en/0xa8-security-misconfiguration/' },
      { title: 'PortSwigger CORS', url: 'https://portswigger.net/web-security/cors' },
      { title: 'MDN CORS', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS' },
      { title: 'MITRE CWE-942', url: 'https://cwe.mitre.org/data/definitions/942.html' },
    ],
    en: {
      title: 'CORS Misconfiguration',
      summary: 'CORS misconfiguration lets untrusted origins read browser-accessible API responses that should remain limited to approved first-party sites.',
      terms: {
        topic: 'CORS Misconfiguration',
        trustedBoundary: 'Origin headers and cross-origin browser reads',
        coreFailure: 'the server reflects or over-trusts origins while allowing sensitive responses to be read cross-origin',
        dataAtRisk: 'API responses available to a credentialed browser session',
        safeAction: 'only explicitly approved HTTPS origins receive credentialed CORS access',
        browserMechanism: 'CORS controls browser read access to cross-origin responses',
        primaryControl: 'strict origin allowlists, credential-aware CORS policy, and separate non-browser authorization checks',
        reviewFocus: 'Access-Control-Allow-Origin, Access-Control-Allow-Credentials, preflight behavior, and environment origin lists',
      },
      httpRequest: ['GET /api/account HTTP/1.1', 'Host: example.test', 'Origin: https://untrusted.example', 'Cookie: session=REDACTED'].join('\n'),
      httpResponse: ['HTTP/1.1 403 Forbidden', 'Vary: Origin', 'Content-Type: application/json', '', '{"message":"Origin not allowed"}'].join('\n'),
      vulnerableCode: ['const origin = req.headers.origin;', 'res.setHeader("Access-Control-Allow-Origin", origin ?? "*");', 'res.setHeader("Access-Control-Allow-Credentials", "true");'].join('\n'),
      secureCode: ['const allowed = new Set(["https://app.example.test"]);', 'if (origin && allowed.has(origin)) {', '  res.setHeader("Access-Control-Allow-Origin", origin);', '  res.setHeader("Vary", "Origin");', '}'].join('\n'),
      relatedScenarios: ['An API reflects arbitrary Origin values.', 'A credentialed endpoint allows broad subdomain patterns.', 'A development localhost origin remains enabled in production.'],
      misconceptions: [
        ['“CORS is authentication.”', 'CORS is a browser read policy; the server still needs authentication and authorization.'],
        ['“Wildcard is fine if we need integrations.”', 'Credentialed browser APIs need explicit trusted origins, not broad reflection.'],
        ['“Only frontend code controls CORS.”', 'CORS is emitted by servers and proxies, so deployment config matters.'],
      ],
    },
    fa: {
      title: 'پیکربندی نادرست CORS',
      summary: 'Misconfiguration در CORS باعث می‌شود Originهای نامعتبر پاسخ API قابل خواندن توسط مرورگر را ببینند، در حالی‌که باید فقط سایت‌های First-party مجاز باشند.',
      terms: {
        topic: 'پیکربندی نادرست CORS',
        trustedBoundary: 'Headerهای Origin و خواندن Cross-origin در مرورگر',
        coreFailure: 'سرور Origin را بازتاب می‌دهد یا بیش از حد به آن اعتماد می‌کند و اجازه خواندن پاسخ حساس از Origin دیگر را می‌دهد',
        dataAtRisk: 'پاسخ‌های API در دسترس نشست Credentialed مرورگر',
        safeAction: 'فقط Originهای HTTPS تأییدشده دسترسی Credentialed CORS بگیرند',
        browserMechanism: 'CORS دسترسی خواندن مرورگر به پاسخ Cross-origin را کنترل می‌کند',
        primaryControl: 'allowlist سخت‌گیرانه Origin، سیاست CORS آگاه به Credential و Authorization مستقل از مرورگر',
        reviewFocus: 'Access-Control-Allow-Origin، Access-Control-Allow-Credentials، Preflight و فهرست Originهای محیطی',
      },
      httpRequest: ['GET /api/account HTTP/1.1', 'Host: example.test', 'Origin: https://untrusted.example', 'Cookie: session=REDACTED'].join('\n'),
      httpResponse: ['HTTP/1.1 403 Forbidden', 'Vary: Origin', 'Content-Type: application/json', '', '{"message":"Origin not allowed"}'].join('\n'),
      vulnerableCode: ['const origin = req.headers.origin;', 'res.setHeader("Access-Control-Allow-Origin", origin ?? "*");', 'res.setHeader("Access-Control-Allow-Credentials", "true");'].join('\n'),
      secureCode: ['const allowed = new Set(["https://app.example.test"]);', 'if (origin && allowed.has(origin)) {', '  res.setHeader("Access-Control-Allow-Origin", origin);', '  res.setHeader("Vary", "Origin");', '}'].join('\n'),
      relatedScenarios: ['API هر Origin را در پاسخ بازتاب می‌دهد.', 'Endpoint دارای Credential الگوی Subdomain بسیار گسترده را می‌پذیرد.', 'Origin توسعه مثل localhost در Production باقی مانده است.'],
      misconceptions: [
        ['«CORS همان Authentication است.»', 'CORS سیاست خواندن مرورگر است؛ سرور هنوز Authentication و Authorization لازم دارد.'],
        ['«Wildcard برای Integrationها مشکلی ندارد.»', 'API مرورگری دارای Credential به Originهای مشخص و قابل اعتماد نیاز دارد، نه Reflection گسترده.'],
        ['«فقط کد فرانت‌اند CORS را کنترل می‌کند.»', 'CORS را سرور و Proxy تولید می‌کنند، پس تنظیم Deployment مهم است.'],
      ],
    },
  }),
  makeArticle({
    id: 'clickjacking',
    slug: 'clickjacking',
    severity: 'Medium',
    relatedLabIds: ['click-001'],
    relatedVulnerabilityIds: ['csrf', 'xss'],
    mappings: {
      owasp: ['OWASP Top 10 2021 A05: Security Misconfiguration'],
      cwe: ['CWE-1021: Improper Restriction of Rendered UI Layers or Frames', 'CWE-451: User Interface Misrepresentation of Critical Information'],
      portSwigger: 'PortSwigger Web Security Academy: Clickjacking',
    },
    references: [
      { title: 'OWASP Clickjacking', url: 'https://owasp.org/www-community/attacks/Clickjacking' },
      { title: 'OWASP Clickjacking Defense Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html' },
      { title: 'PortSwigger Clickjacking', url: 'https://portswigger.net/web-security/clickjacking' },
      { title: 'MDN Clickjacking', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/Clickjacking' },
      { title: 'MITRE CWE-1021', url: 'https://cwe.mitre.org/data/definitions/1021.html' },
    ],
    en: {
      title: 'Clickjacking',
      summary: 'Clickjacking tricks a user into interacting with a framed or overlaid target page while believing they are clicking something else.',
      terms: {
        topic: 'Clickjacking',
        trustedBoundary: 'visible user interface and frame embedding rules',
        coreFailure: 'sensitive pages can be embedded or visually overlaid by untrusted sites',
        dataAtRisk: 'state-changing UI controls and sensitive user decisions',
        safeAction: 'sensitive pages cannot be framed by untrusted origins',
        browserMechanism: 'iframes and CSS can layer interfaces unless frame restrictions block them',
        primaryControl: 'Content-Security-Policy frame-ancestors and legacy X-Frame-Options where needed',
        reviewFocus: 'frame-ancestors, X-Frame-Options, embedded widgets, and critical-click workflows',
      },
      httpRequest: ['GET /account/settings HTTP/1.1', 'Host: example.test', 'Cookie: session=REDACTED'].join('\n'),
      httpResponse: ['HTTP/1.1 200 OK', "Content-Security-Policy: frame-ancestors 'self'", 'X-Frame-Options: SAMEORIGIN'].join('\n'),
      vulnerableCode: ['app.get("/account/settings", requireSession, renderSettings);', '// Missing frame-ancestors or X-Frame-Options headers'].join('\n'),
      secureCode: ['app.use((req, res, next) => {', `  res.setHeader("Content-Security-Policy", "frame-ancestors 'self'");`, '  res.setHeader("X-Frame-Options", "SAMEORIGIN");', '  next();', '});'].join('\n'),
      relatedScenarios: ['A settings page can be loaded inside an attacker-controlled frame.', 'A confirmation button is visually aligned with a decoy button.', 'A legacy browser ignores an incomplete frame policy.'],
      misconceptions: [
        ['“Users can see what they click.”', 'Transparent or disguised frames can hide the real target.'],
        ['“CSRF tokens prevent clickjacking.”', 'Tokens do not stop a real user click inside a framed page.'],
        ['“Frame-busting JavaScript is enough.”', 'Script-based frame busting is weaker than browser-enforced headers.'],
      ],
    },
    fa: {
      title: 'کلیک‌ربایی',
      summary: 'Clickjacking کاربر را فریب می‌دهد تا با صفحه هدف داخل Frame یا لایه پنهان تعامل کند، در حالی‌که فکر می‌کند روی چیز دیگری کلیک می‌کند.',
      terms: {
        topic: 'کلیک‌ربایی',
        trustedBoundary: 'رابط کاربری قابل مشاهده و قوانین Frame embedding',
        coreFailure: 'صفحه‌های حساس می‌توانند توسط سایت نامعتبر Embed یا Overlay شوند',
        dataAtRisk: 'کنترل‌های UI تغییر وضعیت و تصمیم‌های حساس کاربر',
        safeAction: 'صفحه حساس توسط Origin نامعتبر قابل Frame شدن نباشد',
        browserMechanism: 'iframe و CSS می‌توانند رابط‌ها را لایه‌بندی کنند مگر محدودیت Frame مانع شود',
        primaryControl: 'Content-Security-Policy frame-ancestors و در صورت نیاز X-Frame-Options قدیمی',
        reviewFocus: 'frame-ancestors، X-Frame-Options، Widgetهای Embed و Workflowهای دارای کلیک حساس',
      },
      httpRequest: ['GET /account/settings HTTP/1.1', 'Host: example.test', 'Cookie: session=REDACTED'].join('\n'),
      httpResponse: ['HTTP/1.1 200 OK', "Content-Security-Policy: frame-ancestors 'self'", 'X-Frame-Options: SAMEORIGIN'].join('\n'),
      vulnerableCode: ['app.get("/account/settings", requireSession, renderSettings);', '// Missing frame-ancestors or X-Frame-Options headers'].join('\n'),
      secureCode: ['app.use((req, res, next) => {', `  res.setHeader("Content-Security-Policy", "frame-ancestors 'self'");`, '  res.setHeader("X-Frame-Options", "SAMEORIGIN");', '  next();', '});'].join('\n'),
      relatedScenarios: ['صفحه تنظیمات داخل Frame تحت کنترل مهاجم Load می‌شود.', 'دکمه تأیید با دکمه Decoy هم‌راستا می‌شود.', 'مرورگر قدیمی سیاست Frame ناقص را نادیده می‌گیرد.'],
      misconceptions: [
        ['«کاربر می‌بیند روی چه چیزی کلیک می‌کند.»', 'Frame شفاف یا تغییرشکل‌داده می‌تواند هدف واقعی را پنهان کند.'],
        ['«توکن CSRF جلوی Clickjacking را می‌گیرد.»', 'توکن جلوی کلیک واقعی کاربر داخل صفحه Frame شده را نمی‌گیرد.'],
        ['«JavaScript frame-busting کافی است.»', 'Frame busting اسکریپتی ضعیف‌تر از Headerهای enforce شده توسط مرورگر است.'],
      ],
    },
  }),
  makeArticle({
    id: 'path-traversal',
    slug: 'path-traversal',
    severity: 'High',
    relatedLabIds: ['path-001', 'path-002'],
    relatedVulnerabilityIds: ['file-upload', 'rce'],
    mappings: {
      owasp: ['OWASP Top 10 2021 A01: Broken Access Control', 'OWASP Web Security Testing Guide: Testing Directory Traversal File Include'],
      cwe: ['CWE-22: Improper Limitation of a Pathname to a Restricted Directory', 'CWE-23: Relative Path Traversal'],
      portSwigger: 'PortSwigger Web Security Academy: Path traversal',
    },
    references: [
      { title: 'OWASP Path Traversal', url: 'https://owasp.org/www-community/attacks/Path_Traversal' },
      { title: 'OWASP Testing Directory Traversal File Include', url: 'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/01-Testing_Directory_Traversal_File_Include' },
      { title: 'PortSwigger Path Traversal', url: 'https://portswigger.net/web-security/file-path-traversal' },
      { title: 'MITRE CWE-22', url: 'https://cwe.mitre.org/data/definitions/22.html' },
      { title: 'MITRE CWE-23', url: 'https://cwe.mitre.org/data/definitions/23.html' },
    ],
    en: {
      title: 'Path Traversal',
      summary: 'Path traversal occurs when user-controlled path input escapes an intended directory and reaches files the application did not mean to expose.',
      terms: {
        topic: 'Path Traversal',
        trustedBoundary: 'file names and path fragments supplied by users',
        coreFailure: 'the application joins user input into filesystem paths without canonicalizing and enforcing an allowed base directory',
        dataAtRisk: 'server-side files, configuration, source code, and generated documents',
        safeAction: 'requested files resolve inside the approved directory after decoding and canonicalization',
        browserMechanism: 'URL encoding can transform path markers before the server uses them',
        primaryControl: 'identifier-based file lookup, canonical path checks, allowlists, and storage isolation',
        reviewFocus: 'download routes, image handlers, archive extraction, template includes, and file APIs',
      },
      httpRequest: ['GET /files?name=LAB_PATH_MARKER HTTP/1.1', 'Host: example.test', 'Cookie: session=REDACTED'].join('\n'),
      httpResponse: ['HTTP/1.1 400 Bad Request', 'Content-Type: application/json', '', '{"message":"Invalid file reference"}'].join('\n'),
      vulnerableCode: ['const requested = String(req.query.name ?? "");', 'const filePath = path.join(storageRoot, requested);', 'res.sendFile(filePath);'].join('\n'),
      secureCode: ['const fileId = String(req.query.id ?? "");', 'const record = await files.findOwnedFile(req.user.id, fileId);', 'res.sendFile(record.absolutePath);'].join('\n'),
      relatedScenarios: ['A download route accepts path fragments instead of file IDs.', 'An image handler decodes input after validation.', 'Archive extraction writes entries outside the destination directory.'],
      misconceptions: [
        ['“Removing ../ is enough.”', 'Encoding, separators, symlinks, and decode order can bypass simple string removal.'],
        ['“The web root is the only sensitive place.”', 'Config, source, logs, and temporary files outside the web root can be sensitive.'],
        ['“Path traversal only reads files.”', 'Upload and extraction flows can write files too, which may lead to stronger impact.'],
      ],
    },
    fa: {
      title: 'پیمایش مسیر',
      summary: 'Path Traversal زمانی رخ می‌دهد که ورودی مسیر تحت کنترل کاربر از پوشه مجاز خارج شود و به فایل‌هایی برسد که برنامه قصد افشای آن‌ها را ندارد.',
      terms: {
        topic: 'پیمایش مسیر',
        trustedBoundary: 'نام فایل و تکه‌مسیرهای ارسال‌شده توسط کاربر',
        coreFailure: 'برنامه ورودی کاربر را بدون canonicalize کردن و enforce کردن پوشه پایه مجاز وارد مسیر فایل‌سیستم می‌کند',
        dataAtRisk: 'فایل‌های سمت سرور، پیکربندی، کد منبع و سندهای تولیدشده',
        safeAction: 'فایل درخواستی پس از Decode و Canonicalization داخل پوشه تأییدشده Resolve شود',
        browserMechanism: 'URL encoding می‌تواند نشانه‌های مسیر را قبل از استفاده سرور تغییر دهد',
        primaryControl: 'File lookup مبتنی بر شناسه، بررسی canonical path، allowlist و جداسازی Storage',
        reviewFocus: 'Routeهای دانلود، Image handler، استخراج Archive، Template include و File API',
      },
      httpRequest: ['GET /files?name=LAB_PATH_MARKER HTTP/1.1', 'Host: example.test', 'Cookie: session=REDACTED'].join('\n'),
      httpResponse: ['HTTP/1.1 400 Bad Request', 'Content-Type: application/json', '', '{"message":"Invalid file reference"}'].join('\n'),
      vulnerableCode: ['const requested = String(req.query.name ?? "");', 'const filePath = path.join(storageRoot, requested);', 'res.sendFile(filePath);'].join('\n'),
      secureCode: ['const fileId = String(req.query.id ?? "");', 'const record = await files.findOwnedFile(req.user.id, fileId);', 'res.sendFile(record.absolutePath);'].join('\n'),
      relatedScenarios: ['Route دانلود به‌جای File ID تکه‌مسیر می‌پذیرد.', 'Image handler ورودی را بعد از Validation دوباره Decode می‌کند.', 'استخراج Archive فایل را بیرون از مقصد می‌نویسد.'],
      misconceptions: [
        ['«حذف ../ کافی است.»', 'Encoding، Separator، Symlink و ترتیب Decode می‌توانند حذف رشته‌ای ساده را دور بزنند.'],
        ['«فقط Web root حساس است.»', 'Config، Source، Log و فایل‌های موقت بیرون Web root هم حساس‌اند.'],
        ['«Path traversal فقط فایل می‌خواند.»', 'جریان Upload و استخراج می‌تواند فایل بنویسد و اثر شدیدتری ایجاد کند.'],
      ],
    },
  }),
];


