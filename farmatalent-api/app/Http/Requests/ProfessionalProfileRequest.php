<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfessionalProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'professional_type' => ['nullable', Rule::in(['pharmacist', 'pharmacy_technician', 'doctor', 'assistant'])],
            'photo_path' => ['nullable', 'string', 'max:255'],
            'professional_license' => ['nullable', 'string', 'max:100'],
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:80'],
            'specialty' => ['nullable', 'string', 'max:255'],
            'certifications' => ['nullable', 'array'],
            'certifications.*' => ['string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_available' => ['nullable', 'boolean'],
            'availability' => ['nullable', 'array'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', 'max:100'],
        ];
    }
}
