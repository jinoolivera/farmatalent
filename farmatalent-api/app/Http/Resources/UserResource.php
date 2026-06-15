<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified' => ! is_null($this->email_verified_at),
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'professional_type' => $this->professional_type,
            'status' => $this->status,
            'photo_path' => $this->photo_path,
            'reputation_score' => $this->reputation_score,
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
            'companies' => CompanyResource::collection($this->whenLoaded('companies')),
            'professional_profile' => ProfessionalProfileResource::make($this->whenLoaded('professionalProfile')),
            'worker_metrics' => WorkerMetricResource::make($this->whenLoaded('workerMetrics')),
        ];
    }
}
