<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class EmailVerificationController extends Controller
{
    /**
     * GET /email/verify/{id}/{hash}
     *
     * Verifica el email del usuario usando la URL firmada temporalmente.
     * Redirige al frontend tras la verificación.
     */
    public function verify(Request $request, int $id): RedirectResponse
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');

        // La ruta usa middleware 'signed' — si llegamos aquí, la firma es válida.
        $user = \App\Models\User::findOrFail($id);

        // Verificar el hash del email
        if (! hash_equals(sha1($user->getEmailForVerification()), (string) $request->route('hash'))) {
            return redirect($frontendUrl . '/email-verificado?error=invalid');
        }

        if ($user->hasVerifiedEmail()) {
            return redirect($frontendUrl . '/email-verificado?already=1');
        }

        $user->markEmailAsVerified();

        return redirect($frontendUrl . '/email-verificado?verified=1');
    }

    /**
     * POST /email/resend
     *
     * Reenvía el correo de verificación al usuario autenticado.
     * Protegido por throttle:3,1 (3 intentos por minuto).
     */
    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'El correo ya ha sido verificado.',
            ]);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Correo de verificación enviado. Revisa tu bandeja de entrada.',
        ]);
    }
}
