<?php

declare(strict_types=1);

namespace App\Data;

use App\Enums\LabVerificationStatus;

final readonly class LabVerificationResult
{
    public function __construct(
        public string $labKey,
        public LabVerificationStatus $status,
        public int $pointsAwarded = 0,
    ) {}

    public function isCorrect(): bool
    {
        return $this->status === LabVerificationStatus::Correct;
    }

    /**
     * @return array{lab_key:string,status:string,correct:bool,points_awarded:int}
     */
    public function toResponse(): array
    {
        return [
            'lab_key' => $this->labKey,
            'status' => $this->status->value,
            'correct' => $this->isCorrect(),
            'points_awarded' => $this->pointsAwarded,
        ];
    }
}
