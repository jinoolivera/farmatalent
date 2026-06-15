<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('worker_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('punctuality_score', 5, 2)->default(0);
            $table->decimal('sales_score', 5, 2)->default(0);
            $table->decimal('operation_score', 5, 2)->default(0);
            $table->decimal('care_score', 5, 2)->default(0);
            $table->decimal('reputation_score', 5, 2)->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('worker_metrics');
    }
};
