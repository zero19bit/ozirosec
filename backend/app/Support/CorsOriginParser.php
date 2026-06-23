<?php

declare(strict_types=1);

namespace App\Support;

use InvalidArgumentException;

final readonly class CorsOriginParser
{
    /**
     * @return list<string>
     */
    public static function fromCommaSeparated(
        ?string $origins,
        string $environment,
    ): array {
        $normalized = [];

        foreach (explode(',', (string) $origins) as $origin) {
            $origin = rtrim(trim($origin), '/');

            if ($origin === '') {
                continue;
            }

            self::assertValidOrigin($origin, $environment);
            $normalized[] = $origin;
        }

        return array_values(array_unique($normalized));
    }

    private static function assertValidOrigin(
        string $origin,
        string $environment,
    ): void {
        if ($origin === '*') {
            return;
        }

        if (filter_var($origin, FILTER_VALIDATE_URL) === false) {
            throw new InvalidArgumentException('CORS_ALLOWED_ORIGINS contains a malformed origin.');
        }

        $scheme = parse_url($origin, PHP_URL_SCHEME);
        $host = parse_url($origin, PHP_URL_HOST);
        $path = parse_url($origin, PHP_URL_PATH);
        $query = parse_url($origin, PHP_URL_QUERY);
        $fragment = parse_url($origin, PHP_URL_FRAGMENT);

        if (! in_array($scheme, ['http', 'https'], true) || ! is_string($host) || $host === '') {
            throw new InvalidArgumentException('CORS_ALLOWED_ORIGINS must contain HTTP(S) origins only.');
        }

        if (is_string($path) && $path !== '') {
            throw new InvalidArgumentException('CORS_ALLOWED_ORIGINS must contain origins without paths.');
        }

        if ($query !== null || $fragment !== null) {
            throw new InvalidArgumentException('CORS_ALLOWED_ORIGINS must not contain query strings or fragments.');
        }

        if ($environment !== 'production') {
            return;
        }

        if ($scheme !== 'https') {
            throw new InvalidArgumentException('CORS_ALLOWED_ORIGINS must use HTTPS in production.');
        }

        if (self::isLocalhost($host)) {
            throw new InvalidArgumentException('CORS_ALLOWED_ORIGINS must not include localhost in production.');
        }
    }

    private static function isLocalhost(string $host): bool
    {
        return in_array(strtolower($host), ['localhost', '127.0.0.1', '::1'], true);
    }
}
