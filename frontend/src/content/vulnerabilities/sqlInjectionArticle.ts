import type { BilingualVulnerabilityArticle, LocalizedVulnerabilityArticle } from './types';

const englishSqlInjection: LocalizedVulnerabilityArticle = {
  title: 'SQL Injection',
  summary:
    'SQL Injection is a server-side injection flaw where untrusted input becomes part of a database query. In an authorized lab, it teaches why applications must separate query structure from user-controlled values.',
  callouts: [
    {
      type: 'warning',
      title: 'Authorized-lab-only examples',
      body: 'The requests and payloads here use example.test and REDACTED values. They are for HackPath training labs and defensive review only.',
    },
  ],
  overviewSections: [
    {
      id: 'introduction',
      title: 'Introduction',
      body: [
        'SQL Injection, often shortened to SQLi, happens when an application builds SQL statements by mixing trusted query syntax with untrusted input. The database cannot tell which characters came from the developer and which characters came from the user. If the application concatenates a search term, product category, username, cookie value, or header into a query, an attacker may be able to change the meaning of that query.',
        'SQLi remains representative of web security because it combines input handling, authentication design, least privilege, logging, and secure coding discipline. A single vulnerable endpoint can expose private rows, bypass login checks, modify records, or invoke database-specific features. Even modern stacks are affected when developers step outside safe query APIs or use raw SQL without parameter binding.',
      ],
    },
    {
      id: 'technical-explanation',
      title: 'Technical explanation',
      body: [
        'A safe query has a fixed structure and binds values separately. An unsafe query is assembled as one string. For example, a product filter might create `SELECT * FROM products WHERE category = \'<input>\'`. If input is treated as SQL syntax, a crafted value can close the string literal, add a condition, comment out the remaining predicate, or append a UNION query.',
        'SQLi appears in several forms: in-band injection where results are returned in the response, blind injection where differences in true or false conditions reveal data, time-based injection where delays confirm execution, and second-order injection where malicious data is stored first and executed later in a different workflow.',
      ],
    },
    {
      id: 'root-causes',
      title: 'Root causes',
      body: [
        'The root cause is not simply “missing sanitization.” The deeper problem is that user-controlled data is allowed to influence query grammar. Common causes include string concatenation, dynamic ORDER BY clauses without allowlists, unsafe ORM raw-query helpers, generic escaping used in the wrong context, and database accounts with more privileges than the application needs.',
        'Another frequent cause is inconsistent trust boundaries. Data saved by administrators, imported from CSV files, copied from partner systems, or read from cookies may later be reused in SQL. If code assumes stored data is safe, second-order SQLi can survive initial validation and trigger in background jobs, reports, or audit views.',
      ],
    },
    {
      id: 'attack-surface',
      title: 'Attack surface',
      body: [
        'Any value that reaches a database query is part of the attack surface: route parameters, query strings, JSON bodies, form fields, cookies, HTTP headers, GraphQL arguments, CSV imports, webhooks, search filters, sort fields, and admin-only reporting screens.',
        'Authentication endpoints deserve special attention because they often compare usernames and passwords in a single query. Search and analytics endpoints are also high risk because developers may add flexible filters, joins, and ordering logic that bypasses normal ORM protections.',
      ],
    },
    {
      id: 'attack-lifecycle',
      title: 'Attack lifecycle',
      body: [
        'A tester usually starts by identifying inputs that affect database-backed content, then sends harmless probes such as a single quote or boolean condition in an authorized environment. The goal is to observe differences in status codes, error messages, row counts, response time, or application behavior.',
        'After confirming a vulnerability, the tester determines the query context, column count, database type, and output locations. In a real assessment, the work should stop at the minimum proof needed to demonstrate impact. In HackPath labs, the goal is to understand the pattern without touching real systems or real data.',
      ],
    },
    {
      id: 'technical-impact',
      title: 'Technical impact',
      body: [
        'Technical impact ranges from unauthorized reads to full write access. SQLi may expose credentials, password reset tokens, personal data, internal configuration, or API keys. It may also modify prices, change roles, delete rows, or bypass authorization by changing WHERE clauses.',
        'Some database engines and deployments make impact worse. Dangerous stored procedures, file read/write features, linked servers, weak database isolation, and overprivileged accounts can turn query manipulation into command execution or broad infrastructure compromise.',
      ],
    },
    {
      id: 'business-impact',
      title: 'Business impact',
      body: [
        'For the business, SQLi can become a breach notification event, regulatory incident, fraud vector, or trust failure. Even if no data is stolen, evidence that database queries can be changed by users usually requires emergency remediation, forensic review, and customer communication planning.',
        'The cost is rarely limited to one endpoint. Teams must review shared query helpers, ORM escape hatches, logging practices, access controls, and database privileges. SQLi is therefore both a coding flaw and an architectural risk signal.',
      ],
    },
    {
      id: 'detection-indicators',
      title: 'Detection indicators',
      body: [
        'Indicators include SQL syntax errors, unexpected row counts, identical responses for different credentials, delayed responses after time probes, database error strings in logs, WAF alerts, unusual UNION keywords, and repeated requests that vary only by quote, comment, or boolean syntax.',
        'Defenders should correlate web logs, application logs, database audit logs, and authentication anomalies. Avoid logging submitted secrets or full payloads when they may contain credentials, tokens, or sensitive user data.',
      ],
    },
    {
      id: 'manual-testing-methodology',
      title: 'Manual testing methodology',
      body: [
        'Manual testing should be controlled and minimal. Map inputs, confirm authorization scope, send non-destructive probes, compare true and false conditions, and document the vulnerable parameter. Use fake domains and lab data. Do not dump real tables or attempt privilege escalation outside an explicitly authorized lab.',
        'When testing dynamic identifiers such as sort fields or column names, parameterized values are not enough. Developers must use strict allowlists because bind parameters protect values, not SQL keywords or identifiers.',
      ],
    },
    {
      id: 'automated-testing-considerations',
      title: 'Automated testing considerations',
      body: [
        'Automated scanners can help find SQLi, but they need careful scoping. They may send many payload variations, trigger rate limits, affect audit logs, or cause unsafe write operations on fragile systems. In production-like environments, use read-only accounts and test data.',
        'Static analysis can catch string-concatenated SQL and unsafe raw-query helpers. Dynamic testing catches runtime query construction. Neither replaces code review of query boundaries, permissions, and business logic.',
      ],
    },
    {
      id: 'prevention',
      title: 'Prevention',
      body: [
        'Use prepared statements or ORM APIs that bind parameters by default. Keep query structure fixed, allowlist dynamic identifiers, validate input for business rules, and encode output separately for the rendering context. Escaping can be a defense-in-depth measure but should not be the primary SQLi control.',
        'Apply least privilege to database users. The application account should not own schema changes, administrative procedures, or unrelated databases. Strong monitoring and safe error handling reduce blast radius when a flaw is introduced.',
      ],
    },
    {
      id: 'remediation-workflow',
      title: 'Remediation workflow',
      body: [
        'First, identify every code path that builds the affected query. Replace string concatenation with parameter binding, convert dynamic identifiers to allowlists, and add regression tests for the vulnerable parameter. Then review adjacent endpoints that reuse the same helper or pattern.',
        'After code fixes, rotate credentials if sensitive data may have been exposed, review logs for exploitation attempts, reduce database privileges, and deploy monitoring for repeat probes. Document the root cause so future raw SQL changes go through extra review.',
      ],
    },
  ],
  httpExamples: [
    {
      id: 'boolean-probe',
      title: 'Boolean probe against a training search endpoint',
      description: 'A safe educational example showing how a lab request may reveal query manipulation through changed row counts.',
      request: [
        'GET /products?category=LAB_BOOLEAN_PROBE HTTP/1.1',
        'Host: example.test',
        'Cookie: session=REDACTED',
        'Accept: application/json',
      ].join('\n'),
      response: [
        'HTTP/1.1 200 OK',
        'Content-Type: application/json',
        '',
        '{',
        '  "training": true,',
        '  "message": "More rows returned than expected in this lab dataset."',
        '}',
      ].join('\n'),
    },
    {
      id: 'blocked-fixed-query',
      title: 'Expected behavior after parameter binding',
      description: 'The same value is treated as data, not SQL syntax, so the application returns a normal empty result.',
      request: [
        'GET /products?category=LAB_BOOLEAN_PROBE HTTP/1.1',
        'Host: example.test',
        'Cookie: session=REDACTED',
        'Accept: application/json',
      ].join('\n'),
      response: [
        'HTTP/1.1 200 OK',
        'Content-Type: application/json',
        '',
        '{',
        '  "items": [],',
        '  "message": "No products matched that literal category value."',
        '}',
      ].join('\n'),
    },
  ],
  impact: [
    'Unauthorized reading of rows that should be filtered by user, tenant, role, or workflow state.',
    'Authentication bypass when login predicates are altered.',
    'Data modification or deletion when write queries are injectable.',
    'Potential command execution in high-risk database deployments with unsafe privileges.',
  ],
  businessImpact: [
    'Customer data exposure, regulatory reporting, fraud, service interruption, and loss of trust.',
    'Emergency remediation across shared query helpers and database permissions, not only the first vulnerable route.',
  ],
  remediation: [
    'Replace concatenated SQL with prepared statements or safe ORM parameter binding.',
    'Allowlist dynamic identifiers such as sort columns and directions.',
    'Limit database privileges and remove dangerous procedures from application accounts.',
    'Add tests proving malicious-looking input remains a literal value.',
  ],
  safePayloadExamples: ['<boolean-condition probe>', '<false-condition probe>', '<union-shape probe with NULL placeholders>'],
  attackScenarios: [
    'A product filter returns unreleased items because the category predicate can be changed.',
    'A login query is altered so the password predicate is ignored.',
    'A reporting screen concatenates a sort field and exposes data across tenants.',
  ],
  commonMistakes: [
    'Assuming input validation alone prevents SQLi.',
    'Using escaping as the primary defense instead of parameter binding.',
    'Protecting form fields but forgetting cookies, headers, imports, and admin tools.',
    'Granting the application database account schema-owner privileges.',
  ],
  detection: {
    manual: [
      'Compare normal, quote, true-condition, and false-condition responses in a lab scope.',
      'Look for differences in row count, response time, status code, and error shape.',
      'Review raw SQL helpers and dynamic identifiers during code review.',
    ],
    automated: [
      'Use dynamic scanners only in authorized scopes with test data.',
      'Use static analysis to find concatenated SQL and unsafe raw-query APIs.',
      'Correlate scanner findings with database logs before declaring exploitability.',
    ],
  },
  codeExamples: [
    {
      language: 'typescript',
      title: 'Unsafe query construction and safe parameter binding',
      vulnerable: [
        'const category = request.query.category;',
        "const sql = \"SELECT id, name, price FROM products WHERE category = '\" + category + \"'\";",
        'const rows = await database.query(sql);',
      ].join('\n'),
      fixed: [
        'const category = String(request.query.category ?? "");',
        'const sql = "SELECT id, name, price FROM products WHERE category = ?";',
        'const rows = await database.query(sql, [category]);',
      ].join('\n'),
    },
  ],
  developerChecklist: [
    'Use parameter binding for every user-controlled value.',
    'Allowlist sort columns, table names, and directions.',
    'Avoid raw SQL unless reviewed and tested.',
    'Run the application with least-privilege database credentials.',
    'Return generic errors while logging safely without secrets.',
  ],
  testerChecklist: [
    'Confirm written authorization and test scope.',
    'Use non-destructive probes first.',
    'Document the vulnerable parameter and observed difference.',
    'Stop at minimum proof of impact outside dedicated labs.',
    'Verify the fixed version treats payloads as literal data.',
  ],
  misconceptions: [
    {
      myth: '“We use an ORM, so SQL Injection is impossible.”',
      correction: 'ORMs help, but raw queries, dynamic identifiers, and unsafe helper methods can still introduce SQLi.',
    },
    {
      myth: '“Escaping quotes is enough.”',
      correction: 'Escaping is context-sensitive and fragile. Parameter binding keeps values separate from query grammar.',
    },
    {
      myth: '“Only form fields matter.”',
      correction: 'Headers, cookies, imports, webhooks, JSON fields, and admin filters can all reach SQL.',
    },
    {
      myth: '“Blind SQLi has low impact.”',
      correction: 'Blind SQLi can still extract data through boolean or timing signals when enough requests are possible.',
    },
  ],
  reviewQuestions: [
    'Where does the query structure end and user-controlled data begin?',
    'Which database privileges are actually required by this endpoint?',
    'How would a regression test prove the payload is treated as data?',
  ],
};

