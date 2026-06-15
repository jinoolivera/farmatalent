<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('professional_profiles', function (Blueprint $table) {
            $table->string('photo_path')->nullable()->after('user_id');
            $table->boolean('is_available')->default(true)->after('description');
            $table->json('availability')->nullable()->after('is_available');
            $table->json('skills')->nullable()->after('availability');
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->string('logo_path')->nullable()->after('type');
            $table->text('description')->nullable()->after('address');
        });

        Schema::table('worker_metrics', function (Blueprint $table) {
            $table->decimal('reliability_score', 5, 2)->default(0)->after('care_score');
        });
    }

    public function down(): void
    {
        Schema::table('professional_profiles', function (Blueprint $table) {
            $table->dropColumn(['photo_path', 'is_available', 'availability', 'skills']);
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['logo_path', 'description']);
        });

        Schema::table('worker_metrics', function (Blueprint $table) {
            $table->dropColumn('reliability_score');
        });
    }
};
