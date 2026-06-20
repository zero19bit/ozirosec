<?php

declare(strict_types=1);

namespace App\Enums;

enum WriteupSourceType: string
{
    case Rss = 'rss';
    case Api = 'api';
    case Html = 'html';
    case Manual = 'manual';
}