const persianSqlInjection: LocalizedVulnerabilityArticle = {
  title: 'تزریق SQL',
  summary:
    'تزریق SQL نقصی سمت سرور است که در آن ورودی غیرقابل اعتماد به بخشی از پرس‌وجوی پایگاه داده تبدیل می‌شود. این مقاله برای محیط آموزشی مجاز توضیح می‌دهد چرا ساختار Query باید از مقدارهای کاربر جدا بماند.',
  callouts: [
    {
      type: 'warning',
      title: 'نمونه‌ها فقط برای آزمایشگاه مجاز',
      body: 'درخواست‌ها و Payloadهای این صفحه از دامنه example.test و مقدارهای REDACTED استفاده می‌کنند. هدف، آموزش HackPath و بازبینی دفاعی است؛ نه آزمون روی سامانه واقعی.',
    },
  ],
  overviewSections: [
    {
      id: 'introduction',
      title: 'مقدمه',
      body: [
        'تزریق SQL یا SQL Injection زمانی رخ می‌دهد که برنامه، دستور SQL را با ترکیب مستقیم Syntax قابل اعتماد و ورودی غیرقابل اعتماد بسازد. پایگاه داده نمی‌تواند تشخیص دهد کدام بخش را توسعه‌دهنده نوشته و کدام بخش از کاربر آمده است. اگر مقدار جستجو، دسته محصول، نام کاربری، Cookie یا Header مستقیم داخل Query چسبانده شود، مهاجم در محیط مجاز می‌تواند معنای Query را تغییر دهد.',
        'SQLi هنوز نمونه‌ای مهم برای آموزش امنیت وب است، چون فقط مشکل یک فیلد ورودی نیست. این نقص به مرزبندی اعتماد، طراحی احراز هویت، حداقل‌سازی دسترسی پایگاه داده، خطاهای امن، لاگ‌برداری و انضباط کدنویسی مربوط می‌شود. یک endpoint آسیب‌پذیر ممکن است ردیف‌های خصوصی را افشا کند، ورود را دور بزند، داده را تغییر دهد یا در برخی پیکربندی‌ها قابلیت‌های خطرناک پایگاه داده را فعال کند.',
      ],
    },
    {
      id: 'technical-explanation',
      title: 'توضیح فنی',
      body: [
        'در Query امن، ساختار دستور ثابت است و مقدارها جداگانه Bind می‌شوند. در Query ناامن، همه چیز به یک رشته تبدیل می‌شود. مثلاً فیلتر محصول ممکن است `SELECT * FROM products WHERE category = \'<input>\'` بسازد. اگر ورودی به‌عنوان Syntax SQL تفسیر شود، مقدار مخرب می‌تواند String literal را ببندد، شرط جدید اضافه کند، ادامه دستور را Comment کند یا UNION query بسازد.',
        'SQLi شکل‌های مختلفی دارد: in-band که نتیجه در پاسخ دیده می‌شود، blind که تفاوت شرط درست و غلط داده را آشکار می‌کند، time-based که تأخیر پاسخ نشانه اجراست، و second-order که داده مخرب ابتدا ذخیره می‌شود و بعداً در یک گردش کار دیگر اجرا می‌شود.',
      ],
    },
    {
      id: 'root-causes',
      title: 'علت‌های ریشه‌ای',
      body: [
        'علت ریشه‌ای فقط «Sanitize نکردن» نیست. مشکل اصلی این است که داده کاربر اجازه پیدا می‌کند Grammar پرس‌وجو را تغییر دهد. علت‌های رایج شامل String concatenation، ORDER BY پویا بدون allowlist، استفاده ناامن از raw query در ORM، Escaping عمومی در Context اشتباه، و دسترسی بیش از نیاز حساب پایگاه داده است.',
        'علت دیگر، مرزبندی اعتماد ناسازگار است. داده‌ای که مدیر وارد کرده، از CSV آمده، از سامانه شریک دریافت شده یا در Cookie ذخیره شده ممکن است بعداً در SQL استفاده شود. اگر کد فرض کند داده ذخیره‌شده امن است، SQLi نوع second-order می‌تواند از اعتبارسنجی اولیه عبور کند و در گزارش‌ها، Jobها یا صفحه‌های مدیریتی فعال شود.',
      ],
    },
    {
      id: 'attack-surface',
      title: 'سطح حمله',
      body: [
        'هر مقداری که به Query پایگاه داده برسد بخشی از سطح حمله است: پارامتر مسیر، Query string، JSON body، فرم، Cookie، Header، آرگومان GraphQL، واردات CSV، Webhook، فیلتر جستجو، فیلد مرتب‌سازی و حتی گزارش‌های فقط-مدیر.',
        'Endpointهای احراز هویت حساس‌ترند، چون معمولاً نام کاربری و رمز عبور را در یک Query مقایسه می‌کنند. صفحه‌های جستجو و Analytics هم پرخطر هستند، زیرا توسعه‌دهنده برای انعطاف بیشتر فیلتر، Join و مرتب‌سازی پویا اضافه می‌کند و گاهی از محافظت پیش‌فرض ORM خارج می‌شود.',
      ],
    },
    {
      id: 'attack-lifecycle',
      title: 'چرخه حمله آموزشی',
      body: [
        'تستر ابتدا ورودی‌هایی را پیدا می‌کند که روی داده پایگاه داده اثر دارند، سپس در محدوده مجاز Probeهای بی‌خطر مانند تک‌کوتیشن یا شرط Boolean می‌فرستد. هدف مشاهده تفاوت در Status code، خطا، تعداد ردیف، زمان پاسخ یا رفتار برنامه است.',
        'پس از تأیید نقص، تستر Context پرس‌وجو، تعداد ستون‌ها، نوع پایگاه داده و محل نمایش خروجی را مشخص می‌کند. در ارزیابی واقعی باید در حد کمترین اثبات لازم توقف کرد. در آزمایشگاه HackPath هدف فهم الگو است، نه تماس با سامانه یا داده واقعی.',
      ],
    },
    {
      id: 'technical-impact',
      title: 'اثر فنی',
      body: [
        'اثر فنی از خواندن غیرمجاز تا تغییر کامل داده گسترده است. SQLi می‌تواند اعتبارنامه‌ها، توکن‌های Reset، داده شخصی، پیکربندی داخلی یا کلیدهای API را افشا کند. همچنین ممکن است قیمت‌ها، نقش‌ها یا ردیف‌ها را تغییر دهد یا با تغییر WHERE clause کنترل دسترسی را دور بزند.',
        'برخی موتورهای پایگاه داده و استقرارها اثر را شدیدتر می‌کنند. Stored procedureهای خطرناک، قابلیت خواندن/نوشتن فایل، linked server، جداسازی ضعیف و حساب‌های پرمجوز می‌توانند دستکاری Query را به اجرای فرمان یا نفوذ گسترده‌تر تبدیل کنند.',
      ],
    },
    {
      id: 'business-impact',
      title: 'اثر کسب‌وکار',
      body: [
        'برای کسب‌وکار، SQLi می‌تواند به رخداد افشای داده، گزارش‌دهی قانونی، تقلب، قطعی سرویس یا از دست رفتن اعتماد تبدیل شود. حتی اگر داده‌ای سرقت نشده باشد، اثبات تغییرپذیری Query توسط کاربر معمولاً نیازمند اصلاح فوری، بررسی رخداد و برنامه ارتباط با مشتری است.',
        'هزینه معمولاً محدود به یک endpoint نیست. تیم باید helperهای مشترک Query، مسیرهای raw SQL، لاگ‌برداری، کنترل دسترسی و مجوزهای پایگاه داده را بررسی کند. بنابراین SQLi هم نقص کدنویسی است و هم نشانه ریسک معماری.',
      ],
    },
    {
      id: 'detection-indicators',
      title: 'نشانه‌های تشخیص',
      body: [
        'نشانه‌ها شامل خطای Syntax SQL، تعداد ردیف غیرمنتظره، پاسخ یکسان برای اعتبارنامه‌های متفاوت، تأخیر پس از Probe زمانی، رشته خطای پایگاه داده در لاگ، هشدار WAF، کلمه UNION غیرعادی و درخواست‌هایی است که فقط در Quote، Comment یا Boolean syntax تفاوت دارند.',
        'مدافع باید لاگ وب، لاگ برنامه، Audit log پایگاه داده و ناهنجاری‌های ورود را کنار هم ببیند. از ثبت Secretها یا Payload کامل که ممکن است شامل رمز، Token یا داده حساس باشد خودداری کنید.',
      ],
    },
    {
      id: 'manual-testing-methodology',
      title: 'روش تست دستی',
      body: [
        'تست دستی باید کنترل‌شده و حداقلی باشد. ورودی‌ها را نقشه‌برداری کنید، مجوز و Scope را تأیید کنید، Probeهای غیرمخرب بفرستید، شرط درست و غلط را مقایسه کنید و پارامتر آسیب‌پذیر را مستند کنید. از دامنه جعلی و داده آزمایشگاهی استفاده کنید و خارج از آزمایشگاه اختصاصی، جدول واقعی Dump نکنید.',
        'برای شناسه‌های پویا مثل Sort field یا نام ستون، Bind parameter کافی نیست. Parameter binding مقدارها را محافظت می‌کند، نه Keyword یا Identifierهای SQL را. در این موارد باید allowlist سخت‌گیرانه استفاده شود.',
      ],
    },
    {
      id: 'automated-testing-considerations',
      title: 'ملاحظات تست خودکار',
      body: [
        'اسکنرهای خودکار برای یافتن SQLi مفیدند، اما Scope دقیق لازم دارند. این ابزارها Payloadهای زیادی می‌فرستند، ممکن است Rate limit را فعال کنند، لاگ‌ها را آلوده کنند یا روی سامانه شکننده عملیات ناخواسته ایجاد کنند. در محیط شبیه تولید از داده تست و حساب فقط‌خواندنی استفاده کنید.',
        'تحلیل ایستا می‌تواند SQL ساخته‌شده با String concatenation و raw-query helperهای ناامن را پیدا کند. تست پویا ساخت Query در زمان اجرا را آشکار می‌کند. هیچ‌کدام جای بازبینی مرز Query، مجوزها و منطق کسب‌وکار را نمی‌گیرد.',
      ],
    },
    {
      id: 'prevention',
      title: 'پیشگیری',
      body: [
        'از Prepared statement یا APIهای ORM که مقدارها را Bind می‌کنند استفاده کنید. ساختار Query را ثابت نگه دارید، Identifierهای پویا را allowlist کنید، ورودی را بر اساس قانون کسب‌وکار اعتبارسنجی کنید و خروجی را جداگانه متناسب با Context نمایش Encode کنید. Escaping فقط دفاع کمکی است و نباید کنترل اصلی SQLi باشد.',
        'اصل Least privilege را روی حساب پایگاه داده اعمال کنید. حساب برنامه نباید مالک تغییر Schema، Procedureهای مدیریتی یا پایگاه‌های نامرتبط باشد. مانیتورینگ مناسب و خطای امن، شعاع اثر را هنگام ورود نقص جدید کم می‌کند.',
      ],
    },
    {
      id: 'remediation-workflow',
      title: 'گردش کار اصلاح',
      body: [
        'ابتدا همه مسیرهایی را که Query آسیب‌دیده را می‌سازند پیدا کنید. String concatenation را با Parameter binding جایگزین کنید، Identifierهای پویا را به allowlist تبدیل کنید و برای پارامتر آسیب‌پذیر Regression test بنویسید. سپس endpointهای کنار آن را که همان helper یا الگو را دارند بررسی کنید.',
        'پس از اصلاح کد، اگر احتمال افشای داده وجود دارد Credentialها را بچرخانید، لاگ‌ها را برای تلاش‌های سوءاستفاده بررسی کنید، مجوزهای پایگاه داده را کاهش دهید و پایش Probeهای تکراری را فعال کنید. علت ریشه‌ای را مستند کنید تا تغییرات raw SQL در آینده بازبینی اضافه بگیرند.',
      ],
    },
  ],
  httpExamples: [
    {
      id: 'boolean-probe',
      title: 'Probe بولی روی endpoint آموزشی جستجو',
      description: 'نمونه امن آموزشی که نشان می‌دهد در آزمایشگاه، تغییر تعداد ردیف می‌تواند نشانه دستکاری Query باشد.',
      request: [
        'GET /products?category=LAB_BOOLEAN_PROBE HTTP/1.1',
        'Host: example.test',
        'Cookie: session=REDACTED',
        'Accept: application/json',
      ].join('\n'),
      response: [
        'HTTP/1.1 200 OK',
        'Content-Type: application/json',
        '',
        '{',
        '  "training": true,',
        '  "message": "More rows returned than expected in this lab dataset."',
        '}',
      ].join('\n'),
    },
    {
      id: 'blocked-fixed-query',
      title: 'رفتار مورد انتظار پس از Parameter binding',
      description: 'همان مقدار به‌عنوان داده literal پردازش می‌شود، نه Syntax SQL؛ بنابراین پاسخ عادی و خالی است.',
      request: [
        'GET /products?category=LAB_BOOLEAN_PROBE HTTP/1.1',
        'Host: example.test',
        'Cookie: session=REDACTED',
        'Accept: application/json',
      ].join('\n'),
      response: [
        'HTTP/1.1 200 OK',
        'Content-Type: application/json',
        '',
        '{',
        '  "items": [],',
        '  "message": "No products matched that literal category value."',
        '}',
      ].join('\n'),
    },
  ],
  impact: [
    'خواندن غیرمجاز ردیف‌هایی که باید با کاربر، Tenant، نقش یا وضعیت Workflow محدود شوند.',
    'دور زدن احراز هویت وقتی Predicate ورود تغییر داده شود.',
    'تغییر یا حذف داده در Queryهای نوشتنی آسیب‌پذیر.',
    'احتمال اجرای فرمان در استقرارهای پرخطر با مجوزهای ناامن پایگاه داده.',
  ],
  businessImpact: [
    'افشای داده مشتری، الزامات قانونی، تقلب، اختلال سرویس و کاهش اعتماد.',
    'نیاز به اصلاح فوری در helperهای مشترک Query و مجوزهای پایگاه داده، نه فقط یک Route.',
  ],
  remediation: [
    'SQL چسبانده‌شده را با Prepared statement یا Parameter binding امن ORM جایگزین کنید.',
    'ستون‌ها و جهت‌های مرتب‌سازی پویا را فقط از allowlist بپذیرید.',
    'مجوز پایگاه داده را محدود و Procedureهای خطرناک را از حساب برنامه حذف کنید.',
    'تست اضافه کنید که ثابت کند ورودی شبیه Payload به‌عنوان داده literal پردازش می‌شود.',
  ],
  safePayloadExamples: ['<boolean-condition probe>', '<false-condition probe>', '<union-shape probe with NULL placeholders>'],
  attackScenarios: [
    'فیلتر محصول، آیتم‌های منتشرنشده را برمی‌گرداند چون Predicate دسته قابل تغییر است.',
    'Query ورود تغییر می‌کند و شرط رمز عبور نادیده گرفته می‌شود.',
    'گزارش مدیریتی، Sort field را می‌چسباند و داده Tenantهای دیگر را افشا می‌کند.',
  ],
  commonMistakes: [
    'فرض اینکه اعتبارسنجی ورودی به‌تنهایی SQLi را حذف می‌کند.',
    'استفاده از Escaping به‌عنوان دفاع اصلی به‌جای Parameter binding.',
    'محافظت از فرم‌ها اما فراموش کردن Cookie، Header، Import و ابزارهای مدیر.',
    'دادن مجوز Schema owner به حساب پایگاه داده برنامه.',
  ],
  detection: {
    manual: [
      'در Scope آزمایشگاهی پاسخ عادی، Quote، شرط درست و شرط غلط را مقایسه کنید.',
      'به تفاوت تعداد ردیف، زمان پاسخ، Status code و شکل خطا توجه کنید.',
      'در بازبینی کد raw SQL helperها و Identifierهای پویا را بررسی کنید.',
    ],
    automated: [
      'اسکنر پویا را فقط در Scope مجاز و با داده تست اجرا کنید.',
      'از تحلیل ایستا برای پیدا کردن SQL چسبانده‌شده و raw-query APIهای ناامن استفاده کنید.',
      'یافته اسکنر را با لاگ پایگاه داده تطبیق دهید و بعد Exploitability را اعلام کنید.',
    ],
  },
  codeExamples: [
    {
      language: 'typescript',
      title: 'ساخت Query ناامن و Parameter binding امن',
      vulnerable: [
        'const category = request.query.category;',
        "const sql = \"SELECT id, name, price FROM products WHERE category = '\" + category + \"'\";",
        'const rows = await database.query(sql);',
      ].join('\n'),
      fixed: [
        'const category = String(request.query.category ?? "");',
        'const sql = "SELECT id, name, price FROM products WHERE category = ?";',
        'const rows = await database.query(sql, [category]);',
      ].join('\n'),
    },
  ],
  developerChecklist: [
    'برای هر مقدار تحت کنترل کاربر از Parameter binding استفاده کن.',
    'نام ستون، نام جدول و جهت مرتب‌سازی را allowlist کن.',
    'raw SQL را فقط با بازبینی و تست اضافه کن.',
    'برنامه را با Credentialهای کم‌مجوز پایگاه داده اجرا کن.',
    'خطای عمومی برگردان و بدون Secret لاگ بگیر.',
  ],
  testerChecklist: [
    'مجوز کتبی و Scope تست را تأیید کن.',
    'اول Probe غیرمخرب بفرست.',
    'پارامتر آسیب‌پذیر و تفاوت مشاهده‌شده را مستند کن.',
    'خارج از آزمایشگاه اختصاصی، در حد کمترین اثبات اثر توقف کن.',
    'در نسخه اصلاح‌شده بررسی کن Payload به‌عنوان داده literal پردازش می‌شود.',
  ],
  misconceptions: [
    {
      myth: '«ما ORM داریم، پس SQL Injection ممکن نیست.»',
      correction: 'ORM کمک می‌کند، اما raw query، Identifier پویا و helper ناامن همچنان SQLi ایجاد می‌کنند.',
    },
    {
      myth: '«Escape کردن Quote کافی است.»',
      correction: 'Escaping وابسته به Context و شکننده است. Parameter binding مقدار را از Grammar Query جدا نگه می‌دارد.',
    },
    {
      myth: '«فقط فیلدهای فرم مهم‌اند.»',
      correction: 'Header، Cookie، Import، Webhook، JSON و فیلترهای مدیر هم می‌توانند به SQL برسند.',
    },
    {
      myth: '«Blind SQLi اثر کمی دارد.»',
      correction: 'Blind SQLi با سیگنال Boolean یا Timing و تعداد درخواست کافی همچنان می‌تواند داده استخراج کند.',
    },
  ],
  reviewQuestions: [
    'ساختار Query کجا تمام می‌شود و داده کاربر از کجا شروع می‌شود؟',
    'این endpoint واقعاً به چه مجوزهایی در پایگاه داده نیاز دارد؟',
    'Regression test چگونه ثابت می‌کند Payload فقط داده است؟',
  ],
};

