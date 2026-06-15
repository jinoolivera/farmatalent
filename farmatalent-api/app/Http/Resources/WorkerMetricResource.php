<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkerMetricResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'punctuality_score' => $this->punctuality_score,
            'sales_score' => $this->sales_score,
            'operation_score' => $this->operation_score,
            'care_score' => $this->care_score,
            'reliability_score' => $this->reliability_score,
            'reputation_score' => $this->reputation_score,
            'metadata' => $this->metadata,
        ];
    }
}
