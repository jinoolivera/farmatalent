<?php

namespace App\Services;

use App\Models\ShiftApplication;
use App\Models\ShiftRequest;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class ShiftApplicationService
{
    public function apply(ShiftRequest $shiftRequest, User $user, ?string $message = null): ShiftApplication
    {
        if ($shiftRequest->status !== 'open') {
            throw ValidationException::withMessages([
                'shift_request_id' => ['Este turno no esta abierto para postulaciones.'],
            ]);
        }

        if (! $user->professional_type) {
            throw ValidationException::withMessages([
                'user_id' => ['Solo profesionales pueden postular a turnos.'],
            ]);
        }

        return ShiftApplication::updateOrCreate(
            [
                'shift_request_id' => $shiftRequest->id,
                'user_id' => $user->id,
            ],
            [
                'status' => 'pending',
                'message' => $message,
                'reviewed_at' => null,
                'reviewed_by' => null,
            ]
        );
    }

    public function review(ShiftApplication $application, User $reviewer, string $status): ShiftApplication
    {
        if (! in_array($status, ['accepted', 'rejected'], true)) {
            throw ValidationException::withMessages([
                'status' => ['Estado de revision invalido.'],
            ]);
        }

        if ($application->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => ['Solo puedes revisar postulaciones pendientes.'],
            ]);
        }

        $shiftRequest = $application->shiftRequest()->first();

        if ($status === 'accepted' && $shiftRequest && $shiftRequest->status === 'assigned' && $shiftRequest->assigned_user_id !== $application->user_id) {
            throw ValidationException::withMessages([
                'shift_request_id' => ['Este turno ya fue asignado a otro profesional.'],
            ]);
        }

        $application->update([
            'status' => $status,
            'reviewed_at' => now(),
            'reviewed_by' => $reviewer->id,
        ]);

        if ($status === 'accepted') {
            $application->shiftRequest()->update([
                'status' => 'assigned',
                'assigned_user_id' => $application->user_id,
            ]);
        }

        return $application->fresh(['user.professionalProfile', 'user.workerMetrics', 'shiftRequest.company', 'reviewer']);
    }
}
