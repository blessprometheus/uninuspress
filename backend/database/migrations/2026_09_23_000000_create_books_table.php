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
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('author');
            $table->text('synopsis')->nullable();
            $table->string('category')->nullable();

            // ISBN belum tentu ada saat pertama kali dipublish ke Toko Buku
            // (buku tampil dulu selama proses penomoran di Perpusnas).
            $table->string('isbn')->nullable();
            $table->unsignedBigInteger('price')->nullable();
            $table->string('year')->nullable();

            $table->boolean('is_published')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
