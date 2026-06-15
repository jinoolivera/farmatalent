<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessage extends Model
{
    protected $fillable = [
        'shift_application_id',
        'sender_user_id',
        'message',
    ];

    public function shiftApplication(): BelongsTo
    {
        return $this->belongsTo(ShiftApplication::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }
}
