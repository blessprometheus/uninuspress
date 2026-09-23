<?php

namespace App\Services;

use App\Models\Submission;
use App\Models\SubmissionHistory;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
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
    public function __construct(private readonly BookService $books = new BookService()) {}

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
            $submission->va_number = 'VA-UNINUS-'.str_pad($submission->id, 2, '0', STR_PAD_LEFT).'-'.now()->year;
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

        $submission = $this->transition($submission, Submission::STAGE_SUBMITTED, $user, 'SUBMITTED', null);

        try {
            $this->generateReceipt($submission);
        } catch (\Throwable $e) {
            // PDF bukti pengajuan adalah pelengkap, bukan syarat inti alur submit.
            // Jangan sampai kegagalan render PDF (mis. gambar kwitansi terlalu besar)
            // menggagalkan submit yang sebenarnya sudah berhasil di atas.
            report($e);
        }

        return $submission->fresh();
    }

    /**
     * Buat PDF bukti pengajuan (ringkasan isian + daftar dokumen + bukti bayar)
     * setiap kali user submit/submit ulang. Disimpan sebagai media ter-versi
     * seperti dokumen lain, agar riwayatnya tetap tersimpan (ADR-001).
     */
    private function generateReceipt(Submission $submission): void
    {
        $submission->load('author');

        $paymentReceipt = $submission->latestDocument(Submission::COLLECTION_PAYMENT_RECEIPT);
        $paymentReceiptCanRead = $paymentReceipt
            && str_starts_with((string) $paymentReceipt->mime_type, 'image/')
            // Path lokal hanya bisa dibaca dompdf kalau disk-nya lokal (bukan S3/Wasabi).
            && config("filesystems.disks.{$paymentReceipt->disk}.driver") === 'local';

        // Kecilkan gambar kwitansi dulu (foto asli dari user bisa berukuran besar
        // dan pernah membuat dompdf kehabisan memory saat merender PNG beresolusi
        // tinggi). Dipasang sebagai data URI supaya dompdf tidak perlu membaca
        // ulang file besar aslinya.
        $paymentReceiptImageDataUri = $paymentReceiptCanRead
            ? $this->resizeImageToDataUri($paymentReceipt->getPath())
            : null;

        $documents = collect(Submission::requiredUserDocumentCollections())
            ->mapWithKeys(fn (string $collection) => [
                $collection => $submission->latestDocument($collection),
            ]);

        $pdf = Pdf::loadView('pdf.submission-receipt', [
            'submission' => $submission,
            'documents' => $documents,
            'paymentReceipt' => $paymentReceipt,
            'paymentReceiptImageDataUri' => $paymentReceiptImageDataUri,
            'generatedAt' => now(),
        ]);

        $version = $submission->documentVersions(Submission::COLLECTION_SUBMISSION_RECEIPT)->count() + 1;

        $submission->addMediaFromString($pdf->output())
            ->usingFileName('bukti_pengajuan_v'.$version.'.pdf')
            ->toMediaCollection(Submission::COLLECTION_SUBMISSION_RECEIPT);
    }

    /**
     * Baca gambar dari path lokal, kecilkan ke maksimal 900px sisi terpanjang,
     * lalu kembalikan sebagai data URI JPEG. Mengembalikan null bila gambar
     * gagal dibaca/diproses (format tidak didukung GD, dsb) — pemanggil harus
     * menangani null dengan menampilkan fallback teks di PDF.
     */
    private function resizeImageToDataUri(string $path, int $maxDimension = 900): ?string
    {
        if (! extension_loaded('gd') || ! is_readable($path)) {
            return null;
        }

        $info = @getimagesize($path);
        if (! $info) {
            return null;
        }
        [$width, $height, $type] = $info;

        // Foto kamera/screenshot asli bisa >10 megapixel — decode ke bitmap mentah
        // (lebar x tinggi x 4 byte) butuh memory jauh lebih besar dari limit default
        // 128M dan pernah membuat proses ini fatal error. Naikkan sementara, dan
        // tolak file yang benar-benar di luar wajar untuk foto kwitansi.
        if ($width * $height > 40_000_000) {
            return null;
        }
        $originalLimit = ini_get('memory_limit');
        ini_set('memory_limit', '512M');

        try {
            $source = match ($type) {
                IMAGETYPE_JPEG => @imagecreatefromjpeg($path),
                IMAGETYPE_PNG => @imagecreatefrompng($path),
                IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : false,
                default => false,
            };
            if (! $source) {
                return null;
            }

            $scale = min(1, $maxDimension / max($width, $height));
            $targetW = max(1, (int) round($width * $scale));
            $targetH = max(1, (int) round($height * $scale));

            $resized = imagecreatetruecolor($targetW, $targetH);
            // Latar putih supaya PNG transparan tidak jadi hitam saat dikonversi ke JPEG.
            $white = imagecolorallocate($resized, 255, 255, 255);
            imagefill($resized, 0, 0, $white);
            imagecopyresampled($resized, $source, 0, 0, 0, 0, $targetW, $targetH, $width, $height);
            imagedestroy($source);

            ob_start();
            imagejpeg($resized, null, 80);
            $jpegData = ob_get_clean();
            imagedestroy($resized);

            if (! $jpegData) {
                return null;
            }

            return 'data:image/jpeg;base64,'.base64_encode($jpegData);
        } catch (\Throwable) {
            return null;
        } finally {
            ini_set('memory_limit', $originalLimit);
        }
    }

    /**
     * Koleksi yang belum punya dokumen (hanya dipakai untuk submit pertama).
     * Hanya mengecek dokumen yang wajib diunggah USER (6 dokumen awal);
     * koleksi hasil kerja pelaksana/admin divalidasi di tahap masing-masing.
     */
    public function missingDocumentCollections(Submission $submission): array
    {
        return array_values(array_filter(
            Submission::requiredUserDocumentCollections(),
            fn (string $c) => $submission->documentVersions($c)->isEmpty()
        ));
    }

    /**
     * Hitung media pada sebuah collection via query DB segar.
     *
     * Menggunakan query eksplisit (bukan $submission->getMedia()) agar tetap
     * akurat ketika dipanggil dalam request yang SAMA setelah addMedia()
     * menyimpan media — Spatie men-cache relation `media` di instance model,
     * sehingga getMedia() bisa mengembalikan 0 padahal media sudah tersimpan.
     */
    private function mediaCount(Submission $submission, string $collection): int
    {
        return Media::query()
            ->where('model_type', $submission->getMorphClass())
            ->where('model_id', $submission->getKey())
            ->where('collection_name', $collection)
            ->count();
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
        if (! $this->mediaCount($submission, Submission::COLLECTION_LAYOUT_PDF)) {
            throw new \DomainException("PDF layout wajib diunggah sebelum menyelesaikan layouting.");
        }
        if (! $this->mediaCount($submission, Submission::COLLECTION_FINAL_WORD)) {
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
        $submission = $this->transition(
            $submission,
            Submission::STAGE_PERPUSNAS_SUBMISSION,
            $admin,
            'SUBMITTED_TO_PERPUSNAS',
            $note
        );

        // Buku tampil di Toko Buku sejak diusulkan ke Perpusnas — bukan menunggu
        // COMPLETED — karena daftar pengajuan ISBN mengharuskan link buku sudah ada.
        // Cover diganti ke versi ber-ISBN oleh admin setelah nomor ISBN terbit.
        $this->books->publishFromSubmission($submission);

        return $submission;
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
        if (! $this->mediaCount($submission, Submission::COLLECTION_PERPUSNAS_RESULT)) {
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