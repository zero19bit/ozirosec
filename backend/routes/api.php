<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Internal\WriteupIngestionController;
use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\EmailVerificationController;
use App\Http\Controllers\Api\V1\LabVerificationController;
use App\Http\Controllers\Api\V1\ProgressController;
use App\Http\Controllers\Api\V1\WriteupController;
use App\Models\Writeup;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')
    ->name('api.v1.')
    ->group(function (): void {
        Route::post('/register', [AuthController::class, 'register'])
            ->middleware('throttle:hackpath.registration')
            ->name('register');

        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:hackpath.login')
            ->name('login');

        Route::post('/logout', [AuthController::class, 'logout'])
            ->middleware(['auth:sanctum', 'not.suspended'])
            ->name('logout');

        Route::post('/auth/logout-all', [AuthController::class, 'logoutAll'])
            ->middleware(['auth:sanctum', 'not.suspended', 'throttle:hackpath.logout_all_devices'])
            ->name('auth.logout-all');

        Route::get('/user', [AuthController::class, 'user'])
            ->middleware(['auth:sanctum', 'not.suspended'])
            ->name('user');

        Route::get('/progress', ProgressController::class)
            ->middleware(['auth:sanctum', 'not.suspended'])
            ->name('progress');

        Route::patch('/user', [AuthController::class, 'updateProfile'])
            ->middleware(['auth:sanctum', 'not.suspended', 'throttle:hackpath.profile_mutation'])
            ->name('user.update');

        Route::get('/email/verification', [EmailVerificationController::class, 'status'])
            ->middleware(['auth:sanctum', 'not.suspended'])
            ->name('verification.status');

        Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
            ->middleware(['auth:sanctum', 'not.suspended', 'throttle:hackpath.email_resend'])
            ->name('verification.send');

        Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
            ->middleware(['auth:sanctum', 'not.suspended', 'signed', 'throttle:hackpath.email_resend'])
            ->whereNumber('id')
            ->name('verification.verify');

        Route::post('/labs/verify', LabVerificationController::class)
            ->middleware(['auth:sanctum', 'not.suspended', 'verified', 'throttle:hackpath.lab_submission'])
            ->name('labs.verify');

        Route::get('/writeups', [WriteupController::class, 'index'])->name('writeups.index');
        Route::get('/writeups/{slug}', [WriteupController::class, 'show'])->name('writeups.show');
        Route::get('/vulnerabilities/{vulnerability}/writeups', [WriteupController::class, 'vulnerability'])->name('vulnerabilities.writeups');
        Route::get('/labs/{lab}/writeups', [WriteupController::class, 'lab'])->name('labs.writeups');

        Route::prefix('admin')
            ->middleware(['auth:sanctum', 'not.suspended', 'verified', 'admin'])
            ->name('admin.')
            ->group(function (): void {
                Route::get('/writeups/metrics', fn () => response()->json(['data' => ['total' => Writeup::count(), 'pending_review' => Writeup::where('status', 'pending_review')->count(), 'published' => Writeup::where('status', 'published')->count()]]))->name('writeups.metrics');
                Route::get('/writeups', [WriteupController::class, 'adminIndex'])->name('writeups.index');
                Route::post('/writeups', [WriteupController::class, 'store'])->name('writeups.store');
                Route::get('/writeups/{writeup}', [WriteupController::class, 'adminShow'])->name('writeups.show');
                Route::patch('/writeups/{writeup}', [WriteupController::class, 'update'])->name('writeups.update');
                Route::delete('/writeups/{writeup}', [WriteupController::class, 'destroy'])->name('writeups.destroy');
                Route::post('/writeups/{writeup}/{operation}', [WriteupController::class, 'transition'])->whereIn('operation', ['submit', 'approve', 'revision', 'reject', 'schedule', 'publish', 'archive'])->name('writeups.transition');
                Route::match(['get', 'post'], '/writeup-sources', [WriteupController::class, 'sources'])->name('writeup-sources.index');
                Route::get('/writeup-automation-runs', [WriteupController::class, 'automation'])->name('writeup-automation-runs.index');
                Route::get('/metrics', [AdminController::class, 'metrics'])
                    ->middleware('throttle:hackpath.admin_read')
                    ->name('metrics');
                Route::get('/users', [AdminController::class, 'users'])
                    ->middleware('throttle:hackpath.admin_read')
                    ->name('users');
                Route::get('/logs', [AdminController::class, 'logs'])
                    ->middleware('throttle:hackpath.admin_read')
                    ->name('logs');
                Route::patch('/users/{userId}', [AdminController::class, 'updateUser'])
                    ->middleware('throttle:hackpath.admin_mutation')
                    ->whereNumber('userId')
                    ->name('users.update');
            });
    });

Route::prefix('internal')->middleware(['writeup.ingestion', 'throttle:hackpath.writeup_ingestion'])->group(function (): void {
    Route::get('/writeup-sources', [WriteupIngestionController::class, 'sources']);
    Route::post('/writeups/check-duplicate', [WriteupIngestionController::class, 'duplicate']);
    Route::post('/writeups/ingest', [WriteupIngestionController::class, 'ingest']);
    Route::post('/writeup-automation-runs', [WriteupIngestionController::class, 'createRun']);
    Route::patch('/writeup-automation-runs/{run}', [WriteupIngestionController::class, 'updateRun']);
});
