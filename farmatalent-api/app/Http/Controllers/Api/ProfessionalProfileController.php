<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfessionalProfileRequest;
use App\Http\Resources\ProfessionalProfileResource;
use App\Models\ProfessionalProfile;
use App\Models\User;
use App\Models\WorkerMetric;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfessionalProfileController extends Controller
{
    public function mine(Request $request): ProfessionalProfileResource
    {
        $profile = $request->user()->professionalProfile()->firstOrCreate([
            'user_id' => $request->user()->id,
        ]);

        WorkerMetric::firstOrCreate(['user_id' => $request->user()->id]);

        return ProfessionalProfileResource::make(
            $profile->load('user.workerMetrics')
        );
    }

    public function updateMine(ProfessionalProfileRequest $request): ProfessionalProfileResource
    {
        $user = $request->user();
        $data = $request->validated();

        $user->update(collect($data)->only(['name', 'professional_type'])->all());

        $profile = $user->professionalProfile()->updateOrCreate(
            ['user_id' => $user->id],
            collect($data)->except(['name', 'professional_type'])->all()
        );

        WorkerMetric::firstOrCreate(['user_id' => $user->id]);

        return ProfessionalProfileResource::make($profile->load('user.workerMetrics'));
    }

    public function toggleAvailability(Request $request): ProfessionalProfileResource
    {
        $data = $request->validate([
            'is_available' => ['required', 'boolean'],
        ]);

        $profile = $request->user()->professionalProfile()->firstOrCreate([
            'user_id' => $request->user()->id,
        ]);

        $profile->update(['is_available' => $data['is_available']]);

        return ProfessionalProfileResource::make($profile->load('user.workerMetrics'));
    }

    public function showPublic(User $user): ProfessionalProfileResource|JsonResponse
    {
        $profile = $user->professionalProfile;

        if (! $profile) {
            return response()->json(['message' => 'Perfil profesional no encontrado.'], 404);
        }

        return ProfessionalProfileResource::make($profile->load('user.workerMetrics'));
    }

    public function index(Request $request): JsonResponse
    {
        $query = ProfessionalProfile::query()
            ->with('user.workerMetrics')
            ->whereHas('user', fn ($userQuery) => $userQuery->where('status', 'active'));

        if ($request->filled('professional_type')) {
            $query->whereHas('user', fn ($userQuery) => $userQuery->where('professional_type', $request->string('professional_type')));
        }

        if ($request->boolean('available')) {
            $query->where('is_available', true);
        }

        return response()->json(
            ProfessionalProfileResource::collection($query->latest()->paginate(20))->response()->getData(true)
        );
    }
}
