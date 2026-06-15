<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ShiftApplicationRequest;
use App\Http\Resources\ShiftApplicationResource;
use App\Models\ShiftApplication;
use App\Models\ShiftRequest;
use App\Services\ShiftApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShiftApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ShiftApplication::query()
            ->with(['user.professionalProfile', 'user.workerMetrics', 'shiftRequest.company', 'reviewer'])
            ->latest();

        if ($request->filled('shift_request_id')) {
            $query->where('shift_request_id', $request->integer('shift_request_id'));
        }

        if ($request->filled('company_id')) {
            $query->whereHas('shiftRequest', fn ($shiftQuery) => $shiftQuery->where('company_id', $request->integer('company_id')));
        }

        if (! $request->user()->hasRole('super-admin')) {
            $companyIds = $request->user()->companies()->pluck('companies.id');
            $query->whereHas('shiftRequest', fn ($shiftQuery) => $shiftQuery->whereIn('company_id', $companyIds));
        }

        return response()->json(
            ShiftApplicationResource::collection($query->paginate(30))->response()->getData(true)
        );
    }

    public function mine(Request $request): JsonResponse
    {
        $applications = $request->user()->shiftApplications()
            ->with(['shiftRequest.company', 'reviewer'])
            ->latest()
            ->paginate(30);

        return response()->json(
            ShiftApplicationResource::collection($applications)->response()->getData(true)
        );
    }

    public function show(Request $request, ShiftApplication $shiftApplication): ShiftApplicationResource
    {
        $user = $request->user()->loadMissing('roles');
        $isOwner = $shiftApplication->user_id === $user->id;
        $isCompanyMember = $user->hasRole('super-admin')
            || $user->companies()->whereKey($shiftApplication->shiftRequest->company_id)->exists();

        abort_unless($isOwner || $isCompanyMember, 403, 'No tienes acceso a esta postulacion.');

        return ShiftApplicationResource::make(
            $shiftApplication->load(['user.professionalProfile', 'user.workerMetrics', 'shiftRequest.company', 'reviewer'])
        );
    }

    public function store(ShiftApplicationRequest $request, ShiftRequest $shiftRequest, ShiftApplicationService $service): ShiftApplicationResource
    {
        $application = $service->apply($shiftRequest, $request->user(), $request->validated('message'));

        return ShiftApplicationResource::make($application->load(['user.professionalProfile', 'shiftRequest.company']));
    }

    public function withdraw(Request $request, ShiftApplication $shiftApplication): JsonResponse
    {
        abort_unless($shiftApplication->user_id === $request->user()->id, 403, 'No puedes retirar esta postulacion.');
        abort_unless($shiftApplication->status === 'pending', 422, 'Solo puedes retirar postulaciones pendientes.');

        $shiftApplication->update(['status' => 'withdrawn']);

        return response()->json(['message' => 'Postulacion retirada correctamente.']);
    }

    public function review(Request $request, ShiftApplication $shiftApplication, ShiftApplicationService $service): ShiftApplicationResource
    {
        $data = $request->validate([
            'status' => ['required', 'in:accepted,rejected'],
        ]);

        $company = $shiftApplication->shiftRequest->company;
        $user = $request->user()->loadMissing('roles');

        abort_unless(
            $user->hasRole('super-admin') || $user->companies()->whereKey($company->id)->exists(),
            403,
            'No tienes acceso para revisar esta postulacion.'
        );

        return ShiftApplicationResource::make($service->review($shiftApplication, $user, $data['status']));
    }
}
