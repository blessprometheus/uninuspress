<?php

namespace App\Services;

use App\Models\Submission;
use App\Models\SubmissionHistory;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Spatie\MediaLibrary\MediaCollections\Exceptions\FileDoesNotExist;
use Spatie\MediaLibrary\MediaCollections\Exceptions\FileIsTooBig;

/**
 * Service terpusat untuk workflow Submission.
 *
 * Semua perubahan stage harus lewat sini agar:
 *  - Stage transition valid (tidak loncat-loncat)
 *  - Audit trail selalu tercatat
 *  - current_status (label bahasa Indonesia) di-update konsisten
 */
class SubmissionService
{
    /**
     * Mapping stage → label bahasa Indonesia untuk user.
     * Sumber kebenaran: docs/requirements.md #11.
     */
    public static function statusLabel(string $stage): string
    {
        return match ($stage) {
            Submission::STAGE_DRAFT => 'Draf',
            Submission::STAGE_SUBMITTED,
            Submission::STAGE_ADMIN_REVIEW => 'Sedang Diverifikasi',
            Submission::STAGE_NEEDS_USER_REVISION_ADMIN,
            Submission::STAGE_NEEDS_USER_REVISION_EXECUTOR => 'Perlu Perbaikan',
            Submission::STAGE_ADMIN_APPROVED,
            Submission::STAGE_ASSIGNED_TO_EXECUTOR => 'Disetujui',
            Submission::STAGE_EXECUTOR_REVIEW => 'Sedang Direview Pelaksana',
            Submission::STAGE_EXECUTOR_APPROVED,
            Submission::STAGE_LAYOUTING => 'Proses Layouting',
            Submission::STAGE_LAYOUT_COMPLETED => 'Menunggu Pengiriman',
            Submission::STAGE_PERPUSNAS_SUBMISSION,
            Submission::STAGE_WAITING_PERPUSNAS => 'Menunggu Hasil Perpusnas',
            Submission::STAGE_PERPUSNAS_RESULT_RECEIVED => 'Hasil Siap Diunduh',
            Submission::STAGE_COMPLETED => 'Selesai',
            default => $stage,
        };
    }

    /**
     * Daftar stage aktif (selesai tidak dihitung) untuk batas 10/user.
     */
    public static function activeSubmissionsCount(User $user): int
    {
        return Submission::query()
            ->where('user_id', $user->id)
            ->where('current_stage', '!=', Submission::STAGE_COMPLETED)
            ->count();
    }

    /**
     * Buat DRAFT baru atas nama user. Batas 10 aktif divalidasi di sini.
     */
    public function createDraft(User $user, array $data): Submission
    {
        if (static::activeSubmissionsCount($user) >= Submission::MAX_ACTIVE_SUBMISSIONS) {
            throw new \DomainException(
                "Batas maksimal ".Submission::MAX_ACTIVE_SUBMISSIONS.
                " pengajuan aktif tercapai. Selesaikan pengajuan lain terlebih dahulu."
            );
        }

        return DB::transaction(function () use ($user, $data) {
            $submission = Submission::create([
                'user_id' => $user->id,
                'title' => $data['title'],
                'author_name' => $data['author_name'] ?? $user->name,
                'synopsis' => $data['synopsis'] ?? null,
                'category' => $data['category'] ?? Submission::CATEGORY_BOOK,
                'current_stage' => Submission::STAGE_DRAFT,
            ]);

            $submission->current_status = static::statusLabel(Submission::STAGE_DRAFT);
            $submission->save();

            SubmissionHistory::create([
                'submission_id' => $submission->id,
                'actor_id' => $user->id,
                'action' => 'DRAFT_CREATED',
                'from_stage' => null,
                'to_stage' => Submission::STAGE_DRAFT,
                'note' => null,
                'performed_at' => now(),
            ]);

            return $submission->fresh();
        });
    }

