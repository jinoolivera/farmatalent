<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'profile' => $request->user()->load(['professionalProfile', 'workerMetrics', 'roles', 'companies']),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'professional_type' => ['nullable', 'string', 'max:100'],
            'professional_profile.professional_license' => ['nullable', 'string', 'max:100'],
            'professional_profile.experience_years' => ['nullable', 'integer', 'min:0', 'max:80'],
            'professional_profile.specialty' => ['nullable', 'string', 'max:255'],
            'professional_profile.certifications' => ['nullable', 'array'],
            'professional_profile.description' => ['nullable', 'string', 'max:2000'],
        ]);

        $user = $request->user();
        $user->update(collect($data)->only(['name', 'professional_type'])->all());

        if (isset($data['professional_profile'])) {
            $user->professionalProfile()->updateOrCreate(
                ['user_id' => $user->id],
                $data['professional_profile']
            );
        }

        return response()->json([
            'profile' => UserResource::make($user->fresh()->load(['professionalProfile', 'workerMetrics', 'roles', 'companies'])),
        ]);
    }
}
