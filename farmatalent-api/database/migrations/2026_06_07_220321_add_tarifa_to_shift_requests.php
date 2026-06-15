<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('shift_requests', function (Blueprint $table) {
            $table->decimal('proposed_rate', 10, 2)->nullable()->after('location');
            $table->boolean('coordinacion_chat')->default(false)->after('proposed_rate');
            $table->boolean('recurring')->default(false)->after('coordinacion_chat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shift_requests', function (Blueprint $table) {
            $table->dropColumn(['proposed_rate', 'coordinacion_chat', 'recurring']);
        });
    }
};
