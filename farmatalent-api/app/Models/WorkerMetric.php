<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkerMetric extends Model
{
    protected $fillable = [
        'user_id',
        'punctuality_score',
        'sales_score',
        'operation_score',
        'care_score',
        'reliability_score',
        'reputation_score',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'punctuality_score' => 'decimal:2',
            'sales_score' => 'decimal:2',
            'operation_score' => 'decimal:2',
            'care_score' => 'decimal:2',
            'reliability_score' => 'decimal:2',
            'reputation_score' => 'decimal:2',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
