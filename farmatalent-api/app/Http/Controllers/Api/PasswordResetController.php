<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

class PasswordResetController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        Password::sendResetLink([
            'email' => $data['email'],
        ]);

        return response()->json([
            'message' => 'Si el correo existe en FarmaTalent, recibirás instrucciones para restablecer tu contraseña.',
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        $status = Password::reset(
            $data,
            function ($user) use ($data): void {
                $user->forceFill([
                    'password' => Hash::make($data['password']),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'El enlace de restablecimiento no es válido o ha expirado.',
                'errors' => [
                    'email' => ['El enlace de restablecimiento no es válido o ha expirado.'],
                ],
            ], 422);
        }

        return response()->json([
            'message' => 'Tu contraseña fue actualizada correctamente.',
        ]);
    }
}
