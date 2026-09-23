<?php

namespace App\Http\Controllers\Api\Executors;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Executors\ExecutorActionRequest;
use App\Http\Requests\Api\Executors\ExecutorUploadRequest;
use App\Http\Resources\SubmissionResource;
use App\Models\Submission;
use App\Services\SubmissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ExecutorSubmissionController extends Controller
{
    public function __construct(private readonly SubmissionService $service) {}

    /**
     * GET /api/executor/submissions
     * Hanya pengajuan yang ditugaskan ke pelaksana ini.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $submissions = Submission::query()
            ->where('assigned_executor_id', $user->id)
            ->with(['author', 'executor', 'history.actor', 'media'])
            ->latest('id')
            ->paginate(20);

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
     * GET /api/executor/submissions/{submission}
     */
    public function show(Request $request, Submission $submission): JsonResponse
    {
        if (! $submission->isExecutor($request->user()) && ! $request->user()->hasRole('ADMIN')) {
            return response()->json(['message' => 'Anda tidak berhak mengakses pengajuan ini.'], 403);
        }
        $submission->load(['author', 'executor', 'history.actor', 'media']);
        return response()->json([
            'data' => (new SubmissionResource($submission))->resolve(),
        ]);
    }

    /**
     * POST /api/executor/submissions/{submission}/start-review
     * ASSIGNED_TO_EXECUTOR → EXECUTOR_REVIEW.
     */
    public function startReview(Request $request, Submission $submission): JsonResponse
    {
        try {
            $submission = $this->service->startExecutorReview($submission, $request->user());
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
     * POST /api/executor/submissions/{submission}/request-revision
     * Body: note (required)
     */
    public function requestRevision(ExecutorActionRequest $request, Submission $submission): JsonResponse
    {
        $request->validate(['note' => ['required', 'string', 'min:3', 'max:2000']]);
        try {
            $submission = $this->service->requestExecutorRevision(
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
     * POST /api/executor/submissions/{submission}/approve
     * EXECUTOR_REVIEW → LAYOUTING.
     */
    public function approve(ExecutorActionRequest $request, Submission $submission): JsonResponse
    {
        try {
            $submission = $this->service->approveByExecutor(
                $submission,
                $request->user(),
                $request->input('note')
            );
        } catch (\DomainException $e) {
            throw ValidationException::withMessages(['submission' => $e->getMessage()]);
        }

        $submission->load(['author', 'executor', 'history.actor']);
        return response()->json([
            'message' => 'Pengajuan disetujui. Lanjutkan ke layouting.',
            'data' => (new SubmissionResource($submission))->resolve(),
        ]);
    }

    /**
     * POST /api/executor/submissions/{submission}/upload
     * Unggah layout_pdf atau final_word.
     * Body: file, collection.
     */
    public function upload(ExecutorUploadRequest $request, Submission $submission): JsonResponse
    {
        if (! $submission->isExecutor($request->user())) {
            return response()->json(['message' => 'Anda bukan pelaksana pengajuan ini.'], 403);
        }
        if (! in_array($submission->current_stage, [
            Submission::STAGE_LAYOUTING,
            Submission::STAGE_EXECUTOR_REVIEW,
        ], true)) {
            return response()->json([
                'message' => 'Upload hanya bisa dilakukan saat pengajuan masuk tahap review / layouting.',
            ], 422);
        }

        $collection = $request->string('collection')->toString();
        $media = $submission->addMedia($request->file('file'))
            ->usingFileName(
                $collection.'_v'.($submission->documentVersions($collection)->count() + 1).
                '.'.$request->file('file')->getClientOriginalExtension()
            )
            ->toMediaCollection($collection);

        \App\Models\SubmissionHistory::create([
            'submission_id' => $submission->id,
            'actor_id' => $request->user()->id,
            'action' => 'EXECUTOR_UPLOAD',
            'from_stage' => $submission->current_stage,
            'to_stage' => $submission->current_stage,
            'note' => "{$collection} media id={$media->id}",
            'performed_at' => now(),
        ]);

        $submission->refresh()->load(['author', 'executor', 'history.actor', 'media']);
        return response()->json([
            'message' => 'File hasil kerja berhasil diunggah.',
            'data' => (new SubmissionResource($submission))->resolve(),
        ]);
    }

    /**
     * POST /api/executor/submissions/{submission}/complete-layout
     * LAYOUTING → LAYOUT_COMPLETED. (Setelah kedua file diunggah)
     */
    public function completeLayout(ExecutorActionRequest $request, Submission $submission): JsonResponse
    {
        try {
            $submission = $this->service->completeLayouting(
                $submission,
                $request->user(),
                $request->input('note')
            );
        } catch (\DomainException $e) {
            throw ValidationException::withMessages(['submission' => $e->getMessage()]);
        }

        $submission->load(['author', 'executor', 'history.actor']);
        return response()->json([
            'message' => 'Layouting selesai. Hasil telah dikirim ke admin.',
            'data' => (new SubmissionResource($submission))->resolve(),
        ]);
    }
}