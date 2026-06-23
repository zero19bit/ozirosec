<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Actions\SubmitLabFlag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Route as RouteFacade;
use Mockery;
use Tests\TestCase;

final class ApiV1RouteContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_v1_route_contract_remains_available(): void
    {
        $actual = collect(RouteFacade::getRoutes())
            ->filter(fn (Route $route): bool => str_starts_with($route->uri(), 'api/v1/'))
            ->map(fn (Route $route): array => [
                'methods' => array_values(array_diff($route->methods(), ['HEAD'])),
                'uri' => $route->uri(),
                'name' => $route->getName(),
            ])
            ->sortBy(fn (array $route): string => $route['uri'].'|'.$route['name'])
            ->values()
            ->all();

        $expected = collect([
            ['methods' => ['GET'], 'uri' => 'api/v1/admin/logs', 'name' => 'api.v1.admin.logs'],
            ['methods' => ['GET'], 'uri' => 'api/v1/admin/metrics', 'name' => 'api.v1.admin.metrics'],
            ['methods' => ['GET'], 'uri' => 'api/v1/admin/users', 'name' => 'api.v1.admin.users'],
            ['methods' => ['PATCH'], 'uri' => 'api/v1/admin/users/{userId}', 'name' => 'api.v1.admin.users.update'],
            ['methods' => ['GET'], 'uri' => 'api/v1/admin/writeup-automation-runs', 'name' => 'api.v1.admin.writeup-automation-runs.index'],
            ['methods' => ['GET', 'POST'], 'uri' => 'api/v1/admin/writeup-sources', 'name' => 'api.v1.admin.writeup-sources.index'],
            ['methods' => ['GET'], 'uri' => 'api/v1/admin/writeups/metrics', 'name' => 'api.v1.admin.writeups.metrics'],
            ['methods' => ['POST'], 'uri' => 'api/v1/admin/writeups/{writeup}/{operation}', 'name' => 'api.v1.admin.writeups.transition'],
            ['methods' => ['GET'], 'uri' => 'api/v1/admin/writeups/{writeup}', 'name' => 'api.v1.admin.writeups.show'],
            ['methods' => ['PATCH'], 'uri' => 'api/v1/admin/writeups/{writeup}', 'name' => 'api.v1.admin.writeups.update'],
            ['methods' => ['DELETE'], 'uri' => 'api/v1/admin/writeups/{writeup}', 'name' => 'api.v1.admin.writeups.destroy'],
            ['methods' => ['GET'], 'uri' => 'api/v1/admin/writeups', 'name' => 'api.v1.admin.writeups.index'],
            ['methods' => ['POST'], 'uri' => 'api/v1/admin/writeups', 'name' => 'api.v1.admin.writeups.store'],
            ['methods' => ['POST'], 'uri' => 'api/v1/auth/logout-all', 'name' => 'api.v1.auth.logout-all'],
            ['methods' => ['GET'], 'uri' => 'api/v1/email/verification', 'name' => 'api.v1.verification.status'],
            ['methods' => ['POST'], 'uri' => 'api/v1/email/verification-notification', 'name' => 'api.v1.verification.send'],
            ['methods' => ['GET'], 'uri' => 'api/v1/email/verify/{id}/{hash}', 'name' => 'api.v1.verification.verify'],
            ['methods' => ['POST'], 'uri' => 'api/v1/labs/verify', 'name' => 'api.v1.labs.verify'],
            ['methods' => ['GET'], 'uri' => 'api/v1/labs/{lab}/writeups', 'name' => 'api.v1.labs.writeups'],
            ['methods' => ['POST'], 'uri' => 'api/v1/login', 'name' => 'api.v1.login'],
            ['methods' => ['POST'], 'uri' => 'api/v1/logout', 'name' => 'api.v1.logout'],
            ['methods' => ['GET'], 'uri' => 'api/v1/progress', 'name' => 'api.v1.progress'],
            ['methods' => ['POST'], 'uri' => 'api/v1/register', 'name' => 'api.v1.register'],
            ['methods' => ['GET'], 'uri' => 'api/v1/user', 'name' => 'api.v1.user'],
            ['methods' => ['PATCH'], 'uri' => 'api/v1/user', 'name' => 'api.v1.user.update'],
            ['methods' => ['GET'], 'uri' => 'api/v1/vulnerabilities/{vulnerability}/writeups', 'name' => 'api.v1.vulnerabilities.writeups'],
            ['methods' => ['GET'], 'uri' => 'api/v1/writeups/{slug}', 'name' => 'api.v1.writeups.show'],
            ['methods' => ['GET'], 'uri' => 'api/v1/writeups', 'name' => 'api.v1.writeups.index'],
        ])
            ->sortBy(fn (array $route): string => $route['uri'].'|'.$route['name'])
            ->values()
            ->all();

        $this->assertSame($expected, $actual);
    }

    public function test_v1_lab_controller_delegates_to_reusable_submission_action(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $csrfToken = 'known-csrf-token';

        $action = Mockery::mock(SubmitLabFlag::class);
        $action->shouldReceive('handle')
            ->once()
            ->withArgs(fn ($request, int|string $userId, string $labKey, string $flag): bool => $userId === $user->getKey()
                && $labKey === 'sql-injection-login-bypass'
                && $flag === 'FLAG{example}')
            ->andReturn([
                'status' => 'correct',
                'message' => 'Correct flag.',
                'points_awarded' => 25,
            ]);

        $this->app->instance(SubmitLabFlag::class, $action);

        $this
            ->actingAs($user)
            ->withSession(['_token' => $csrfToken])
            ->withHeader('Origin', 'http://localhost:5173')
            ->withHeader('Referer', 'http://localhost:5173/')
            ->withHeader('X-CSRF-TOKEN', $csrfToken)
            ->postJson('/api/v1/labs/verify', [
                'lab_key' => 'sql-injection-login-bypass',
                'flag' => ' FLAG{example} ',
                'points' => 999999,
            ])
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'status' => 'correct',
                    'message' => 'Correct flag.',
                    'points_awarded' => 25,
                ],
            ]);
    }
}