    /**
     * Tambah/unggah dokumen. Dokumen sebelumnya di collection yang sama
     * tetap tersimpan (versioning) — yang terbaru ada di urutan atas.
     */
    public function uploadDocument(
        Submission $submission,
        string $collection,
        UploadedFile $file,
        ?User $actor = null
    ): \Spatie\MediaLibrary\MediaCollections\Models\Media {
        if (! in_array($collection, Submission::documentCollections(), true)) {
            throw new \InvalidArgumentException("Koleksi dokumen tidak dikenal: {$collection}");
        }
        if (! $submission->canUserEdit()) {
            throw new \DomainException(
                "Dokumen hanya bisa diubah saat pengajuan berstatus Draf atau Perlu Perbaikan."
            );
        }

        $media = $submission
            ->addMedia($file)
            ->usingFileName(
                $collection.'_v'.($submission->documentVersions($collection)->count() + 1).
                '.'.$file->getClientOriginalExtension()
            )
            ->toMediaCollection($collection);

        SubmissionHistory::create([
            'submission_id' => $submission->id,
            'actor_id' => $actor?->id ?? $submission->user_id,
            'action' => 'DOCUMENT_UPLOADED',
            'from_stage' => $submission->current_stage,
            'to_stage' => $submission->current_stage,
            'note' => "{$collection} versi baru (id={$media->id})",
            'performed_at' => now(),
        ]);

        return $media;
    }

    /**
     * Hapus dokumen. Hanya boleh saat DRAFT (saat ini tidak dipakai
     * oleh API; disediakan untuk konsistensi).
     */
    public function deleteDocument(
        Submission $submission,
        string $collection,
        int $mediaId,
        ?User $actor = null
    ): void {
        if (! $submission->canUserEdit()) {
            throw new \DomainException(
                "Dokumen hanya bisa dihapus saat pengajuan berstatus Draf atau Perlu Perbaikan."
            );
        }

        $media = $submission->getMedia($collection)->firstWhere('id', $mediaId);
        if (! $media) {
            throw new \DomainException("Dokumen tidak ditemukan.");
        }
        $media->delete();

        SubmissionHistory::create([
            'submission_id' => $submission->id,
            'actor_id' => $actor?->id ?? $submission->user_id,
            'action' => 'DOCUMENT_DELETED',
            'from_stage' => $submission->current_stage,
            'to_stage' => $submission->current_stage,
            'note' => "{$collection} media id={$mediaId} dihapus",
            'performed_at' => now(),
        ]);
    }

    /**
     * Submit pengajuan: DRAFT / NEEDS_USER_REVISION_* → SUBMITTED.
     * Validasi 6 dokumen wajib ada.
     */
    public function submit(Submission $submission, User $user): Submission
    {
        if (! $submission->isOwner($user)) {
            throw new \DomainException("Hanya pemilik yang bisa mengajukan.");
        }
        if (! in_array($submission->current_stage, [
            Submission::STAGE_DRAFT,
            Submission::STAGE_NEEDS_USER_REVISION_ADMIN,
            Submission::STAGE_NEEDS_USER_REVISION_EXECUTOR,
        ], true)) {
            throw new \DomainException(
                "Pengajuan tidak bisa disubmit dari stage {$submission->current_stage}."
            );
        }

        // Validasi kelengkapan dokumen (hanya sekali per submission di stage DRAFT awal).
        // Saat revisi, hanya yang dikoreksi yang perlu di-upload ulang.
        if ($submission->current_stage === Submission::STAGE_DRAFT) {
            $missing = $this->missingDocumentCollections($submission);
            if (! empty($missing)) {
                throw new \DomainException(
                    "Dokumen belum lengkap: ".implode(', ', $missing)
                );
            }
        }

        return $this->transition($submission, Submission::STAGE_SUBMITTED, $user, 'SUBMITTED', null);
    }

    /**
     * Koleksi yang belum punya dokumen (hanya dipakai untuk submit pertama).
     */
    public function missingDocumentCollections(Submission $submission): array
    {
        return array_values(array_filter(
            Submission::documentCollections(),
            fn (string $c) => $submission->documentVersions($c)->isEmpty()
        ));
    }

