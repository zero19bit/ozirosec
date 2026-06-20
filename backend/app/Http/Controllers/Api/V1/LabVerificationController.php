<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\SubmitLabFlag;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\VerifyFlagRequest;
use Illuminate\Http\JsonResponse;

final class LabVerificationController extends Controller
{
    public function __construct(
        private readonly SubmitLabFlag $submitLabFlag,
    ) {}

    public function __invoke(VerifyFlagRequest $request): JsonResponse
    {
        $userId = $request->user()->getAuthIdentifier();
        $labKey = $request->labKey();
        $data = $this->submitLabFlag->handle($request, $userId, $labKey, $request->flag());

        return response()->json([
            'data' => $data,
        ]);
    }
}
