<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class VerifyFlagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'lab_key' => ['required', 'string', 'max:100'],
            'flag' => ['required', 'string', 'max:512'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'lab_key' => is_string($this->input('lab_key')) ? trim($this->input('lab_key')) : $this->input('lab_key'),
            'flag' => is_string($this->input('flag')) ? trim($this->input('flag')) : $this->input('flag'),
        ]);
    }

    public function labKey(): string
    {
        return $this->validated('lab_key');
    }

    public function flag(): string
    {
        return $this->validated('flag');
    }
}
