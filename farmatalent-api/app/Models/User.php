<?php

namespace App\Models;

use App\Notifications\VerifyEmailNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\DB;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'professional_type',
        'status',
        'photo_path',
        'reputation_score',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'reputation_score' => 'decimal:2',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    public function companies(): BelongsToMany
    {
        return $this->belongsToMany(Company::class, 'company_users')
            ->withPivot(['role_id', 'status', 'joined_at'])
            ->withTimestamps();
    }

    public function professionalProfile(): HasOne
    {
        return $this->hasOne(ProfessionalProfile::class);
    }

    public function workerMetrics(): HasOne
    {
        return $this->hasOne(WorkerMetric::class);
    }

    public function createdShiftRequests(): HasMany
    {
        return $this->hasMany(ShiftRequest::class, 'created_by');
    }

    public function assignedShiftRequests(): HasMany
    {
        return $this->hasMany(ShiftRequest::class, 'assigned_user_id');
    }

    public function shiftApplications(): HasMany
    {
        return $this->hasMany(ShiftApplication::class);
    }

    public function chatMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'sender_user_id');
    }

    public function hasRole(string $slug): bool
    {
        return $this->roles->contains('slug', $slug);
    }

    public function hasCompanyRole(int $companyId, string $slug): bool
    {
        return DB::table('company_users')
            ->join('roles', 'roles.id', '=', 'company_users.role_id')
            ->where('company_users.user_id', $this->id)
            ->where('company_users.company_id', $companyId)
            ->where('roles.slug', $slug)
            ->exists();
    }

    /**
     * Usa nuestra notificación personalizada en español en lugar de la de Laravel por defecto.
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification());
    }
}