    /**
     * Admin membuka detail pengajuan → SUBMITTED → ADMIN_REVIEW.
     * Setelah ini, admin punya hak untuk verifikasi.
     */
    public function startAdminReview(Submission $submission, User $admin): Submission
    {
        if (! $admin->hasRole('ADMIN')) {
            throw new \DomainException("Hanya admin yang boleh membuka review.");
        }
        if ($submission->current_stage !== Submission::STAGE_SUBMITTED) {
            throw new \DomainException(
                "Review hanya bisa dimulai dari stage SUBMITTED. Saat ini: {$submission->current_stage}."
            );
        }
        return $this->transition($submission, Submission::STAGE_ADMIN_REVIEW, $admin, 'ADMIN_REVIEW_STARTED', null);
    }

    /**
     * Admin minta user revisi. Beri catatan.
     */
    public function requestAdminRevision(Submission $submission, User $admin, string $note): Submission
    {
        if (! $admin->hasRole('ADMIN')) {
            throw new \DomainException("Hanya admin yang boleh meminta revisi.");
        }
        if (! in_array($submission->current_stage, [
            Submission::STAGE_ADMIN_REVIEW,
        ], true)) {
            throw new \DomainException(
                "Revisi hanya bisa diminta dari stage ADMIN_REVIEW. Saat ini: {$submission->current_stage}."
            );
        }
        if (empty(trim($note))) {
            throw new \DomainException("Catatan revisi wajib diisi.");
        }
        return $this->transition(
            $submission,
            Submission::STAGE_NEEDS_USER_REVISION_ADMIN,
            $admin,
            'REVISION_REQUESTED',
            $note
        );
    }

    /**
     * Admin approve & langsung pilih pelaksana (satu action).
     * ASSIGNED_TO_EXECUTOR disimpan.
     */
    public function approveAndAssign(
        Submission $submission,
        User $admin,
        int $executorId,
        ?string $note
    ): Submission {
        if (! $admin->hasRole('ADMIN')) {
            throw new \DomainException("Hanya admin yang boleh menyetujui.");
        }
        if ($submission->current_stage !== Submission::STAGE_ADMIN_REVIEW) {
            throw new \DomainException(
                "Persetujuan hanya bisa dari stage ADMIN_REVIEW. Saat ini: {$submission->current_stage}."
            );
        }
        $executor = User::find($executorId);
        if (! $executor) {
            throw new \DomainException("Pelaksana tidak ditemukan.");
        }
        if (! $executor->hasRole('PELAKSANA')) {
            throw new \DomainException("User yang dipilih bukan Pelaksana.");
        }
        if (! $executor->is_active) {
            throw new \DomainException("Pelaksana tidak aktif.");
        }

        return DB::transaction(function () use ($submission, $admin, $executor, $note) {
            $submission->assigned_executor_id = $executor->id;
            $submission->save();

            return $this->transition(
                $submission,
                Submission::STAGE_ASSIGNED_TO_EXECUTOR,
                $admin,
                'APPROVED_AND_ASSIGNED',
                $note,
                ['executor_id' => $executor->id, 'executor_name' => $executor->name]
            );
        });
    }

    /**
     * Pelaksana mulai review → ASSIGNED_TO_EXECUTOR → EXECUTOR_REVIEW.
     */
    public function startExecutorReview(Submission $submission, User $executor): Submission
    {
        if (! $submission->isExecutor($executor)) {
            throw new \DomainException("Anda bukan pelaksana pengajuan ini.");
        }
        if ($submission->current_stage !== Submission::STAGE_ASSIGNED_TO_EXECUTOR) {
            throw new \DomainException(
                "Review pelaksana hanya bisa dimulai dari stage ASSIGNED_TO_EXECUTOR. Saat ini: {$submission->current_stage}."
            );
        }
        return $this->transition(
            $submission,
            Submission::STAGE_EXECUTOR_REVIEW,
            $executor,
            'EXECUTOR_REVIEW_STARTED',
            null
        );
    }

