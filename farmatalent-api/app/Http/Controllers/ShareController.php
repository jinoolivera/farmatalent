<?php

namespace App\Http\Controllers;

use App\Models\ShiftRequest;
use Illuminate\View\View;

class ShareController extends Controller
{
    public function turno(int $id): View
    {
        $shift = ShiftRequest::with('company')->findOrFail($id);

        $typeLabels = [
            'pharmacist' => 'Químico farmacéutico',
            'pharmacy_technician' => 'Técnico en farmacia',
            'doctor' => 'Doctor',
            'assistant' => 'Auxiliar / apoyo',
            'nurse' => 'Enfermero/a',
            'intern' => 'Practicante',
        ];

        $companyName = $shift->company?->name ?? 'una farmacia';
        $typeLabel = $typeLabels[$shift->professional_type] ?? 'profesional de salud';
        $location = $shift->location;
        $time = trim(sprintf('%s%s', substr((string) $shift->starts_at, 0, 5), $shift->ends_at ? '–' . substr((string) $shift->ends_at, 0, 5) : ''));

        $title = $shift->title ?: "Turno de {$typeLabel} · {$companyName}";

        $descriptionParts = array_filter([
            "Se busca {$typeLabel} en {$companyName}",
            $location,
            $time ?: null,
            $shift->shift_date?->format('Y-m-d'),
        ]);
        $description = implode(' · ', $descriptionParts) . '. Postula gratis en FarmaTalent.';

        $frontendUrl = rtrim(config('app.frontend_url'), '/');
        $appUrl = rtrim(config('app.url'), '/');

        return view('share.turno', [
            'title' => $title,
            'description' => $description,
            'image' => $appUrl . '/images/og-share.png',
            'shareUrl' => $appUrl . '/compartir/turno/' . $id,
            'redirectUrl' => $frontendUrl . '/app/turnos/' . $id,
        ]);
    }
}
