<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

final class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_verification_notification_sent_after_registration(): void
    {
        Notification::fake();

        $this->statefulPost('/api/v1/register', [
            'username' => 'verifyme',
            'email' => 'VERIFYME@example.test',
            'password' => 'StrongPass!42',
        ])->assertCreated()
            ->assertJsonPath('data.user.email', 'verifyme@example.test')
            ->assertJsonPath('data.user.email_verified_at', null);

        $user = User::query()->where('email', 'verifyme@example.test')->firstOrFail();
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_valid_signed_link_verifies_user(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->getJson($this->verificationUrl($user))
            ->assertOk()
            ->assertJsonPath('data.verified', true);

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    public function test_invalid_signature(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->getJson("/api/v1/email/verify/{$user->id}/".sha1($user->email).'?signature=bad')
            ->assertForbidden();
    }

    public function test_expired_signature(): void
    {
        $user = User::factory()->unverified()->create();
        $url = URL::temporarySignedRoute('api.v1.verification.verify', now()->subMinute(), [
            'id' => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
        ]);

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->getJson($url)
            ->assertForbidden();
    }

    public function test_wrong_user_link(): void
    {
        $owner = User::factory()->unverified()->create();
        $other = User::factory()->unverified()->create();

        $this->actingAs($other, 'web')
            ->withStatefulHeaders()
            ->getJson($this->verificationUrl($owner))
            ->assertForbidden()
            ->assertJsonPath('message', 'Verification link does not belong to the authenticated user.');
    }

    public function test_already_verified(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->getJson($this->verificationUrl($user))
            ->assertOk()
            ->assertJsonPath('message', 'Email address is already verified.');
    }

    public function test_resend_succeeds(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->postJson('/api/v1/email/verification-notification')
            ->assertOk()
            ->assertJsonPath('message', 'Verification link sent.');

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_resend_throttled(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();

        for ($attempt = 0; $attempt < 6; $attempt++) {
            $this->actingAs($user, 'web')
                ->withStatefulHeaders()
                ->postJson('/api/v1/email/verification-notification')
                ->assertOk();
        }

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->postJson('/api/v1/email/verification-notification')
            ->assertTooManyRequests();
    }

    public function test_unverified_user_blocked_from_verified_only_route(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->postJson('/api/v1/labs/verify', ['lab_key' => 'anything', 'flag' => 'anything'])
            ->assertForbidden();
    }

    public function test_verified_user_allowed(): void
    {
        $user = User::factory()->create();
        Config::set('vulnerabilities.labs', []);

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->postJson('/api/v1/labs/verify', ['lab_key' => 'anything', 'flag' => 'anything'])
            ->assertOk();
    }

    public function test_logout_still_allowed_for_unverified_user(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->postJson('/api/v1/logout')
            ->assertOk();
    }

    public function test_email_change_clears_verification_and_sends_notification(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->patchJson('/api/v1/user', ['email' => 'changed@example.test'])
            ->assertOk()
            ->assertJsonPath('data.user.email', 'changed@example.test')
            ->assertJsonPath('data.user.email_verified_at', null);

        $user->refresh();
        $this->assertFalse($user->hasVerifiedEmail());
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    private function verificationUrl(User $user): string
    {
        return URL::temporarySignedRoute('api.v1.verification.verify', Carbon::now()->addHour(), [
            'id' => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
        ]);
    }

    private function statefulPost(string $uri, array $payload): TestResponse
    {
        return $this->withStatefulHeaders()->postJson($uri, $payload);
    }

    private function withStatefulHeaders(): self
    {
        return $this
            ->withHeader('Origin', 'http://localhost:5173')
            ->withHeader('Referer', 'http://localhost:5173/')
            ->withHeader('Accept', 'application/json');
    }
}