    /**
     * Pelaksana minta revisi.
     */
    public function requestExecutorRevision(Submission $submission, User $executor, string $note): Submission
    {
        if (! $submission->isExecutor($executor)) {
            throw new \DomainException("Anda bukan pelaksana pengajuan ini.");
        }
        if ($submission->current_stage !== Submission::STAGE_EXECUTOR_REVIEW) {
            throw new \DomainException(
                "Revisi hanya bisa diminta dari stage EXECUTOR_REVIEW. Saat ini: {$submission->current_stage}."
            );
        }
        if (empty(trim($note))) {
            throw new \DomainException("Catatan revisi wajib diisi.");
        }
        return $this->transition(
            $submission,
            Submission::STAGE_NEEDS_USER_REVISION_EXECUTOR,
            $executor,
            'REVISION_REQUESTED',
            $note
        );
    }

    /**
     * Pelaksana menyetujui → EXECUTOR_REVIEW → LAYOUTING.
     * (Menggantikan stage EXECUTOR_APPROVED sebagai transisi; status ke user
     * tetap "Proses Layouting" sesuai mapping label.)
     */
    public function approveByExecutor(Submission $submission, User $executor, ?string $note): Submission
    {
        if (! $submission->isExecutor($executor)) {
            throw new \DomainException("Anda bukan pelaksana pengajuan ini.");
        }
        if ($submission->current_stage !== Submission::STAGE_EXECUTOR_REVIEW) {
            throw new \DomainException(
                "Persetujuan hanya bisa dari stage EXECUTOR_REVIEW. Saat ini: {$submission->current_stage}."
            );
        }
        return $this->transition(
            $submission,
            Submission::STAGE_LAYOUTING,
            $executor,
            'APPROVED_BY_EXECUTOR',
            $note
        );
    }

    /**
     * Pelaksana selesaikan layouting → LAYOUTING → LAYOUT_COMPLETED.
     * Wajib mengunggah PDF layout + Word final sebagai hasil.
     */
    public function completeLayouting(Submission $submission, User $executor, ?string $note): Submission
    {
        if (! $submission->isExecutor($executor)) {
            throw new \DomainException("Anda bukan pelaksana pengajuan ini.");
        }
        if ($submission->current_stage !== Submission::STAGE_LAYOUTING) {
            throw new \DomainException(
                "Layouting hanya bisa diselesaikan dari stage LAYOUTING. Saat ini: {$submission->current_stage}."
            );
        }
        if (! $submission->getMedia(Submission::COLLECTION_LAYOUT_PDF)->count()) {
            throw new \DomainException("PDF layout wajib diunggah sebelum menyelesaikan layouting.");
        }
        if (! $submission->getMedia(Submission::COLLECTION_FINAL_WORD)->count()) {
            throw new \DomainException("Word final wajib diunggah sebelum menyelesaikan layouting.");
        }
        return $this->transition(
            $submission,
            Submission::STAGE_LAYOUT_COMPLETED,
            $executor,
            'LAYOUT_COMPLETED',
            $note
        );
    }

    /**
     * Admin usulkan ke Perpusnas → LAYOUT_COMPLETED → PERPUSNAS_SUBMISSION.
     */
    public function submitToPerpusnas(Submission $submission, User $admin, ?string $note): Submission
    {
        if (! $admin->hasRole('ADMIN')) {
            throw new \DomainException("Hanya admin yang boleh mengusulkan ke Perpusnas.");
        }
        if ($submission->current_stage !== Submission::STAGE_LAYOUT_COMPLETED) {
            throw new \DomainException(
                "Pengusulan Perpusnas hanya dari stage LAYOUT_COMPLETED. Saat ini: {$submission->current_stage}."
            );
        }
        return $this->transition(
            $submission,
            Submission::STAGE_PERPUSNAS_SUBMISSION,
            $admin,
            'SUBMITTED_TO_PERPUSNAS',
            $note
        );
    }

