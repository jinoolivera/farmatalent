<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShiftRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'company' => CompanyResource::make($this->whenLoaded('company')),
            'created_by' => $this->created_by,
            'assigned_user_id' => $this->assigned_user_id,
            'title' => $this->title,
            'description' => $this->description,
            'professional_type' => $this->professional_type,
            'shift_date' => $this->shift_date?->format('Y-m-d'),
            'starts_at' => substr((string) $this->starts_at, 0, 5),
            'ends_at' => substr((string) $this->ends_at, 0, 5),
            'location'          => $this->location,
            'proposed_rate'     => $this->proposed_rate,
            'coordinacion_chat' => $this->coordinacion_chat,
            'recurring'         => $this->recurring,
            'priority'          => $this->priority,
            'support_type'      => $this->support_type,
            'status'            => $this->status,
            'applications_count' => $this->whenCounted('applications'),
            'applications' => ShiftApplicationResource::collection($this->whenLoaded('applications')),
            'metadata' => $this->metadata,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
