<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('favorites')) {
            Schema::create('favorites', function (Blueprint $table) {
                $table->id();
                $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('repairer_id')->constrained('users')->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['customer_id', 'repairer_id']);
            });
        }

        if (!Schema::hasTable('recently_viewed')) {
            Schema::create('recently_viewed', function (Blueprint $table) {
                $table->id();
                $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('repairer_id')->constrained('users')->cascadeOnDelete();
                $table->timestamp('viewed_at')->nullable();
                $table->timestamps();
                $table->unique(['customer_id', 'repairer_id']);
            });
        }

        if (!Schema::hasTable('chat_messages')) {
            Schema::create('chat_messages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('receiver_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('repair_request_id')->nullable()->constrained('repair_requests')->nullOnDelete();
                $table->text('message');
                $table->boolean('is_read')->default(false);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('title');
                $table->text('message');
                $table->string('type')->default('system');
                $table->boolean('is_read')->default(false);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('repairer_services')) {
            Schema::create('repairer_services', function (Blueprint $table) {
                $table->id();
                $table->foreignId('repairer_id')->constrained('users')->cascadeOnDelete();
                $table->string('name');
                $table->text('description')->nullable();
                $table->integer('starting_price')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('repairer_earnings')) {
            Schema::create('repairer_earnings', function (Blueprint $table) {
                $table->id();
                $table->foreignId('repairer_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('repair_request_id')->nullable()->constrained('repair_requests')->nullOnDelete();
                $table->decimal('amount', 10, 2)->default(0);
                $table->string('status')->default('completed');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('repairer_earnings');
        Schema::dropIfExists('repairer_services');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('recently_viewed');
        Schema::dropIfExists('favorites');
    }
};
