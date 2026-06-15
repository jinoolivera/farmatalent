<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WorkerMetricRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $score = ['nullable', 'numeric', 'min:0', 'max:100'];

        return [
            'punctuality_score' => $score,
            'sales_score' => $score,
            'operation_score' => $score,
            'care_score' => $score,
            'reliability_score' => $score,
            'reputation_score' => $score,
            'metadata' => ['nullable', 'array'],
        ];
    }
}
