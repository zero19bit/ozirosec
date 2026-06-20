export type Difficulty = 'Apprentice' | 'Practitioner' | 'Expert';

export interface Lab {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  categoryId: string;
  difficulty: Difficulty;
  solution: string;
  hints: string[];
  payloads: string[];
  validationPattern: string;
  successMessage: string;
  isWeekly?: boolean;
  isSimulated?: boolean;
  estimatedMinutes: number;
  points: number;
}

const xpMap: Record<Difficulty, number> = {
  Apprentice: 10,
  Practitioner: 25,
  Expert: 50
};

export const labs: Lab[] = [
  // === SQL INJECTION ===
  {
    id: 'sqli-001',
    slug: 'sqli-where-clause-string',
    title: 'SQL injection in WHERE clause – retrieve hidden data',
    description: 'The product category filter uses an SQL query to return products. The results are displayed in a vulnerable way. To solve this lab, perform an SQL injection attack that causes the application to display all products, including unreleased items.',
    category: 'SQL Injection',
    categoryId: 'sqli',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Excellent! You've bypassed the WHERE clause and revealed all hidden products!",
    estimatedMinutes: 10,
    points: xpMap['Apprentice'],
    isSimulated: true
  },
  {
    id: 'sqli-002',
    slug: 'sqli-login-bypass',
    title: 'SQL injection – login bypass',
    description: "The login page uses SQL to authenticate users. The application constructs the SQL query using string concatenation with user-supplied input. To solve the lab, log in as the administrator user without knowing the password.",
    category: 'SQL Injection',
    categoryId: 'sqli',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Login bypassed! You're now authenticated as the administrator!",
    estimatedMinutes: 15,
    points: xpMap['Apprentice'],
    isSimulated: true,
    isWeekly: true
  },
  {
    id: 'sqli-003',
    slug: 'sqli-union-attack-columns',
    title: 'SQL injection UNION attack – determining columns',
    description: 'The application is vulnerable to SQL injection via the category parameter. Determine the number of columns returned by the query using a UNION-based attack technique.',
    category: 'SQL Injection',
    categoryId: 'sqli',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Column count determined! You've mastered UNION-based SQLi enumeration!",
    estimatedMinutes: 20,
    points: xpMap['Practitioner'],
    isSimulated: true
  },
  {
    id: 'sqli-004',
    slug: 'sqli-union-data-extraction',
    title: 'SQL injection UNION attack – extract data from other tables',
    description: 'The database contains a table called users with columns username and password. Use a UNION-based SQL injection to retrieve all usernames and passwords.',
    category: 'SQL Injection',
    categoryId: 'sqli',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Database credentials extracted! Superb UNION attack execution!",
    estimatedMinutes: 25,
    points: xpMap['Practitioner'],
    isSimulated: false
  },
  {
    id: 'sqli-005',
    slug: 'sqli-blind-boolean',
    title: 'Blind SQL injection with boolean-based detection',
    description: "The application uses a tracking cookie for analytics. The SQL query is evaluated but results are not returned. The application's behavior differs based on whether the query returns results. Use boolean-based blind SQL injection to determine the admin password length.",
    category: 'SQL Injection',
    categoryId: 'sqli',
    difficulty: 'Expert',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Incredible! You've mastered boolean-based blind SQL injection!",
    estimatedMinutes: 45,
    points: xpMap['Expert'],
    isSimulated: false
  },
  // === XSS ===
  {
    id: 'xss-001',
    slug: 'xss-reflected-html',
    title: 'Reflected XSS into HTML context with no encoding',
    description: "The search blog functionality reflects the search term in the response without any encoding. Inject a script that calls alert(document.domain) to demonstrate the XSS vulnerability.",
    category: 'Cross-Site Scripting',
    categoryId: 'xss',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "XSS executed! You've successfully injected and executed JavaScript in the page!",
    estimatedMinutes: 10,
    points: xpMap['Apprentice'],
    isSimulated: true
  },
  {
    id: 'xss-002',
    slug: 'xss-stored-comments',
    title: 'Stored XSS into HTML context',
    description: "The blog comment functionality stores user input and displays it to other users without proper encoding. Inject a stored XSS payload that will execute for every user who views the comment.",
    category: 'Cross-Site Scripting',
    categoryId: 'xss',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Stored XSS planted! Every user who visits will now execute your script!",
    estimatedMinutes: 15,
    points: xpMap['Apprentice'],
    isSimulated: true,
    isWeekly: false
  },
  {
    id: 'xss-003',
    slug: 'xss-dom-document-write',
    title: 'DOM XSS using document.write with location.search',
    description: "The search functionality uses document.write() with data from location.search. Exploit this DOM-based XSS to execute JavaScript. The script writes: `document.write('<img src=\"/resources/images/tracker.gif?searchTerms='+query+'\">')`",
    category: 'Cross-Site Scripting',
    categoryId: 'xss',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "DOM XSS exploited! You've broken out of the attribute context!",
    estimatedMinutes: 20,
    points: xpMap['Practitioner'],
    isSimulated: true
  },
  {
    id: 'xss-004',
    slug: 'xss-stored-onclick',
    title: 'Stored XSS into onClick event with HTML encoding',
    description: "The website links to user-supplied website URLs in the href attribute of anchor tags, and also in onclick event handlers. Bypass the HTML encoding to achieve XSS.",
    category: 'Cross-Site Scripting',
    categoryId: 'xss',
    difficulty: 'Expert',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Event handler XSS achieved! Masterful bypass of HTML encoding!",
    estimatedMinutes: 35,
    points: xpMap['Expert'],
    isSimulated: false
  },
  // === CSRF ===
  {
    id: 'csrf-001',
    slug: 'csrf-no-defenses',
    title: 'CSRF vulnerability with no defenses',
    description: "The email change functionality has no CSRF defenses. Craft a cross-site request forgery attack that changes the victim's email address to one you control.",
    category: 'CSRF',
    categoryId: 'csrf',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "CSRF attack successful! Email has been changed to your controlled address!",
    estimatedMinutes: 20,
    points: xpMap['Apprentice'],
    isSimulated: true
  },
  {
    id: 'csrf-002',
    slug: 'csrf-token-not-tied-to-session',
    title: 'CSRF where token is not tied to user session',
    description: "The CSRF token is validated but not tied to the user session. Obtain a valid CSRF token from your own account and use it in a CSRF attack against another user.",
    category: 'CSRF',
    categoryId: 'csrf',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "CSRF bypass! Token was valid across sessions - a critical implementation flaw!",
    estimatedMinutes: 30,
    points: xpMap['Practitioner'],
    isSimulated: false
  },
  // === SSRF ===
  {
    id: 'ssrf-001',
    slug: 'ssrf-basic-against-server',
    title: 'Basic SSRF against the local server',
    description: "The stock check feature fetches data from an internal URL. The URL is taken from the request body and no validation is performed. Access the admin panel at http://localhost/admin.",
    category: 'SSRF',
    categoryId: 'ssrf',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Internal admin panel accessed via SSRF! Server-side requests bypass network controls!",
    estimatedMinutes: 15,
    points: xpMap['Apprentice'],
    isSimulated: true
  },
  {
    id: 'ssrf-002',
    slug: 'ssrf-aws-metadata',
    title: 'SSRF to access AWS EC2 metadata',
    description: "This application runs on AWS EC2. Use SSRF to access the instance metadata service and retrieve sensitive information including IAM credentials.",
    category: 'SSRF',
    categoryId: 'ssrf',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "AWS metadata accessed! You've retrieved cloud IAM credentials via SSRF!",
    estimatedMinutes: 25,
    points: xpMap['Practitioner'],
    isSimulated: true
  },
  // === PATH TRAVERSAL ===
  {
    id: 'path-001',
    slug: 'path-traversal-simple',
    title: 'File path traversal – simple case',
    description: "The application serves images via a filename parameter. Attempt to traverse outside the intended directory to read the /safe/training/file.txt file.",
    category: 'Path Traversal',
    categoryId: 'path-traversal',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Path traversal successful! /safe/training/file.txt contents retrieved!",
    estimatedMinutes: 10,
    points: xpMap['Apprentice'],
    isSimulated: true
  },
  {
    id: 'path-002',
    slug: 'path-traversal-bypass-validation',
    title: 'Path traversal with validation bypass',
    description: "The application attempts to strip ../ sequences from the filename input but the sanitization can be bypassed. Retrieve the /safe/training/file.txt file despite the filtering.",
    category: 'Path Traversal',
    categoryId: 'path-traversal',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Validation bypass! Nested traversal sequences successfully reconstructed the path!",
    estimatedMinutes: 20,
    points: xpMap['Practitioner'],
    isSimulated: true
  },
  // === IDOR ===
  {
    id: 'idor-001',
    slug: 'idor-user-profile',
    title: 'IDOR – access another user\'s profile',
    description: "The user profile endpoint uses a numeric user ID in the URL. Test whether you can access other users' profiles by changing the ID parameter.",
    category: 'IDOR',
    categoryId: 'idor',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "IDOR confirmed! You've accessed another user's data without authorization!",
    estimatedMinutes: 15,
    points: xpMap['Apprentice'],
    isSimulated: true
  },
  {
    id: 'idor-002',
    slug: 'idor-order-history',
    title: 'IDOR – access order history',
    description: "The order history endpoint exposes order details based on an order ID in the URL. Find and access another customer's order records.",
    category: 'IDOR',
    categoryId: 'idor',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Order IDOR exploited! You've accessed another customer's private order data!",
    estimatedMinutes: 20,
    points: xpMap['Practitioner'],
    isSimulated: false
  },
  // === JWT ===
  {
    id: 'jwt-001',
    slug: 'jwt-alg-none',
    title: 'JWT authentication bypass via unverified signature',
    description: "The application uses JWT authentication but doesn't properly validate the signature. Modify your JWT to change the algorithm to 'none' and access the admin panel.",
    category: 'JWT',
    categoryId: 'jwt',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "JWT alg:none bypass! The server accepted an unsigned token - critical vulnerability!",
    estimatedMinutes: 20,
    points: xpMap['Apprentice'],
    isSimulated: true
  },
  {
    id: 'jwt-002',
    slug: 'jwt-weak-secret',
    title: 'JWT authentication bypass via weak secret',
    description: "The application uses HS256 JWT with a weak secret key. Brute-force the secret and forge a valid admin token.",
    category: 'JWT',
    categoryId: 'jwt',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Weak secret cracked! Admin JWT forged with the discovered signing key!",
    estimatedMinutes: 30,
    points: xpMap['Practitioner'],
    isSimulated: true
  },
  {
    id: 'jwt-003',
    slug: 'jwt-algorithm-confusion',
    title: 'JWT authentication bypass via algorithm confusion',
    description: "The application allows both RS256 and HS256 algorithms. Exploit algorithm confusion by using the server's public key as the HMAC secret for HS256.",
    category: 'JWT',
    categoryId: 'jwt',
    difficulty: 'Expert',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Algorithm confusion exploited! RS256 to HS256 downgrade attack successful!",
    estimatedMinutes: 45,
    points: xpMap['Expert'],
    isSimulated: false
  },
  // === COMMAND INJECTION ===
  {
    id: 'cmdi-001',
    slug: 'command-injection-simple',
    title: 'OS command injection – simple case',
    description: "The application provides a ping functionality for network diagnostics. The IP address is passed directly to a system command. Inject OS commands to execute arbitrary system commands.",
    category: 'Command Injection',
    categoryId: 'rce',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Command injection successful! System commands are executing on the server!",
    estimatedMinutes: 10,
    points: xpMap['Apprentice'],
    isSimulated: true
  },
  {
    id: 'cmdi-002',
    slug: 'command-injection-blind',
    title: 'Blind OS command injection with out-of-band detection',
    description: "The feedback submission form is vulnerable to blind OS command injection. There's no visible output, but you can use time delays and out-of-band techniques to confirm and exploit the vulnerability.",
    category: 'Command Injection',
    categoryId: 'rce',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Blind command injection confirmed via time delay! Server executed your sleep command!",
    estimatedMinutes: 30,
    points: xpMap['Practitioner'],
    isSimulated: true
  },
  // === XXE ===
  {
    id: 'xxe-001',
    slug: 'xxe-basic-file-read',
    title: 'Exploiting XXE to retrieve files',
    description: "The application uses an XML-based stock check API. Inject an external entity to retrieve the contents of /safe/training/file.txt from the server.",
    category: 'XXE',
    categoryId: 'xxe',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "XXE successful! /safe/training/file.txt contents returned in the response!",
    estimatedMinutes: 20,
    points: xpMap['Apprentice'],
    isSimulated: true
  },
  {
    id: 'xxe-002',
    slug: 'xxe-ssrf',
    title: 'Exploiting XXE to perform SSRF',
    description: "The application is vulnerable to XXE. Use XXE to perform SSRF and access the AWS metadata endpoint at http://metadata.training.local.",
    category: 'XXE',
    categoryId: 'xxe',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "XXE→SSRF achieved! AWS metadata accessed via XML external entity!",
    estimatedMinutes: 25,
    points: xpMap['Practitioner'],
    isSimulated: false
  },
  // === SSTI ===
  {
    id: 'ssti-001',
    slug: 'ssti-basic-detection',
    title: 'Server-Side Template Injection – basic detection',
    description: "The application renders user input in a template. Detect SSTI and identify the template engine by injecting mathematical expressions.",
    category: 'SSTI',
    categoryId: 'ssti',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "SSTI detected! Mathematical expression evaluated server-side by the template engine!",
    estimatedMinutes: 15,
    points: xpMap['Apprentice'],
    isSimulated: true
  },
  {
    id: 'ssti-002',
    slug: 'ssti-jinja2-rce',
    title: 'SSTI – Jinja2 Remote Code Execution',
    description: "The application uses Jinja2 and is vulnerable to SSTI. Escalate from basic SSTI to remote code execution by accessing Python built-in functions.",
    category: 'SSTI',
    categoryId: 'ssti',
    difficulty: 'Expert',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Jinja2 RCE achieved! You've escalated SSTI to full remote code execution!",
    estimatedMinutes: 50,
    points: xpMap['Expert'],
    isSimulated: false
  },
  // === CORS ===
  {
    id: 'cors-001',
    slug: 'cors-origin-reflection',
    title: 'CORS vulnerability with basic origin reflection',
    description: "The application reflects the Origin header in the Access-Control-Allow-Origin response header with credentials allowed. Exploit this to steal the victim's API key.",
    category: 'CORS',
    categoryId: 'cors',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "CORS exploit successful! Victim's API key exfiltrated from the vulnerable endpoint!",
    estimatedMinutes: 20,
    points: xpMap['Apprentice'],
    isSimulated: true
  },
  // === CLICKJACKING ===
  {
    id: 'click-001',
    slug: 'clickjacking-basic',
    title: 'Basic clickjacking attack',
    description: "The target website doesn't use X-Frame-Options or CSP frame-ancestors, making it vulnerable to clickjacking. Construct a clickjacking attack that causes the victim to delete their account.",
    category: 'Clickjacking',
    categoryId: 'clickjacking',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Clickjacking PoC created! Victim's clicks are being hijacked to the target site!",
    estimatedMinutes: 20,
    points: xpMap['Apprentice'],
    isSimulated: true
  },
  // === NOSQL ===
  {
    id: 'nosqli-001',
    slug: 'nosqli-login-bypass',
    title: 'NoSQL injection – login bypass',
    description: "The application uses MongoDB to authenticate users. The login form sends JSON data directly to the MongoDB query. Bypass authentication using NoSQL operators.",
    category: 'NoSQL Injection',
    categoryId: 'nosqli',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "NoSQL authentication bypass! MongoDB operator injection granted admin access!",
    estimatedMinutes: 25,
    points: xpMap['Practitioner'],
    isSimulated: true
  },
  // === BUSINESS LOGIC ===
  {
    id: 'bizlogic-001',
    slug: 'bizlogic-negative-quantity',
    title: 'Business logic – negative quantity purchase',
    description: "The shopping cart allows quantity to be set to any integer value. Use negative quantities to manipulate the total price and potentially get items for free or get a refund.",
    category: 'Business Logic',
    categoryId: 'business-logic',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Business logic flaw! Negative quantities manipulate the total price!",
    estimatedMinutes: 15,
    points: xpMap['Apprentice'],
    isSimulated: true
  },
  {
    id: 'bizlogic-002',
    slug: 'bizlogic-2fa-bypass',
    title: 'Business logic – 2FA bypass',
    description: "After completing the first authentication factor (password), the application redirects to the 2FA page. Test if you can bypass the 2FA step by directly navigating to authenticated pages.",
    category: 'Business Logic',
    categoryId: 'business-logic',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "2FA bypassed! The authentication state machine has a critical flaw!",
    estimatedMinutes: 20,
    points: xpMap['Practitioner'],
    isSimulated: false
  },
  // === HTTP SMUGGLING ===
  {
    id: 'smuggling-001',
    slug: 'smuggling-basic-cl-te',
    title: 'HTTP request smuggling – basic CL.TE vulnerability',
    description: "The front-end server uses Content-Length and the back-end uses Transfer-Encoding. Exploit this discrepancy to smuggle a request. To solve the lab, smuggle a request so that the next user's request is captured.",
    category: 'HTTP Smuggling',
    categoryId: 'http-smuggling',
    difficulty: 'Expert',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Request smuggled! CL.TE desync attack successful - next request was prepended!",
    estimatedMinutes: 60,
    points: xpMap['Expert'],
    isSimulated: false
  },
  // === RACE CONDITIONS ===
  {
    id: 'race-001',
    slug: 'race-condition-coupon',
    title: 'Race condition – coupon code reuse',
    description: "The coupon redemption system has a race condition. The check and update are not atomic. Send concurrent requests to use the same coupon code multiple times.",
    category: 'Race Conditions',
    categoryId: 'race-conditions',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Race condition exploited! Coupon applied multiple times due to non-atomic operations!",
    estimatedMinutes: 30,
    points: xpMap['Practitioner'],
    isSimulated: false
  },
  // === FILE UPLOAD ===
  {
    id: 'fileupload-001',
    slug: 'file-upload-bypass-content-type',
    title: 'File upload – bypass content type validation',
    description: "The file upload functionality validates the Content-Type header but not the actual file content. Upload a PHP webshell by manipulating the Content-Type header.",
    category: 'File Upload',
    categoryId: 'file-upload',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Webshell uploaded! Content-Type bypass allowed PHP code execution!",
    estimatedMinutes: 20,
    points: xpMap['Apprentice'],
    isSimulated: false
  },
  {
    id: 'fileupload-002',
    slug: 'file-upload-zip-slip',
    title: 'File upload – Zip Slip path traversal',
    description: "The application extracts uploaded ZIP files. Craft a malicious ZIP file where entries have path traversal sequences in their filenames to write files outside the extraction directory.",
    category: 'File Upload',
    categoryId: 'file-upload',
    difficulty: 'Expert',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Zip Slip exploited! PHP shell written to web root via ZIP path traversal!",
    estimatedMinutes: 45,
    points: xpMap['Expert'],
    isSimulated: false
  },
  // === GRAPHQL ===
  {
    id: 'graphql-001',
    slug: 'graphql-introspection',
    title: 'GraphQL – information disclosure via introspection',
    description: "The GraphQL API has introspection enabled in production. Use introspection to discover all types, fields, and queries, including hidden administrative functionality.",
    category: 'GraphQL',
    categoryId: 'graphql',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Full schema disclosed! Introspection revealed all types including hidden admin functionality!",
    estimatedMinutes: 15,
    points: xpMap['Apprentice'],
    isSimulated: true
  },
  {
    id: 'graphql-002',
    slug: 'graphql-batch-bypass',
    title: 'GraphQL – batching attack to bypass rate limiting',
    description: "The OTP verification uses GraphQL mutations. Rate limiting is applied per request but not per operation. Use GraphQL batching to send hundreds of OTP guesses in a single request.",
    category: 'GraphQL',
    categoryId: 'graphql',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Rate limit bypassed! GraphQL batching allowed 1000 OTP guesses in one HTTP request!",
    estimatedMinutes: 30,
    points: xpMap['Practitioner'],
    isSimulated: false
  },
  // === DESERIALIZATION ===
  {
    id: 'deser-001',
    slug: 'deserialization-php-cookie',
    title: 'PHP deserialization – cookie manipulation',
    description: "The application stores session data in a PHP-serialized cookie. Modify the serialized object to grant yourself admin privileges.",
    category: 'Deserialization',
    categoryId: 'deserialization',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Deserialization attack! PHP object property manipulated to grant admin access!",
    estimatedMinutes: 30,
    points: xpMap['Practitioner'],
    isSimulated: true
  },
  // === WEB CACHE ===
  {
    id: 'cache-001',
    slug: 'web-cache-poisoning-xss',
    title: 'Web cache poisoning to deliver stored XSS',
    description: "The application reflects the X-Forwarded-Host header in the response, which gets cached. Poison the cache with a malicious X-Forwarded-Host to deliver XSS to all visitors.",
    category: 'Web Cache Poisoning',
    categoryId: 'web-cache-poisoning',
    difficulty: 'Expert',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Cache poisoned! XSS payload will be served to all users from the CDN cache!",
    estimatedMinutes: 45,
    points: xpMap['Expert'],
    isSimulated: false
  },
  // === OAUTH ===
  {
    id: 'oauth-001',
    slug: 'oauth-csrf-state',
    title: 'OAuth – CSRF via missing state parameter',
    description: "The OAuth flow doesn't implement the state parameter, making it vulnerable to CSRF. Forge a link that connects an attacker's OAuth account to a victim's application account.",
    category: 'OAuth',
    categoryId: 'oauth',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "OAuth CSRF! Attacker's external account linked to victim's application account!",
    estimatedMinutes: 35,
    points: xpMap['Practitioner'],
    isSimulated: false
  },
  // === ADDITIONAL LABS ===
  {
    id: 'sqli-006',
    slug: 'sqli-time-based-blind',
    title: 'Blind SQL injection with time delays',
    description: "The application doesn't show any output from SQL queries but is vulnerable to blind SQL injection. Use time delays to confirm and enumerate the database.",
    category: 'SQL Injection',
    categoryId: 'sqli',
    difficulty: 'Expert',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Time-based blind SQLi confirmed! Conditional time delays reveal database information!",
    estimatedMinutes: 40,
    points: xpMap['Expert'],
    isSimulated: false
  },
  {
    id: 'xss-005',
    slug: 'xss-csp-bypass',
    title: 'Reflected XSS with CSP bypass',
    description: "The application uses Content Security Policy to prevent XSS but the policy is misconfigured. Find a CSP bypass to execute arbitrary JavaScript.",
    category: 'Cross-Site Scripting',
    categoryId: 'xss',
    difficulty: 'Expert',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "CSP bypassed! Policy misconfiguration allowed JavaScript execution despite CSP!",
    estimatedMinutes: 50,
    points: xpMap['Expert'],
    isSimulated: false
  },
  {
    id: 'auth-001',
    slug: 'auth-username-enumeration',
    title: 'Username enumeration via different responses',
    description: "The login form behaves differently when an incorrect username vs an incorrect password is provided. Use this difference to enumerate valid usernames.",
    category: 'Authentication',
    categoryId: 'authentication',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Username enumeration confirmed! Response differences reveal valid usernames!",
    estimatedMinutes: 20,
    points: xpMap['Apprentice'],
    isSimulated: true
  },
  {
    id: 'auth-002',
    slug: 'auth-brute-force',
    title: 'Brute-force attack on login',
    description: "The login page has no effective brute-force protection. Perform a credential stuffing attack using a list of common passwords to gain access.",
    category: 'Authentication',
    categoryId: 'authentication',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Brute force successful! Weak password found - account compromised!",
    estimatedMinutes: 25,
    points: xpMap['Practitioner'],
    isSimulated: false
  },
  {
    id: 'access-control-001',
    slug: 'access-control-admin-bypass',
    title: 'Unprotected admin functionality',
    description: "The admin panel is not properly protected. It relies on security through obscurity - the URL is not linked but accessible. Find and access the admin panel.",
    category: 'Access Control',
    categoryId: 'access-control',
    difficulty: 'Apprentice',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Admin panel accessed! Security through obscurity is not a valid access control!",
    estimatedMinutes: 10,
    points: xpMap['Apprentice'],
    isSimulated: true
  },
  {
    id: 'access-control-002',
    slug: 'access-control-horizontal-privilege',
    title: 'User-controlled key for horizontal privilege escalation',
    description: "The application uses a GUID to identify user accounts in the URL. Test if you can access other users' accounts by finding their GUIDs.",
    category: 'Access Control',
    categoryId: 'access-control',
    difficulty: 'Practitioner',
    solution: "Exact lab solutions are intentionally not bundled in the frontend. Use the objective, authorized lab environment, and server-side verification flow to validate your work.",
    hints: [
      "Review the lab objective and identify the trusted server-side control involved.",
      "Use only the authorized training environment and avoid real third-party targets.",
      "Change one input or workflow step at a time and observe the simulated response.",
      "When you believe the behavior is correct, submit through the server-side verification flow."
    ],
    payloads: ["Craft your own authorized training input; exact payloads are not bundled."],
    validationPattern: "(?i)(training|authorized|lab)",
    successMessage: "Horizontal privilege escalation! Accessed another user's account using their exposed GUID!",
    estimatedMinutes: 25,
    points: xpMap['Practitioner'],
    isSimulated: false
  }
];

export const getLabsByCategory = (categoryId: string) =>
  labs.filter(lab => lab.categoryId === categoryId);

export const getLabBySlug = (slug: string) =>
  labs.find(lab => lab.slug === slug);

export const getLabById = (id: string) =>
  labs.find(lab => lab.id === id);

export const getXPForDifficulty = (difficulty: Difficulty, isWeekly = false) => {
  const base = { Apprentice: 10, Practitioner: 25, Expert: 50 }[difficulty];
  return isWeekly ? base * 2 : base;
};

export const weeklyLab = labs.find(l => l.isWeekly) ?? labs[1];
