<?php

declare(strict_types=1);

$environment = (string) env('APP_ENV', 'local');
$boolean = static fn (string $key, bool $default = false): bool => filter_var(
    env($key, $default),
    FILTER_VALIDATE_BOOL,
    FILTER_NULL_ON_FAILURE,
) ?? $default;

return [
    'frontend_url' => env('FRONTEND_URL', $environment === 'production' ? '' : 'http://localhost:5173'),
    'enforce_production_config' => $boolean('HACKPATH_ENFORCE_PRODUCTION_CONFIG'),

    'auth' => [
        'token_abilities' => array_values(array_filter(explode(',', env('HACKPATH_TOKEN_ABILITIES', '*')))),
        'admin' => [
            'username' => env('HACKPATH_ADMIN_USERNAME'),
            'name' => env('HACKPATH_ADMIN_NAME'),
            'email' => env('HACKPATH_ADMIN_EMAIL'),
            'password' => env('HACKPATH_ADMIN_PASSWORD'),
            'bootstrap_enabled' => $boolean('HACKPATH_ADMIN_BOOTSTRAP_ENABLED'),
        ],
    ],

    'labs' => [
        'training_mode' => $boolean('HACKPATH_TRAINING_MODE', true),
    ],

    'trusted_proxies' => [
        'proxies' => array_values(array_filter(array_map(
            'trim',
            explode(',', env('TRUSTED_PROXIES', ''))
        ))),
        'headers' => env('TRUSTED_PROXY_HEADERS'),
        'documentation_url' => env('TRUSTED_PROXIES_DOCUMENTATION_URL'),
    ],
];
