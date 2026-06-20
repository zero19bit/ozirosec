<?php

declare(strict_types=1);

namespace App\Enums;

enum LabVerificationStatus: string
{
    case Correct = 'correct';
    case Incorrect = 'incorrect';
    case Inactive = 'inactive';
    case UnknownLab = 'unknown_lab';
}
