<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('repairer_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->cascadeOnDelete();
            $table->string('category')->nullable();
            $table->text('bio')->nullable();
            $table->integer('years_experience')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->string('location')->nullable();
            $table->integer('price')->nullable();
            $table->string('phone')->nullable();
            $table->string('photo_url')->nullable();
            $table->boolean('available')->default(true);
        });

        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('portfolio_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->text('image_url');
            $table->text('caption')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('repair_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('repairer_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->string('service');
            $table->text('description')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repair_request_id')
                ->unique()
                ->constrained('repair_requests')
                ->cascadeOnDelete();
            $table->foreignId('customer_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('repairer_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('repair_requests');
        Schema::dropIfExists('portfolio_items');
        Schema::dropIfExists('reports');
        Schema::dropIfExists('repairer_profiles');
    }
};
