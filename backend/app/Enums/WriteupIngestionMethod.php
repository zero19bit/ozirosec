<?php

declare(strict_types=1);

namespace App\Enums;

enum WriteupIngestionMethod: string
{
    case Manual = 'manual';
    case N8n = 'n8n';
    case Api = 'api';
    case Import = 'import';
}
