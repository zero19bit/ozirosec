import { buildDefensiveEducation } from './defensiveWriteups';

export interface Vulnerability {
  id: string;
  slug: string;
  title: string;
  description: string;
  defensiveEducation: string;
  impact: string;
  remediation: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  examples: string[];
  attackScenarios: string[];
  commonMistakes: string[];
  codeExamples: {
    vulnerable: string;
    fixed: string;
    language: string;
  };
  detectionMethods: {
    manual: string[];
    automated: string[];
  };
  references: { title: string; url: string }[];
  icon: string;
  color: string;
}

const vulnerabilitySeeds: Array<Omit<Vulnerability, 'defensiveEducation'>> = [
  {
    id: 'sqli',
    slug: 'sql-injection',
    title: 'SQL Injection',
    description: 'SQL Injection (SQLi) is a web security vulnerability that allows attackers to interfere with the queries that an application makes to its database. It allows attackers to view data they are not normally able to retrieve, modify or delete data, and in some cases execute commands on the underlying server.',
    impact: 'Data breach, authentication bypass, data manipulation, remote code execution on the database server, complete system compromise.',
    remediation: 'Use parameterized queries (prepared statements), implement stored procedures correctly, use an allowlist for input validation, escape special characters, use an ORM, apply principle of least privilege to database accounts.',
    severity: 'Critical',
    examples: [
      'Authentication-bypass probe using a benign training marker',
      'UNION-style column alignment probe with redacted column values',
      'Boolean-condition probe that compares true and false responses',
      'Time-delay probe using a redacted delay function',
      'Stored-value probe that is later consumed by a separate query'
    ],
    attackScenarios: [
      'Attacker terminates an unsafe username query and bypasses authentication',
      'Using UNION-based injection to retrieve unauthorized database fields',
      'Blind SQLi via time delays to enumerate database structure without visible output',
      'Second-order injection: malicious data stored then executed in a different query'
    ],
    commonMistakes: [
      'Using string concatenation to build SQL queries',
      'Relying solely on client-side validation',
      'Using blacklisting instead of allowlisting for input',
      'Granting excessive database privileges to the application account',
      'Not sanitizing input from all sources (headers, cookies, URL params)'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: String concatenation
const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
db.execute(query);`,
      fixed: `// FIXED: Parameterized query
const query = "SELECT * FROM users WHERE username = ? AND password = ?";
db.execute(query, [username, password]);`
    },
    detectionMethods: {
      manual: [
        'Enter a single quote (\') and observe errors',
        'Test boolean-condition probes in authorized input fields',
        'Test with a redacted time-delay probe in a training environment',
        'Check for differences in response with TRUE vs FALSE conditions'
      ],
      automated: [
        'SQLMap: sqlmap -u "http://target.com/page?id=1" --dbs',
        'Burp Suite Active Scanner',
        'OWASP ZAP automated scan',
        'Havij (legacy but educational)'
      ]
    },
    references: [
      { title: 'OWASP SQL Injection', url: 'https://owasp.org/www-community/attacks/SQL_Injection' },
      { title: 'PortSwigger SQL Injection', url: 'https://portswigger.net/web-security/sql-injection' }
    ],
    icon: '🗄️',
    color: 'red'
  },
  {
    id: 'xss',
    slug: 'cross-site-scripting',
    title: 'Cross-Site Scripting (XSS)',
    description: 'Cross-site scripting (XSS) is a client-side code injection attack. The attacker aims to execute malicious scripts in a web browser of the victim by including malicious code in a legitimate web page or web application. Types include Reflected, Stored, and DOM-based XSS.',
    impact: 'Session hijacking, credential theft, malware distribution, defacement, keylogging, phishing attacks within trusted context.',
    remediation: 'Encode output based on context (HTML, JS, CSS, URL), use Content Security Policy (CSP), sanitize input with allowlists, use modern frameworks that auto-escape, implement HttpOnly and Secure cookie flags.',
    severity: 'High',
    examples: [
      'HTML element injection with a harmless training marker',
      'Event-handler injection represented with redacted code',
      'JavaScript URL handling test in a controlled sandbox',
      'SVG event handling test with a redacted callback',
      'Context-breakout test that does not include a live exfiltration target'
    ],
    attackScenarios: [
      'Stored XSS in a forum post that steals session cookies from all visitors',
      'Reflected XSS in a search parameter used in a phishing email',
      'DOM-based XSS exploiting unsafe innerHTML assignment',
      'XSS in a PDF viewer to exfiltrate sensitive document content'
    ],
    commonMistakes: [
      'Using innerHTML or document.write with user-controlled data',
      'Insufficient output encoding (encoding HTML but not JavaScript context)',
      'Trusting data from your own database without re-encoding on output',
      'Ignoring DOM-based XSS in JavaScript code',
      'Weak CSP policies with unsafe-inline or wildcard sources'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: Direct innerHTML assignment
const name = new URLSearchParams(location.search).get('name');
document.getElementById('greeting').innerHTML = 'Hello, ' + name;`,
      fixed: `// FIXED: Use textContent and proper encoding
const name = new URLSearchParams(location.search).get('name');
const el = document.getElementById('greeting');
el.textContent = 'Hello, ' + name; // textContent safely encodes`
    },
    detectionMethods: {
      manual: [
        'Inject a harmless encoded training marker in authorized input fields',
        'Test event-handler contexts with redacted callbacks',
        'Check if input is reflected in page source',
        'Test DOM sinks: location.hash, document.referrer'
      ],
      automated: [
        'Burp Suite Scanner with XSS detection',
        'OWASP ZAP active scan',
        'XSSHunter for blind XSS',
        'Dalfox: dalfox url "http://target.com/?q=test"'
      ]
    },
    references: [
      { title: 'OWASP XSS Prevention', url: 'https://owasp.org/www-community/attacks/xss/' },
      { title: 'PortSwigger XSS', url: 'https://portswigger.net/web-security/cross-site-scripting' }
    ],
    icon: '💉',
    color: 'orange'
  },
  {
    id: 'csrf',
    slug: 'csrf',
    title: 'Cross-Site Request Forgery (CSRF)',
    description: 'CSRF is an attack that forces authenticated users to submit a request to a web application against which they are currently authenticated. CSRF attacks exploit the trust a site has in the user\'s browser, tricking victims into performing unintended actions.',
    impact: 'Unauthorized fund transfers, email/password changes, account deletion, privilege escalation, data modification on behalf of victim.',
    remediation: 'Use CSRF tokens (synchronizer pattern or double submit), implement SameSite cookie attribute, verify Origin/Referer headers, require re-authentication for sensitive actions.',
    severity: 'High',
    examples: [
      '<form action="https://bank.com/transfer" method="POST"><input name="to" value="attacker"><input name="amount" value="10000"></form>',
      '<img src="https://victim.com/delete-account?confirm=true">',
      'fetch("https://victim.com/api/change-email", {method:"POST",body:"email=hacker@evil.com",credentials:"include"})'
    ],
    attackScenarios: [
      'Malicious page with hidden form that transfers bank funds when victim visits',
      'Email with embedded image that triggers account deletion',
      'Forum post with JavaScript that changes victim email address',
      'OAuth CSRF to link attacker account to victim profile'
    ],
    commonMistakes: [
      'Relying only on cookies for authentication without CSRF tokens',
      'Using GET requests for state-changing operations',
      'Not validating SameSite cookie attribute',
      'Accepting CSRF tokens via URL parameters instead of headers',
      'Not invalidating CSRF tokens after use'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: No CSRF protection
app.post('/transfer', (req, res) => {
  const { to, amount } = req.body;
  // Just checks if user is logged in via cookie
  if (req.session.userId) {
    transferFunds(req.session.userId, to, amount);
  }
});`,
      fixed: `// FIXED: CSRF token validation
app.post('/transfer', csrfProtection, (req, res) => {
  // csrfProtection middleware validates the token
  const { to, amount } = req.body;
  if (req.session.userId) {
    transferFunds(req.session.userId, to, amount);
  }
});`
    },
    detectionMethods: {
      manual: [
        'Check if state-changing requests include CSRF tokens',
        'Try removing/modifying the CSRF token in requests',
        'Test if SameSite cookie attribute is set',
        'Verify Origin/Referer header validation'
      ],
      automated: [
        'Burp Suite CSRF PoC generator',
        'OWASP ZAP CSRF tester',
        'CSRFTester tool'
      ]
    },
    references: [
      { title: 'OWASP CSRF', url: 'https://owasp.org/www-community/attacks/csrf' },
      { title: 'PortSwigger CSRF', url: 'https://portswigger.net/web-security/csrf' }
    ],
    icon: '🔄',
    color: 'yellow'
  },
  {
    id: 'ssrf',
    slug: 'ssrf',
    title: 'Server-Side Request Forgery (SSRF)',
    description: 'SSRF is a web security vulnerability that allows attackers to induce the server-side application to make HTTP requests to an arbitrary domain of the attacker\'s choosing. This can lead to unauthorized access to internal services, cloud metadata APIs, and internal network scanning.',
    impact: 'Internal network scanning, access to cloud metadata (AWS/GCP/Azure), access to internal services, SSRF-to-RCE in some configurations, data exfiltration.',
    remediation: 'Allowlist permitted domains/IPs, disable unnecessary URL schemes, use a DNS resolver that blocks internal IPs, validate and sanitize all user-supplied URLs, implement network segmentation.',
    severity: 'Critical',
    examples: [
      'http://metadata.training.local/latest/meta-data/',
      'http://localhost:8080/admin',
      'http://internal-service.local/api/users',
      'file:///safe/training/file.txt',
      'dict://127.0.0.1:11211/stat'
    ],
    attackScenarios: [
      'Fetching AWS metadata endpoint to obtain IAM credentials',
      'Scanning internal network to discover hidden services',
      'Accessing internal admin panels not exposed to internet',
      'Using Gopher protocol to interact with internal Redis/Memcached'
    ],
    commonMistakes: [
      'Fetching URLs provided directly by users without validation',
      'Not blocking internal IP ranges (127.0.0.1, 10.x.x.x, 172.16.x.x, 192.168.x.x)',
      'Allowing file:// and dict:// URL schemes',
      'Not validating redirect destinations',
      'Relying on hostname filtering without resolving to IP first'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: Direct URL fetch from user input
app.get('/fetch', async (req, res) => {
  const { url } = req.query;
  const response = await fetch(url); // Dangerous!
  res.send(await response.text());
});`,
      fixed: `// FIXED: Strict URL allowlist
const ALLOWED_DOMAINS = ['api.trusted.com', 'cdn.example.com'];
app.get('/fetch', async (req, res) => {
  const { url } = req.query;
  const parsed = new URL(url);
  if (!ALLOWED_DOMAINS.includes(parsed.hostname)) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }
  const response = await fetch(url);
  res.send(await response.text());
});`
    },
    detectionMethods: {
      manual: [
        'Replace URLs with Burp Collaborator/interactsh URLs',
        'Test with internal IP addresses and cloud metadata endpoints',
        'Try different URL schemes: file://, dict://, gopher://',
        'Test URL parsers with bypass techniques like 0.0.0.0, 127.1'
      ],
      automated: [
        'Burp Suite with Collaborator for out-of-band detection',
        'SSRFire automated SSRF scanner',
        'Interactsh for blind SSRF detection'
      ]
    },
    references: [
      { title: 'OWASP SSRF', url: 'https://owasp.org/www-community/attacks/Server_Side_Request_Forgery' },
      { title: 'PortSwigger SSRF', url: 'https://portswigger.net/web-security/ssrf' }
    ],
    icon: '🌐',
    color: 'purple'
  },
  {
    id: 'xxe',
    slug: 'xxe',
    title: 'XML External Entity (XXE)',
    description: 'XXE injection is a type of attack against an application that parses XML input. It occurs when XML input containing a reference to an external entity is processed by a weakly configured XML parser. XXE can lead to disclosure of confidential data, SSRF, port scanning, and RCE.',
    impact: 'Sensitive file disclosure (/safe/training/file.txt), SSRF, port scanning, denial of service (Billion Laughs), remote code execution in some configurations.',
    remediation: 'Disable external entity processing in XML parsers, use simpler data formats (JSON), update/patch XML processors, use SAST tools, implement allowlists for XML content.',
    severity: 'Critical',
    examples: [
      '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///safe/training/file.txt">]><root>&xxe;</root>',
      '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://metadata.training.local/latest/meta-data/">]>',
      '<!DOCTYPE lolz [<!ENTITY lol "lol"><!ENTITY lol2 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">]>'
    ],
    attackScenarios: [
      'XML upload feature parsing malicious DOCTYPE to read server files',
      'XXE via SVG file upload in a web application',
      'Blind XXE using out-of-band data exfiltration via DNS',
      'XXE in SAML authentication to read sensitive server files'
    ],
    commonMistakes: [
      'Not disabling external entity resolution in XML parsers',
      'Accepting XML input in unexpected places (e.g., JSON endpoints that also accept XML)',
      'Not auditing third-party libraries for XXE vulnerabilities',
      'Allowing SVG/DOCX/XLSX uploads without stripping XML entities'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: XML parser with external entities enabled
const parser = new DOMParser();
const doc = parser.parseFromString(userXML, 'application/xml');
// External entities will be resolved!`,
      fixed: `// FIXED: Disable external entities (Java example)
DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);`
    },
    detectionMethods: {
      manual: [
        'Inject external entity DOCTYPE declarations in XML input',
        'Test file:// protocol to read /safe/training/file.txt or win.ini',
        'Use Burp Collaborator for blind XXE detection',
        'Check SVG, XLSX, DOCX upload endpoints'
      ],
      automated: [
        'Burp Suite active scanner for XXE',
        'XXEinjector automated tool',
        'OWASP ZAP XXE detection plugin'
      ]
    },
    references: [
      { title: 'OWASP XXE', url: 'https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing' },
      { title: 'PortSwigger XXE', url: 'https://portswigger.net/web-security/xxe' }
    ],
    icon: '📄',
    color: 'blue'
  },
  {
    id: 'rce',
    slug: 'remote-code-execution',
    title: 'Remote Code Execution (RCE)',
    description: 'Remote Code Execution vulnerabilities allow attackers to run arbitrary code on the target server. RCE can occur through command injection, deserialization flaws, file inclusion, template injection, or exploiting vulnerable software components.',
    impact: 'Complete server compromise, data theft, malware installation, pivot to internal network, cryptomining, ransomware deployment.',
    remediation: 'Avoid executing shell commands with user input, use parameterized APIs, keep software updated, implement application firewalls, run applications with least privilege, use sandboxing.',
    severity: 'Critical',
    examples: [
      '; cat /safe/training/file.txt',
      '| whoami',
      '`id`',
      '$(cat /safe/training/file.txt)',
      '& net user'
    ],
    attackScenarios: [
      'Command injection in ping utility: user controls the IP address field',
      'PHP file inclusion vulnerability executing uploaded malicious PHP file',
      'Deserialization of malicious Java object triggering code execution',
      'Server-Side Template Injection executing OS commands via template engine'
    ],
    commonMistakes: [
      'Passing user input to exec(), system(), eval() without sanitization',
      'Deserializing untrusted data without integrity verification',
      'Including files based on user-controlled paths',
      'Running web applications as root/administrator',
      'Not keeping dependencies updated'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: Command injection
const { exec } = require('child_process');
app.get('/ping', (req, res) => {
  const ip = req.query.ip;
  exec('ping -c 1 ' + ip, (err, stdout) => { // INJECTION POINT!
    res.send(stdout);
  });
});`,
      fixed: `// FIXED: Validate IP, use argument array
const { execFile } = require('child_process');
app.get('/ping', (req, res) => {
  const ip = req.query.ip;
  if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    return res.status(400).send('Invalid IP');
  }
  execFile('ping', ['-c', '1', ip], (err, stdout) => {
    res.send(stdout);
  });
});`
    },
    detectionMethods: {
      manual: [
        'Test command separators: ; | && || ` $() in all inputs',
        'Use time-based blind detection: ; sleep 5',
        'Check for SSTI with {{7*7}} or ${7*7}',
        'Test file upload for code execution'
      ],
      automated: [
        'Commix: automated command injection exploitation',
        'Burp Suite active scanner',
        'Nuclei templates for RCE detection'
      ]
    },
    references: [
      { title: 'OWASP Command Injection', url: 'https://owasp.org/www-community/attacks/Command_Injection' },
      { title: 'PortSwigger OS Command Injection', url: 'https://portswigger.net/web-security/os-command-injection' }
    ],
    icon: '💻',
    color: 'red'
  },
  {
    id: 'path-traversal',
    slug: 'path-traversal',
    title: 'Path Traversal',
    description: 'Path traversal (also known as directory traversal) allows attackers to read files outside the intended directory by manipulating variables that reference files with ../ sequences or absolute paths, potentially exposing sensitive system files.',
    impact: 'Sensitive file disclosure (credentials, config files, source code), potential code execution if combined with file write vulnerabilities.',
    remediation: 'Use allowlists for permitted files, canonicalize paths before validation, jail the application to a specific directory (chroot), use file permission restrictions.',
    severity: 'High',
    examples: [
      '../../../../safe/training/file.txt',
      '..\\..\\..\\windows\\win.ini',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '....//....//....//safe/training/file.txt',
      '/var/www/images/../../../etc/shadow'
    ],
    attackScenarios: [
      'File download endpoint: /download?file=../../../../safe/training/file.txt',
      'Image loading: /img?path=../../config/database.yml',
      'Log viewing feature traversing to sensitive configuration files',
      'Template inclusion with user-controlled path parameter'
    ],
    commonMistakes: [
      'Using user input directly in file system operations',
      'Only blocking ../ without encoding variants',
      'Not using realpath() to canonicalize paths',
      'Trusting sanitized input from client side',
      'Not restricting file access to specific directories'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: Direct path concatenation
app.get('/file', (req, res) => {
  const filename = req.query.name;
  const path = '/var/www/files/' + filename; // Traversal possible!
  res.sendFile(path);
});`,
      fixed: `// FIXED: Path canonicalization and validation
const path = require('path');
app.get('/file', (req, res) => {
  const filename = req.query.name;
  const baseDir = '/var/www/files';
  const fullPath = path.resolve(baseDir, filename);
  if (!fullPath.startsWith(baseDir)) {
    return res.status(403).send('Access denied');
  }
  res.sendFile(fullPath);
});`
    },
    detectionMethods: {
      manual: [
        'Try ../../../safe/training/file.txt in file-related parameters',
        'Test URL-encoded variants: %2e%2e%2f',
        'Try Windows paths on potential Windows servers',
        'Test double encoding: %252e%252e%252f'
      ],
      automated: [
        'Burp Suite path traversal scanner',
        'DotDotPwn path traversal fuzzer',
        'OWASP ZAP directory traversal scanner'
      ]
    },
    references: [
      { title: 'OWASP Path Traversal', url: 'https://owasp.org/www-community/attacks/Path_Traversal' },
      { title: 'PortSwigger Directory Traversal', url: 'https://portswigger.net/web-security/file-path-traversal' }
    ],
    icon: '📁',
    color: 'green'
  },
  {
    id: 'idor',
    slug: 'idor',
    title: 'Insecure Direct Object Reference (IDOR)',
    description: 'IDOR occurs when an application uses user-controllable input to access objects directly without proper authorization checks. Attackers can bypass access controls by modifying reference values to access unauthorized resources belonging to other users.',
    impact: 'Unauthorized data access, account takeover, sensitive data exposure, privacy violations, mass data harvesting.',
    remediation: 'Implement proper access control checks for every object access, use indirect references (hashed/random IDs), use UUIDs instead of sequential IDs, log and monitor access attempts.',
    severity: 'High',
    examples: [
      '/api/users/123/profile → change to /api/users/124/profile',
      '/download?invoice=1001 → change to /download?invoice=1002',
      'GET /api/orders/456 → change 456 to another user\'s order ID',
      '/reset-password?token=user_id=123'
    ],
    attackScenarios: [
      'Changing account ID in API request to access another user\'s private messages',
      'Modifying invoice number to download another customer\'s financial records',
      'Changing user_id in profile update request to hijack another account',
      'Mass IDOR: scripting to enumerate all user IDs and download all data'
    ],
    commonMistakes: [
      'Using sequential integer IDs for resources',
      'Only checking if user is authenticated, not if they own the resource',
      'Exposing internal database IDs directly to users',
      'Not logging access to sensitive resources',
      'Trusting client-supplied user IDs in API requests'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: No ownership check
app.get('/api/invoices/:id', authenticate, async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  res.json(invoice); // Anyone can access any invoice!
});`,
      fixed: `// FIXED: Verify ownership
app.get('/api/invoices/:id', authenticate, async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    userId: req.user.id // Must belong to authenticated user
  });
  if (!invoice) return res.status(403).json({ error: 'Access denied' });
  res.json(invoice);
});`
    },
    detectionMethods: {
      manual: [
        'Create two accounts and swap their resource IDs',
        'Increment/decrement numeric IDs in requests',
        'Check API responses for other users\' data',
        'Test all endpoints with different user context'
      ],
      automated: [
        'Autorize Burp extension for automated IDOR testing',
        'AuthMatrix for access control testing',
        'Custom scripts to enumerate IDs'
      ]
    },
    references: [
      { title: 'OWASP IDOR', url: 'https://owasp.org/www-community/attacks/Insecure_Direct_Object_Reference' },
      { title: 'PortSwigger Access Control', url: 'https://portswigger.net/web-security/access-control/idor' }
    ],
    icon: '🔑',
    color: 'yellow'
  },
  {
    id: 'jwt',
    slug: 'jwt-vulnerabilities',
    title: 'JWT Vulnerabilities',
    description: 'JSON Web Token (JWT) vulnerabilities arise from improper implementation or configuration of JWTs. Common issues include the "none" algorithm attack, algorithm confusion (RS256→HS256), weak secrets, lack of expiration, and sensitive data in payload.',
    impact: 'Authentication bypass, privilege escalation, account takeover, session hijacking, impersonation of any user including admin.',
    remediation: 'Use strong, random secrets, explicitly specify allowed algorithms, validate all claims (exp, iss, aud), use RS256 instead of HS256 for distributed systems, never trust client-supplied algorithm headers.',
    severity: 'Critical',
    examples: [
      'Setting alg to "none" to bypass signature verification',
      'Changing RS256 to HS256 and signing with public key',
      'Brute-forcing weak HS256 secret ("secret", "password")',
      'Modifying payload claims without valid signature',
      'JWT with no expiration (exp claim missing)'
    ],
    attackScenarios: [
      'Changing "user" role to "admin" in JWT payload with none algorithm',
      'Algorithm confusion: server uses public key as HMAC secret',
      'Offline brute force of weak JWT secret to forge tokens',
      'JWT header injection: embedding malicious JWK set URL'
    ],
    commonMistakes: [
      'Using weak/guessable secrets for HMAC',
      'Not validating the algorithm header server-side',
      'Storing sensitive data (passwords, SSNs) in JWT payload',
      'Not implementing token revocation mechanism',
      'Using the same key for all environments'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: Trusting algorithm from header
const decoded = jwt.verify(token, secret, {}); // No algorithm restriction!
// Attacker changes header alg to "none" → bypasses signature check`,
      fixed: `// FIXED: Explicit algorithm specification
const decoded = jwt.verify(token, secret, {
  algorithms: ['HS256'], // Only allow specific algorithm
  issuer: 'yourapp.com',
  audience: 'yourapp-users'
});`
    },
    detectionMethods: {
      manual: [
        'Decode JWT on jwt.io and analyze header/payload',
        'Try setting alg to "none" and removing signature',
        'Attempt to brute force secret with common wordlists',
        'Test algorithm confusion attacks'
      ],
      automated: [
        'jwt_tool: python3 jwt_tool.py <token> -X a (none attack)',
        'hashcat for offline JWT secret brute force',
        'Burp JWT Editor extension'
      ]
    },
    references: [
      { title: 'PortSwigger JWT Attacks', url: 'https://portswigger.net/web-security/jwt' },
      { title: 'JWT Security Best Practices', url: 'https://auth0.com/docs/secure/tokens/json-web-tokens' }
    ],
    icon: '🎫',
    color: 'indigo'
  },
  {
    id: 'cors',
    slug: 'cors',
    title: 'CORS Misconfiguration',
    description: 'Cross-Origin Resource Sharing (CORS) misconfigurations allow malicious websites to make cross-origin requests to APIs on behalf of authenticated users. When origins are trusted too broadly or dynamically without validation, attackers can read sensitive data across origins.',
    impact: 'Sensitive data theft, authentication token exfiltration, account takeover, API data exposure.',
    remediation: 'Strictly allowlist trusted origins, never use wildcards with credentials, validate Origin headers with exact matching, avoid reflecting Origin header without validation.',
    severity: 'High',
    examples: [
      'Access-Control-Allow-Origin: * (with credentials)',
      'Origin header reflected without validation',
      'Trusting null origin (sandbox iframes)',
      'Subdomain wildcards allowing any subdomain'
    ],
    attackScenarios: [
      'Malicious site reads victim\'s private API data using victim\'s session cookies',
      'Null origin bypass via sandboxed iframe',
      'Subdomain takeover + CORS misconfiguration for account takeover',
      'CORS misconfiguration leaking internal API documentation'
    ],
    commonMistakes: [
      'Setting Access-Control-Allow-Origin to * with credentials',
      'Reflecting any Origin header without validation',
      'Trusting the null origin',
      'Misconfiguring regex validation (e.g., allowing evil-company.com when validating company.com)',
      'Not restricting allowed methods and headers'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: Reflecting any origin
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin); // Reflects any origin!
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});`,
      fixed: `// FIXED: Strict origin allowlist
