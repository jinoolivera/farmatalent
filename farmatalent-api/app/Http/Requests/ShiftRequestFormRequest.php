<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ShiftRequestFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $post = $this->isMethod('post');
        return [
            'company_id'        => [$post ? 'required' : 'sometimes', 'exists:companies,id'],
            'title'             => [$post ? 'required' : 'sometimes', 'string', 'max:255'],
            'description'       => ['nullable', 'string', 'max:3000'],
            'professional_type' => [$post ? 'required' : 'sometimes', Rule::in(['pharmacist', 'pharmacy_technician', 'doctor', 'assistant', 'nurse', 'intern'])],
            'shift_date'        => [$post ? 'required' : 'sometimes', 'date'],
            'starts_at'         => [$post ? 'required' : 'sometimes', 'date_format:H:i'],
            'ends_at'           => [$post ? 'required' : 'sometimes', 'date_format:H:i'],
            'location'          => ['nullable', 'string', 'max:255'],
            'proposed_rate'     => ['nullable', 'numeric', 'min:0', 'max:99999'],
            'coordinacion_chat' => ['sometimes', 'boolean'],
            'recurring'         => ['sometimes', 'boolean'],
            'priority'          => ['sometimes', Rule::in(['low', 'normal', 'high', 'urgent'])],
            'support_type'      => ['sometimes', Rule::in(['shift_coverage', 'campaign', 'inventory', 'customer_care', 'medical_support'])],
            'status'            => ['sometimes', Rule::in(['open', 'in_review', 'assigned', 'completed', 'cancelled'])],
        ];
    }
}
