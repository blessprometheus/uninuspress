<?php

namespace App\Http\Controllers\Api\Submissions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Submissions\StoreSubmissionRequest;
use App\Http\Requests\Api\Submissions\UploadDocumentRequest;
use App\Http\Resources\SubmissionResource;
use App\Models\Submission;
use App\Services\SubmissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UserSubmissionController extends Controller
{
    public function __construct(private readonly SubmissionService $service) {}

    /**
     * GET /api/submissions
     * Daftar pengajuan milik user yang sedang login.
     */
    public function index(Request $request): JsonResponse
    {
        $submissions = Submission::query()
            ->where('user_id', $request->user()->id)
            ->with(['author', 'executor', 'history.actor'])
            ->latest('id')
            ->paginate(20);

        return response()->json([
            'data' => SubmissionResource::collection($submissions)->resolve(),
            'meta' => [
                'current_page' => $submissions->currentPage(),
                'last_page' => $submissions->lastPage(),
                'total' => $submissions->total(),
            ],
            'stats' => [
                'active_count' => $this->service->activeSubmissionsCount($request->user()),
                'max_active' => Submission::MAX_ACTIVE_SUBMISSIONS,
            ],
        ]);
    }

    /**
     * POST /api/submissions
     * Buat DRAFT baru.
     */
    public function store(StoreSubmissionRequest $request): JsonResponse
    {
        try {
            $submission = $this->service->createDraft($request->user(), $request->validated());
        } catch (\DomainException $e) {
            throw ValidationException::withMessages(['submission' => $e->getMessage()]);
        }

        return response()->json([
            'message' => 'Pengajuan baru berhasil dibuat sebagai draf.',
            'data' => (new SubmissionResource(
                $submission->load(['author', 'executor', 'history.actor'])
            ))->resolve(),
        ], 201);
    }

    /**
     * GET /api/submissions/{submission}
     * Detail pengajuan. Hanya pemilik / admin / pelaksana yang ditugaskan.
     */
    public function show(Request $request, Submission $submission): JsonResponse
    {
        $user = $request->user();
        if (! $submission->canAccess($user)) {
            return response()->json(['message' => 'Anda tidak berhak mengakses pengajuan ini.'], 403);
        }

        $submission->load(['author', 'executor', 'history.actor', 'media']);

        return response()->json([
            'data' => (new SubmissionResource($submission))->resolve(),
        ]);
    }

    /**
     * POST /api/submissions/{submission}/documents
     * Unggah/unggah-ulang satu dokumen.
     * Body: file, collection
     */
    public function uploadDocument(UploadDocumentRequest $request, Submission $submission): JsonResponse
    {
        if (! $submission->isOwner($request->user())) {
            return response()->json(['message' => 'Hanya pemilik yang bisa mengunggah dokumen.'], 403);
        }
        if (! $submission->canUserEdit()) {
            return response()->json([
                'message' => 'Dokumen hanya bisa diubah saat pengajuan berstatus Draf atau Perlu Perbaikan.',
            ], 422);
        }

        try {
            $media = $this->service->uploadDocument(
                $submission,
                $request->string('collection')->toString(),
                $request->file('file'),
                $request->user()
            );
        } catch (\DomainException $e) {
            throw ValidationException::withMessages(['file' => $e->getMessage()]);
        }

        $submission->refresh()->load(['author', 'executor', 'history.actor', 'media']);

        return response()->json([
            'message' => 'Dokumen berhasil diunggah.',
            'data' => (new SubmissionResource($submission))->resolve(),
            'media' => [
                'id' => $media->id,
                'file_name' => $media->file_name,
                'size' => $media->size,
                'collection_name' => $media->collection_name,
            ],
        ], 201);
    }

    /**
     * POST /api/submissions/{submission}/submit
     * Ajukan pengajuan.
     */
    public function submit(Request $request, Submission $submission): JsonResponse
    {
        try {
            $submission = $this->service->submit($submission, $request->user());
        } catch (\DomainException $e) {
            throw ValidationException::withMessages(['submission' => $e->getMessage()]);
        }

        $submission->load(['author', 'executor', 'history.actor']);

        return response()->json([
            'message' => 'Pengajuan berhasil dikirim untuk diverifikasi admin.',
            'data' => (new SubmissionResource($submission))->resolve(),
        ]);
    }
}