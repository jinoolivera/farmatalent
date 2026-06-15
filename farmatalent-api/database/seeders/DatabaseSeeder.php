<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\ProfessionalProfile;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkerMetric;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles base
        $roles = collect([
            ['name' => 'Super Admin',            'slug' => 'super-admin',      'scope' => 'global',  'description' => 'Administra toda la plataforma.'],
            ['name' => 'Profesional',             'slug' => 'professional',     'scope' => 'global',  'description' => 'Usuario profesional de salud.'],
            ['name' => 'Propietario de empresa', 'slug' => 'company-owner',    'scope' => 'company', 'description' => 'Administra la cuenta de una empresa.'],
            ['name' => 'Administrador empresa',  'slug' => 'company-admin',    'scope' => 'company', 'description' => 'Gestiona usuarios y datos de empresa.'],
            ['name' => 'Operador empresa',       'slug' => 'company-operator', 'scope' => 'company', 'description' => 'Opera procesos basicos de la empresa.'],
        ])->mapWithKeys(fn (array $role) => [
            $role['slug'] => Role::updateOrCreate(['slug' => $role['slug']], $role),
        ]);

        // 2. Propietario SmartFarma
        $owner = User::updateOrCreate(['email' => 'propietario@smartfarma.pe'], [
            'name'     => 'Carlos Mendoza',
            'password' => bcrypt('Smartfarma2024!'),
            'status'   => 'active',
        ]);

        // 3. Profesional tecnico farmaceutico
        $professional = User::updateOrCreate(['email' => 'ana.garcia@farmatalent.pe'], [
            'name'              => 'Ana Garcia',
            'password'          => bcrypt('Tecnico2024!'),
            'professional_type' => 'pharmacy_technician',
            'status'            => 'active',
        ]);

        $professional->roles()->syncWithoutDetaching([$roles['professional']->id]);

        ProfessionalProfile::updateOrCreate(['user_id' => $professional->id], [
            'professional_license' => 'TF-LIM-00142',
            'experience_years'     => 3,
            'specialty'            => 'Farmacia comunitaria',
            'certifications'       => ['Buenas Practicas de Dispensacion', 'Atencion farmaceutica'],
            'description'          => 'Tecnica farmaceutica con 3 anhos de experiencia en cadenas y boticas independientes de Lima Este.',
            'is_available'         => true,
        ]);

        WorkerMetric::updateOrCreate(['user_id' => $professional->id], [
            'punctuality_score' => 88.0,
            'operation_score'   => 82.0,
            'care_score'        => 91.0,
            'reliability_score' => 85.0,
            'sales_score'       => 76.0,
            'reputation_score'  => 84.4,
        ]);

        // 4. Empresa SmartFarma
        $company = Company::updateOrCreate(['tax_id' => '20601234567'], [
            'name'          => 'SmartFarma',
            'type'          => 'pharmacy',
            'status'        => 'active',
            'contact_email' => 'contacto@smartfarma.pe',
            'contact_phone' => '+51 1 7654321',
            'address'       => 'Lima Este, Lima, Peru',
            'description'   => 'Red de farmacias inteligentes en Lima Este con 7 locales. Atencion personalizada y tecnologia para el cuidado de la salud.',
        ]);

        $company->users()->syncWithoutDetaching([
            $owner->id => [
                'role_id'   => $roles['company-owner']->id,
                'status'    => 'active',
                'joined_at' => now(),
            ],
        ]);

        // 5. Turnos SmartFarma
        $this->call(SmartFarmaSeeder::class, false, ['company' => $company, 'owner' => $owner]);
    }
}
