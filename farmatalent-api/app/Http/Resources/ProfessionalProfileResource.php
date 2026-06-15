<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfessionalProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->whenLoaded('user', fn () => $this->user->name),
            'email' => $this->whenLoaded('user', fn () => $this->user->email),
            'professional_type' => $this->whenLoaded('user', fn () => $this->user->professional_type),
            'photo_path' => $this->photo_path,
            'professional_license' => $this->professional_license,
            'experience_years' => $this->experience_years,
            'specialty' => $this->specialty,
            'certifications' => $this->certifications ?? [],
            'description' => $this->description,
            'is_available' => $this->is_available,
            'availability' => $this->availability ?? [],
            'skills' => $this->skills ?? [],
            'metrics' => WorkerMetricResource::make($this->whenLoaded('user', fn () => $this->user->workerMetrics)),
        ];
    }
}
