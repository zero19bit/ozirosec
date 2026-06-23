<?php

declare(strict_types=1);

use App\Support\CorsOriginParser;

$environment = (string) env('APP_ENV', 'local');
$supportsCredentials = filter_var(env('CORS_SUPPORTS_CREDENTIALS', true), FILTER_VALIDATE_BOOL);
$allowedOrigins = CorsOriginParser::fromCommaSeparated(
    env('CORS_ALLOWED_ORIGINS', env('FRONTEND_URL', $environment === 'production' ? '' : 'http://localhost:5173')),
    $environment,
);

if (in_array('*', $allowedOrigins, true) && ($supportsCredentials || $environment === 'production')) {
    throw new InvalidArgumentException('CORS_ALLOWED_ORIGINS cannot contain * for credentialed or production deployments.');
}

if ($environment === 'production' && $allowedOrigins === []) {
    throw new InvalidArgumentException('CORS_ALLOWED_ORIGINS must contain at least one explicit HTTPS origin in production.');
}

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => $allowedOrigins,
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Accept', 'Content-Type', 'Origin', 'X-Requested-With', 'X-XSRF-TOKEN'],
    'exposed_headers' => [],
    'max_age' => 600,
    'supports_credentials' => $supportsCredentials,
];
