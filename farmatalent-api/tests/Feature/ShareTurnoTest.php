<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\ShiftRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShareTurnoTest extends TestCase
{
    use RefreshDatabase;

    public function test_share_page_uses_dynamic_og_image(): void
    {
        $company = Company::query()->create([
            'name' => 'SmartFarma Campoy',
            'type' => 'botica',
            'logo_path' => 'logos/smartfarma.svg',
            'address' => 'Campoy, SJL',
        ]);

        $shift = ShiftRequest::query()->create([
            'company_id' => $company->id,
            'title' => 'Practicante pre-profesional',
            'professional_type' => 'intern',
            'shift_date' => '2026-08-24',
            'starts_at' => '08:00:00',
            'ends_at' => '14:00:00',
            'location' => 'Campoy, SJL',
            'status' => 'open',
        ]);

        $response = $this->get('/compartir/turno/' . $shift->id);

        $response->assertOk();
        $response->assertSee('/compartir/turno/' . $shift->id . '/imagen.png', false);
        $response->assertSee('image/png', false);
        $response->assertDontSee('/images/og-share.png', false);
    }

    public function test_share_image_endpoint_returns_png(): void
    {
        $company = Company::query()->create([
            'name' => 'Botica Central Norte',
            'type' => 'botica',
        ]);

        $shift = ShiftRequest::query()->create([
            'company_id' => $company->id,
            'title' => 'Tecnico en farmacia para turno diurno',
            'professional_type' => 'pharmacy_technician',
            'shift_date' => '2026-08-24',
            'starts_at' => '09:00:00',
            'ends_at' => '18:00:00',
            'location' => 'Los Olivos',
            'status' => 'open',
        ]);

        $response = $this->get('/compartir/turno/' . $shift->id . '/imagen.png');

        $response->assertOk();
        $response->assertHeader('content-type', 'image/png');
        $this->assertStringStartsWith("\x89PNG", $response->streamedContent() ?: $response->getContent());
    }
}
