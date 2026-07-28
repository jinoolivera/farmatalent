<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\AdminNewUserNotification;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthRegistrationNotificationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_professional_registration_sends_verification_and_admin_notifications(): void
    {
        Notification::fake();

        config(['app.admin_email' => 'jinooli@gmail.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Juana Perez',
            'email' => 'juana@example.com',
            'password' => 'Secreta123',
            'password_confirmation' => 'Secreta123',
            'account_type' => 'professional',
            'professional_type' => 'pharmacist',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'juana@example.com')
            ->assertJsonPath('user.email_verified', false);

        $user = User::where('email', 'juana@example.com')->firstOrFail();

        Notification::assertSentTo($user, VerifyEmailNotification::class);
        Notification::assertSentOnDemand(
            AdminNewUserNotification::class,
            function ($notification, array $channels, object $notifiable): bool {
                return in_array('mail', $channels, true)
                    && ($notifiable->routes['mail'] ?? null) === 'jinooli@gmail.com';
            }
        );
    }
}