const ALLOWED_ORIGINS = ['https://app.yoursite.com', 'https://yoursite.com'];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
});`
    },
    detectionMethods: {
      manual: [
        'Send requests with custom Origin headers and check responses',
        'Test null origin: Origin: null',
        'Try subdomains and variations of trusted origins',
        'Check for Access-Control-Allow-Credentials: true with wildcard'
      ],
      automated: [
        'CORScanner: python cors_scanner.py -u target.com',
        'Burp Suite CORS checks',
        'corsy automated CORS scanner'
      ]
    },
    references: [
      { title: 'PortSwigger CORS', url: 'https://portswigger.net/web-security/cors' },
      { title: 'OWASP CORS', url: 'https://owasp.org/www-community/attacks/CORS_Misconfiguration' }
    ],
    icon: '🌍',
    color: 'cyan'
  },
  {
    id: 'ssti',
    slug: 'ssti',
    title: 'Server-Side Template Injection (SSTI)',
    description: 'SSTI occurs when user input is embedded in a template unsafely, allowing attackers to inject template directives. Depending on the template engine, this can lead to information disclosure, file system access, and remote code execution.',
    impact: 'Remote code execution, file system access, internal service access, sensitive data exfiltration, complete server compromise.',
    remediation: 'Never allow users to control template content, use sandboxed template engines, sanitize and escape all user input before template rendering, use logic-less templates where possible.',
    severity: 'Critical',
    examples: [
      '{{7*7}} → 49 (Jinja2/Twig)',
      '${7*7} → 49 (Freemarker/Thymeleaf)',
      '<%= 7*7 %> → 49 (ERB)',
      "{{config.items()}} (Jinja2 config disclosure)",
      "{{''.__class__.__mro__[2].__subclasses__()}}"
    ],
    attackScenarios: [
      'Name field rendered in email template: Hello {{user.name}} → injection via name',
      'Custom error pages including user-supplied template code',
      'Report generation feature passing user data to template engine unsafely',
      'Marketing email personalization with user-controlled content'
    ],
    commonMistakes: [
      'Rendering user input as template code instead of data',
      'Using template engines to process user-supplied content',
      'Not sandboxing template engines',
      'Trusting template output without escaping'
    ],
    codeExamples: {
      language: 'python',
      vulnerable: `# VULNERABLE: User input rendered as template
