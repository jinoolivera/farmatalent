<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MarketplaceSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $companies = [
            'miraflores' => [
                'tax_id' => 'FT-LIM-MIR-001',
                'name' => 'Química Suiza Miraflores',
                'type' => 'pharmacy',
                'address' => 'Miraflores, Lima, Perú',
            ],
            'san_isidro' => [
                'tax_id' => 'FT-LIM-SI-001',
                'name' => 'Inkafarma San Isidro',
                'type' => 'pharmacy',
                'address' => 'San Isidro, Lima, Perú',
            ],
            'surco' => [
                'tax_id' => 'FT-LIM-SUR-001',
                'name' => 'Mifarma Surco',
                'type' => 'pharmacy',
                'address' => 'Santiago de Surco, Lima, Perú',
            ],
            'arequipa' => [
                'tax_id' => 'FT-ARE-001',
                'name' => 'Boticas Perú Arequipa',
                'type' => 'pharmacy',
                'address' => 'Cercado, Arequipa, Perú',
            ],
            'trujillo' => [
                'tax_id' => 'FT-TRU-001',
                'name' => 'Mifarma Trujillo',
                'type' => 'pharmacy',
                'address' => 'Trujillo, La Libertad, Perú',
            ],
        ];

        $companyIds = [];
        foreach ($companies as $key => $data) {
            $company = Company::updateOrCreate(['tax_id' => $data['tax_id']], [
                'name' => $data['name'],
                'type' => $data['type'],
                'status' => 'active',
                'address' => $data['address'],
            ]);
            $companyIds[$key] = $company->id;
        }

        $shifts = [
            [
                'company_key' => 'miraflores',
                'title' => 'Cobertura nocturna',
                'professional_type' => 'pharmacist',
                'shift_date' => $now->toDateString(),
                'starts_at' => '22:00:00',
                'ends_at' => '06:00:00',
                'location' => 'Miraflores, Lima',
                'priority' => 'high',
                'metadata' => ['district' => 'Miraflores', 'city' => 'Lima', 'tags' => ['tarifa_dinamica', 'alta_prioridad']],
            ],
            [
                'company_key' => 'san_isidro',
                'title' => 'Refuerzo de mostrador',
                'professional_type' => 'pharmacy_technician',
                'shift_date' => $now->addDay()->toDateString(),
                'starts_at' => '14:00:00',
                'ends_at' => '22:00:00',
                'location' => 'San Isidro, Lima',
                'priority' => 'normal',
                'metadata' => ['district' => 'San Isidro', 'city' => 'Lima', 'tags' => ['tarifa_dinamica', 'validado']],
            ],
            [
                'company_key' => 'surco',
                'title' => 'Cobertura fin de semana',
                'professional_type' => 'pharmacy_technician',
                'shift_date' => $now->addDays(2)->toDateString(),
                'starts_at' => '08:00:00',
                'ends_at' => '16:00:00',
                'location' => 'Santiago de Surco, Lima',
                'priority' => 'normal',
                'metadata' => ['district' => 'Santiago de Surco', 'city' => 'Lima', 'tags' => ['tarifa_dinamica', 'match_alto']],
            ],
            [
                'company_key' => 'arequipa',
                'title' => 'Guardia operativa',
                'professional_type' => 'pharmacist',
                'shift_date' => $now->toDateString(),
                'starts_at' => '07:00:00',
                'ends_at' => '15:00:00',
                'location' => 'Cercado, Arequipa',
                'priority' => 'high',
                'metadata' => ['district' => 'Cercado', 'city' => 'Arequipa', 'tags' => ['tarifa_dinamica', 'alta_demanda']],
            ],
            [
                'company_key' => 'trujillo',
                'title' => 'Turno nocturno',
                'professional_type' => 'pharmacy_technician',
                'shift_date' => $now->addDay()->toDateString(),
                'starts_at' => '22:00:00',
                'ends_at' => '06:00:00',
                'location' => 'Trujillo',
                'priority' => 'high',
                'metadata' => ['district' => 'Trujillo', 'city' => 'Trujillo', 'tags' => ['tarifa_dinamica', 'alta_prioridad']],
            ],
        ];

        foreach ($shifts as $shift) {
            $companyId = $companyIds[$shift['company_key']] ?? null;
            if (! $companyId) {
                continue;
            }

            $unique = [
                'company_id' => $companyId,
                'shift_date' => $shift['shift_date'],
                'starts_at' => $shift['starts_at'],
                'ends_at' => $shift['ends_at'],
                'title' => $shift['title'],
            ];

            $payload = [
                'company_id' => $companyId,
                'created_by' => null,
                'assigned_user_id' => null,
                'title' => $shift['title'],
                'description' => null,
                'professional_type' => $shift['professional_type'],
                'shift_date' => $shift['shift_date'],
                'starts_at' => $shift['starts_at'],
                'ends_at' => $shift['ends_at'],
                'location' => $shift['location'],
                'priority' => $shift['priority'],
                'support_type' => 'shift_coverage',
                'status' => 'open',
                'metadata' => json_encode($shift['metadata']),
                'created_at' => $now,
                'updated_at' => $now,
            ];

            DB::table('shift_requests')->updateOrInsert($unique, $payload);
        }
    }
}


