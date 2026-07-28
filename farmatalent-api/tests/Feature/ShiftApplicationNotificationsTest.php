<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\ShiftRequest;
use App\Models\User;
use App\Notifications\AdminActivityNotification;
use App\Notifications\NewApplicationNotification;
use App\Services\ShiftApplicationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ShiftApplicationNotificationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_application_notifies_company_and_admin_email(): void
    {
        Notification::fake();

        config(['app.admin_email' => 'jinooli@gmail.com']);

        $company = Company::create([
            'name' => 'Farmacia Central',
            'type' => 'pharmacy',
            'tax_id' => '20999999991',
            'status' => 'active',
            'contact_email' => 'operaciones@farmacia-central.pe',
        ]);

        $professional = User::factory()->create([
            'name' => 'Profesional Uno',
            'email' => 'profesional@example.com',
            'professional_type' => 'pharmacist',
            'status' => 'active',
        ]);

        $shiftRequest = ShiftRequest::create([
            'company_id' => $company->id,
            'title' => 'Turno noche',
            'professional_type' => 'pharmacist',
            'shift_date' => Carbon::create(2026, 7, 28)->toDateString(),
            'starts_at' => '20:00:00',
            'ends_at' => '08:00:00',
            'status' => 'open',
        ]);

        app(ShiftApplicationService::class)->apply($shiftRequest, $professional, 'Disponible para cubrir el turno.');

        Notification::assertSentOnDemand(
            NewApplicationNotification::class,
            function ($notification, array $channels, object $notifiable): bool {
                return in_array('mail', $channels, true)
                    && ($notifiable->routes['mail'] ?? null) === 'operaciones@farmacia-central.pe';
            }
        );

        Notification::assertSentOnDemand(
            AdminActivityNotification::class,
            function ($notification, array $channels, object $notifiable): bool {
                return in_array('mail', $channels, true)
                    && ($notifiable->routes['mail'] ?? null) === 'jinooli@gmail.com';
            }
        );
    }
}
