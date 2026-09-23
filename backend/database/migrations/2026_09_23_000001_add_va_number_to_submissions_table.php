<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Kolom va_number sudah dipakai di Submission::$fillable dan
 * SubmissionService::createDraft() sejak awal, tapi belum pernah
 * ditambahkan ke migration submissions — menyebabkan create draft
 * gagal dengan "column va_number does not exist".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->string('va_number')->nullable()->after('assigned_executor_id');
        });
    }

    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn('va_number');
        });
    }
};
