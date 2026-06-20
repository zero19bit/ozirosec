import { useState, useRef } from 'react';
import { Lab } from '../data/labs';
import { useLanguage } from '../i18n/LanguageContext';
import { faLabel } from '../utils/localizeContent';
import { useAppStore } from '../store/useAppStore';
import { useLabTimer } from '../hooks/useLabTimer';
import {
  Terminal, CheckCircle2, XCircle, Lightbulb, Timer,
  ChevronDown, ChevronUp, Play, RotateCcw, Zap
} from 'lucide-react';

interface SimulatorProps {
  lab: Lab;
}

// Safe pattern matching - no eval
function checkPayload(input: string, pattern: string): boolean {
  try {
    const normalizedPattern = pattern
      .replace(/^\(\?i\)/, '')
      .replace(/\(\?i\)/g, '');
    const regex = new RegExp(normalizedPattern, 'i');
    return regex.test(input);
  } catch {
    return false;
  }
}

// Simulated "vulnerable" environment responses
function getSimulatedResponse(labId: string, input: string): string {
  const lower = input.toLowerCase().trim();

  if (labId.startsWith('sqli')) {
    if (/or\s+1\s*=\s*1|or\s+'1'\s*=\s*'1'/.test(lower)) {
      return `MySQL Result: 3 rows returned
+----+----------------+-------+----------+
| id | name           | price | released |
+----+----------------+-------+----------+
|  1 | iPhone 15      | 999   | 1        |
|  2 | MacBook Pro    | 1999  | 1        |
|  3 | AirPods Max    | 549   | 0        |  ← hidden unreleased
+----+----------------+-------+----------+
✓ WHERE clause bypassed — all rows including unreleased returned!`;
    }
    if (/administrator['"]*--/.test(lower) || /admin['"]*\s*--/.test(lower)) {
      return `SELECT * FROM users WHERE username=<redacted training marker> AND password=<redacted>

MySQL: Successful Login!
Welcome, training administrator!
Session token: REDACTED
✓ Authentication bypass demonstrated in the authorized simulator!`;
    }
    if (/order\s+by\s+\d+/.test(lower)) {
      const match = input.match(/order\s+by\s+(\d+)/i);
      const n = parseInt(match?.[1] ?? '1');
      if (n <= 2) return `MySQL: ORDER BY ${n} — OK (${n} column${n > 1 ? 's' : ''} exists)`;
      return `MySQL Error: Unknown column '${n}' in 'order clause'
✓ Column count = ${n - 1}`;
    }
    if (/union\s+select/.test(lower)) {
      return `MySQL UNION Result:
+----------+----------+
| username | password |
+----------+----------+
| admin    | REDACTED |
| alice    | REDACTED |
| bob      | REDACTED |
+----------+----------+
✓ UNION-style extraction demonstrated with redacted training data!`;
    }
    if (/sleep\s*\(\d+\)|pg_sleep|waitfor/.test(lower)) {
      return `... [5 second delay] ...
MySQL: OK
✓ Time-based blind SQLi confirmed — SLEEP() executed server-side!`;
    }
  }

  if (labId.startsWith('xss')) {
    if (/<script[^>]*>[\s\S]*?alert[\s\S]*?<\/script>/i.test(input)) {
      return `HTTP/1.1 200 OK
Content-Type: text/html

<html><body>
<h2>Search results for: ${input}</h2>
</body></html>

⚠️ ALERT DIALOG: "1" executed in browser context
✓ Reflected XSS — script injected into HTML response and executed!`;
    }
    if (/<img[^>]+onerror\s*=.*>/i.test(input) || /<svg[^>]+onload\s*=.*>/i.test(input)) {
      return `HTTP/1.1 200 OK
<img src="x" onerror="alert(1)"> rendered in page.

⚠️ ALERT DIALOG: "1" triggered by onerror event!
✓ XSS via HTML event handler!`;
    }
    if (/{{7\*7}}/i.test(input)) {
      return `Template Output: Hello 49!
✓ SSTI Detected! Mathematical expression evaluated by Jinja2 template engine.`;
    }
    if (/">\s*</i.test(input)) {
      return `DOM: Injected element after closing attribute with ">
⚠️ alert(1) executed via SVG/script injection
✓ DOM XSS via attribute breakout!`;
    }
  }

  if (labId.startsWith('ssrf')) {
    if (/localhost|127\.0\.0\.1|0\.0\.0\.0/.test(lower)) {
      return `Server fetched: http://localhost/admin

HTTP/1.1 200 OK
Content-Type: text/html

<html>
<h1>Admin Panel</h1>
<p>Welcome to internal admin (accessible only from localhost)</p>
<a href="/admin/delete-user">Delete User</a>
<a href="/admin/view-logs">View Logs</a>
</html>

✓ SSRF — Internal admin panel accessed via server-side request!`;
    }
    if (/169\.254\.169\.254/.test(input)) {
      return `Server fetched: http://metadata.training.local/latest/meta-data/

HTTP/1.1 200 OK
ami-id
ami-launch-index
block-device-mapping/
hostname: ip-10-0-1-5.ec2.internal
iam/
  security-credentials/
    EC2-WebRole
instance-id: i-0a1b2c3d4e5f6

GET /latest/meta-data/iam/security-credentials/EC2-WebRole:
{
  "AccessKeyId": "<redacted-access-key-id>",
  "SecretAccessKey": "<redacted-secret-access-key>",
  "Token": "<redacted-session-token>",
  "Expiration": "2025-01-01T00:00:00Z"
}
✓ AWS IAM credentials stolen via SSRF!`;
    }
  }

  if (labId.startsWith('path')) {
    if (/\.\.\//i.test(input) || /%2e%2e/i.test(input) || /\.\.\\/.test(input)) {
      return `File read: ${input}

root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
mysql:x:113:119:MySQL Server:/var/lib/mysql:/bin/false

✓ Path traversal successful — /safe/training/file.txt contents returned!`;
    }
  }

  if (labId.startsWith('idor')) {
    if (/user.?id\s*=\s*[12]|\/users\/[12]$/i.test(input)) {
      return `HTTP/1.1 200 OK
GET /api/users/1 (requesting as user #5)

{
  "id": 1,
  "username": "admin",
  "email": "admin@company.com",
  "role": "administrator",
  "salary": 120000,
  "ssn": "123-45-6789",
  "phone": "+1-555-0100"
}
⚠️ Authorization check missing!
✓ IDOR — Accessed admin's private data without permission!`;
    }
  }

  if (labId.startsWith('jwt')) {
    if (/alg.*none|none.*alg/i.test(input)) {
      return `JWT Header: {"alg":"none","typ":"JWT"}
JWT Payload: {"user":"alice","admin":true}
JWT Signature: (empty)

Server response: HTTP/1.1 200 OK
{"message":"Welcome, admin!","access":"full","dashboard":"/admin"}

✓ JWT alg:none bypass — unsigned token accepted!`;
    }
    if (/secret|password|weak|hashcat/i.test(input)) {
      return `Hashcat brute-force complete:
Cracked signing material: REDACTED
Time: 0.003s

Forged JWT: REDACTED

✓ Weak JWT signing configuration demonstrated with redacted training output!`;
    }
  }

  if (labId.startsWith('cmdi')) {
    if (/;\s*(whoami|id|ls|cat)|&&\s*(whoami|id)|\|\s*(cat|ls|whoami)/i.test(input)) {
      const cmd = input.match(/(whoami|id|cat\s+\S+|ls\s*\S*)/i)?.[1] ?? 'whoami';
      const output = cmd.includes('whoami') ? 'www-data' : cmd.includes('id') ? 'uid=33(www-data) gid=33(www-data) groups=33(www-data)' : 'index.php config.php .htaccess';
      return `ping -c 1 ${input}

PING 127.0.0.1: 56 data bytes
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.052 ms

Injected command output (${cmd}):
${output}

✓ OS command injection — arbitrary command executed on server!`;
    }
    if (/sleep\s*\d+/i.test(input)) {
      return `... [server took 5 seconds to respond] ...

✓ Blind command injection confirmed via time delay!`;
    }
  }

  if (labId.startsWith('xxe')) {
    if (/<!entity|system\s+["']file/i.test(input)) {
      return `XML parsed with external entities enabled.

Entity resolved: file:///safe/training/file.txt
Result:
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

✓ XXE — Local file disclosed via XML external entity!`;
    }
    if (/169\.254\.169\.254/.test(input)) {
      return `XML external entity resolved via HTTP:
Fetching: http://metadata.training.local/latest/meta-data/

ami-id
instance-id: i-0a1b2c3d
iam/security-credentials/role1

✓ XXE→SSRF — AWS metadata accessed via XML entity!`;
    }
  }

  if (labId.startsWith('ssti')) {
    if (/\{\{7\*[7']\}\}/.test(input)) {
      return `Template rendered: Hello 49!
✓ SSTI confirmed — Jinja2 evaluated {{7*7}} = 49`;
    }
    if (/\$\{7\*7\}/.test(input)) {
      return `Template rendered: 49
✓ SSTI confirmed — Freemarker/Thymeleaf evaluated ${'{7*7}'} = 49`;
    }
    if (/__class__|__mro__|__subclasses__/i.test(input)) {
      return `[<class 'type'>, <class 'object'>]
[<class 'subprocess.Popen'>, <class 'os._wrap_close'>, ...]

uid=0(root) gid=0(root)
✓ Jinja2 SSTI → RCE — system command executed!`;
    }
  }

  if (labId.startsWith('nosqli')) {
    if (/\$ne|\$regex|\$gt|\$where|\[\$/.test(input)) {
      return `MongoDB query executed:
db.users.findOne({ username: {$ne: null}, password: {$ne: null} })

Result:
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "admin",
  "email": "admin@site.com",
  "role": "superadmin",
  "password": "hashed_but_bypassed"
}

✓ NoSQL injection — MongoDB operator bypassed authentication!`;
    }
  }

  if (labId.startsWith('csrf')) {
    if (/form\s+action|csrf|cross.site/i.test(input)) {
      return `Victim visits attacker's page while logged in to target.com...

POST /change-email HTTP/1.1
Host: target.com
Cookie: session=victim_session_abc123
Content-Type: application/x-www-form-urlencoded

email=attacker%40evil.com

HTTP/1.1 200 OK
{"message":"Email updated to attacker@evil.com"}

✓ CSRF attack successful — victim's email changed without consent!`;
    }
  }

  if (labId === 'click-001') {
    if (/iframe|opacity|clickjack/i.test(input)) {
      return `Clickjacking PoC rendered:

[Victim sees]: "Click here to claim your prize! 🎁"
[Actually clicking]: "Delete Account" button on target.com

The transparent iframe loads target.com at opacity:0.001
Decoy button is positioned exactly over the dangerous action.

✓ Clickjacking PoC — user interaction hijacked!`;
    }
  }

  if (labId.startsWith('deser')) {
    if (/O:\d+:|b:1|deserializ|unserialize/i.test(input)) {
      return `PHP deserialization:
Input: O:4:"User":2:{s:4:"name";s:5:"alice";s:5:"admin";b:1;}

Deserialized object:
User {
  name: "alice",
  admin: true  ← changed from false to true!
}

HTTP/1.1 200 OK
{"role":"administrator","message":"Welcome to admin panel!"}

✓ PHP deserialization — admin property manipulated!`;
    }
  }

  if (labId === 'cors-001') {
    if (/fetch.*credentials|access-control|cors/i.test(input)) {
      return `Malicious page sends credentialed cross-origin request:

fetch("https://target.com/api/userdata", {credentials: "include"})

Response (with victim's cookies):
Access-Control-Allow-Origin: https://evil.com
Access-Control-Allow-Credentials: true

{
  "apiKey": "<redacted-api-key>",
  "email": "victim@company.com",
  "balance": 15000
}

Exfiltrated to attacker server!
✓ CORS misconfiguration — victim's data stolen cross-origin!`;
    }
  }

  if (labId === 'graphql-001') {
    if (/__schema|__type|introspect/i.test(input)) {
      return `GraphQL Introspection Result:
{
  "__schema": {
    "types": [
      {"name": "Query"},
      {"name": "Mutation"},
      {"name": "User"},
      {"name": "AdminPanel"},        ← hidden!
      {"name": "InternalConfig"},    ← hidden!
      {"name": "SecretDocument"}     ← hidden!
    ]
  }
}

Available Mutations:
- deleteUser(id: ID!)
- promoteToAdmin(userId: ID!)     ← sensitive!
- viewAllUsers: [User!]!

✓ Introspection exposed full schema including admin mutations!`;
    }
  }

  if (labId.startsWith('access-control')) {
    if (/robots\.txt|\/admin|administrator/i.test(input)) {
      return `GET /robots.txt HTTP/1.1

User-agent: *
Disallow: /admin-panel-77788
Disallow: /secret-backup

Visiting /admin-panel-77788:
HTTP/1.1 200 OK
<html>
<h1>Administrator Panel</h1>
<p>Manage users, view logs, modify settings</p>
[Delete User] [View All Data] [System Config]
</html>

✓ Unprotected admin panel found via robots.txt disclosure!`;
    }
  }

  if (labId.startsWith('bizlogic')) {
    if (/quantity\s*=\s*-\d+|qty\s*=\s*-/i.test(input)) {
      return `Shopping Cart Update:
Item: Premium Widget × -1 = -$299.99

Cart Total:
  Leather Jacket    × 1 = $120.00
  Premium Widget    × -1 = -$299.99
  ─────────────────────────────
  TOTAL: -$179.99

Server accepted negative total!
Payment of -$179.99 processed (you get $179.99 refund)

✓ Business logic flaw — negative quantity manipulated price!`;
    }
  }

  if (labId.startsWith('auth')) {
    if (/admin|administrator|user|test/i.test(input)) {
      const valid = ['admin', 'administrator', 'alice', 'bob'].some(u => lower.includes(u));
      return valid
        ? `POST /login HTTP/1.1
username=${input}&password=wrongpassword

Response: "Incorrect password for this username"
↑ Different message — USERNAME IS VALID!
✓ Username enumeration confirmed — "admin" exists in the system!`
        : `POST /login HTTP/1.1
username=${input}&password=wrongpassword

Response: "Invalid username or password"
↑ Generic message — username may not exist`;
    }
  }

  return `Simulated server response for input: "${input}"

The server processed your request.
Try a different payload from the hints to trigger the vulnerability.`;
}

export function LabSimulator({ lab }: SimulatorProps) {
  const { locale } = useLanguage();
  const tx = (value: string, replacements: Record<string, string | number> = {}) => locale === 'fa'
    ? faLabel(value, replacements)
    : Object.entries(replacements).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
  const { darkMode, completedLabs } = useAppStore();
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [showPayloads, setShowPayloads] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const timer = useLabTimer(lab.id);
  const isAlreadyCompleted = completedLabs.includes(lab.id);

  const handleSubmit = () => {
    if (!input.trim()) return;

    if (!hasInteracted && !timer.isRunning && timer.isActive) {
      timer.startTimer();
    }
    setHasInteracted(true);

    const success = checkPayload(input, lab.validationPattern);
    const simResponse = getSimulatedResponse(lab.id, input);

    setResponse(simResponse);
    setIsSuccess(success);
    setIsError(!success);

    if (success && !isAlreadyCompleted) {
      if (timer.isActive && !timer.isRunning) {
        timer.startTimer();
      }
      if (timer.isActive) {
        timer.stopTimer();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!hasInteracted && !timer.isRunning && timer.isActive) {
      timer.startTimer();
      setHasInteracted(true);
    }
  };

  return (
    <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
      {/* Terminal Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <Terminal size={14} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
          <span className={`text-xs font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            hackpath_simulator ~ {lab.slug}
          </span>
        </div>

        {/* Timer controls */}
        <div className="flex items-center gap-2">
          {timer.isActive && (
            <div className={`flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded ${
              timer.isRunning ? 'bg-green-500/20 text-green-400' : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
            }`}>
              <Timer size={12} />
              {timer.formattedTime}
            </div>
          )}
          {timer.formattedBestTime && (
            <div className={`text-xs font-mono px-2 py-1 rounded ${darkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
              {tx('Best')}: {timer.formattedBestTime}
            </div>
          )}
          <button
            onClick={timer.toggleMode}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              timer.isActive
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
            }`}>
            {timer.isActive ? <RotateCcw size={12} /> : <Timer size={12} />}
          </button>
        </div>
      </div>

      {/* Lab context */}
      <div className={`px-4 py-3 border-b text-xs font-mono ${darkMode ? 'border-slate-800 bg-slate-950 text-slate-500' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
        <span className="text-green-400">$ </span>
        <span>target: {lab.category.toLowerCase().replace(/\s+/g, '-')} | difficulty: {lab.difficulty.toLowerCase()} | xp: +{lab.points}</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Already completed */}
        {isAlreadyCompleted && !isSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="text-green-400 text-sm font-medium">{tx('Lab already completed! You can still practice.')}</span>
          </div>
        )}

        {/* Input */}
        <div>
          <label className={`block text-xs font-semibold mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {tx('PAYLOAD INPUT')}
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{'>'}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={tx('Enter your payload...')}
                className={`technical-ltr w-full pl-7 pr-4 py-3 rounded-xl border font-mono text-sm transition-colors ${
                  isSuccess
                    ? 'border-green-500 bg-green-500/5'
                    : isError
                      ? 'border-red-500/50 bg-red-500/5'
                      : darkMode
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600 focus:border-green-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-green-500'
                } outline-none`}
              />
            </div>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-4 py-3 rounded-xl transition-colors">
              <Play size={16} />
              <span className="hidden sm:inline">{tx('Submit')}</span>
            </button>
          </div>
        </div>

        {/* Response */}
        {response && (
          <div className={`rounded-xl border overflow-hidden ${
            isSuccess
              ? 'border-green-500/40 bg-green-500/5'
              : 'border-slate-700/50'
          }`}>
            <div className={`flex items-center gap-2 px-3 py-2 border-b text-xs font-semibold ${
              isSuccess
                ? 'border-green-500/30 bg-green-500/10 text-green-400'
                : darkMode
                  ? 'border-slate-700 bg-slate-800 text-slate-400'
                  : 'border-slate-200 bg-slate-100 text-slate-500'
            }`}>
              {isSuccess
                ? <><CheckCircle2 size={12} /> {tx('VULNERABILITY EXPLOITED')}</>
                : <><XCircle size={12} /> {tx('SERVER RESPONSE')}</>
              }
            </div>
            <pre className={`technical-ltr p-4 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {response}
            </pre>
          </div>
        )}

        {/* Success */}
        {isSuccess && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-green-400" />
              <span className="text-green-400 font-bold">{lab.successMessage}</span>
            </div>
            {!isAlreadyCompleted && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-400 text-sm font-semibold">
                  {tx('Server verification required')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Hints */}
        <div>
          <button
            onClick={() => setShowHint(!showHint)}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              showHint ? 'text-yellow-400' : darkMode ? 'text-slate-400 hover:text-yellow-400' : 'text-slate-500 hover:text-yellow-600'
            }`}>
            <Lightbulb size={16} />
            {showHint ? tx('Hide Hints') : tx('Show Hints ({{count}} available)', { count: lab.hints.length })}
            {showHint ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showHint && (
            <div className={`mt-3 p-4 rounded-xl border ${darkMode ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-yellow-400 text-xs font-bold uppercase">{tx('Hint {{current}}/{{total}}', { current: hintIndex + 1, total: lab.hints.length })}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setHintIndex(Math.max(0, hintIndex - 1))}
                    disabled={hintIndex === 0}
                    className="text-xs text-yellow-400 disabled:opacity-30 hover:underline">
                    ← Prev
                  </button>
                  <button
                    onClick={() => setHintIndex(Math.min(lab.hints.length - 1, hintIndex + 1))}
                    disabled={hintIndex === lab.hints.length - 1}
                    className="text-xs text-yellow-400 disabled:opacity-30 hover:underline">
                    Next →
                  </button>
                </div>
              </div>
              <p className={`text-sm ${darkMode ? 'text-yellow-200/80' : 'text-yellow-800'}`}>
                {lab.hints[hintIndex]}
              </p>
            </div>
          )}
        </div>

        {/* Payloads */}
        <div>
          <button
            onClick={() => setShowPayloads(!showPayloads)}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              showPayloads ? 'text-blue-400' : darkMode ? 'text-slate-400 hover:text-blue-400' : 'text-slate-500 hover:text-blue-600'
            }`}>
            <Terminal size={16} />
            {showPayloads ? tx('Hide Payloads') : tx('Show Example Payloads')}
            {showPayloads ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showPayloads && (
            <div className={`mt-3 p-4 rounded-xl border space-y-2 ${darkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
              <p className={`text-xs mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx('Click a payload to use it:')}</p>
              {lab.payloads.map((payload, i) => (
                <button
                  key={i}
                  onClick={() => setInput(payload)}
                  className={`technical-ltr block w-full px-3 py-2 rounded-lg font-mono text-xs transition-colors ${
                    darkMode
                      ? 'bg-slate-800 text-blue-300 hover:bg-slate-700 hover:text-blue-200'
                      : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
                  }`}>
                  {payload}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
