<?php

declare(strict_types=1);

namespace App\Support;

final class Usernames
{
    public const MIN_LENGTH = 3;

    public const MAX_LENGTH = 32;

    public const RESERVED = [
        'admin',
        'administrator',
        'api',
        'root',
        'support',
        'system',
    ];

    public const PATTERN = '/\A[a-z0-9](?:[a-z0-9._-]{1,30}[a-z0-9])\z/';

    public static function canonicalize(string $username): string
    {
        return strtolower(trim($username));
    }

    public static function isReserved(string $username): bool
    {
        return in_array($username, self::RESERVED, true);
    }

    public static function hasConsecutivePeriods(string $username): bool
    {
        return str_contains($username, '..');
    }

    public static function candidateFromDisplayName(?string $displayName, int|string $userId): string
    {
        $candidate = strtolower(trim((string) $displayName));
        $candidate = preg_replace('/[^a-z0-9._-]+/', '-', $candidate) ?? '';
        $candidate = preg_replace('/[._-]{2,}/', '-', $candidate) ?? '';
        $candidate = trim($candidate, '._-');

        if ($candidate === '' || ! preg_match('/\A[a-z0-9]/', $candidate)) {
            $candidate = 'user'.$userId;
        }

        if (self::isReserved($candidate)) {
            $candidate = $candidate.'-'.$userId;
        }

        $candidate = rtrim(substr($candidate, 0, self::MAX_LENGTH), '._-');

        return $candidate !== '' ? $candidate : 'user'.$userId;
    }

    public static function withStableSuffix(string $candidate, int|string $userId): string
    {
        $suffix = '-'.$userId;
        $prefixLength = self::MAX_LENGTH - strlen($suffix);
        $prefix = rtrim(substr($candidate, 0, max(1, $prefixLength)), '._-');

        if ($prefix === '' || ! preg_match('/\A[a-z0-9]/', $prefix)) {
            $prefix = 'user';
        }

        return $prefix.$suffix;
    }
}
