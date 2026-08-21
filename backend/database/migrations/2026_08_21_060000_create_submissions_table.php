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
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('author_name');
            $table->text('synopsis')->nullable();
            $table->string('category')->nullable();

            // workflow
            $table->string('current_stage')->default('DRAFT');
            $table->string('current_status')->nullable();
            $table->foreignId('assigned_executor_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['current_stage', 'current_status']);
            $table->index(['user_id', 'current_stage']);
        });

        Schema::create('submission_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->string('from_stage')->nullable();
            $table->string('to_stage')->nullable();
            $table->text('note')->nullable();
            $table->timestamp('performed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submission_history');
        Schema::dropIfExists('submissions');
    }
};