<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ShiftRequestFormRequest;
use App\Http\Resources\ShiftRequestResource;
use App\Models\Company;
use App\Models\ShiftRequest;
use App\Notifications\AdminActivityNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class ShiftRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ShiftRequest::query()
            ->with('company')
            ->withCount('applications')
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->integer('company_id'));
        }

        if ($request->filled('professional_type')) {
            $query->where('professional_type', $request->string('professional_type'));
        }

        return response()->json(
            ShiftRequestResource::collection($query->paginate(20))->response()->getData(true)
        );
    }

    public function store(ShiftRequestFormRequest $request): ShiftRequestResource
    {
        $data = $request->validated();
        $company = Company::findOrFail($data['company_id']);
        $this->authorizeCompanyMember($request, $company);

        $shiftRequest = ShiftRequest::create($data + [
            'created_by' => $request->user()->id,
            'status' => $data['status'] ?? 'open',
        ]);

        Notification::route('mail', config('app.admin_email'))->notify(new AdminActivityNotification(
            'Nuevo turno publicado',
            'Actividad en FarmaTalent',
            [
                $company->name . ' publicó el turno "' . ($shiftRequest->title ?? 'Turno') . '".',
                'Tipo: ' . ($shiftRequest->professional_type ?? '—'),
            ]
        ));

        return ShiftRequestResource::make($shiftRequest->load('company')->loadCount('applications'));
    }

    public function show(Request $request, ShiftRequest $shiftRequest): ShiftRequestResource
    {
        return ShiftRequestResource::make(
            $shiftRequest->load(['company', 'applications.user.professionalProfile', 'applications.user.workerMetrics'])
                ->loadCount('applications')
        );
    }

    public function update(ShiftRequestFormRequest $request, ShiftRequest $shiftRequest): ShiftRequestResource
    {
        $this->authorizeCompanyMember($request, $shiftRequest->company);

        $shiftRequest->update($request->validated());

        return ShiftRequestResource::make($shiftRequest->fresh(['company'])->loadCount('applications'));
    }

    private function authorizeCompanyMember(Request $request, Company $company): void
    {
        $user = $request->user()->loadMissing('roles');

        abort_unless(
            $user->hasRole('super-admin') || $user->companies()->whereKey($company->id)->exists(),
            403,
            'No tienes acceso para gestionar esta empresa.'
        );
    }
}
