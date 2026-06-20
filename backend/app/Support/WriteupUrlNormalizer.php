<?php

declare(strict_types=1);

namespace App\Support;

use InvalidArgumentException;

final class WriteupUrlNormalizer
{
    public static function normalize(?string $url): ?string
    {
        if ($url === null || trim($url) === '') {
            return null;
        }

        $parts = parse_url(trim($url));

        if ($parts === false
            || ! isset($parts['scheme'], $parts['host'])
            || ! in_array(strtolower($parts['scheme']), ['http', 'https'], true)
            || isset($parts['user'], $parts['pass'])) {
            throw new InvalidArgumentException('URLs must be absolute HTTP(S) URLs without credentials.');
        }

        $scheme = strtolower($parts['scheme']);
        $host = strtolower($parts['host']);
        $port = isset($parts['port']) && ! (($scheme === 'http' && $parts['port'] === 80) || ($scheme === 'https' && $parts['port'] === 443))
            ? ':'.$parts['port']
            : '';
        $path = $parts['path'] ?? '/';
        $query = isset($parts['query']) && $parts['query'] !== '' ? '?'.$parts['query'] : '';

        return $scheme.'://'.$host.$port.$path.$query;
    }

    public static function sha256(?string $url): ?string
    {
        $normalized = self::normalize($url);

        return $normalized === null ? null : hash('sha256', $normalized);
    }
}
