<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'shift_application_id' => $this->shift_application_id,
            'sender_user_id' => $this->sender_user_id,
            'sender' => $this->whenLoaded('sender', function () {
                return [
                    'id' => $this->sender?->id,
                    'name' => $this->sender?->name,
                    'email' => $this->sender?->email,
                ];
            }),
            'message' => $this->message,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
