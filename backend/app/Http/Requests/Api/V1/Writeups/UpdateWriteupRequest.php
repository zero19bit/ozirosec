<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Writeups;

final class UpdateWriteupRequest extends WriteupPayloadRequest
{
    public function rules(): array
    {
        return array_merge(parent::rules(), ['original_title' => ['sometimes', 'string', 'max:500', 'not_regex:/<\/?[a-z][^>]*>/i']]);
    }
}
