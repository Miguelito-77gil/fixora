<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'account_number')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('account_number', 5)
                    ->unique()
                    ->nullable()
                    ->after('id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'account_number')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropUnique(['account_number']);
                $table->dropColumn('account_number');
            });
        }
    }
};