<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * 7 locales SmartFarma — Lima Este / Lima Norte
 * Crea 14 turnos: 7 técnico (diurno 08-17) + 7 practicante (tarde 14-20)
 */
class SmartFarmaSeeder extends Seeder
{
    public function run(Company $company, User $owner): void
    {
        DB::table('shift_requests')->where('company_id', $company->id)->delete();

        $now = now();

        $locales = [
            [
                'name'     => 'SmartFarma Campoy',
                'address'  => 'Jr. Las Flores 245, Campoy, San Juan de Lurigancho',
                'district' => 'San Juan de Lurigancho',
                'lat'      => -11.9801,
                'lng'      => -77.0067,
            ],
            [
                'name'     => 'SmartFarma Los Olivos',
                'address'  => 'Av. Universitaria Norte 2850, Los Olivos',
                'district' => 'Los Olivos',
                'lat'      => -11.9784,
                'lng'      => -77.0706,
            ],
            [
                'name'     => 'SmartFarma SJL Canto Grande',
                'address'  => 'Av. Canto Grande 1250, San Juan de Lurigancho',
                'district' => 'San Juan de Lurigancho',
                'lat'      => -11.9461,
                'lng'      => -76.9998,
            ],
            [
                'name'     => 'SmartFarma SJL Zarate',
                'address'  => 'Av. Gran Chimu 450, Zarate, San Juan de Lurigancho',
                'district' => 'San Juan de Lurigancho',
                'lat'      => -12.0017,
                'lng'      => -77.0118,
            ],
            [
                'name'     => 'SmartFarma El Agustino',
                'address'  => 'Av. Riva Aguero 1380, El Agustino',
                'district' => 'El Agustino',
                'lat'      => -12.0390,
                'lng'      => -76.9960,
            ],
            [
                'name'     => 'SmartFarma Ate Vitarte',
                'address'  => 'Av. Nicolas Ayllon 3290, Ate Vitarte',
                'district' => 'Ate',
                'lat'      => -12.0249,
                'lng'      => -76.9153,
            ],
            [
                'name'     => 'SmartFarma Santa Anita',
                'address'  => 'Av. Los Heroes 890, Santa Anita',
                'district' => 'Santa Anita',
                'lat'      => -12.0421,
                'lng'      => -76.9519,
            ],
        ];

        $shifts = [];

        foreach ($locales as $i => $local) {
            $date = $now->copy()->addDays($i + 1)->toDateString();

            // Turno tecnico farmaceutico - diurno
            $shifts[] = [
                'company_id'       => $company->id,
                'created_by'       => $owner->id,
                'assigned_user_id' => null,
                'title'            => 'Tecnico Farmaceutico - ' . $local['name'],
                'description'      => 'Turno estable diurno en ' . $local['name'] . '. Responsable de dispensacion, control de inventario y atencion al cliente. Lunes a viernes, turno de 9 horas.',
                'professional_type' => 'pharmacy_technician',
                'shift_date'       => $date,
                'starts_at'        => '08:00:00',
                'ends_at'          => '17:00:00',
                'location'         => $local['address'],
                'priority'         => 'normal',
                'support_type'     => 'shift_coverage',
                'status'           => 'open',
                'metadata'         => json_encode([
                    'lat'      => $local['lat'],
                    'lng'      => $local['lng'],
                    'district' => $local['district'],
                    'city'     => 'Lima',
                    'local'    => $local['name'],
                    'tags'     => ['turno_estable', 'diurno', 'lima_este'],
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ];

            // Turno practicante pre-profesional - tarde (cobertura puntual, NO estable)
            $shifts[] = [
                'company_id'       => $company->id,
                'created_by'       => $owner->id,
                'assigned_user_id' => null,
                'title'            => 'Practicante Pre-profesional - ' . $local['name'],
                'description'      => 'Cobertura de turno tarde en ' . $local['name'] . '. Apoyo en dispensacion y organizacion de almacen. Ideal para estudiantes de ultimo anho de farmacia que buscan experiencia puntual.',
                'professional_type' => 'assistant',
                'shift_date'       => $date,
                'starts_at'        => '14:00:00',
                'ends_at'          => '20:00:00',
                'location'         => $local['address'],
                'priority'         => 'normal',
                'support_type'     => 'shift_coverage',
                'status'           => 'open',
                'metadata'         => json_encode([
                    'lat'      => $local['lat'],
                    'lng'      => $local['lng'],
                    'district' => $local['district'],
                    'city'     => 'Lima',
                    'local'    => $local['name'],
                    'tags'     => ['cobertura', 'tarde', 'practicante'],
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('shift_requests')->insert($shifts);
    }
}
