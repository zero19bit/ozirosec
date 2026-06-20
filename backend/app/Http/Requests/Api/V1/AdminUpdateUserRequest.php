<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class AdminUpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'role' => ['sometimes', 'string', Rule::enum(UserRole::class)],
            'suspended' => ['sometimes', 'boolean'],
        ];
    }

    public function role(): ?UserRole
    {
        $role = $this->validated('role');

        return is_string($role) ? UserRole::from($role) : null;
    }

    public function hasRoleChange(): bool
    {
        return $this->safe()->has('role');
    }

    public function hasSuspensionChange(): bool
    {
        return $this->safe()->has('suspended');
    }

    public function suspended(): ?bool
    {
        $value = $this->validated('suspended');

        return is_bool($value) ? $value : null;
    }
}
