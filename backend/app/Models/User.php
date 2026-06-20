<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'suspended_at' => 'datetime',
            'role' => UserRole::class,
            'password' => 'hashed',
        ];
    }

    public function isActiveAdmin(): bool
    {
        return $this->role === UserRole::Admin && $this->suspended_at === null;
    }

    public function createdWriteups(): HasMany
    {
        return $this->hasMany(Writeup::class, 'created_by');
    }

    public function reviewedWriteups(): HasMany
    {
        return $this->hasMany(Writeup::class, 'reviewed_by');
    }

    public function approvedWriteups(): HasMany
    {
        return $this->hasMany(Writeup::class, 'approved_by');
    }
}
