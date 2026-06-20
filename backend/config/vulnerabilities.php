<?php

declare(strict_types=1);
$lab = static function (string $key, string $title, string $vulnerability, string $difficulty, int $points): array {
    $envKey = strtoupper(str_replace('-', '_', $key));

    return [
        'key' => $key,
        'title' => $title,
        'vulnerability' => $vulnerability,
        'difficulty' => $difficulty,
        'active' => (bool) env("HACKPATH_LAB_{$envKey}_ACTIVE", false),
        'points' => env("HACKPATH_LAB_{$envKey}_POINTS", $points),
        'expected_digest' => env("HACKPATH_LAB_{$envKey}_DIGEST"),
    ];
};

return [
    'digest_algorithm' => env('HACKPATH_FLAG_ALGORITHM', 'sha256'),
    'flag_secret' => env('HACKPATH_FLAG_SECRET'),
    'labs' => [
        'sqli-001' => $lab('sqli-001', 'SQL injection in WHERE clause - retrieve hidden data', 'SQL Injection', 'Apprentice', 10),
        'sqli-002' => $lab('sqli-002', 'SQL injection - login bypass', 'SQL Injection', 'Apprentice', 10),
        'sqli-003' => $lab('sqli-003', 'SQL injection UNION attack - determining columns', 'SQL Injection', 'Practitioner', 25),
        'sqli-004' => $lab('sqli-004', 'SQL injection UNION attack - extract data from other tables', 'SQL Injection', 'Practitioner', 25),
        'sqli-005' => $lab('sqli-005', 'Blind SQL injection with boolean-based detection', 'SQL Injection', 'Expert', 50),
        'xss-001' => $lab('xss-001', 'Reflected XSS into HTML context with no encoding', 'Cross-Site Scripting', 'Apprentice', 10),
        'xss-002' => $lab('xss-002', 'Stored XSS into HTML context', 'Cross-Site Scripting', 'Apprentice', 10),
        'xss-003' => $lab('xss-003', 'DOM XSS using document.write with location.search', 'Cross-Site Scripting', 'Practitioner', 25),
        'xss-004' => $lab('xss-004', 'Stored XSS into onClick event with HTML encoding', 'Cross-Site Scripting', 'Expert', 50),
        'csrf-001' => $lab('csrf-001', 'CSRF vulnerability with no defenses', 'CSRF', 'Apprentice', 10),
        'csrf-002' => $lab('csrf-002', 'CSRF where token is not tied to user session', 'CSRF', 'Practitioner', 25),
        'ssrf-001' => $lab('ssrf-001', 'Basic SSRF against the local server', 'SSRF', 'Apprentice', 10),
        'ssrf-002' => $lab('ssrf-002', 'SSRF to access AWS EC2 metadata', 'SSRF', 'Practitioner', 25),
        'path-001' => $lab('path-001', 'File path traversal - simple case', 'Path Traversal', 'Apprentice', 10),
        'path-002' => $lab('path-002', 'Path traversal with validation bypass', 'Path Traversal', 'Practitioner', 25),
        'idor-001' => $lab('idor-001', 'IDOR - access another user\'s profile', 'IDOR', 'Apprentice', 10),
        'idor-002' => $lab('idor-002', 'IDOR - access order history', 'IDOR', 'Practitioner', 25),
        'jwt-001' => $lab('jwt-001', 'JWT authentication bypass via unverified signature', 'JWT', 'Apprentice', 10),
        'jwt-002' => $lab('jwt-002', 'JWT authentication bypass via weak secret', 'JWT', 'Practitioner', 25),
        'jwt-003' => $lab('jwt-003', 'JWT authentication bypass via algorithm confusion', 'JWT', 'Expert', 50),
        'cmdi-001' => $lab('cmdi-001', 'OS command injection - simple case', 'Command Injection', 'Apprentice', 10),
        'cmdi-002' => $lab('cmdi-002', 'Blind OS command injection with out-of-band detection', 'Command Injection', 'Practitioner', 25),
        'xxe-001' => $lab('xxe-001', 'Exploiting XXE to retrieve files', 'XXE', 'Apprentice', 10),
        'xxe-002' => $lab('xxe-002', 'Exploiting XXE to perform SSRF', 'XXE', 'Practitioner', 25),
        'ssti-001' => $lab('ssti-001', 'Server-Side Template Injection - basic detection', 'SSTI', 'Apprentice', 10),
        'ssti-002' => $lab('ssti-002', 'SSTI - Jinja2 Remote Code Execution', 'SSTI', 'Expert', 50),
        'cors-001' => $lab('cors-001', 'CORS vulnerability with basic origin reflection', 'CORS', 'Apprentice', 10),
        'click-001' => $lab('click-001', 'Basic clickjacking attack', 'Clickjacking', 'Apprentice', 10),
        'nosqli-001' => $lab('nosqli-001', 'NoSQL injection - login bypass', 'NoSQL Injection', 'Practitioner', 25),
        'bizlogic-001' => $lab('bizlogic-001', 'Business logic - negative quantity purchase', 'Business Logic', 'Apprentice', 10),
        'bizlogic-002' => $lab('bizlogic-002', 'Business logic - 2FA bypass', 'Business Logic', 'Practitioner', 25),
        'smuggling-001' => $lab('smuggling-001', 'HTTP request smuggling - basic CL.TE vulnerability', 'HTTP Smuggling', 'Expert', 50),
        'race-001' => $lab('race-001', 'Race condition - coupon code reuse', 'Race Conditions', 'Practitioner', 25),
        'fileupload-001' => $lab('fileupload-001', 'File upload - bypass content type validation', 'File Upload', 'Apprentice', 10),
        'fileupload-002' => $lab('fileupload-002', 'File upload - Zip Slip path traversal', 'File Upload', 'Expert', 50),
        'graphql-001' => $lab('graphql-001', 'GraphQL - information disclosure via introspection', 'GraphQL', 'Apprentice', 10),
        'graphql-002' => $lab('graphql-002', 'GraphQL - batching attack to bypass rate limiting', 'GraphQL', 'Practitioner', 25),
        'deser-001' => $lab('deser-001', 'PHP deserialization - cookie manipulation', 'Deserialization', 'Practitioner', 25),
        'cache-001' => $lab('cache-001', 'Web cache poisoning to deliver stored XSS', 'Web Cache Poisoning', 'Expert', 50),
        'oauth-001' => $lab('oauth-001', 'OAuth - CSRF via missing state parameter', 'OAuth', 'Practitioner', 25),
        'sqli-006' => $lab('sqli-006', 'Blind SQL injection with time delays', 'SQL Injection', 'Expert', 50),
        'xss-005' => $lab('xss-005', 'Reflected XSS with CSP bypass', 'Cross-Site Scripting', 'Expert', 50),
        'auth-001' => $lab('auth-001', 'Username enumeration via different responses', 'Authentication', 'Apprentice', 10),
        'auth-002' => $lab('auth-002', 'Brute-force attack on login', 'Authentication', 'Practitioner', 25),
        'access-control-001' => $lab('access-control-001', 'Unprotected admin functionality', 'Access Control', 'Apprentice', 10),
        'access-control-002' => $lab('access-control-002', 'User-controlled key for horizontal privilege escalation', 'Access Control', 'Practitioner', 25),
    ],
];
