<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Pengajuan naskah ke UNINUS Press.
 *
 * Workflow dijalankan lewat field terpisah:
 * - current_stage  : state mesin status (DRAFT, SUBMITTED, dst.)
 * - current_status : status turunan yang ditampilkan ke user (bahasa sederhana)
 * - assigned_executor_id : pelaksana yang ditugaskan
 */
#[Fillable([
    'user_id',
    'title',
    'author_name',
    'synopsis',
    'category',
    'current_stage',
    'current_status',
    'assigned_executor_id',
    'submitted_at',
    'completed_at',
    'va_number',
])]
class Submission extends Model implements HasMedia
{
    use InteractsWithMedia;

    /** Koleksi dokumen yang bisa diunggah user. */
    public const string COLLECTION_SYNOPSIS = 'synopsis';
    public const string COLLECTION_MANUSCRIPT = 'manuscript';
    public const string COLLECTION_COVER_FRONT = 'cover_front';
    public const string COLLECTION_COVER_BACK = 'cover_back';
    public const string COLLECTION_PAYMENT_RECEIPT = 'payment_receipt';
    public const string COLLECTION_PLAGIARISM = 'plagiarism_check';

    /** Koleksi dokumen hasil kerja pelaksana / hasil Perpusnas. */
    public const string COLLECTION_LAYOUT_PDF = 'layout_pdf';
    public const string COLLECTION_FINAL_WORD = 'final_word';
    public const string COLLECTION_PERPUSNAS_RESULT = 'perpusnas_result_pdf';

    /** PDF bukti pengajuan, dibuat otomatis oleh sistem tiap kali submit/submit ulang. */
    public const string COLLECTION_SUBMISSION_RECEIPT = 'submission_receipt';

    /**
     * Koleksi dokumen yang wajib diunggah USER saat submit pertama (AGENTS.md).
     * Koleksi layout_pdf / final_word / perpusnas_result_pdf dihasilkan kemudian
     * oleh pelaksana / admin, sehingga tidak termasuk syarat submit awal.
     */
    public static function requiredUserDocumentCollections(): array
    {
        return [
            self::COLLECTION_SYNOPSIS,
            self::COLLECTION_MANUSCRIPT,
            self::COLLECTION_COVER_FRONT,
            self::COLLECTION_COVER_BACK,
            self::COLLECTION_PAYMENT_RECEIPT,
            self::COLLECTION_PLAGIARISM,
        ];
    }

    /** State workflow (AGENTS.md). */
    public const string STAGE_DRAFT = 'DRAFT';
    public const string STAGE_SUBMITTED = 'SUBMITTED';
    public const string STAGE_ADMIN_REVIEW = 'ADMIN_REVIEW';
    public const string STAGE_NEEDS_USER_REVISION_ADMIN = 'NEEDS_USER_REVISION_ADMIN';
    public const string STAGE_ADMIN_APPROVED = 'ADMIN_APPROVED';
    public const string STAGE_ASSIGNED_TO_EXECUTOR = 'ASSIGNED_TO_EXECUTOR';
    public const string STAGE_EXECUTOR_REVIEW = 'EXECUTOR_REVIEW';
    public const string STAGE_NEEDS_USER_REVISION_EXECUTOR = 'NEEDS_USER_REVISION_EXECUTOR';
    public const string STAGE_EXECUTOR_APPROVED = 'EXECUTOR_APPROVED';
    public const string STAGE_LAYOUTING = 'LAYOUTING';
    public const string STAGE_LAYOUT_COMPLETED = 'LAYOUT_COMPLETED';
    public const string STAGE_PERPUSNAS_SUBMISSION = 'PERPUSNAS_SUBMISSION';
    public const string STAGE_WAITING_PERPUSNAS = 'WAITING_PERPUSNAS';
    public const string STAGE_PERPUSNAS_RESULT_RECEIVED = 'PERPUSNAS_RESULT_RECEIVED';
    public const string STAGE_COMPLETED = 'COMPLETED';

    /** Kategori pengajuan default. */
    public const string CATEGORY_BOOK = 'BUKU';

    /** Maksimal pengajuan aktif per user (requirements.md #10). */
    public const int MAX_ACTIVE_SUBMISSIONS = 10;

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /** Pemilik pengajuan (user yang mengajukan). */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** Pelaksana yang ditugaskan. */
    public function executor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_executor_id');
    }

    /** Riwayat/audit trail perubahan status. */
    public function history(): HasMany
    {
        return $this->hasMany(SubmissionHistory::class);
    }

    // ------------------------------------------------------------------
    // Media library
    // ------------------------------------------------------------------

    public function registerMediaCollections(): void
    {
        foreach (self::documentCollections() as $collection) {
            $this->addMediaCollection($collection);
        }
    }

    /** Daftar seluruh koleksi dokumen yang digunakan sistem. */
    public static function documentCollections(): array
    {
        return [
            self::COLLECTION_SYNOPSIS,
            self::COLLECTION_MANUSCRIPT,
            self::COLLECTION_COVER_FRONT,
            self::COLLECTION_COVER_BACK,
            self::COLLECTION_PAYMENT_RECEIPT,
            self::COLLECTION_PLAGIARISM,
            self::COLLECTION_LAYOUT_PDF,
            self::COLLECTION_FINAL_WORD,
            self::COLLECTION_PERPUSNAS_RESULT,
            self::COLLECTION_SUBMISSION_RECEIPT,
        ];
    }

    /** Versi terakhir sebuah dokumen pada collection tertentu (lokasi terakhir). */
    public function latestDocument(string $collection): ?Media
    {
        return $this->getMedia($collection)->sortByDesc('id')->first();
    }

    /** Daftar semua versi sebuah dokumen pada collection tertentu, terbaru dulu. */
    public function documentVersions(string $collection): \Illuminate\Support\Collection
    {
        return $this->getMedia($collection)->sortByDesc('id')->values();
    }

    // ------------------------------------------------------------------
    // Business helpers
    // ------------------------------------------------------------------

    public function isOwner(User $user): bool
    {
        return (int) $this->user_id === (int) $user->id;
    }

    public function isExecutor(User $user): bool
    {
        return $this->assigned_executor_id !== null
            && (int) $this->assigned_executor_id === (int) $user->id;
    }

    /** Apakah pengajuan sudah masuk proses administrasi (bukan DRAFT & bukan revisi user). */
    public function isInFlow(): bool
    {
        return $this->current_stage !== self::STAGE_DRAFT
            && $this->current_stage !== self::STAGE_NEEDS_USER_REVISION_ADMIN
            && $this->current_stage !== self::STAGE_NEEDS_USER_REVISION_EXECUTOR;
    }

    /** Apakah user boleh mengubah dokumen pada stage ini (DRAFT atau diminta revisi). */
    public function canUserEdit(): bool
    {
        return in_array($this->current_stage, [
            self::STAGE_DRAFT,
            self::STAGE_NEEDS_USER_REVISION_ADMIN,
            self::STAGE_NEEDS_USER_REVISION_EXECUTOR,
        ], true);
    }

    /** Stage yang masuk kategori "aktif" untuk batas 10 pengajuan. */
    public function isActive(): bool
    {
        return $this->current_stage !== self::STAGE_COMPLETED;
    }

    /** Siapa saja yang boleh mengakses file privat pengajuan ini. */
    public function canAccess(User $user): bool
    {
        return $user->hasRole('ADMIN')
            || $this->isOwner($user)
            || $this->isExecutor($user);
    }
}