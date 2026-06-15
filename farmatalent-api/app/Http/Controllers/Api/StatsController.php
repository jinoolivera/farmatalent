<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    /**
     * GET /stats/professionals
     *
     * Devuelve el número de profesionales activos registrados en la plataforma.
     * Endpoint público — no requiere autenticación.
     * Usado por la landing page para mostrar un conteo real (mínimo 50).
     */
    public function professionalsCount(): JsonResponse
    {
        $count = User::where('status', 'active')
            ->where(function ($q) {
                $q->whereNotNull('professional_type')
                  ->orWhereHas('roles', fn ($r) => $r->where('slug', 'professional'));
            })
            ->count();

        return response()->json([
            'count' => $count,
            'display' => max(50, $count),
        ]);
    }
}
