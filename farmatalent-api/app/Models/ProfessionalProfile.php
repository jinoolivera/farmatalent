<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProfessionalProfile extends Model
{
    protected $fillable = [
        'user_id',
        'photo_path',
        'professional_license',
        'experience_years',
        'specialty',
        'certifications',
        'description',
        'is_available',
        'availability',
        'skills',
    ];

    protected function casts(): array
    {
        return [
            'certifications' => 'array',
            'experience_years' => 'integer',
            'is_available' => 'boolean',
            'availability' => 'array',
            'skills' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
