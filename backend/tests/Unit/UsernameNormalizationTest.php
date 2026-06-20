<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Support\Usernames;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class UsernameNormalizationTest extends TestCase
{
    #[DataProvider('canonicalUsernameProvider')]
    public function test_canonicalize_trims_and_lowercases_ascii(string $input, string $expected): void
    {
        $this->assertSame($expected, Usernames::canonicalize($input));
    }

    public function test_reserved_names_are_centralized(): void
    {
        $this->assertTrue(Usernames::isReserved('admin'));
        $this->assertTrue(Usernames::isReserved('system'));
        $this->assertFalse(Usernames::isReserved('security-analyst'));
    }

    public function test_candidate_from_display_name_avoids_reserved_and_invalid_values(): void
    {
        $this->assertSame('root-42', Usernames::candidateFromDisplayName('root', 42));
        $this->assertSame('user42', Usernames::candidateFromDisplayName(' مدیر ', 42));
        $this->assertSame('alice-smith', Usernames::candidateFromDisplayName('Alice Smith', 42));
    }

    public function test_stable_suffix_respects_maximum_length(): void
    {
        $username = Usernames::withStableSuffix(str_repeat('a', 80), 12345);

        $this->assertSame(Usernames::MAX_LENGTH, strlen($username));
        $this->assertStringEndsWith('-12345', $username);
    }

    /**
     * @return array<string, array{string,string}>
     */
    public static function canonicalUsernameProvider(): array
    {
        return [
            'trim and lower' => [' Security.Analyst ', 'security.analyst'],
            'preserve internal punctuation' => ['red-team_01', 'red-team_01'],
        ];
    }
}
