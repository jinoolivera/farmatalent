<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\ProfessionalProfile;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkerMetric;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'account_type' => ['nullable', Rule::in(['professional', 'company'])],
            'professional_type' => ['nullable', Rule::in(['pharmacist', 'pharmacy_technician', 'doctor', 'assistant'])],
        ]);

        $accountType = $data['account_type'] ?? 'professional';
        $professionalType = $accountType === 'professional' ? ($data['professional_type'] ?? null) : null;

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'professional_type' => $professionalType,
            'status' => 'active',
        ]);

        if ($accountType === 'professional') {
            ProfessionalProfile::create(['user_id' => $user->id]);
            WorkerMetric::create(['user_id' => $user->id]);
            $role = Role::where('slug', 'professional')->first();
            if ($role) {
                $user->roles()->attach($role);
            }
        }

        // Enviar correo de verificación (logueado en local, enviado en producción)
        $user->sendEmailVerificationNotification();

        return response()->json([
            'token' => $user->createToken('web')->plainTextToken,
            'user' => UserResource::make($user->load(['roles', 'companies', 'professionalProfile', 'workerMetrics'])),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son validas.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['El usuario no esta activo.'],
            ]);
        }

        return response()->json([
            'token' => $user->createToken('web')->plainTextToken,
            'user' => UserResource::make($user->load(['roles', 'companies', 'professionalProfile', 'workerMetrics'])),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => UserResource::make($request->user()->load(['roles', 'companies', 'professionalProfile', 'workerMetrics'])),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Sesion cerrada correctamente.']);
    }

}
