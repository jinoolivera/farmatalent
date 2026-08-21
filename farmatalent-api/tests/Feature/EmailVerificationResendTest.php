<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class EmailVerificationResendTest extends TestCase
{
    use RefreshDatabase;

    public function test_unverified_user_can_resend_verification_email(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/email/resend');

        $response->assertOk()
            ->assertJsonPath('message', 'Correo de verificación enviado. Revisa tu bandeja de entrada.');

        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    public function test_verified_user_does_not_receive_resend_email(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/email/resend');

        $response->assertOk()
            ->assertJsonPath('message', 'El correo ya ha sido verificado.');

        Notification::assertNothingSent();
    }
}
