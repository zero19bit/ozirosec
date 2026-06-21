<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\HackPathVerifyEmail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

final class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_an_unverified_user_and_sends_a_notification(): void
    {
        Notification::fake();

        $this->statefulPost('/api/v1/register', [
            'username' => 'verifyme',
            'email' => 'VERIFYME@example.test',
            'password' => 'StrongPass!42',
        ])->assertCreated()
            ->assertJsonPath('data.user.email', 'verifyme@example.test')
            ->assertJsonPath('data.user.email_verified', false)
            ->assertJsonPath('data.user.email_verified_at', null)
            ->assertJsonPath('data.email_verification_required', true);

        $user = User::query()->where('email', 'verifyme@example.test')->firstOrFail();
        Notification::assertSentTo($user, HackPathVerifyEmail::class);
    }

    public function test_registration_dispatches_the_registered_event(): void
    {
        Event::fake([Registered::class]);

        $this->statefulPost('/api/v1/register', [
            'username' => 'eventuser',
            'email' => 'event@example.test',
            'password' => 'StrongPass!42',
        ])->assertCreated();

        Event::assertDispatched(Registered::class);
    }

    public function test_valid_signed_link_verifies_user_and_dispatches_event(): void
    {
        Event::fake([Verified::class]);
        $user = User::factory()->unverified()->create();

        $this->get($this->verificationUrl($user))
            ->assertRedirect('http://localhost:5173/verify-email/success');

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        Event::assertDispatched(Verified::class, fn (Verified $event): bool => $event->user->is($user));
    }

    public function test_modified_signature_redirects_to_a_safe_error_page(): void
    {
        $user = User::factory()->unverified()->create();

        $this->get("/api/v1/email/verify/{$user->id}/".sha1($user->email).'?signature=bad')
            ->assertRedirect('http://localhost:5173/verify-email/error?reason=invalid');

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_expired_signature_redirects_to_the_expired_error_page(): void
    {
        $user = User::factory()->unverified()->create();
        $url = URL::temporarySignedRoute('api.v1.verification.verify', now()->subMinute(), [
            'id' => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
        ]);

        $this->get($url)->assertRedirect('http://localhost:5173/verify-email/error?reason=expired');
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_incorrect_email_hash_does_not_verify_the_user(): void
    {
        $user = User::factory()->unverified()->create();
        $url = URL::temporarySignedRoute('api.v1.verification.verify', now()->addHour(), [
            'id' => $user->id,
            'hash' => sha1('other@example.test'),
        ]);

        $this->get($url)->assertRedirect('http://localhost:5173/verify-email/error?reason=invalid');
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_wrong_user_id_does_not_verify_any_user(): void
    {
        $user = User::factory()->unverified()->create();
        $url = URL::temporarySignedRoute('api.v1.verification.verify', now()->addHour(), [
            'id' => $user->id + 1000,
            'hash' => sha1($user->getEmailForVerification()),
        ]);

        $this->get($url)->assertRedirect('http://localhost:5173/verify-email/error?reason=invalid');
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_already_verified_user_is_redirected_to_success(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->get($this->verificationUrl($user))
            ->assertRedirect('http://localhost:5173/verify-email/success?status=already-verified');
    }

    public function test_resend_requires_authentication(): void
    {
        $this->postJson('/api/v1/email/verification-notification')->assertUnauthorized();
    }

    public function test_resend_sends_for_an_unverified_user(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();

        $this->actingAs($user, 'web')->withStatefulHeaders()
            ->postJson('/api/v1/email/verification-notification')
            ->assertOk()
            ->assertJsonPath('message', 'Verification link sent.');

        Notification::assertSentTo($user, HackPathVerifyEmail::class);
    }

    public function test_resend_does_not_send_for_an_already_verified_user(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->actingAs($user, 'web')->withStatefulHeaders()
            ->postJson('/api/v1/email/verification-notification')
            ->assertOk()
            ->assertJsonPath('data.verified', true);

        Notification::assertNothingSent();
    }

    public function test_resend_is_rate_limited(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();

        for ($attempt = 0; $attempt < 6; $attempt++) {
            $this->actingAs($user, 'web')->withStatefulHeaders()
                ->postJson('/api/v1/email/verification-notification')
                ->assertOk();
        }

        $this->actingAs($user, 'web')->withStatefulHeaders()
            ->postJson('/api/v1/email/verification-notification')
            ->assertTooManyRequests();
    }

    public function test_unverified_user_is_rejected_by_verified_only_routes(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user, 'web')->withStatefulHeaders()
            ->getJson('/api/v1/progress')
            ->assertForbidden()
            ->assertExactJson(['message' => 'Email address is not verified.', 'code' => 'EMAIL_NOT_VERIFIED']);
    }

    public function test_verified_user_can_use_verified_only_routes(): void
    {
        $user = User::factory()->create();
        Config::set('vulnerabilities.labs', []);

        $this->actingAs($user, 'web')->withStatefulHeaders()
            ->postJson('/api/v1/labs/verify', ['lab_key' => 'anything', 'flag' => 'anything'])
            ->assertOk();
    }

    public function test_email_change_invalidates_old_verification_link_and_sends_a_new_notification(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email_verified_at' => now()]);
        $oldUrl = $this->verificationUrl($user);

        $this->actingAs($user, 'web')->withStatefulHeaders()
            ->patchJson('/api/v1/user', ['email' => 'changed@example.test'])
            ->assertOk()
            ->assertJsonPath('data.user.email_verified', false)
            ->assertJsonPath('data.user.email_verified_at', null);

        $this->get($oldUrl)->assertRedirect('http://localhost:5173/verify-email/error?reason=invalid');
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
        Notification::assertSentTo($user, HackPathVerifyEmail::class);
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
