<?php

return [
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
    'enforce_production_config' => (bool) env('HACKPATH_ENFORCE_PRODUCTION_CONFIG', false),

    'auth' => [
        'token_abilities' => array_values(array_filter(explode(',', env('HACKPATH_TOKEN_ABILITIES', '*')))),
        'admin' => [
            'username' => env('HACKPATH_ADMIN_USERNAME'),
            'name' => env('HACKPATH_ADMIN_NAME'),
            'email' => env('HACKPATH_ADMIN_EMAIL'),
            'password' => env('HACKPATH_ADMIN_PASSWORD'),
            'bootstrap_enabled' => (bool) env('HACKPATH_ADMIN_BOOTSTRAP_ENABLED', false),
        ],
    ],

    'labs' => [
        'training_mode' => (bool) env('HACKPATH_TRAINING_MODE', true),
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
