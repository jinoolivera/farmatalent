<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShiftApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'shift_request_id' => $this->shift_request_id,
            'user_id' => $this->user_id,
            'status' => $this->status,
            'message' => $this->message,
            'reviewed_at' => $this->reviewed_at?->toISOString(),
            'reviewed_by' => $this->reviewed_by,
            'reviewer' => $this->whenLoaded('reviewer', function () {
                return [
                    'id' => $this->reviewer?->id,
                    'name' => $this->reviewer?->name,
                    'email' => $this->reviewer?->email,
                ];
            }),
            'worker' => UserResource::make($this->whenLoaded('user')),
            'shift_request' => ShiftRequestResource::make($this->whenLoaded('shiftRequest')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
