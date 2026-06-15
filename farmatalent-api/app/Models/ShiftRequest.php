<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShiftRequest extends Model
{
    protected $fillable = [
        'company_id',
        'created_by',
        'assigned_user_id',
        'title',
        'description',
        'professional_type',
        'shift_date',
        'starts_at',
        'ends_at',
        'location',
        'proposed_rate',
        'coordinacion_chat',
        'recurring',
        'priority',
        'support_type',
        'status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'shift_date'       => 'date:Y-m-d',
            'proposed_rate'    => 'decimal:2',
            'coordinacion_chat'=> 'boolean',
            'recurring'        => 'boolean',
            'metadata'         => 'array',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(ShiftApplication::class);
    }
}
