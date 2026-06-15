<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatMessageController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\ProfessionalProfileController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ShiftApplicationController;
use App\Http\Controllers\Api\ShiftRequestController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\WorkerMetricController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    /* ── Autenticación — con rate limiting ───────────────── */
    // 5 registros por minuto por IP (anti-bots)
    Route::middleware(['throttle:5,1'])
        ->post('/auth/register', [AuthController::class, 'register']);

    // 10 intentos de login por minuto por IP (anti-fuerza bruta)
    Route::middleware(['throttle:10,1'])
        ->post('/auth/login', [AuthController::class, 'login']);

    /* ── Verificación de email (URL firmada desde el correo) ─ */
    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware(['signed', 'throttle:10,5'])
        ->name('verification.verify');

    /* ── Estadísticas públicas ───────────────────────────── */
    Route::get('/stats/professionals', [StatsController::class, 'professionalsCount'])
        ->middleware(['throttle:60,1']);

    /* ── Búsqueda pública de turnos — no requiere auth ──── */
    Route::get('/shifts', [ShiftRequestController::class, 'index']);

    /* ── Rutas autenticadas ──────────────────────────────── */
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        /* Verificación de email — reenvío (3 por minuto por usuario) */
        Route::post('/email/resend', [EmailVerificationController::class, 'resend'])
            ->middleware(['throttle:3,1']);

        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);

        Route::get('/professional/profile', [ProfessionalProfileController::class, 'mine']);
        Route::put('/professional/profile', [ProfessionalProfileController::class, 'updateMine']);
        Route::post('/professional/availability', [ProfessionalProfileController::class, 'toggleAvailability']);
        Route::get('/professional/profiles/{user}', [ProfessionalProfileController::class, 'showPublic']);
        Route::get('/professional/profiles', [ProfessionalProfileController::class, 'index']);

        /* Alias público de profesionales para conteo */
        Route::get('/workers', [ProfessionalProfileController::class, 'index']);

        Route::get('/metrics/mine', [WorkerMetricController::class, 'mine']);
        Route::get('/metrics/{user}', [WorkerMetricController::class, 'show']);
        Route::put('/metrics/{user}', [WorkerMetricController::class, 'update']);

        Route::get('/roles', [RoleController::class, 'index']);

        Route::apiResource('companies', CompanyController::class);

        // /shifts/mine DEBE ir antes de /shifts/{shiftRequest} para evitar que
        // Laravel resuelva "mine" como un ID de ShiftRequest
        Route::get('/shifts/mine', [ShiftApplicationController::class, 'mine']);
        Route::post('/shifts', [ShiftRequestController::class, 'store']);
        Route::put('/shifts/{shiftRequest}', [ShiftRequestController::class, 'update']);
        Route::patch('/shifts/{shiftRequest}', [ShiftRequestController::class, 'update']);
        Route::delete('/shifts/{shiftRequest}', [ShiftRequestController::class, 'destroy']);
        Route::post('/shifts/{shiftRequest}/apply', [ShiftApplicationController::class, 'store']);

        Route::get('/shift-applications', [ShiftApplicationController::class, 'index']);
        Route::get('/shift-applications/{shiftApplication}', [ShiftApplicationController::class, 'show']);
        Route::post('/shift-applications/{shiftApplication}/withdraw', [ShiftApplicationController::class, 'withdraw']);
        Route::post('/shift-applications/{shiftApplication}/review', [ShiftApplicationController::class, 'review']);
        Route::get('/shift-applications/{shiftApplication}/chat-messages', [ChatMessageController::class, 'index']);
        Route::post('/shift-applications/{shiftApplication}/chat-messages', [ChatMessageController::class, 'store']);
    });

    // Detalle público de un turno — DESPUÉS de las rutas con segmentos fijos (/shifts/mine)
    Route::get('/shifts/{shiftRequest}', [ShiftRequestController::class, 'show']);
});