export const sqlInjectionArticle: BilingualVulnerabilityArticle = {
  id: 'sqli',
  slug: 'sql-injection',
  batch: 1,
  severity: 'Critical',
  currentContentSource: 'frontend/src/data/vulnerabilities.ts',
  relatedLabIds: ['sqli-001', 'sqli-002', 'sqli-003', 'sqli-004', 'sqli-005', 'sqli-006'],
  relatedVulnerabilityIds: ['nosqli', 'ssti', 'rce'],
  mappings: {
    owasp: ['OWASP Top 10 2021 A03: Injection', 'OWASP Web Security Testing Guide: Testing for SQL Injection'],
    cwe: ['CWE-89: Improper Neutralization of Special Elements used in an SQL Command'],
    portSwigger: 'PortSwigger Web Security Academy: SQL injection',
  },
  references: [
    { title: 'OWASP SQL Injection', url: 'https://owasp.org/www-community/attacks/SQL_Injection' },
    { title: 'OWASP SQL Injection Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html' },
    { title: 'OWASP Web Security Testing Guide — Testing for SQL Injection', url: 'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection' },
    { title: 'PortSwigger Web Security Academy — SQL injection', url: 'https://portswigger.net/web-security/sql-injection' },
    { title: 'MITRE CWE-89', url: 'https://cwe.mitre.org/data/definitions/89.html' },
  ],
  status: {
    english: 'complete',
    persian: 'complete',
    references: 'complete',
    tests: 'complete',
    finalReview: 'complete',
  },
  locales: {
    en: englishSqlInjection,
    fa: persianSqlInjection,
  },
};