from jinja2 import Template
@app.route('/hello')
def hello():
    name = request.args.get('name', 'World')
    template = Template('Hello ' + name + '!')  # DANGEROUS!
    return template.render()`,
      fixed: `# FIXED: Pass user input as template variable
from jinja2 import Environment, select_autoescape
env = Environment(autoescape=select_autoescape())
@app.route('/hello')
def hello():
    name = request.args.get('name', 'World')
    template = env.from_string('Hello {{ name }}!')
    return template.render(name=name)  # Safe: name is data, not template`
    },
    detectionMethods: {
      manual: [
        'Test with {{7*7}}, ${7*7}, #{7*7}, <% 7*7 %>',
        'Check if mathematical expressions are evaluated',
        'Try engine-specific payloads after identification',
        'Test error messages for template engine fingerprinting'
      ],
      automated: [
        'tplmap: automated SSTI detection and exploitation',
        'Burp Suite SSTI scanner plugin',
        'Manual fuzzing with engine-specific payloads'
      ]
    },
    references: [
      { title: 'PortSwigger SSTI', url: 'https://portswigger.net/web-security/server-side-template-injection' },
      { title: 'James Kettle SSTI Research', url: 'https://portswigger.net/research/server-side-template-injection' }
    ],
    icon: '📝',
    color: 'pink'
  },
  {
    id: 'clickjacking',
    slug: 'clickjacking',
    title: 'Clickjacking',
    description: 'Clickjacking is an interface-based attack where users are tricked into clicking on actionable content on a hidden website. Attackers overlay a transparent iframe over a legitimate site, hijacking user clicks for malicious purposes.',
    impact: 'Unauthorized actions performed by user, social media manipulation, account settings changes, unauthorized purchases, Like/Share hijacking.',
    remediation: 'Implement X-Frame-Options header (DENY/SAMEORIGIN), use Content Security Policy frame-ancestors directive, implement framebusting JavaScript (defense in depth).',
    severity: 'Medium',
    examples: [
      '<iframe src="https://victim.com/settings" style="opacity:0;position:absolute;top:0;left:0;width:100%;height:100%">',
      'Overlaying a "Win Prize" button over a "Delete Account" button',
      'Transparent iframe over bank transfer confirmation'
    ],
    attackScenarios: [
      'Like-farming: hidden iframe tricks users into liking Facebook pages',
      'Overlaying Twitter iframe to make users follow malicious accounts',
      'Invisible "Delete Account" button over a game play button',
      'Webcam activation through hidden browser permission dialog'
    ],
    commonMistakes: [
      'Not setting X-Frame-Options header',
      'Not using CSP frame-ancestors directive',
      'Allowing framing from any origin',
      'Relying solely on framebusting JavaScript (can be bypassed)'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: No frame protection headers
app.get('/settings', (req, res) => {
  // No X-Frame-Options or CSP frame-ancestors
  res.render('settings');
});`,
      fixed: `// FIXED: Set frame protection headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  next();
});`
    },
    detectionMethods: {
      manual: [
        'Try embedding the target in an iframe on your own page',
        'Check for X-Frame-Options header in response',
        'Check CSP for frame-ancestors directive',
        'Test with different origins'
      ],
      automated: [
        'Burp Suite passive scan for missing security headers',
        'Security headers checker: securityheaders.com',
        'OWASP ZAP passive scanner'
      ]
    },
    references: [
      { title: 'OWASP Clickjacking', url: 'https://owasp.org/www-community/attacks/Clickjacking' },
      { title: 'PortSwigger Clickjacking', url: 'https://portswigger.net/web-security/clickjacking' }
    ],
    icon: '🖱️',
    color: 'teal'
  },
  {
    id: 'nosqli',
    slug: 'nosql-injection',
    title: 'NoSQL Injection',
    description: 'NoSQL injection attacks exploit vulnerabilities in applications using NoSQL databases like MongoDB, CouchDB, and Redis. Unlike SQL injection, NoSQL injection uses database-specific query operators and JavaScript execution to manipulate queries.',
    impact: 'Authentication bypass, data exfiltration, data manipulation, denial of service, in some cases code execution.',
    remediation: 'Use query builder libraries, validate and sanitize input types, use schema validation, avoid passing user input directly to query operators, disable JavaScript execution in MongoDB.',
    severity: 'High',
    examples: [
      '{"$gt": ""}  (MongoDB greater than operator)',
      '{"username": {"$regex": ".*"}, "password": {"$gt": ""}}',
      'username[$ne]=invalid&password[$ne]=invalid',
      '{"$where": "this.password == \'test\'"}'
    ],
    attackScenarios: [
      'Authentication bypass: username[$ne]=x&password[$ne]=x returns first user',
      'MongoDB regex injection to enumerate usernames',
      '$where operator executing arbitrary JavaScript',
      'Operator injection in search functionality'
    ],
    commonMistakes: [
      'Passing user-supplied JSON directly to MongoDB queries',
      'Not validating input types (string vs object)',
      'Allowing $where operator in queries',
      'Not using schema validation libraries like Joi or Zod'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: Direct user input to MongoDB query
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // If username = {"$ne": ""}, returns first user in DB!
  const user = await User.findOne({ username, password });
});`,
      fixed: `// FIXED: Type validation and sanitization
const Joi = require('joi');
app.post('/login', async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  });
  const { username, password } = await schema.validateAsync(req.body);
  const user = await User.findOne({ username, password });
});`
    },
    detectionMethods: {
      manual: [
        'Try MongoDB operators: {"$gt": ""} in JSON body',
        'Test URL parameters: ?user[$ne]=invalid',
        'Inject $regex, $where operators',
        'Test for JavaScript injection in $where clause'
      ],
      automated: [
        'NoSQLMap automated NoSQL injection tool',
        'Burp Suite with NoSQL injection payloads',
        'Custom scripts with MongoDB operator payloads'
      ]
    },
    references: [
      { title: 'OWASP Testing for NoSQL', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
      { title: 'MongoDB Security Checklist', url: 'https://docs.mongodb.com/manual/administration/security-checklist/' }
    ],
    icon: '🍃',
    color: 'green'
  },
  {
    id: 'http-smuggling',
    slug: 'http-request-smuggling',
    title: 'HTTP Request Smuggling',
    description: 'HTTP request smuggling is a technique for interfering with the way a web site processes sequences of HTTP requests received from one or more users. It exploits discrepancies in how front-end and back-end servers parse HTTP request boundaries.',
    impact: 'Bypass security controls, gain unauthorized access to sensitive data, hijack other users\' requests, XSS, cache poisoning, credential capture.',
    remediation: 'Use HTTP/2 end-to-end, disable reuse of back-end connections, use consistent parsing between front-end and back-end, disable ambiguous request support.',
    severity: 'Critical',
    examples: [
      'POST / HTTP/1.1\nContent-Length: 6\nTransfer-Encoding: chunked\n\n0\n\nX',
      'CL.TE attack: Content-Length differs from Transfer-Encoding interpretation',
      'TE.CL attack: Transfer-Encoding chunked with trailing data'
    ],
    attackScenarios: [
      'Smuggling a request to access an internal admin endpoint',
      'Capturing other users\' requests by poisoning front-end routing',
      'Bypassing WAF rules by smuggling malicious content',
      'Cache poisoning via request smuggling'
    ],
    commonMistakes: [
      'Mixing HTTP/1.1 and HTTP/2 in proxy chains',
      'Front-end and back-end using different parsing logic',
      'Not normalizing requests at the front-end',
      'Allowing keep-alive connections without proper handling'
    ],
    codeExamples: {
      language: 'http',
      vulnerable: `POST / HTTP/1.1
Host: vulnerable-website.com
Content-Length: 13
Transfer-Encoding: chunked

0

SMUGGLED`,
      fixed: `# Configure your server to:
# 1. Reject ambiguous requests
# 2. Use HTTP/2 throughout
# 3. Normalize all requests at the edge
# Nginx config:
# proxy_http_version 1.1;
# proxy_set_header Connection "";`
    },
    detectionMethods: {
      manual: [
        'Use timing-based detection with CL.TE payloads',
        'Send requests that cause differential responses',
        'Use Burp Suite HTTP Request Smuggler extension',
        'Test with desync payloads and observe side effects'
      ],
      automated: [
        'Burp Suite HTTP Request Smuggler extension (albinowax)',
        'smuggler.py automated tool',
        'h2csmuggler for HTTP/2 smuggling'
      ]
    },
    references: [
      { title: 'PortSwigger HTTP Smuggling', url: 'https://portswigger.net/web-security/request-smuggling' },
      { title: 'HTTP Desync Attacks Research', url: 'https://portswigger.net/research/http-desync-attacks' }
    ],
    icon: '📦',
    color: 'slate'
  },
  {
    id: 'file-upload',
    slug: 'file-upload-vulnerabilities',
    title: 'File Upload Vulnerabilities',
    description: 'File upload vulnerabilities occur when a web server allows users to upload files without sufficiently validating properties like name, type, contents, or size. Improper handling can lead to RCE, XSS, or other serious attacks.',
    impact: 'Remote code execution, XSS via malicious SVG/HTML, DoS via zip bombs, phishing via malicious documents, server compromise.',
    remediation: 'Validate file type by content (magic bytes), use allowlist for permitted types, rename uploaded files, store outside web root, scan with antivirus, use separate domain for user content.',
    severity: 'Critical',
    examples: [
      'Uploading shell.php disguised as shell.php.jpg',
      'Uploading malicious SVG with embedded JavaScript',
      'Zip slip attack: ../../../../safe/training/file.txt in archive',
      'File with null byte: shell.php%00.jpg',
      'Polyglot file (valid image AND valid PHP)'
    ],
    attackScenarios: [
      'Upload PHP webshell renamed with .jpg extension to bypass MIME checks',
      'SVG upload with XSS payload executing in victim\'s browser',
      'Archive upload with path traversal to overwrite sensitive files',
      'ImageMagick exploitation via malicious image file'
    ],
    commonMistakes: [
      'Relying on client-provided Content-Type header',
      'Only checking file extension without content',
      'Storing uploads in web-accessible directories',
      'Not renaming files on upload',
      'Not scanning file contents for malicious code'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: Trust client Content-Type
app.post('/upload', (req, res) => {
  if (req.file.mimetype === 'image/jpeg') { // Easily bypassed!
    saveFile(req.file);
  }
});`,
      fixed: `// FIXED: Validate by magic bytes + extension allowlist
const mmmagic = require('mmmagic');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
app.post('/upload', async (req, res) => {
  const magic = new mmmagic.Magic(mmmagic.MAGIC_MIME_TYPE);
  const mimeType = await detectMimeFromBuffer(req.file.buffer);
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }
  const safeFilename = crypto.randomUUID() + '.jpg';
  saveFile(req.file, '/secure/uploads/' + safeFilename);
});`
    },
    detectionMethods: {
      manual: [
        'Upload files with dangerous extensions (.php, .jsp, .aspx)',
        'Modify Content-Type header to image/jpeg with PHP content',
        'Try double extensions: file.php.jpg',
        'Test null byte: file.php%00.jpg'
      ],
      automated: [
        'Burp Suite file upload scanner',
        'Upload Scanner Burp extension',
        'Fuzz file extensions and MIME types'
      ]
    },
    references: [
      { title: 'PortSwigger File Upload', url: 'https://portswigger.net/web-security/file-upload' },
      { title: 'OWASP File Upload Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html' }
    ],
    icon: '📤',
    color: 'amber'
  },
  {
    id: 'deserialization',
    slug: 'deserialization',
    title: 'Insecure Deserialization',
    description: 'Insecure deserialization occurs when untrusted data is used to abuse the logic of an application, inflict a denial of service (DoS) attack, or even execute arbitrary code. It is one of the most critical vulnerability classes in modern applications.',
    impact: 'Remote code execution, authentication bypass, privilege escalation, denial of service, data tampering.',
    remediation: 'Avoid deserializing data from untrusted sources, use integrity checks (HMAC) on serialized data, use safe serialization formats (JSON), implement deserialization firewalls.',
    severity: 'Critical',
    examples: [
      'Java serialized objects with deserialization training fixture gadget chains',
      'PHP unserialize() with magic methods (__destruct, __wakeup)',
      'Python pickle.loads() with arbitrary code execution',
      'Ruby Marshal.load() exploitation',
      'Manipulating .NET BinaryFormatter serialized data'
    ],
    attackScenarios: [
      'Modifying serialized session cookie to gain admin privileges',
      'Java deserialization via Apache Commons Collections gadget chain',
      'Python pickle exploitation in ML model serving endpoints',
      'PHP deserialization leading to file deletion via __destruct'
    ],
    commonMistakes: [
      'Deserializing user-supplied data without integrity verification',
      'Using Java native serialization for untrusted data',
      'Exposing serialized objects to client in cookies/parameters',
      'Not restricting which classes can be deserialized'
    ],
    codeExamples: {
      language: 'python',
      vulnerable: `# VULNERABLE: Python pickle deserialization
import pickle, base64
@app.route('/load')
def load_data():
    data = base64.b64decode(request.cookies.get('session'))
    obj = pickle.loads(data)  # DANGEROUS! Can execute arbitrary code
    return str(obj)`,
      fixed: `# FIXED: Use JSON with HMAC integrity check
import json, hmac, hashlib
SECRET = os.environ['SESSION_SECRET']
@app.route('/load')
def load_data():
    token = request.cookies.get('session', '')
    data_b64, signature = token.rsplit('.', 1)
    expected = hmac.new(SECRET.encode(), data_b64.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        abort(403)
    return json.loads(base64.b64decode(data_b64))`
    },
    detectionMethods: {
      manual: [
        'Look for base64-encoded data in cookies/parameters that starts with serialization markers',
        'Java: rO0 prefix (base64 of 0xaced)',
        'PHP: O:4:"User":... patterns',
        'Test with deserialization training fixture, PHPGGC, or pickle payloads'
      ],
      automated: [
        'deserialization training fixture for Java deserialization payloads',
        'PHPGGC for PHP deserialization gadget chains',
        'Burp Suite Deserialization Scanner extension'
      ]
    },
    references: [
      { title: 'OWASP Deserialization', url: 'https://owasp.org/www-community/vulnerabilities/Deserialization_of_untrusted_data' },
      { title: 'PortSwigger Deserialization', url: 'https://portswigger.net/web-security/deserialization' }
    ],
    icon: '📦',
    color: 'violet'
  },
  {
    id: 'graphql',
    slug: 'graphql-vulnerabilities',
    title: 'GraphQL Vulnerabilities',
    description: 'GraphQL APIs introduce unique security challenges including introspection-based information disclosure, batching attacks for rate limit bypass, deeply nested queries for DoS, injection via input types, and improper authorization on resolvers.',
    impact: 'Schema disclosure, authentication bypass, DoS via complex queries, authorization bypass, injection attacks, mass data exfiltration.',
    remediation: 'Disable introspection in production, implement query depth limiting, use query cost analysis, apply field-level authorization in resolvers, rate limit queries, validate all inputs.',
    severity: 'High',
    examples: [
      '{ __schema { types { name fields { name } } } } (introspection)',
      'Deep nesting attack: { user { friends { friends { friends { ... } } } } }',
      'Batching: [{ query: "mutation { ... }" }, { query: "mutation { ... }" }]',
      'IDOR via GraphQL: { user(id: 2) { email, password } }'
    ],
    attackScenarios: [
      'Introspection query revealing entire API schema and hidden endpoints',
      'Batch mutations bypassing OTP rate limiting (1000 guesses in one request)',
      'Authorization bypass: accessing other users\' data via unprotected resolvers',
      'DoS via circular fragment or deeply nested query'
    ],
    commonMistakes: [
      'Leaving introspection enabled in production',
      'Not implementing depth/complexity limits on queries',
      'Missing field-level authorization in resolvers',
      'Not rate limiting GraphQL mutations (OTP, login)',
      'Exposing internal IDs through GraphQL types'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: No depth limit, introspection enabled
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // No query depth limit
  // Introspection enabled by default
});`,
      fixed: `// FIXED: Disable introspection, add depth limit
const { createComplexityLimitRule } = require('graphql-validation-complexity');
const depthLimit = require('graphql-depth-limit');
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  validationRules: [
    depthLimit(7),
    createComplexityLimitRule(1000)
  ]
});`
    },
    detectionMethods: {
      manual: [
        'Send introspection query to discover schema',
        'Test deeply nested queries for performance impact',
        'Try accessing other users\' data via resolver arguments',
        'Test batch query support for rate limit bypass'
      ],
      automated: [
        'GraphQL Voyager for schema visualization',
        'InQL Burp extension for GraphQL testing',
        'Clairvoyance for schema inference without introspection'
      ]
    },
    references: [
      { title: 'OWASP GraphQL Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html' },
      { title: 'HackTricks GraphQL', url: 'https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/graphql' }
    ],
    icon: '🔷',
    color: 'pink'
  },
  {
    id: 'oauth',
    slug: 'oauth-vulnerabilities',
    title: 'OAuth Vulnerabilities',
    description: 'OAuth 2.0 implementation flaws can lead to account takeover, unauthorized data access, and privilege escalation. Common issues include CSRF on OAuth flow, open redirectors, state parameter misuse, and authorization code interception.',
    impact: 'Account takeover, unauthorized data access to third-party resources, privilege escalation, cross-site request forgery on authorization.',
    remediation: 'Always use and validate state parameter, use PKCE for public clients, validate redirect URIs strictly, use short-lived authorization codes, implement proper token storage.',
    severity: 'Critical',
    examples: [
      'Missing state parameter CSRF: link victim to attacker account',
      'Open redirect in redirect_uri parameter',
      'Authorization code interception via referer header leak',
      'Token leakage via fragment identifier'
    ],
    attackScenarios: [
      'CSRF on OAuth flow linking attacker\'s external account to victim\'s account',
      'Redirect URI manipulation to steal authorization codes',
      'Authorization code reuse if single-use not enforced',
      'Implicit flow token leakage in browser history/logs'
    ],
    commonMistakes: [
      'Not validating or using the state parameter',
      'Loose redirect URI validation (prefix match instead of exact)',
      'Using implicit flow for sensitive applications',
      'Storing access tokens in localStorage',
      'Long-lived authorization codes'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: No state parameter validation
app.get('/oauth/callback', async (req, res) => {
  const { code } = req.query;
  // No state validation! CSRF possible
  const tokens = await exchangeCode(code);
  req.session.token = tokens.access_token;
});`,
      fixed: `// FIXED: Validate state parameter
app.get('/oauth/callback', async (req, res) => {
  const { code, state } = req.query;
  if (state !== req.session.oauthState) {
    return res.status(403).send('Invalid state parameter');
  }
  delete req.session.oauthState;
  const tokens = await exchangeCode(code);
  req.session.token = tokens.access_token;
});`
    },
    detectionMethods: {
      manual: [
        'Remove state parameter and test for CSRF vulnerability',
        'Modify redirect_uri to attacker-controlled URL',
        'Test for authorization code reuse',
        'Check for token leakage in logs/referrer'
      ],
      automated: [
        'Burp Suite OAuth tester',
        'Manual testing with Burp Repeater',
        'Review OAuth flow in Burp Proxy'
      ]
    },
    references: [
      { title: 'PortSwigger OAuth', url: 'https://portswigger.net/web-security/oauth' },
      { title: 'OAuth Security Best Practices', url: 'https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics' }
    ],
    icon: '🔐',
    color: 'blue'
  },
  {
    id: 'race-conditions',
    slug: 'race-conditions',
    title: 'Race Conditions',
    description: 'Race conditions occur when the outcome of a web application depends on timing of events, and attackers can manipulate timing to subvert application logic. Modern web apps with concurrent request handling are particularly susceptible.',
    impact: 'Double-spending, inventory manipulation, duplicate coupon use, bypassing single-use limits, account balance manipulation.',
    remediation: 'Use database transactions with proper isolation levels, implement locking mechanisms, use atomic operations, validate state changes atomically, use idempotency keys.',
    severity: 'High',
    examples: [
      'Sending concurrent requests to apply a one-time coupon code',
      'Parallel withdrawal requests to overdraw an account',
      'Racing purchase requests for limited stock items',
      'Concurrent account creation with same username'
    ],
    attackScenarios: [
      'Sending 50 simultaneous redemption requests for a $100 gift card',
      'Racing to overdraft a bank account: balance check and deduction not atomic',
      'Concurrent requests bypassing rate limiting in a time window',
      'Exploiting TOCTOU (Time-of-Check-Time-of-Use) in file operations'
    ],
    commonMistakes: [
      'Reading then writing database values in separate operations',
      'Not using database transactions for related operations',
      'Implementing rate limiting without atomic counters',
      'Not using SELECT FOR UPDATE for critical state checks',
      'Trusting local state in distributed systems'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: Race condition in coupon redemption
app.post('/redeem', async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.body.code });
  if (coupon.used) return res.status(400).send('Already used');
  // GAP HERE: another request can pass the check!
  await Coupon.update({ code }, { used: true });
  await applyDiscount(req.user.id, coupon.value);
});`,
      fixed: `// FIXED: Atomic update with condition
app.post('/redeem', async (req, res) => {
  const result = await Coupon.findOneAndUpdate(
    { code: req.body.code, used: false }, // Atomic check-and-update
    { used: true, usedBy: req.user.id },
    { new: false } // Returns old document
  );
  if (!result) return res.status(400).send('Invalid or already used');
  await applyDiscount(req.user.id, result.value);
});`
    },
    detectionMethods: {
      manual: [
        'Send concurrent requests using Burp Intruder with 1-click attack',
        'Use Burp\'s "Send group in parallel" feature',
        'Test any single-use functionality with parallel requests',
        'Monitor for double-execution in application logs'
      ],
      automated: [
        'Burp Suite Turbo Intruder for race conditions',
        'Custom scripts with asyncio/threading',
        'Race condition testing with Apache Benchmark (ab)'
      ]
    },
    references: [
      { title: 'PortSwigger Race Conditions', url: 'https://portswigger.net/web-security/race-conditions' },
      { title: 'OWASP Race Conditions', url: 'https://owasp.org/www-community/vulnerabilities/Race_Condition' }
    ],
    icon: '⚡',
    color: 'yellow'
  },
  {
    id: 'business-logic',
    slug: 'business-logic-flaws',
    title: 'Business Logic Flaws',
    description: 'Business logic vulnerabilities are flaws in the design and implementation of an application that allow attackers to elicit unintended behavior. Unlike technical vulnerabilities, these exploit the application\'s own intended functionality in unintended ways.',
    impact: 'Financial loss, data integrity issues, unauthorized access, bypassing security controls, abusing application features for unintended purposes.',
    remediation: 'Threat model all business processes, implement server-side validation for all business rules, test edge cases and boundary conditions, implement proper state machine validation.',
    severity: 'High',
    examples: [
      'Applying negative quantities to get refunds on purchases',
      'Skipping steps in a multi-step checkout process',
      'Applying a coupon code multiple times by manipulating request order',
      'Purchasing items at their original price after applying a percentage discount to a cart with negative-price items'
    ],
    attackScenarios: [
      'Adding negative quantity items to cart to reduce total price to negative',
      'Skipping email verification step by directly accessing post-verification endpoint',
      'Manipulating discount calculation by adding/removing items after discount applied',
      'Bypassing 2FA by navigating directly to authenticated area after first factor'
    ],
    commonMistakes: [
      'Not validating all state transitions server-side',
      'Trusting client-supplied price or discount information',
      'Not enforcing workflow steps in proper sequence',
      'Assuming users will follow the intended application flow'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: Trust client-supplied price
app.post('/checkout', async (req, res) => {
  const { items, totalPrice } = req.body; // Trusting client price!
  await processPayment(req.user.id, totalPrice);
  await fulfillOrder(items);
});`,
      fixed: `// FIXED: Calculate price server-side
app.post('/checkout', async (req, res) => {
  const { items } = req.body;
  // Always calculate price server-side from database
  let totalPrice = 0;
  for (const item of items) {
    const product = await Product.findById(item.id);
    if (item.quantity < 1) throw new Error('Invalid quantity');
    totalPrice += product.price * item.quantity;
  }
  await processPayment(req.user.id, totalPrice);
});`
    },
    detectionMethods: {
      manual: [
        'Test negative values in quantity/price fields',
        'Try to skip steps in multi-step workflows',
        'Apply the same coupon/offer multiple times',
        'Test boundary conditions and extreme values'
      ],
      automated: [
        'Manual testing with Burp Repeater',
        'Fuzzing business logic parameters',
        'Custom scripts to test workflow bypasses'
      ]
    },
    references: [
      { title: 'PortSwigger Business Logic', url: 'https://portswigger.net/web-security/logic-flaws' },
      { title: 'OWASP Testing Business Logic', url: 'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/10-Business_Logic_Testing/' }
    ],
    icon: '💼',
    color: 'orange'
  },
  {
    id: 'web-cache-poisoning',
    slug: 'web-cache-poisoning',
    title: 'Web Cache Poisoning',
    description: 'Web cache poisoning is an attack where an attacker exploits the behavior of a web server and cache to serve a harmful HTTP response to other users. By manipulating cache keys and unkeyed inputs, attackers can inject malicious content into cached responses.',
    impact: 'Stored XSS affecting all users who receive poisoned cache, denial of service, JavaScript injection, cookie theft.',
    remediation: 'Avoid using unkeyed inputs in responses, configure cache to include all relevant headers in cache keys, use Cache-Control: no-store for sensitive responses, implement cache key normalization.',
    severity: 'High',
    examples: [
      'X-Forwarded-Host header reflected in cached response → XSS',
      'Unkeyed query parameter reflected in cached page',
      'Host header injection poisoning cached redirects',
      'Fat GET request with body reflected in cached response'
    ],
    attackScenarios: [
      'Injecting malicious X-Forwarded-Host to serve XSS to all visitors of a cached page',
      'Poisoning cache with malicious JavaScript file URL',
      'DoS by caching error responses for common URLs',
      'Hijacking cached redirects to phishing pages'
    ],
    commonMistakes: [
      'Reflecting HTTP headers in responses without validation',
      'Not including security-relevant headers in cache keys',
      'Using inconsistent cache key configurations',
      'Caching responses that include user-controlled input'
    ],
    codeExamples: {
      language: 'javascript',
      vulnerable: `// VULNERABLE: Reflecting unkeyed X-Forwarded-Host
app.get('/', (req, res) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  res.send(\`<script src="https://\${host}/app.js"></script>\`);
  // This gets cached! Attacker can inject evil host.
});`,
      fixed: `// FIXED: Use configured base URL, not headers
const BASE_URL = process.env.BASE_URL; // Set at deploy time
app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store'); // Or carefully define cache key
  res.send(\`<script src="\${BASE_URL}/app.js"></script>\`);
});`
    },
    detectionMethods: {
      manual: [
        'Test unkeyed header reflection with Burp Param Miner',
        'Check X-Cache, CF-Cache-Status headers for cache hits',
        'Inject unique values in headers and check cached responses',
        'Test fat GET requests and unkeyed query parameters'
      ],
      automated: [
        'Burp Suite Param Miner extension',
        'Web Cache Vulnerability Scanner (WCVS)',
        'Custom scripts with cache timing analysis'
      ]
    },
    references: [
      { title: 'PortSwigger Web Cache Poisoning', url: 'https://portswigger.net/web-security/web-cache-poisoning' },
      { title: 'Practical Web Cache Poisoning Research', url: 'https://portswigger.net/research/practical-web-cache-poisoning' }
    ],
    icon: '🗃️',
    color: 'slate'
  }
];

export const vulnerabilities: Vulnerability[] = vulnerabilitySeeds.map((vulnerability) => ({
  ...vulnerability,
  defensiveEducation: buildDefensiveEducation({
    id: vulnerability.id,
    title: vulnerability.title,
    severity: vulnerability.severity,
  }),
}));
