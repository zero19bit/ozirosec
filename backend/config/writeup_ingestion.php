<?php

declare(strict_types=1);

return [
    'hmac_secret' => env('WRITEUP_INGEST_HMAC_SECRET'),
    'allowed_clock_skew' => (int) env('WRITEUP_INGEST_ALLOWED_CLOCK_SKEW', 300),
    'max_payload_bytes' => (int) env('WRITEUP_INGEST_MAX_PAYLOAD_BYTES', 262144),
    'nonce_retention_seconds' => (int) env('WRITEUP_INGEST_NONCE_RETENTION_SECONDS', 600),
    'allowed_source_types' => ['rss', 'api', 'html'],
];
