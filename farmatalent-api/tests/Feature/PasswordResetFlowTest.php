<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_sends_reset_notification(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'recuperar@example.com',
        ]);

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => $user->email,
        ]);

        $response->assertOk()
            ->assertJsonPath(
                'message',
                'Si el correo existe en FarmaTalent, recibirás instrucciones para restablecer tu contraseña.'
            );

        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'token@example.com',
        ]);

        $this->postJson('/api/v1/auth/forgot-password', [
            'email' => $user->email,
        ])->assertOk();

        $token = null;

        Notification::assertSentTo(
            $user,
            ResetPasswordNotification::class,
            function (ResetPasswordNotification $notification) use (&$token): bool {
                $token = $notification->token;

                return true;
            }
        );

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'NuevaClave123',
            'password_confirmation' => 'NuevaClave123',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Tu contraseña fue actualizada correctamente.');

        $this->assertTrue(Hash::check('NuevaClave123', $user->fresh()->password));
    }
}
