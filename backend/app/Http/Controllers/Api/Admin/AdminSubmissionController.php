<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\ApproveAndAssignRequest;
use App\Http\Requests\Api\Admin\PerpusnasActionRequest;
use App\Http\Requests\Api\Admin\PerpusnasUploadRequest;
use App\Http\Requests\Api\Admin\RequestRevisionRequest;
use App\Http\Resources\SubmissionResource;
use App\Models\Submission;
use App\Models\User;
use App\Services\SubmissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminSubmissionController extends Controller
{
    public function __construct(private readonly SubmissionService $service) {}

    /**
     * GET /api/admin/submissions
     * Daftar semua pengajuan (filter opsional).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Submission::query()->with(['author', 'executor', 'history.actor', 'media']);

        if ($stage = $request->query('stage')) {
            $query->where('current_stage', $stage);
        }
        if ($executorId = $request->query('executor_id')) {
            $query->where('assigned_executor_id', $executorId);
        }
        if ($userId = $request->query('user_id')) {
            $query->where('user_id', $userId);
        }
        if ($q = trim((string) $request->query('q'))) {
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('author_name', 'like', "%{$q}%");
            });
        }

        $submissions = $query->latest('id')->paginate(20);

        return response()->json([
            'data' => SubmissionResource::collection($submissions)->resolve(),
            'meta' => [
                'current_page' => $submissions->currentPage(),
                'last_page' => $submissions->lastPage(),
                'total' => $submissions->total(),
            ],
        ]);
    }

    /**
     * GET /api/admin/submissions/{submission}
     */
    public function show(Submission $submission): JsonResponse
    {
        $submission->load(['author', 'executor', 'history.actor', 'media']);
        return response()->json([
            'data' => (new SubmissionResource($submission))->resolve(),
        ]);
    }

    /**
     * GET /api/admin/pelaksana
     * Daftar pelaksana untuk dipilih saat assignment.
     */
    public function executors(): JsonResponse
    {
        $executors = User::role('PELAKSANA')
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
            ]);

        return response()->json(['data' => $executors]);
    }

    /**
     * POST /api/admin/submissions/{submission}/start-review
     * SUBMITTED → ADMIN_REVIEW.
     */
    public function startReview(Request $request, Submission $submission): JsonResponse
    {
        try {
            $submission = $this->service->startAdminReview($submission, $request->user());
        } catch (\DomainException $e) {
            throw ValidationException::withMessages(['submission' => $e->getMessage()]);
        }

        $submission->load(['author', 'executor', 'history.actor']);
        return response()->json([
            'message' => 'Review pengajuan dimulai.',
            'data' => (new SubmissionResource($submission))->resolve(),
        ]);
    }

    /**
     * POST /api/admin/submissions/{submission}/request-revision
     */
    public function requestRevision(RequestRevisionRequest $request, Submission $submission): JsonResponse
    {
        try {
            $submission = $this->service->requestAdminRevision(
                $submission,
                $request->user(),
                $request->string('note')->toString()
            );
        } catch (\DomainException $e) {
            throw ValidationException::withMessages(['submission' => $e->getMessage()]);
        }

        $submission->load(['author', 'executor', 'history.actor']);
        return response()->json([
            'message' => 'Permintaan revisi telah dikirim ke user.',
            'data' => (new SubmissionResource($submission))->resolve(),
        ]);
    }

    /**
     * POST /api/admin/submissions/{submission}/approve-assign
     * Body: executor_id, note (optional).
     */
    public function approveAndAssign(ApproveAndAssignRequest $request, Submission $submission): JsonResponse
    {
        try {
            $submission = $this->service->approveAndAssign(
                $submission,
                $request->user(),
                (int) $request->input('executor_id'),
                $request->input('note')
            );
        } catch (\DomainException $e) {
            throw ValidationException::withMessages(['submission' => $e->getMessage()]);
        }

        $submission->load(['author', 'executor', 'history.actor']);
        return response()->json([
            'message' => 'Pengajuan disetujui dan pelaksana ditugaskan.',
            'data' => (new SubmissionResource($submission))->resolve(),
        ]);
    }

    /**
     * POST /api/admin/submissions/{submission}/submit-to-perpusnas
     */
    public function submitToPerpusnas(PerpusnasActionRequest $request, Submission $submission): JsonResponse
    {
        try {
            $submission = $this->service->submitToPerpusnas(
                $submission,
                $request->user(),
                $request->input('note')
            );
        } catch (\DomainException $e) {
            throw ValidationException::withMessages(['submission' => $e->getMessage()]);
        }

        $submission->load(['author', 'executor', 'history.actor']);
        return response()->json([
            'message' => 'Pengajuan diusulkan ke Perpusnas.',
            'data' => (new SubmissionResource($submission))->resolve(),
        ]);
    }

    /**
     * POST /api/admin/submissions/{submission}/perpusnas-waiting
     */
    public function markWaitingPerpusnas(PerpusnasActionRequest $request, Submission $submission): JsonResponse
    {
        try {
            $submission = $this->service->markWaitingPerpusnas(
                $submission,
                $request->user(),
                $request->input('note')
            );
        } catch (\DomainException $e) {
            throw ValidationException::withMessages(['submission' => $e->getMessage()]);
        }

        $submission->load(['author', 'executor', 'history.actor']);
        return response()->json([
            'message' => 'Status diubah: menunggu hasil Perpusnas.',
            'data' => (new SubmissionResource($submission))->resolve(),
        ]);
    }

    /**
     * POST /api/admin/submissions/{submission}/perpusnas-result
     * Body multipart: file (PDF), note (optional).
     */
    public function uploadPerpusnasResult(PerpusnasUploadRequest $request, Submission $submission): JsonResponse
    {
        try {
            $version = \Spatie\MediaLibrary\MediaCollections\Models\Media::query()
                ->where('model_type', $submission->getMorphClass())
                ->where('model_id', $submission->getKey())
                ->where('collection_name', Submission::COLLECTION_PERPUSNAS_RESULT)
                ->count() + 1;

            $submission->addMedia($request->file('file'))
                ->usingFileName('perpusnas_result_v'.$version.'.pdf')
                ->toMediaCollection(Submission::COLLECTION_PERPUSNAS_RESULT);

            $submission = $this->service->receivePerpusnasResult(
                $submission,
                $request->user(),
                $request->input('note')
            );
        } catch (\DomainException $e) {
            throw ValidationException::withMessages(['perpusnas' => $e->getMessage()]);
        }

        $submission->load(['author', 'executor', 'history.actor', 'media']);
        return response()->json([
            'message' => 'Hasil Perpusnas berhasil diunggah. User akan menerima notifikasi.',
            'data' => (new SubmissionResource($submission))->resolve(),
        ]);
    }
}