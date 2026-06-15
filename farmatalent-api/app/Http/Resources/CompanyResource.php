<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'logo_path' => $this->logo_path,
            'tax_id' => $this->tax_id,
            'status' => $this->status,
            'contact_email' => $this->contact_email,
            'contact_phone' => $this->contact_phone,
            'address' => $this->address,
            'description' => $this->description,
            'users_count' => $this->whenCounted('users'),
            'shift_requests_count' => $this->whenCounted('shiftRequests'),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