    /**
     * Admin tandai menunggu hasil → PERPUSNAS_SUBMISSION → WAITING_PERPUSNAS.
     */
    public function markWaitingPerpusnas(Submission $submission, User $admin, ?string $note): Submission
    {
        if (! $admin->hasRole('ADMIN')) {
            throw new \DomainException("Hanya admin yang boleh memperbarui status Perpusnas.");
        }
        if (! in_array($submission->current_stage, [
            Submission::STAGE_PERPUSNAS_SUBMISSION,
            Submission::STAGE_WAITING_PERPUSNAS,
        ], true)) {
            throw new \DomainException(
                "Status menunggu Perpusnas hanya dari stage PERPUSNAS_SUBMISSION. Saat ini: {$submission->current_stage}."
            );
        }
        return $this->transition(
            $submission,
            Submission::STAGE_WAITING_PERPUSNAS,
            $admin,
            'WAITING_PERPUSNAS',
            $note
        );
    }

    /**
     * Admin menerima hasil Perpusnas + mengunggah PDF hasil.
     * → PERPUSNAS_RESULT_RECEIVED.
     */
    public function receivePerpusnasResult(Submission $submission, User $admin, ?string $note): Submission
    {
        if (! $admin->hasRole('ADMIN')) {
            throw new \DomainException("Hanya admin yang boleh menerima hasil Perpusnas.");
        }
        if ($submission->current_stage !== Submission::STAGE_WAITING_PERPUSNAS) {
            throw new \DomainException(
                "Penerimaan hasil Perpusnas hanya dari stage WAITING_PERPUSNAS. Saat ini: {$submission->current_stage}."
            );
        }
        if (! $submission->getMedia(Submission::COLLECTION_PERPUSNAS_RESULT)->count()) {
            throw new \DomainException("PDF hasil Perpusnas wajib diunggah.");
        }
        return $this->transition(
            $submission,
            Submission::STAGE_PERPUSNAS_RESULT_RECEIVED,
            $admin,
            'PERPUSNAS_RESULT_RECEIVED',
            $note
        );
    }

    /**
     * User menerima hasil & unduh → PERPUSNAS_RESULT_RECEIVED → COMPLETED.
     */
    public function finalize(Submission $submission, User $user): Submission
    {
        if (! $submission->isOwner($user)) {
            throw new \DomainException("Hanya pemilik yang bisa menyelesaikan pengajuan.");
        }
        if ($submission->current_stage !== Submission::STAGE_PERPUSNAS_RESULT_RECEIVED) {
            throw new \DomainException(
                "Penyelesaian hanya dari stage PERPUSNAS_RESULT_RECEIVED. Saat ini: {$submission->current_stage}."
            );
        }

        return DB::transaction(function () use ($submission, $user) {
            $submission->completed_at = now();
            $submission->save();

            return $this->transition(
                $submission,
                Submission::STAGE_COMPLETED,
                $user,
                'COMPLETED',
                null
            );
        });
    }

    // ------------------------------------------------------------------
    // Internal
    // ------------------------------------------------------------------

    /**
     * Catat transisi stage + audit history.
     */
    private function transition(
        Submission $submission,
        string $newStage,
        User $actor,
        string $action,
        ?string $note,
        ?array $meta = null
    ): Submission {
        return DB::transaction(function () use ($submission, $newStage, $actor, $action, $note, $meta) {
            $from = $submission->current_stage;

            $submission->current_stage = $newStage;
            $submission->current_status = static::statusLabel($newStage);

            if ($newStage === Submission::STAGE_SUBMITTED && $submission->submitted_at === null) {
                $submission->submitted_at = now();
            }

            $submission->save();

            SubmissionHistory::create([
                'submission_id' => $submission->id,
                'actor_id' => $actor->id,
                'action' => $action,
                'from_stage' => $from,
                'to_stage' => $newStage,
                'note' => $note,
                'performed_at' => now(),
            ]);

            return $submission->fresh();
        });
    }
}