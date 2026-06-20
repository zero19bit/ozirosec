<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\EmailVerificationController;
use App\Http\Controllers\Api\V1\LabVerificationController;
use App\Http\Controllers\Api\V1\ProgressController;
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

        Route::prefix('admin')
            ->middleware(['auth:sanctum', 'not.suspended', 'verified', 'admin'])
            ->name('admin.')
            ->group(function (): void {
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
